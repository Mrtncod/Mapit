import Link from "next/link";
import { getSession } from "@/lib/session";
import DeleteAccountForm from "@/components/DeleteAccountForm";
import {
  UserRound,
  Mail,
  MapPin,
  ChevronRight,
  AlertTriangle,
  ArrowLeft,
} from "lucide-react";

export default async function AccountPage() {
  const session = await getSession();

  return (
    <main className="relative h-full overflow-y-auto bg-gradient-to-br from-violet-100 via-[#f7f6f2] to-blue-100">
      <div className="relative z-10 mx-auto w-full max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        {/* Header */}
        <header className="mb-8">
          <Link
            href="/explore"
            className="btn btn-secondary mb-5 min-h-10 px-4 text-sm"
          >
            <ArrowLeft size={16} />
            Back to map
          </Link>

          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
                Account settings
              </p>

              <h1 className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                Your account
              </h1>

              <p className="mt-2 text-sm text-ink-soft">
                Manage your personal account information.
              </p>
            </div>

            <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
              <UserRound size={23} />
            </div>
          </div>
        </header>

        {/* Personal information */}
        <section className="mb-6">
          <h2 className="mb-3 text-sm font-bold text-ink">
            Personal information
          </h2>

          <div className="overflow-hidden rounded-2xl border border-line bg-white shadow-soft">
            <div className="flex items-center gap-3 p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas text-ink-soft">
                <UserRound size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-soft">Name</p>
                <p className="mt-0.5 truncate text-sm font-semibold text-ink">
                  {session.user.name}
                </p>
              </div>
            </div>

            <div className="mx-4 border-t border-line" />

            <div className="flex items-center gap-3 p-4">
              <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-canvas text-ink-soft">
                <Mail size={18} />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-xs text-ink-soft">Email address</p>
                <p className="mt-0.5 break-all text-sm font-semibold text-ink">
                  {session.user.email}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Quick access */}
        <section className="mb-8">
          <h2 className="mb-3 text-sm font-bold text-ink">Quick access</h2>

          <Link
            href="/me"
            className="group flex items-center gap-3 rounded-2xl border border-line bg-white p-4 shadow-soft transition hover:border-accent/30 hover:bg-white"
          >
            <div className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
              <MapPin size={19} />
            </div>

            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">My experiences</p>
              <p className="mt-0.5 text-xs text-ink-soft">
                Manage your saved places and routes.
              </p>
            </div>

            <ChevronRight
              size={19}
              className="shrink-0 text-ink-soft transition group-hover:translate-x-0.5 group-hover:text-accent"
            />
          </Link>
        </section>

        {/* Danger zone */}
        <section>
          <div className="mb-3 flex items-center gap-2">
            <AlertTriangle size={16} className="text-bad" />
            <h2 className="text-sm font-bold text-ink">Danger zone</h2>
          </div>

          <div className="rounded-2xl border border-red-200 bg-white p-4 shadow-soft sm:p-5">
            <h3 className="text-sm font-bold text-ink">Delete account</h3>

            <p className="mt-1 text-xs leading-5 text-ink-soft">
              Permanently delete your account and associated data. This action
              cannot be undone.
            </p>

            <div className="mt-4">
              <DeleteAccountForm />
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
