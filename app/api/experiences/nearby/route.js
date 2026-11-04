import { NextResponse } from "next/server";
import { z } from "zod";
import { getNearbyExperiences } from "@/lib/db/experiences";

const schema = z.object({
  lat: z.coerce.number().min(-90).max(90),
  lng: z.coerce.number().min(-180).max(180),
  radius: z.coerce.number().min(100).max(50000).default(2000),
  q: z.string().trim().max(100).default(""),
  category: z.string().trim().max(80).default(""),
});

export async function GET(request) {
  const params = Object.fromEntries(new URL(request.url).searchParams);

  const parsed = schema.safeParse(params);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
  }

  const { lat, lng, radius, q, category } = parsed.data;

  const rows = await getNearbyExperiences({
    lat,
    lng,
    radiusM: radius,
    searchTerm: q,
    categorySlug: category,
  });

  return NextResponse.json(rows.map(({ user_id, ...rest }) => rest));
}
