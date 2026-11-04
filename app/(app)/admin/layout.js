import Link from "next/link";
import { notFound } from "next/navigation";
import { isAdmin } from "@/lib/db/moderation";
import { LayoutDashboard, Flag, EyeOff, History } from "lucide-react";

const adminPages = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/reports",
    label: "Open reports",
    icon: Flag,
  },
  {
    href: "/admin/hidden",
    label: "Hidden posts",
    icon: EyeOff,
  },
  {
    href: "/admin/history",
    label: "History",
    icon: History,
  },
];

export default async function AdminLayout({ children }) {
  if (!(await isAdmin())) {
    notFound();
  }

  return (
    <main className="h-full overflow-y-auto bg-gradient-to-br from-violet-100 via-[#f7f6f2] to-blue-100">
      <div className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
        <header className="mb-6">
          <div className="mb-1 flex items-center gap-2 text-sm font-semibold text-accent">
            <span className="grid size-8 place-items-center rounded-xl bg-accent-soft">
              <LayoutDashboard size={17} />
            </span>
            Mapit administration
          </div>

          <h1 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            Admin panel
          </h1>

          <p className="mt-1 text-sm text-ink-soft">
            Manage reports, review content and monitor activity.
          </p>
        </header>

        <nav className="mb-6 flex gap-2 overflow-x-auto rounded-2xl border border-white/70 bg-white/75 p-2 shadow-soft backdrop-blur-xl">
          {adminPages.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className="flex min-h-10 shrink-0 items-center gap-2 rounded-xl px-3 text-sm font-semibold text-ink-soft transition hover:bg-accent-soft hover:text-accent"
            >
              <Icon size={17} />
              {label}
            </Link>
          ))}
        </nav>

        <div className="min-w-0">{children}</div>
      </div>
    </main>
  );
}
