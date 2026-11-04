import { Suspense } from "react";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";
import { isAdmin } from "@/lib/db/moderation";
import AppShell from "@/components/AppShell";
import AppLoading from "@/components/AppLoading";

async function Guard({ children }) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const admin = await isAdmin();

  return (
    <AppShell user={session.user} admin={admin}>
      {children}
    </AppShell>
  );
}

export default function AppLayout({ children }) {
  return (
    <Suspense fallback={<AppLoading />}>
      <Guard>{children}</Guard>
    </Suspense>
  );
}
// import { Suspense } from "react";
// import { redirect } from "next/navigation";
// import { getSession } from "@/lib/session";
// import LogoutButton from "@/components/LogoutButton";
// import Link from "next/link";
// import { isAdmin } from "@/lib/db/moderation";

// async function Guard({ children }) {
//   const session = await getSession();
//   if (!session) redirect("/login");

//   return (
//     <>
//       <header style={{ display: "flex", gap: 16, padding: 16 }}>
//         <span>Signed in as {session.user.name}</span>
//         <Link href="/me">My experiences</Link>
//         <Link href="/explore">Explore</Link>
//         <Link href="/experiences/new">Add experience</Link>
//         <Link href="/experiences/record">Record route</Link>
//         <LogoutButton />
//       </header>
//       {children}
//     </>
//   );
// }

// export default function AppLayout({ children }) {
//   return (
//     <Suspense fallback={<p style={{ padding: 40 }}>Loading...</p>}>
//       <Guard>{children}</Guard>
//     </Suspense>
//   );
// }
