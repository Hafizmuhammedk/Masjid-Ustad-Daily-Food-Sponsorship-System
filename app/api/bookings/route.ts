import { NextRequest, NextResponse } from "next/server";
import { readDb, withDbWrite } from "@/lib/local-db";
import { bookingCreateSchema, monthlyQuerySchema, toUTCDateOnly } from "@/lib/validators";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = bookingCreateSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const db = await readDb();
    const sponsor = db.sponsors.find((item) => item.id === parsed.data.sponsorId);
    if (!sponsor) {
      return NextResponse.json({ message: "Sponsor not found" }, { status: 400 });
    }

    const bookingDate = toUTCDateOnly(parsed.data.bookingDate);
    const bookingDateIso = bookingDate.toISOString();

    const booking = await withDbWrite((currentDb) => {
      const hasDuplicateSlot = currentDb.bookings.some(
        (item) => item.bookingDate === bookingDateIso && item.mealType === parsed.data.mealType
      );
      if (hasDuplicateSlot) {
        throw new Error("MEAL_SLOT_ALREADY_BOOKED");
      }

      const sponsorEntity = currentDb.sponsors.find((item) => item.id === parsed.data.sponsorId);
      if (!sponsorEntity) {
        throw new Error("SPONSOR_NOT_FOUND");
      }

      const id = currentDb.counters.booking + 1;
      currentDb.counters.booking = id;

      const newBooking = {
        id,
        sponsorId: parsed.data.sponsorId,
        bookingDate: bookingDateIso,
        foodNote: parsed.data.foodNote || null,
        mealType: parsed.data.mealType,
        status: "booked",
        createdAt: new Date().toISOString()
      };
      currentDb.bookings.push(newBooking);

      return {
        ...newBooking,
        sponsor: {
          id: sponsorEntity.id,
          fullName: sponsorEntity.fullName,
          phone: sponsorEntity.phone,
          email: sponsorEntity.email
        }
      };
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "MEAL_SLOT_ALREADY_BOOKED") {
      return NextResponse.json({ message: "Selected meal slot already booked for this date" }, { status: 400 });
    }
    if (error instanceof Error && error.message === "SPONSOR_NOT_FOUND") {
      return NextResponse.json({ message: "Sponsor not found" }, { status: 400 });
    }
    console.error("POST /api/bookings failed:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams;
    const parsed = monthlyQuerySchema.safeParse({
      month: params.get("month"),
      year: params.get("year")
    });
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { month, year } = parsed.data;
    const start = new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0));
    const end = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));

    const db = await readDb();
    const bookings = db.bookings
      .filter((booking) => {
        const date = new Date(booking.bookingDate);
        return date >= start && date < end;
      })
      .sort((a, b) => a.bookingDate.localeCompare(b.bookingDate));

    const result = bookings.map((booking) => ({
      id: booking.id,
      bookingDate: booking.bookingDate,
      sponsorName: db.sponsors.find((sponsor) => sponsor.id === booking.sponsorId)?.fullName ?? "Unknown",
      foodNote: booking.foodNote,
      mealType: booking.mealType,
      status: booking.status
    }));

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("GET /api/bookings failed:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
