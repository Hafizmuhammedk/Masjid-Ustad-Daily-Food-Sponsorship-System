import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { readDb } from "@/lib/local-db";
import { adminLoginSchema } from "@/lib/validators";
import { getTokenCookieName, signAdminToken } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const parsed = adminLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: "Validation failed", errors: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const db = await readDb();
    const admin = db.admins.find((item) => item.username === parsed.data.username);
    if (!admin) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const valid = await bcrypt.compare(parsed.data.password, admin.passwordHash);
    if (!valid) {
      return NextResponse.json({ message: "Invalid credentials" }, { status: 401 });
    }

    const token = await signAdminToken({
      adminId: admin.id,
      username: admin.username
    });

    const response = NextResponse.json(
      { message: "Login successful", admin: { id: admin.id, username: admin.username } },
      { status: 200 }
    );

    response.cookies.set({
      name: getTokenCookieName(),
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 30 * 60,
      path: "/"
    });

    return response;
  } catch (error) {
    console.error("POST /api/admin/login failed:", error);
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
