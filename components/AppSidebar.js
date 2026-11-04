"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Compass,
  Map,
  PlusCircle,
  Route,
  ShieldCheck,
  FileText,
  Settings,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  LocateFixed,
} from "lucide-react";
import LogoutButton from "@/components/LogoutButton";

const mainLinks = [
  { href: "/explore", label: "Explore", icon: Compass },
  { href: "/me", label: "My experiences", icon: Map },
  { href: "/experiences/new", label: "Add experience", icon: PlusCircle },
  { href: "/experiences/record", label: "Record route", icon: Route },
];

const adminLinks = [
  { href: "/admin", label: "Dashboard", icon: ShieldCheck },
  { href: "/admin/reports", label: "Open reports", icon: FileText },
];

function Logo() {
  return (
    <Link href="/explore" className="flex min-w-0 items-center gap-2.5">
      <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-accent text-lg text-white shadow-sm">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="size-5"
          aria-hidden="true"
        >
          <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
          <circle cx="12" cy="10" r="2.5" />
        </svg>
      </span>
      <span className="text-[22px] font-extrabold tracking-tight text-ink">
        mapit<span className="text-accent">.</span>
      </span>
    </Link>
  );
}

function NavLink({ href, label, icon: Icon, collapsed, onNavigate }) {
  const pathname = usePathname();

  const active =
    href === "/admin"
      ? pathname === "/admin"
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      title={collapsed ? label : undefined}
      aria-current={active ? "page" : undefined}
      className={`flex min-h-11 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
        active
          ? "bg-accent-soft text-accent"
          : "text-ink-soft hover:bg-canvas hover:text-ink"
      } ${collapsed ? "justify-center" : ""}`}
    >
      <Icon className="size-[19px] shrink-0" strokeWidth={1.9} />
      {!collapsed && <span>{label}</span>}
    </Link>
  );
}

export default function AppSidebar({
  user,
  admin,
  overlay = false,
  collapsed,
  onCollapsedChange,
}) {
  const pathname = usePathname();
  const router = useRouter();

  const [mobileOpen, setMobileOpen] = useState(false);

  const firstName = user?.name?.trim().split(/\s+/)[0] || "Account";
  const initial = firstName.charAt(0).toUpperCase();

  function locateMe() {
    setMobileOpen(false);

    if (pathname === "/explore") {
      window.dispatchEvent(new Event("mapit:locate-me"));
    } else {
      // The map automatically flies to the user's position when it loads.
      router.push("/explore");
    }
  }

  const sidebarContent = (
    <>
      <div
        className={`flex h-[72px] shrink-0 items-center border-b border-line ${
          collapsed ? "justify-center px-2" : "justify-between px-5"
        }`}
      >
        {(!collapsed || mobileOpen) && <Logo />}

        {collapsed && !mobileOpen && (
          <Link href="/explore" aria-label="Mapit home">
            <span className="grid size-10 place-items-center rounded-xl bg-accent text-white shadow-sm">
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                className="size-5"
                aria-hidden="true"
              >
                <path d="M20 10c0 5-8 12-8 12S4 15 4 10a8 8 0 1 1 16 0Z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </span>
          </Link>
        )}

        {!mobileOpen && (
          <button
            type="button"
            onClick={() => onCollapsedChange((value) => !value)}
            className="hidden size-8 items-center justify-center rounded-lg text-ink-soft hover:bg-canvas hover:text-ink lg:flex"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? (
              <ChevronRight className="size-4" />
            ) : (
              <ChevronLeft className="size-4" />
            )}
          </button>
        )}

        {mobileOpen && (
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="rounded-lg p-2 text-ink-soft hover:bg-canvas lg:hidden"
            aria-label="Close navigation"
          >
            <X className="size-5" />
          </button>
        )}
      </div>

      <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-5">
        <div className="space-y-1">
          {!collapsed && (
            <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft/70">
              Workspace
            </p>
          )}

          {mainLinks.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              collapsed={collapsed && !mobileOpen}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}

          <button
            type="button"
            onClick={locateMe}
            title={collapsed && !mobileOpen ? "Locate me" : undefined}
            className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft transition hover:bg-canvas hover:text-ink ${
              collapsed && !mobileOpen ? "justify-center" : ""
            }`}
          >
            <LocateFixed className="size-[19px] shrink-0" strokeWidth={1.9} />
            {(!collapsed || mobileOpen) && <span>Locate me</span>}
          </button>
        </div>

        {admin && (
          <div className="space-y-1">
            {!collapsed && (
              <p className="mb-2 px-3 text-[11px] font-bold uppercase tracking-[0.12em] text-ink-soft/70">
                Administration
              </p>
            )}

            {adminLinks.map((link) => (
              <NavLink
                key={link.href}
                {...link}
                collapsed={collapsed && !mobileOpen}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
          </div>
        )}
      </nav>

      <div className="shrink-0 border-t border-line p-3">
        <Link
          href="/account"
          onClick={() => setMobileOpen(false)}
          title={
            collapsed && !mobileOpen
              ? `${firstName} · Account settings`
              : undefined
          }
          className={`mb-2 flex min-h-12 items-center gap-3 rounded-xl px-2 text-ink hover:bg-canvas ${
            collapsed && !mobileOpen ? "justify-center" : ""
          }`}
        >
          <span className="grid size-9 shrink-0 place-items-center rounded-full bg-accent-soft text-sm font-bold text-accent">
            {initial}
          </span>

          {(!collapsed || mobileOpen) && (
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-semibold">
                {firstName}
              </span>
              <span className="block text-xs text-ink-soft">
                Account settings
              </span>
            </span>
          )}

          {(!collapsed || mobileOpen) && (
            <Settings className="size-4 shrink-0 text-ink-soft" />
          )}
        </Link>

        <LogoutButton collapsed={collapsed && !mobileOpen} />
      </div>
    </>
  );

  return (
    <>
      {/* Mobile navigation bar */}
      {/* Mobile navigation bar */}
      <div
        className={`z-[600] flex h-12 shrink-0 items-center justify-between border border-line/70 bg-white/75 px-4 shadow-soft backdrop-blur-xl lg:hidden ${
          overlay ? "absolute left-3 right-3 top-2 rounded-2xl" : "relative"
        }`}
      >
        <Logo />

        <div className="flex items-center gap-2">
          {/* Locate me */}
          <button
            type="button"
            onClick={locateMe}
            className="flex size-10 items-center justify-center rounded-xl text-accent transition hover:bg-accent-soft active:scale-95"
            aria-label="Locate me"
            title="Locate me"
          >
            <LocateFixed className="size-5" strokeWidth={1.9} />
          </button>

          {/* Open sidebar */}
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="flex size-10 items-center justify-center rounded-xl text-ink transition hover:bg-canvas active:scale-95"
            aria-label="Open navigation"
            title="Open navigation"
          >
            <Menu className="size-6" />
          </button>
        </div>
      </div>

      {/* Desktop sidebar */}
      <aside
        className={`fixed inset-y-3 left-3 z-[600] hidden flex-col rounded-2xl border border-line/70 bg-surface shadow-float backdrop-blur-xl transition-[width] duration-200 lg:flex ${
          collapsed ? "w-[76px]" : "w-[250px]"
        }`}
      >
        {sidebarContent}
      </aside>

      {/* Mobile drawer */}
      {/* Mobile slide-in drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[1000] lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setMobileOpen(false)}
            className="mapit-mobile-backdrop absolute inset-0 bg-black/20 backdrop-blur-[2px]"
          />

          <aside className="mapit-mobile-drawer absolute inset-y-0 left-0 flex w-[200px] max-w-[80vw] flex-col overflow-hidden rounded-r-2xl border-r border-white/70 bg-white/75 shadow-float backdrop-blur-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
