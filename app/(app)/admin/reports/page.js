import { getReportQueue } from "@/lib/db/moderation";
import ModerationCard from "@/components/admin/ModerationCard";
import { Flag } from "lucide-react";

export default async function ReportsPage() {
  const rows = await getReportQueue();

  return (
    <section className="space-y-5">
      <div>
        <div className="flex items-center gap-2">
          <Flag size={19} className="text-accent" />
          <h2 className="text-lg font-bold text-ink">Open reports</h2>
          <span className="rounded-full bg-accent-soft px-2.5 py-1 text-xs font-bold text-accent">
            {rows.length}
          </span>
        </div>
        <p className="mt-1 text-sm text-ink-soft">
          Review reported experiences and decide what action to take.
        </p>
      </div>

      {rows.length === 0 ? (
        <div className="rounded-2xl border border-white/70 bg-white/85 px-5 py-12 text-center shadow-soft">
          <span className="mx-auto mb-3 grid size-12 place-items-center rounded-2xl bg-green-50 text-green-600">
            <Flag size={21} />
          </span>
          <h3 className="font-bold text-ink">No open reports</h3>
          <p className="mt-1 text-sm text-ink-soft">
            There are currently no experiences waiting for review.
          </p>
        </div>
      ) : (
        <ul className="grid min-w-0 gap-4">
          {rows.map((r) => (
            <ModerationCard key={r.id} post={r} />
          ))}
        </ul>
      )}
    </section>
  );
}

// import { Suspense } from "react";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import { isAdmin, getReportQueue } from "@/lib/db/moderation";
// import { moderateAction } from "@/app/(app)/admin/actions";

// async function Queue() {
//   if (!(await isAdmin())) notFound(); // non-admins can't even tell this page exists
//   const rows = await getReportQueue();

//   if (rows.length === 0) return <p>No open reports.</p>;

//   return (
//     <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: 12 }}>
//       {rows.map((r) => (
//         <li
//           key={r.id}
//           style={{ border: "1px solid #ddd", borderRadius: 8, padding: 12 }}
//         >
//           <strong>
//             <Link href={`/experiences/${r.id}`}>{r.title}</Link>
//           </strong>{" "}
//           {r.hidden && <span>(hidden)</span>}
//           <div>
//             by {r.author_name} · {r.report_count} report(s):{" "}
//             {r.reasons.join(", ")}
//           </div>
//           {r.details?.map((d, i) => (
//             <blockquote key={i} style={{ margin: "4px 0" }}>
//               {d}
//             </blockquote>
//           ))}
//           <p style={{ whiteSpace: "pre-wrap" }}>{r.description}</p>
//           <div style={{ display: "flex", gap: 8 }}>
//             {[
//               ["hide", "Hide"],
//               ["restore", "Restore"],
//               ["dismiss", "Dismiss reports"],
//             ].map(([action, label]) => (
//               <form key={action} action={moderateAction}>
//                 <input type="hidden" name="id" value={r.id} />
//                 <input type="hidden" name="action" value={action} />
//                 <button>{label}</button>
//               </form>
//             ))}
//           </div>
//         </li>
//       ))}
//     </ul>
//   );
// }

// export default function ReportsPage() {
//   return (
//     <main style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
//       <h1>Reports</h1>
//       <Suspense fallback={<p>Loading...</p>}>
//         <Queue />
//       </Suspense>
//     </main>
//   );
// }
