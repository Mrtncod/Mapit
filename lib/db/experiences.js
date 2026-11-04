import "server-only";
import { query } from "./index";
import { getSession } from "../session";
import { experienceSchema, editSchema, idSchema } from "../validation";

// Columns returned to the app. Path comes back as GeoJSON.
const COLUMNS = `
  e.id, e.user_id, (e.user_id = $1::text) AS is_mine, e.kind, e.sentiment, e.title, e.place_name, e.description,
  e.visibility, e.hidden, e.lat, e.lng, e.accuracy_m, e.place_ref,
  ST_AsGeoJSON(e.path)::json AS path,
  e.distance_m, e.duration_s, e.elevation_gain_m, e.started_at, e.created_at,
  c.slug AS category_slug, c.label AS category_label, c.icon AS category_icon,
  u.name AS author_name
`;

const FROM = `
  FROM experiences e
  JOIN categories c ON c.id = e.category_id
  JOIN "user" u ON u.id = e.user_id
`;

// THE privacy rule. Every read uses this. $1 is always the current user id (or null).
const VISIBLE = `((e.visibility = 'public' AND NOT e.hidden) OR e.user_id = $1::text)`;

async function currentUserId() {
  const session = await getSession();
  return session?.user.id ?? null;
}

async function requireUserId() {
  const id = await currentUserId();
  if (!id) throw new Error("Not authenticated");
  return id;
}

export async function getCategories() {
  return query(`
    SELECT c.id, c.slug, c.label, c.icon, c.applies_to,
           g.slug AS group_slug, g.label AS group_label, g.icon AS group_icon
    FROM categories c
    JOIN category_groups g ON g.id = c.group_id
    ORDER BY g.sort_order, c.id
  `);
}

// Public experiences plus your own private ones, within radius metres.
export async function getNearbyExperiences({
  lat,
  lng,
  radiusM = 2000,
  limit = 100,
  searchTerm = "",
  categorySlug = null,
}) {
  const userId = await currentUserId();

  const rows = await query(
    `SELECT ${COLUMNS},
            ST_Distance(e.location, ST_MakePoint($3, $2)::geography) AS distance_from_you_m
     ${FROM}
     WHERE ${VISIBLE}
       AND ST_DWithin(e.location, ST_MakePoint($3, $2)::geography, $4)
       AND ($6::text IS NULL OR c.slug = $6)
 AND (
  $7::text IS NULL
  OR e.title ILIKE '%' || $7 || '%'
  OR COALESCE(e.place_name, '') ILIKE '%' || $7 || '%'
  OR COALESCE(e.description, '') ILIKE '%' || $7 || '%'
  OR c.label ILIKE '%' || $7 || '%'
  OR e.sentiment::text ILIKE '%' || $7 || '%'
  OR e.kind::text ILIKE '%' || $7 || '%'
  OR u.name ILIKE '%' || $7 || '%'
)
     ORDER BY distance_from_you_m
     LIMIT $5`,
    [
      userId,
      Number(lat),
      Number(lng),
      Math.min(Number(radiusM), 50000),
      Math.min(Number(limit), 200),
      categorySlug || null,
      searchTerm.trim() || null,
    ],
  );

  return rows;
}

export async function getMyExperiences() {
  const userId = await requireUserId();
  return query(
    `SELECT ${COLUMNS} ${FROM} WHERE e.user_id = $1 ORDER BY e.created_at DESC`,
    [userId],
  );
}

export async function getExperience(id) {
  if (!idSchema.safeParse(id).success) return null;
  const userId = await currentUserId();
  const rows = await query(
    `SELECT ${COLUMNS} ${FROM} WHERE e.id = $2 AND ${VISIBLE}`,
    [userId, id],
  );
  return rows[0] ?? null;
}

export async function createExperience(input) {
  const userId = await requireUserId();
  const v = experienceSchema.parse(input);
  const [{ count }] = await query(
    `SELECT count(*)::int AS count FROM experiences
     WHERE user_id = $1 AND created_at > now() - interval '1 hour'`,
    [userId],
  );
  if (count >= 30)
    throw new Error("You're posting too fast. Please try again later.");

  const pathJson = v.path
    ? JSON.stringify({ type: "LineString", coordinates: v.path })
    : null;

  const rows = await query(
    `WITH p AS (
       SELECT CASE WHEN $13::text IS NULL THEN NULL
                   ELSE ST_SetSRID(ST_GeomFromGeoJSON($13::text), 4326)::geography END AS path
     )
     INSERT INTO experiences
       (user_id, kind, category_id, sentiment, title, place_name, description, visibility,
        lat, lng, accuracy_m, place_ref, path, distance_m, duration_s, elevation_gain_m, started_at)
     SELECT $1, $2, c.id, $4, $5, $6, $7, $8, $9, $10, $11, $12,
            p.path,
            COALESCE(ROUND(ST_Length(p.path))::int, $14),
            $15, $16, $17
     FROM categories c, p
     WHERE c.id = $3 AND c.applies_to IN ('both', $2)
     RETURNING id`,
    [
      userId,
      v.kind,
      v.categoryId,
      v.sentiment,
      v.title,
      v.placeName ?? null,
      v.description,
      v.visibility,
      v.lat,
      v.lng,
      v.accuracyM ?? null,
      v.placeRef ?? null,
      pathJson,
      v.distanceM ?? null,
      v.durationS ?? null,
      v.elevationGainM ?? null,
      v.startedAt ?? null,
    ],
  );

  if (!rows[0]) throw new Error("Invalid category for this kind of experience");
  return rows[0].id;
}
// Ownership is part of the WHERE clause, so you can only delete your own.
export async function deleteExperience(id) {
  const userId = await requireUserId();
  if (!idSchema.safeParse(id).success) return false;
  const rows = await query(
    `DELETE FROM experiences WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId],
  );
  return rows.length > 0;
}

// Ownership is in the WHERE clause. The category must also match the experience's kind.
export async function updateExperience(id, input) {
  const userId = await requireUserId();
  if (!idSchema.safeParse(id).success) return false;
  const v = editSchema.parse(input);

  const rows = await query(
    `UPDATE experiences e
     SET category_id = c.id, sentiment = $4, title = $5,
         place_name = $6, description = $7, visibility = $8
     FROM categories c
     WHERE e.id = $1 AND e.user_id = $2
       AND c.id = $3 AND c.applies_to IN ('both', e.kind)
     RETURNING e.id`,
    [
      id,
      userId,
      v.categoryId,
      v.sentiment,
      v.title,
      v.placeName ?? null,
      v.description,
      v.visibility,
    ],
  );
  return rows.length > 0;
}

export async function setVisibility(id, visibility) {
  const userId = await requireUserId();
  if (!idSchema.safeParse(id).success) return false;
  const v = editSchema.shape.visibility.parse(visibility);
  const rows = await query(
    `UPDATE experiences SET visibility = $3 WHERE id = $1 AND user_id = $2 RETURNING id`,
    [id, userId, v],
  );
  return rows.length > 0;
}
