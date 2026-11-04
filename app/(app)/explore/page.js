import ExploreMap from "@/components/map/ExploreMap";
import { getCategories } from "@/lib/db/experiences";

export default async function ExplorePage() {
  const categories = await getCategories();

  return (
    <div className="h-full min-h-0">
      <ExploreMap categories={categories} />
    </div>
  );
}
