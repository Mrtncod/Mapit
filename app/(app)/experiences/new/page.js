import { Suspense } from "react";
import { getCategories } from "@/lib/db/experiences";
import NewSpotForm from "@/components/NewSpotForm";
import AppLoading from "@/components/AppLoading";

async function FormLoader() {
  const categories = await getCategories();

  return (
    <NewSpotForm
      categories={categories.filter((c) => c.applies_to !== "route")}
    />
  );
}

export default function NewExperiencePage() {
  return (
    <main className="relative h-full min-h-0 overflow-hidden">
      <Suspense
        fallback={<AppLoading message="Preparing experience creator..." />}
      >
        <FormLoader />
      </Suspense>
    </main>
  );
}

// import { Suspense } from "react";
// import { getCategories } from "@/lib/db/experiences";
// import NewSpotForm from "@/components/NewSpotForm";

// async function FormLoader() {
//   const categories = await getCategories();
//   // Spots only for now; routes get their own form later
//   return (
//     <NewSpotForm
//       categories={categories.filter((c) => c.applies_to !== "route")}
//     />
//   );
// }

// export default function NewExperiencePage() {
//   return (
//     <main style={{ padding: 16, maxWidth: 720, margin: "0 auto" }}>
//       <h1>Add experience</h1>
//       <Suspense fallback={<p>Loading...</p>}>
//         <FormLoader />
//       </Suspense>
//     </main>
//   );
// }
