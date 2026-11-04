"use server";

import { reportExperience } from "@/lib/db/moderation";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  createExperience,
  updateExperience,
  deleteExperience,
  setVisibility,
} from "@/lib/db/experiences";

const KNOWN_ERRORS = [
  "Not authenticated",
  "Invalid category for this kind of experience",
  "You're posting too fast. Please try again later.",
  "You're reporting too fast. Please try again later.",
];

export async function createSpotAction(prevState, formData) {
  // Returned with errors so the form can refill itself (React resets forms after an action)
  const values = Object.fromEntries(formData);

  try {
    await createExperience({
      kind: "spot",
      categoryId: formData.get("categoryId"),
      sentiment: formData.get("sentiment"),
      title: formData.get("title"),
      placeName: formData.get("placeName") || null,
      description: formData.get("description"),
      visibility: formData.get("visibility"),
      lat: formData.get("lat"),
      lng: formData.get("lng"),
      accuracyM: formData.get("accuracyM") || null,
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return {
        error: "Please check all fields (title and description are required).",
        values,
      };
    }
    if (KNOWN_ERRORS.includes(err.message)) {
      return { error: err.message, values };
    }
    console.error(err);
    return { error: "Something went wrong. Please try again.", values };
  }

  revalidatePath("/explore");
  redirect("/explore"); // must stay outside the try/catch
}

// Bound to the experience id in the edit page: updateExperienceAction.bind(null, id)
export async function updateExperienceAction(id, prevState, formData) {
  const values = Object.fromEntries(formData);
  let ok = false;

  try {
    ok = await updateExperience(id, {
      categoryId: formData.get("categoryId"),
      sentiment: formData.get("sentiment"),
      title: formData.get("title"),
      placeName: formData.get("placeName") || null,
      description: formData.get("description"),
      visibility: formData.get("visibility"),
    });
  } catch (err) {
    if (err.name === "ZodError") {
      return {
        error: "Please check all fields (title and description are required).",
        values,
      };
    }
    if (err.message === "Not authenticated")
      return { error: err.message, values };
    console.error(err);
    return { error: "Something went wrong. Please try again.", values };
  }

  if (!ok)
    return {
      error: "Couldn't save. It may have been deleted, or it isn't yours.",
      values,
    };

  revalidatePath("/me");
  revalidatePath("/explore");
  redirect("/me");
}

export async function deleteExperienceAction(formData) {
  await deleteExperience(formData.get("id"));
  revalidatePath("/me");
  revalidatePath("/explore");
  redirect("/me");
}

export async function setVisibilityAction(formData) {
  await setVisibility(formData.get("id"), formData.get("visibility"));
  revalidatePath("/me");
  revalidatePath("/explore");
}

export async function createRouteAction(input) {
  try {
    const path = Array.isArray(input?.path) ? input.path : null;
    const start = path?.[0];

    const id = await createExperience({
      kind: "route",
      categoryId: input?.categoryId,
      sentiment: input?.sentiment,
      title: input?.title,
      description: input?.description,
      visibility: input?.visibility,
      lat: start?.[1],
      lng: start?.[0],
      path,
      distanceM: input?.distanceM,
      durationS: input?.durationS,
      elevationGainM: input?.elevationGainM,
      startedAt: input?.startedAt,
    });

    revalidatePath("/me");
    revalidatePath("/explore");
    return { id };
  } catch (err) {
    if (err.name === "ZodError") {
      return {
        error: "Please check all fields (title and description are required).",
      };
    }
    if (KNOWN_ERRORS.includes(err.message)) return { error: err.message };
    console.error(err);
    return { error: "Something went wrong. Please try again." };
  }
}

export async function reportExperienceAction(id, prevState, formData) {
  try {
    const ok = await reportExperience(id, {
      reason: formData.get("reason"),
      details: formData.get("details") || null,
    });
    if (!ok)
      return {
        error: "This can't be reported, or you've already reported it.",
      };
    return { message: "Thanks. We'll review it." };
  } catch (err) {
    if (err.name === "ZodError") return { error: "Please choose a reason." };
    if (KNOWN_ERRORS.includes(err.message)) return { error: err.message };
    console.error(err);
    return { error: "Something went wrong. Please try again." };
  }
}
