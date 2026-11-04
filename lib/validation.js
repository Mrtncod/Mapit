import { z } from "zod";

export const experienceSchema = z
  .object({
    kind: z.enum(["spot", "route"]).default("spot"),
    categoryId: z.coerce.number().int().positive(),
    sentiment: z.enum(["good", "bad", "warning"]),
    title: z.string().trim().min(1).max(120),
    placeName: z.string().trim().max(120).optional().nullable(),
    description: z.string().trim().min(1).max(2000),
    visibility: z.enum(["public", "private"]).default("private"),
    lat: z.coerce.number().min(-90).max(90),
    lng: z.coerce.number().min(-180).max(180),
    accuracyM: z.coerce.number().min(0).optional().nullable(),
    placeRef: z.string().max(100).optional().nullable(),
    // Route only: array of [lng, lat] pairs
    path: z
      .array(
        z.tuple([z.number().min(-180).max(180), z.number().min(-90).max(90)]),
      )
      .min(2)
      .max(20000)
      .optional()
      .nullable(),
    distanceM: z.coerce.number().int().min(0).optional().nullable(),
    durationS: z.coerce.number().int().min(0).optional().nullable(),
    elevationGainM: z.coerce.number().int().min(0).optional().nullable(),
    startedAt: z.coerce.date().optional().nullable(),
  })
  .refine((v) => (v.kind === "route" ? !!v.path : !v.path), {
    message: "Routes need a path, spots must not have one",
  });

export const editSchema = z.object({
  categoryId: z.coerce.number().int().positive(),
  sentiment: z.enum(["good", "bad", "warning"]),
  title: z.string().trim().min(1).max(120),
  placeName: z.string().trim().max(120).optional().nullable(),
  description: z.string().trim().min(1).max(2000),
  visibility: z.enum(["public", "private"]),
});

export const idSchema = z.string().uuid();

export const reportSchema = z.object({
  reason: z.enum(["spam", "offensive", "false", "private_info", "other"]),
  details: z.string().trim().max(500).optional().nullable(),
});

export const moderationSchema = z.enum(["hide", "restore", "dismiss"]);

export const noteSchema = z.string().trim().max(500).optional().nullable();
