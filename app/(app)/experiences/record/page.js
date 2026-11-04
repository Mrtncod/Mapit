import { Suspense } from "react";
import { getCategories } from "@/lib/db/experiences";
import RecordRoute from "@/components/RecordRoute";
import MapLoading from "@/components/map/MapLoading";

async function Loader() {
  const categories = await getCategories();

  return (
    <RecordRoute
      categories={categories.filter((c) => c.applies_to !== "spot")}
    />
  );
}

export default function RecordPage() {
  return (
    <main className="relative h-full min-h-0 overflow-hidden">
      <Suspense fallback={<MapLoading message="Loading route recorder..." />}>
        <Loader />
      </Suspense>
    </main>
  );
}
