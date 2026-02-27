import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/lib/local-db";
import { monthlyQuerySchema } from "@/lib/validators";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const month = params.get("month");
    const year = params.get("year");

    let monthStart: Date | null = null;
    let monthEnd: Date | null = null;
    if (month && year) {
      const parsed = monthlyQuerySchema.safeParse({ month, year });
      if (!parsed.success) {
        return NextResponse.json(
          { message: "Validation failed", errors: parsed.error.flatten() },
          { status: 400 }
        );
      }

      monthStart = new Date(Date.UTC(parsed.data.year, parsed.data.month - 1, 1, 0, 0, 0, 0));
      monthEnd = new Date(Date.UTC(parsed.data.year, parsed.data.month, 1, 0, 0, 0, 0));
    }

    const db = await readDb();
    const bookings = db.bookings
      .filter((booking) => {
        if (!monthStart || !monthEnd) {
          return true;
        }
        const date = new Date(booking.bookingDate);
        return date >= monthStart && date < monthEnd;
      })
      .sort((a, b) => a.bookingDate.localeCompare(b.bookingDate))
      .map((booking) => ({
        ...booking,
        sponsor: db.sponsors.find((sponsor) => sponsor.id === booking.sponsorId) ?? null
      }));

    return NextResponse.json(bookings, { status: 200 });
  } catch (error) {
    console.error("GET /api/admin/bookings failed:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
