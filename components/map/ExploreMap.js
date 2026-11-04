"use client";

import dynamic from "next/dynamic";
import FreshMount from "./FreshMount";
import MapLoading from "./MapLoading";

const MapView = dynamic(() => import("./MapView"), {
  ssr: false,
});

export default function ExploreMap({
  categories = [],
  initialExperiences = [],
  focusExperienceId = null,
  collectionMode = false,
}) {
  return (
    <FreshMount fallback={<MapLoading />}>
      <MapView
        categories={categories}
        initialExperiences={initialExperiences}
        focusExperienceId={focusExperienceId}
        collectionMode={collectionMode}
      />
    </FreshMount>
  );
}
