"use client";

import dynamic from "next/dynamic";
import FreshMount from "./FreshMount";
import MapLoading from "./MapLoading";

const PickerMap = dynamic(() => import("./PickerMap"), {
  ssr: false,
});

export default function LocationPicker(props) {
  return (
    <FreshMount
      fallback={<MapLoading message="Preparing location picker..." />}
    >
      <PickerMap {...props} />
    </FreshMount>
  );
}
