import { Suspense } from "react";
import { notFound } from "next/navigation";

import { getExperience, getCategories } from "@/lib/db/experiences";
import { getSession } from "@/lib/session";
import { updateExperienceAction } from "@/app/(app)/experiences/actions";
import EditExperienceForm from "@/components/EditExperienceForm";
import LocationPicker from "@/components/map/LocationPicker";
import AppLoading from "@/components/AppLoading";

async function Editor({ params }) {
  const { id } = await params;

  const [e, session, categories] = await Promise.all([
    getExperience(id),
    getSession(),
    getCategories(),
  ]);

  if (!e || !session || e.user_id !== session.user.id) notFound();

  const allowed = categories.filter(
    (c) => c.applies_to === "both" || c.applies_to === e.kind,
  );

  return (
    <>
      <div className="absolute inset-0 z-0">
        <LocationPicker
          pin={{ lat: Number(e.lat), lng: Number(e.lng) }}
          accuracy={null}
          interactive={false}
        />
      </div>

      <EditExperienceForm
        experience={e}
        categories={allowed}
        action={updateExperienceAction.bind(null, id)}
      />
    </>
  );
}

export default function EditPage({ params }) {
  return (
    <main className="relative h-full min-h-0 w-full overflow-hidden bg-canvas">
      <Suspense
        fallback={<AppLoading message="Preparing experience editor..." />}
      >
        <Editor params={params} />
      </Suspense>
    </main>
  );
}
