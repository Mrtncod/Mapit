"use server";

import { revalidatePath } from "next/cache";
import { moderate } from "@/lib/db/moderation";

export async function moderateAction(formData) {
  await moderate(
    formData.get("id"),
    formData.get("action"),
    formData.get("note") || null,
  );
  revalidatePath("/admin", "layout");
  revalidatePath("/explore");
}

// "use server";

// import { revalidatePath } from "next/cache";
// import { moderate } from "@/lib/db/moderation";

// export async function moderateAction(formData) {
//   await moderate(formData.get("id"), formData.get("action"));
//   revalidatePath("/admin/reports");
//   revalidatePath("/explore");
// }
