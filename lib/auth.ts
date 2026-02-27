import { jwtVerify, SignJWT } from "jose";
import type { NextRequest } from "next/server";

const TOKEN_COOKIE_NAME = "admin_token";

type AdminTokenPayload = {
  adminId: number;
  username: string;
};

function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (secret) {
    return new TextEncoder().encode(secret);
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("JWT_SECRET is not configured.");
  }

  // Dev fallback to prevent admin login crashes when .env is missing.
  return new TextEncoder().encode("dev-only-insecure-jwt-secret");
}

export function getTokenCookieName(): string {
  return TOKEN_COOKIE_NAME;
}

export async function signAdminToken(payload: AdminTokenPayload): Promise<string> {
  const expiresIn = process.env.JWT_EXPIRES_IN ?? "30m";

  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256", typ: "JWT" })
    .setIssuedAt()
    .setExpirationTime(expiresIn)
    .sign(getJwtSecret());
}

export async function verifyAdminToken(token: string): Promise<AdminTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecret());
    if (typeof payload.adminId !== "number" || typeof payload.username !== "string") {
      return null;
    }
    return {
      adminId: payload.adminId,
      username: payload.username
    };
  } catch {
    return null;
  }
}

export async function getAdminFromRequest(request: NextRequest): Promise<AdminTokenPayload | null> {
  const token = request.cookies.get(TOKEN_COOKIE_NAME)?.value;
  if (!token) {
    return null;
  }
  return verifyAdminToken(token);
}
