"use client";

import dynamic from "next/dynamic";
import FreshMount from "./FreshMount";
import MapLoading from "./MapLoading";

const RecordMapView = dynamic(() => import("./RecordMapView"), {
  ssr: false,
});

export default function RecordMap(props) {
  return (
    <FreshMount fallback={<MapLoading />}>
      <RecordMapView {...props} />
    </FreshMount>
  );
}
