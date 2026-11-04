"use client";

import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton({ collapsed = false }) {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={handleLogout}
      title={collapsed ? "Log out" : undefined}
      className={`flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-ink-soft transition hover:bg-red-50 hover:text-bad ${
        collapsed ? "justify-center" : ""
      }`}
    >
      <LogOut className="size-[19px] shrink-0" strokeWidth={1.9} />
      {!collapsed && <span>Log out</span>}
    </button>
  );
}
