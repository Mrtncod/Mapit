import { NextResponse } from "next/server";
import { getSession } from "@/lib/session";

export async function GET() {
  const session = await getSession();

  return NextResponse.json(
    { userId: session?.user?.id ?? null },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
