import { NextResponse } from "next/server";
import { withDbWrite } from "@/lib/local-db";
import { sponsorCreateSchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = sponsorCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const sponsor = await withDbWrite((db) => {
      const id = db.counters.sponsor + 1;
      db.counters.sponsor = id;

      const newSponsor = {
        id,
        fullName: parsed.data.fullName,
        phone: parsed.data.phone,
        email: parsed.data.email || null,
        createdAt: new Date().toISOString()
      };

      db.sponsors.push(newSponsor);
      return newSponsor;
    });

    return NextResponse.json(sponsor, { status: 201 });
  } catch (error) {
    console.error("POST /api/sponsors failed:", error);
    return NextResponse.json(
      {
        message: "Internal server error",
        ...(process.env.NODE_ENV === "development" && error instanceof Error
          ? { detail: error.message }
          : {})
      },
      { status: 500 }
    );
  }
}
