import { NextResponse } from "next/server";
import { withDbWrite } from "@/lib/local-db";

export const runtime = "nodejs";

type Params = {
  params: Promise<{ id: string }>;
};

export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const bookingId = Number(id);
    if (!Number.isInteger(bookingId) || bookingId <= 0) {
      return NextResponse.json({ message: "Invalid booking id" }, { status: 400 });
    }

    const deleted = await withDbWrite((db) => {
      const bookingIndex = db.bookings.findIndex((item) => item.id === bookingId);
      if (bookingIndex === -1) {
        throw new Error("BOOKING_NOT_FOUND");
      }
      const [removed] = db.bookings.splice(bookingIndex, 1);
      return removed;
    });

    return NextResponse.json(deleted, { status: 200 });
  } catch (error) {
    if (error instanceof Error && error.message === "BOOKING_NOT_FOUND") {
      return NextResponse.json({ message: "Booking not found" }, { status: 404 });
    }
    console.error("DELETE /api/admin/bookings/:id failed:", error);
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
