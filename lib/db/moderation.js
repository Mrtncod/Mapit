import "server-only";
import { pool, query } from "./index";
import { getSession } from "../session";
import {
  idSchema,
  reportSchema,
  moderationSchema,
  noteSchema,
} from "../validation";

const AUTO_HIDE_AT = 3;

async function requireUserId() {
  const session = await getSession();
  if (!session) throw new Error("Not authenticated");
  return session.user.id;
}

export async function isAdmin() {
  const session = await getSession();
  if (!session) return false;
  const rows = await query(`SELECT "isAdmin" FROM "user" WHERE id = $1`, [
    session.user.id,
  ]);
  return rows[0]?.isAdmin === true;
}

// Checked in the database on every call. Returns the admin's user id.
async function requireAdmin() {
  const session = await getSession();
  if (!session) throw new Error("Forbidden");
  const rows = await query(`SELECT "isAdmin" FROM "user" WHERE id = $1`, [
    session.user.id,
  ]);
  if (rows[0]?.isAdmin !== true) throw new Error("Forbidden");
  return session.user.id;
}

async function transaction(fn) {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await fn(client);
    await client.query("COMMIT");
    return result;
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
}

/* ---------- Reporting (any logged-in user) ---------- */

// Returns false if it can't be reported (own post, private, hidden, missing, or already reported)
export async function reportExperience(id, input) {
  const userId = await requireUserId();
  if (!idSchema.safeParse(id).success) return false;
  const v = reportSchema.parse(input);

  const [{ count }] = await query(
    `SELECT count(*)::int AS count FROM reports
     WHERE reporter_id = $1 AND created_at > now() - interval '1 hour'`,
    [userId],
  );
  if (count >= 20)
    throw new Error("You're reporting too fast. Please try again later.");

  const rows = await query(
    `INSERT INTO reports (experience_id, reporter_id, reason, details)
     SELECT e.id, $2, $3, $4 FROM experiences e
     WHERE e.id = $1 AND e.visibility = 'public' AND e.user_id <> $2 AND NOT e.hidden
     ON CONFLICT (experience_id, reporter_id) DO NOTHING
     RETURNING id`,
    [id, userId, v.reason, v.details ?? null],
  );
  if (rows.length === 0) return false;

  // Auto-hide at the threshold, and log it
  await query(
    `WITH hid AS (
       UPDATE experiences
       SET hidden = true, hidden_reason = 'auto_reports', hidden_at = now()
       WHERE id = $1 AND NOT hidden
         AND (SELECT count(*) FROM reports WHERE experience_id = $1 AND status = 'open') >= $2
       RETURNING id, title
     )
     INSERT INTO moderation_log (experience_id, title_snapshot, action)
     SELECT id, title, 'auto_hide' FROM hid`,
    [id, AUTO_HIDE_AT],
  );
  return true;
}

/* ---------- Admin reads ---------- */

// Posts with open reports
export async function getReportQueue() {
  await requireAdmin();
  return query(
    `SELECT e.id, e.title, e.description, e.hidden, e.hidden_reason, e.hidden_at,
            u.name AS author_name,
            count(*)::int AS report_count,
            array_agg(DISTINCT r.reason) AS reasons,
            array_agg(r.details) FILTER (WHERE r.details IS NOT NULL) AS details
     FROM reports r
     JOIN experiences e ON e.id = r.experience_id
     JOIN "user" u ON u.id = e.user_id
     WHERE r.status = 'open'
     GROUP BY e.id, u.name
     ORDER BY report_count DESC, max(r.created_at) DESC
     LIMIT 200`,
  );
}

// Every hidden post, whether or not it still has open reports
export async function getHiddenPosts() {
  await requireAdmin();
  return query(
    `SELECT e.id, e.title, e.description, e.hidden, e.hidden_reason, e.hidden_at,
            u.name AS author_name,
            (SELECT count(*)::int FROM reports r WHERE r.experience_id = e.id) AS report_count,
            (SELECT array_agg(DISTINCT r.reason) FROM reports r WHERE r.experience_id = e.id) AS reasons,
            (SELECT array_agg(r.details) FILTER (WHERE r.details IS NOT NULL)
               FROM reports r WHERE r.experience_id = e.id) AS details
     FROM experiences e
     JOIN "user" u ON u.id = e.user_id
     WHERE e.hidden
     ORDER BY e.hidden_at DESC NULLS LAST
     LIMIT 200`,
  );
}

export async function getModerationHistory() {
  await requireAdmin();
  return query(
    `SELECT l.id, l.experience_id, l.title_snapshot, l.action, l.note, l.created_at,
            a.name AS admin_name
     FROM moderation_log l
     LEFT JOIN "user" a ON a.id = l.admin_id
     ORDER BY l.created_at DESC
     LIMIT 100`,
  );
}

export async function getAdminStats() {
  await requireAdmin();

  const [totals] = await query(`
    SELECT
      (SELECT count(*)::int FROM "user") AS users,
      (SELECT count(*)::int FROM "user" WHERE "emailVerified") AS users_verified,
      (SELECT count(*)::int FROM "user" WHERE "createdAt" > now() - interval '7 days') AS users_7d,
      (SELECT count(*)::int FROM experiences) AS experiences,
      (SELECT count(*)::int FROM experiences WHERE created_at > now() - interval '7 days') AS experiences_7d,
      (SELECT count(*)::int FROM experiences WHERE kind = 'spot') AS spots,
      (SELECT count(*)::int FROM experiences WHERE kind = 'route') AS routes,
      (SELECT count(*)::int FROM experiences WHERE visibility = 'public') AS public_count,
      (SELECT count(*)::int FROM experiences WHERE visibility = 'private') AS private_count,
      (SELECT count(*)::int FROM experiences WHERE sentiment = 'good') AS good,
      (SELECT count(*)::int FROM experiences WHERE sentiment = 'bad') AS bad,
      (SELECT count(*)::int FROM experiences WHERE sentiment = 'warning') AS warning,
      (SELECT count(*)::int FROM experiences WHERE hidden) AS hidden,
      (SELECT count(DISTINCT experience_id)::int FROM reports WHERE status = 'open') AS reported_posts,
      (SELECT count(*)::int FROM reports WHERE status = 'open') AS open_reports,
      (SELECT count(DISTINCT user_id)::int FROM experiences) AS active_authors
  `);

  const categories = await query(`
    SELECT c.icon, c.label, count(*)::int AS count
    FROM experiences e JOIN categories c ON c.id = e.category_id
    GROUP BY c.id ORDER BY count DESC LIMIT 8
  `);

  const daily = await query(`
    SELECT to_char(d, 'DD.MM.') AS label, count(e.id)::int AS count
    FROM generate_series((current_date - 13)::timestamp, current_date::timestamp, interval '1 day') d
    LEFT JOIN experiences e ON e.created_at::date = d::date
    GROUP BY d ORDER BY d
  `);

  return { totals, categories, daily };
}

/* ---------- Admin write ---------- */

// hide: hides the post and marks its open reports resolved
// restore: makes it visible again and dismisses its open reports
// dismiss: leaves visibility as it is and dismisses its open reports
export async function moderate(id, action, note) {
  const adminId = await requireAdmin();
  if (!idSchema.safeParse(id).success) return;
  const a = moderationSchema.parse(action);
  const n = noteSchema.parse(note) || null;

  await transaction(async (db) => {
    const { rows } = await db.query(
      `SELECT id, title FROM experiences WHERE id = $1 FOR UPDATE`,
      [id],
    );
    if (!rows[0]) return;

    if (a === "hide") {
      await db.query(
        `UPDATE experiences
         SET hidden = true, hidden_reason = 'moderator', hidden_at = now() WHERE id = $1`,
        [id],
      );
    } else if (a === "restore") {
      await db.query(
        `UPDATE experiences
         SET hidden = false, hidden_reason = NULL, hidden_at = NULL WHERE id = $1`,
        [id],
      );
    }

    await db.query(
      `UPDATE reports SET status = $2, resolved_at = now(), resolved_by = $3
       WHERE experience_id = $1 AND status = 'open'`,
      [id, a === "hide" ? "resolved" : "dismissed", adminId],
    );

    await db.query(
      `INSERT INTO moderation_log (experience_id, title_snapshot, admin_id, action, note)
       VALUES ($1, $2, $3, $4, $5)`,
      [id, rows[0].title, adminId, a, n],
    );
  });
}

// import "server-only";
// import { query } from "./index";
// import { getSession } from "../session";
// import { idSchema, reportSchema, moderationSchema } from "../validation";

// const AUTO_HIDE_AT = 3;

// async function requireUserId() {
//   const session = await getSession();
//   if (!session) throw new Error("Not authenticated");
//   return session.user.id;
// }

// export async function isAdmin() {
//   const session = await getSession();
//   if (!session) return false;
//   const rows = await query(`SELECT "isAdmin" FROM "user" WHERE id = $1`, [
//     session.user.id,
//   ]);
//   return rows[0]?.isAdmin === true;
// }

// async function requireAdmin() {
//   if (!(await isAdmin())) throw new Error("Forbidden");
// }

// // Returns false if it can't be reported (own post, private, hidden, missing, or already reported)
// export async function reportExperience(id, input) {
//   const userId = await requireUserId();
//   if (!idSchema.safeParse(id).success) return false;
//   const v = reportSchema.parse(input);

//   const [{ count }] = await query(
//     `SELECT count(*)::int AS count FROM reports
//      WHERE reporter_id = $1 AND created_at > now() - interval '1 hour'`,
//     [userId],
//   );
//   if (count >= 20)
//     throw new Error("You're reporting too fast. Please try again later.");

//   const rows = await query(
//     `INSERT INTO reports (experience_id, reporter_id, reason, details)
//      SELECT e.id, $2, $3, $4 FROM experiences e
//      WHERE e.id = $1 AND e.visibility = 'public' AND e.user_id <> $2 AND NOT e.hidden
//      ON CONFLICT (experience_id, reporter_id) DO NOTHING
//      RETURNING id`,
//     [id, userId, v.reason, v.details ?? null],
//   );
//   if (rows.length === 0) return false;

//   await query(
//     `UPDATE experiences SET hidden = true
//      WHERE id = $1
//        AND (SELECT count(*) FROM reports WHERE experience_id = $1 AND status = 'open') >= $2`,
//     [id, AUTO_HIDE_AT],
//   );
//   return true;
// }

// export async function getReportQueue() {
//   await requireAdmin();
//   return query(
//     `SELECT e.id, e.title, e.description, e.hidden, e.visibility,
//             u.name AS author_name,
//             count(*)::int AS report_count,
//             array_agg(DISTINCT r.reason) AS reasons,
//             array_agg(r.details) FILTER (WHERE r.details IS NOT NULL) AS details
//      FROM reports r
//      JOIN experiences e ON e.id = r.experience_id
//      JOIN "user" u ON u.id = e.user_id
//      WHERE r.status = 'open'
//      GROUP BY e.id, u.name
//      ORDER BY report_count DESC, max(r.created_at) DESC`,
//   );
// }

// export async function moderate(id, action) {
//   await requireAdmin();
//   if (!idSchema.safeParse(id).success) return;
//   const a = moderationSchema.parse(action);

//   // One statement: update the post and close its open reports together
//   await query(
//     `WITH h AS (UPDATE experiences SET hidden = $2 WHERE id = $1 RETURNING id)
//      UPDATE reports SET status = $3 WHERE experience_id = $1 AND status = 'open'`,
//     [id, a === "hide", a === "hide" ? "resolved" : "dismissed"],
//   );
// }
