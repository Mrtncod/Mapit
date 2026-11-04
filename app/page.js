import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/lib/session";

const experiences = [
  {
    icon: "✓",
    title: "Good experiences",
    description: "Discover places people genuinely enjoy.",
    color: "bg-green-100 text-green-700",
  },
  {
    icon: "×",
    title: "Bad experiences",
    description: "Know what might not be worth your time.",
    color: "bg-red-100 text-red-700",
  },
  {
    icon: "!",
    title: "Useful warnings",
    description: "Be aware of things others have noticed.",
    color: "bg-amber-100 text-amber-700",
  },
];

const markers = [
  { x: "23%", y: "28%", color: "#16a34a", icon: "✓" },
  { x: "67%", y: "19%", color: "#d97706", icon: "!" },
  { x: "43%", y: "58%", color: "#dc2626", icon: "×" },
  { x: "78%", y: "68%", color: "#16a34a", icon: "✓" },
  { x: "18%", y: "76%", color: "#16a34a", icon: "✓" },
];

function MapIllustration() {
  return (
    <div className="relative mx-auto w-full max-w-[600px]">
      <div className="relative aspect-[1.12/1] overflow-hidden rounded-[28px] border border-line bg-[#eeeee8] shadow-float sm:rounded-[36px]">
        {/* Map background */}
        <svg
          viewBox="0 0 600 540"
          preserveAspectRatio="xMidYMid slice"
          className="absolute inset-0 size-full"
          aria-hidden="true"
        >
          <rect width="600" height="540" fill="#eeeee8" />

          {/* Parks */}
          <path d="M-30 20 L170 0 L220 110 L145 190 L-20 160Z" fill="#dce9d8" />
          <path
            d="M390 300 L640 260 L640 560 L420 560 L360 430Z"
            fill="#dce9d8"
          />
          <path
            d="M250 370 L330 350 L390 460 L300 540 L210 470Z"
            fill="#e0eadb"
          />

          {/* River */}
          <path
            d="M-40 340 C100 260 170 410 290 300 S470 160 650 230"
            fill="none"
            stroke="#c7dce6"
            strokeWidth="55"
            strokeLinecap="round"
          />

          {/* Main roads */}
          <g
            fill="none"
            stroke="#ffffff"
            strokeWidth="23"
            strokeLinecap="round"
          >
            <path d="M-20 215 L620 90" />
            <path d="M80 -20 L230 580" />
            <path d="M430 -20 L350 580" />
            <path d="M-20 465 L620 380" />
            <path d="M160 100 L580 480" />
          </g>

          {/* Smaller roads */}
          <g fill="none" stroke="#d9d8d0" strokeWidth="2" strokeLinecap="round">
            <path d="M0 110 L600 0" />
            <path d="M0 280 L600 190" />
            <path d="M0 410 L600 330" />
            <path d="M300 0 L250 540" />
            <path d="M520 0 L480 540" />
            <path d="M0 520 L600 450" />
          </g>

          {/* Building blocks */}
          <g fill="#e3e1d9">
            <rect x="270" y="55" width="65" height="48" rx="7" />
            <rect x="365" y="130" width="55" height="43" rx="7" />
            <rect x="35" y="390" width="65" height="42" rx="7" />
            <rect x="460" y="300" width="70" height="40" rx="7" />
            <rect x="210" y="250" width="48" height="35" rx="6" />
          </g>
        </svg>

        {/* Map label */}
        <div className="absolute left-4 top-4 rounded-full border border-white/80 bg-white/90 px-3.5 py-2 text-xs font-bold text-ink shadow-sm backdrop-blur sm:left-6 sm:top-6">
          <span className="mr-2 inline-block size-2 rounded-full bg-green-500" />
          Explore experiences
        </div>

        {/* Experience markers */}
        {markers.map((marker, index) => (
          <div
            key={index}
            className="absolute grid size-9 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-[3px] border-white text-sm font-extrabold text-white shadow-lg sm:size-11"
            style={{
              left: marker.x,
              top: marker.y,
              backgroundColor: marker.color,
            }}
          >
            {marker.icon}
          </div>
        ))}

        {/* Floating experience card */}
        <div className="absolute bottom-4 left-4 right-4 rounded-2xl border border-white/80 bg-white/95 p-4 shadow-float backdrop-blur sm:bottom-6 sm:left-6 sm:right-auto sm:w-[290px] sm:p-5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-ink-soft">
              Recent experience
            </span>
            <span className="rounded-full bg-green-100 px-2.5 py-1 text-xs font-bold text-green-700">
              Good
            </span>
          </div>
          <h3 className="mt-2 font-bold text-ink">
            A lovely walk by the river
          </h3>
          <p className="mt-1 text-sm text-ink-soft">
            A peaceful route worth discovering.
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-ink-soft">
            <span>📍</span>
            <span>Shared by the community</span>
          </div>
        </div>
      </div>

      {/* Small floating label */}
      <div className="absolute -right-2 top-[25%] rounded-2xl border border-line bg-white px-3 py-2.5 shadow-soft sm:-right-5 sm:px-4">
        <div className="flex items-center gap-2">
          <span className="grid size-7 place-items-center rounded-full bg-green-100 text-sm text-green-700">
            ✓
          </span>
          <div>
            <p className="text-xs font-bold text-ink">Real experiences</p>
            <p className="text-[10px] text-ink-soft">From real people</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function Home() {
  const session = await getSession();

  if (session) redirect("/explore");

  return (
    <div className="min-h-dvh overflow-hidden">
      {/* Header */}
      <header className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 sm:px-8 lg:px-12">
        <Link href="/" className="flex items-center gap-2.5">
          <span className="grid size-10 place-items-center rounded-xl bg-accent text-lg text-white shadow-sm">
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

        <nav className="flex items-center gap-2 sm:gap-4">
          <Link
            href="/login"
            className="rounded-full px-4 py-2.5 text-sm font-semibold text-ink transition hover:bg-black/5"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-accent px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-accent-dark"
          >
            Sign up
          </Link>
        </nav>
      </header>

      {/* Hero */}
      <main>
        <section className="mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-10 sm:px-8 md:grid-cols-2 md:gap-8 md:py-20 lg:px-12 lg:py-24">
          <div className="relative z-10 max-w-xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-line bg-white px-3.5 py-2 text-xs font-bold text-ink-soft shadow-sm">
              <span className="size-2 rounded-full bg-accent" />
              Discover places through real experiences
            </div>

            <h1 className="text-[42px] leading-[1.08] font-extrabold tracking-[-0.045em] text-ink sm:text-5xl lg:text-[64px]">
              Every place has a story.
              <span className="mt-1 block text-accent">Find yours.</span>
            </h1>

            <p className="mt-6 max-w-lg text-base leading-8 text-ink-soft sm:text-lg">
              Discover the good, the bad and the things worth knowing. Share
              your experiences, explore places around you and build a map that
              tells the real story.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Link
                href="/signup"
                className="inline-flex min-h-13 items-center justify-center gap-3 rounded-full bg-accent px-7 py-3.5 font-bold text-white shadow-lg shadow-accent/20 transition hover:-translate-y-0.5 hover:bg-accent-dark"
              >
                Get started
                <span aria-hidden="true">→</span>
              </Link>
              <span className="text-sm text-ink-soft">
                Free to join. Your map, your choice.
              </span>
            </div>

            <div className="mt-10 flex flex-col items-start gap-3 border-t border-line pt-6 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-6 sm:gap-y-3">
              <span className="text-sm font-semibold text-ink-soft">
                Built around real experiences
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <span className="text-green-600">✓</span> Good
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <span className="text-red-600">×</span> Bad
              </span>
              <span className="flex items-center gap-1.5 text-sm font-semibold text-ink">
                <span className="text-amber-600">!</span> Warning
              </span>
            </div>
          </div>

          <div className="relative px-1 sm:px-4 md:px-0">
            <MapIllustration />
          </div>
        </section>
      </main>

      <footer className="border-t border-line px-5 py-7 text-center text-sm text-ink-soft">
        © {new Date().getFullYear()} Mapit. Explore with confidence.
      </footer>
    </div>
  );
}

// import Link from "next/link";
// import { redirect } from "next/navigation";
// import { getSession } from "@/lib/session";

// const FEATURES = [
//   {
//     icon: "📍",
//     title: "Pin the moment",
//     text: "Drop an experience at the exact spot: a bar, a park, a playground, a street.",
//   },
//   {
//     icon: "🥾",
//     title: "Record your routes",
//     text: "Walk, run, hike or ride with live GPS, then rate the track and share it.",
//   },
//   {
//     icon: "🔒",
//     title: "You choose who sees it",
//     text: "Keep it private as your own map, or make it public to help others nearby.",
//   },
// ];

// const PINS = [
//   { color: "bg-good", icon: "🍺", pos: "top-[22%] left-[24%]" },
//   { color: "bg-warning", icon: "🚧", pos: "top-[46%] left-[62%]" },
//   { color: "bg-bad", icon: "🍔", pos: "top-[66%] left-[30%]" },
//   { color: "bg-good", icon: "🌳", pos: "top-[28%] left-[72%]" },
// ];

// export default async function Home() {
//   const session = await getSession();
//   if (session) redirect("/explore");

//   return (
//     <div className="min-h-dvh pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]">
//       <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
//         <span className="flex items-center gap-2 text-xl font-extrabold tracking-tight">
//           <span className="grid size-9 place-items-center rounded-xl bg-accent-soft text-lg">
//             📍
//           </span>
//           Mapit
//         </span>
//         <Link href="/login" className="px-3 py-2.5 font-semibold">
//           Log in
//         </Link>
//       </header>

//       <main>
//         <section className="mx-auto grid max-w-6xl gap-8 px-5 pt-4 pb-10 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-12 md:pt-12 md:pb-16">
//           <div>
//             <p className="mb-3 text-sm font-bold tracking-wider text-accent uppercase">
//               Real places. Real experiences.
//             </p>
//             <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
//               See what it&rsquo;s really like, wherever you are.
//             </h1>
//             <p className="mt-4 max-w-lg text-lg text-ink-soft">
//               Mark the good, the bad and the dangerous. Mapit is a map of honest
//               experiences from people around you, and a private diary for the
//               rest.
//             </p>
//             <div className="mt-7 flex flex-wrap gap-3">
//               <Link
//                 href="/signup"
//                 className="btn btn-primary flex-1 sm:flex-none"
//               >
//                 Get started
//               </Link>
//               <Link
//                 href="/login"
//                 className="btn btn-secondary flex-1 sm:flex-none"
//               >
//                 Log in
//               </Link>
//             </div>
//           </div>

//           <div
//             aria-hidden="true"
//             className="relative min-h-80 overflow-hidden rounded-card border border-line bg-[#efeee7] bg-[linear-gradient(#e6e4dc_1px,transparent_1px),linear-gradient(90deg,#e6e4dc_1px,transparent_1px)] bg-[size:44px_44px] shadow-soft md:min-h-110"
//           >
//             {PINS.map((p, i) => (
//               <div
//                 key={i}
//                 className={`absolute grid size-10 -rotate-45 place-items-center rounded-[50%_50%_50%_0] border-[3px] border-white shadow-lg ${p.color} ${p.pos}`}
//               >
//                 <span className="rotate-45 text-lg">{p.icon}</span>
//               </div>
//             ))}
//             <div className="absolute inset-x-4 bottom-4 grid gap-0.5 rounded-2xl bg-surface p-4 shadow-float">
//               <strong>Evening run along the river</strong>
//               <span className="text-sm text-ink-soft">
//                 🏃 8.4 km · 👍 Good · 🌍 Public
//               </span>
//             </div>
//           </div>
//         </section>

//         <section className="mx-auto max-w-6xl px-5 py-6 text-center">
//           <h2 className="text-2xl font-bold">Three ways to rate a place</h2>
//           <div className="mt-4 flex flex-wrap justify-center gap-2.5">
//             <span className="rounded-full bg-green-100 px-5 py-2.5 font-bold text-green-800">
//               👍 Good
//             </span>
//             <span className="rounded-full bg-red-100 px-5 py-2.5 font-bold text-red-800">
//               👎 Bad
//             </span>
//             <span className="rounded-full bg-amber-100 px-5 py-2.5 font-bold text-amber-800">
//               ⚠️ Warning
//             </span>
//           </div>
//         </section>

//         <section className="mx-auto grid max-w-6xl gap-4 px-5 py-6 md:grid-cols-3">
//           {FEATURES.map((f) => (
//             <article
//               key={f.title}
//               className="rounded-card border border-line bg-surface p-6 shadow-soft"
//             >
//               <span className="grid size-12 place-items-center rounded-2xl bg-accent-soft text-2xl">
//                 {f.icon}
//               </span>
//               <h3 className="mt-3 mb-1.5 text-xl font-bold">{f.title}</h3>
//               <p className="text-ink-soft">{f.text}</p>
//             </article>
//           ))}
//         </section>

//         <section className="mx-5 mt-6 grid max-w-6xl justify-items-center gap-4 rounded-card bg-ink px-5 py-12 text-center text-white lg:mx-auto">
//           <h2 className="text-3xl font-bold">Start your map today</h2>
//           <Link href="/signup" className="btn btn-primary">
//             Create a free account
//           </Link>
//         </section>
//       </main>

//       <footer className="px-5 py-7 text-center text-sm text-ink-soft">
//         © {new Date().getFullYear()} Mapit
//       </footer>
//     </div>
//   );
// }

// import Link from "next/link";
// import { redirect } from "next/navigation";
// import { getSession } from "@/lib/session";
// import styles from "./home.module.css";

// const FEATURES = [
//   {
//     icon: "📍",
//     title: "Pin the moment",
//     text: "Drop an experience at the exact spot: a bar, a park, a playground, a street.",
//   },
//   {
//     icon: "🥾",
//     title: "Record your routes",
//     text: "Walk, run, hike or ride with live GPS, then rate the track and share it.",
//   },
//   {
//     icon: "🔒",
//     title: "You choose who sees it",
//     text: "Keep it private as your own map, or make it public to help others nearby.",
//   },
// ];

// export default async function Home() {
//   const session = await getSession();
//   if (session) redirect("/explore");

//   return (
//     <div className={styles.page}>
//       <header className={styles.header}>
//         <span className={styles.logo}>
//           <span className={styles.logoMark}>📍</span> Mapit
//         </span>
//         <Link href="/login" className={styles.headerLink}>
//           Log in
//         </Link>
//       </header>

//       <main>
//         <section className={styles.hero}>
//           <div className={styles.heroText}>
//             <p className={styles.eyebrow}>Real places. Real experiences.</p>
//             <h1>See what it&rsquo;s really like, wherever you are.</h1>
//             <p className={styles.lead}>
//               Mark the good, the bad and the dangerous. Mapit is a map of honest
//               experiences from people around you, and a private diary for the
//               rest.
//             </p>
//             <div className={styles.cta}>
//               <Link href="/signup" className="btn btn-primary">
//                 Get started
//               </Link>
//               <Link href="/login" className="btn btn-secondary">
//                 Log in
//               </Link>
//             </div>
//           </div>

//           <div className={styles.preview} aria-hidden="true">
//             <div
//               className={`${styles.pin} ${styles.pinGood}`}
//               style={{ top: "22%", left: "24%" }}
//             >
//               <span>🍺</span>
//             </div>
//             <div
//               className={`${styles.pin} ${styles.pinWarning}`}
//               style={{ top: "46%", left: "62%" }}
//             >
//               <span>🚧</span>
//             </div>
//             <div
//               className={`${styles.pin} ${styles.pinBad}`}
//               style={{ top: "68%", left: "30%" }}
//             >
//               <span>🍔</span>
//             </div>
//             <div
//               className={`${styles.pin} ${styles.pinGood}`}
//               style={{ top: "30%", left: "72%" }}
//             >
//               <span>🌳</span>
//             </div>
//             <div className={styles.previewCard}>
//               <strong>Evening run along the river</strong>
//               <span>🏃 8.4 km · 👍 Good · 🌍 Public</span>
//             </div>
//           </div>
//         </section>

//         <section className={styles.legend}>
//           <h2>Three ways to rate a place</h2>
//           <div className={styles.legendRow}>
//             <span className={`${styles.tag} ${styles.tagGood}`}>👍 Good</span>
//             <span className={`${styles.tag} ${styles.tagBad}`}>👎 Bad</span>
//             <span className={`${styles.tag} ${styles.tagWarning}`}>
//               ⚠️ Warning
//             </span>
//           </div>
//         </section>

//         <section className={styles.features}>
//           {FEATURES.map((f) => (
//             <article key={f.title} className={styles.card}>
//               <span className={styles.cardIcon}>{f.icon}</span>
//               <h3>{f.title}</h3>
//               <p>{f.text}</p>
//             </article>
//           ))}
//         </section>

//         <section className={styles.final}>
//           <h2>Start your map today</h2>
//           <Link href="/signup" className="btn btn-primary">
//             Create a free account
//           </Link>
//         </section>
//       </main>

//       <footer className={styles.footer}>
//         <span>© {new Date().getFullYear()} Mapit</span>
//       </footer>
//     </div>
//   );
// }

// import { Suspense } from "react";
// import { query } from "@/lib/db";
// import Link from "next/link";

// async function DbStatus() {
//   try {
//     const [row] = await query("SELECT now() AS time");
//     return <p>Connected. Server time: {row.time.toISOString()}</p>;
//   } catch (err) {
//     return <p>Failed: {err.message}</p>;
//   }
// }

// export default function Home() {
//   return (
//     <main style={{ padding: 40 }}>
//       <h1>Experience Map</h1>
//       <p>
//         <Link href="/login">Log in</Link> · <Link href="/signup">Sign up</Link>
//       </p>
//       <Suspense fallback={<p>Checking database...</p>}>
//         <DbStatus />
//       </Suspense>
//     </main>
//   );
// }
