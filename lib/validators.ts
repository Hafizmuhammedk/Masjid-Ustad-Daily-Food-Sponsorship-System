import { z } from "zod";

const ymdRegex = /^\d{4}-\d{2}-\d{2}$/;

function parseDateOnlyUTC(value: string): Date {
  const [year, month, day] = value.split("-").map(Number);
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0));
}

function isFutureDateOnly(value: string): boolean {
  if (!ymdRegex.test(value)) {
    return false;
  }
  const selected = parseDateOnlyUTC(value);
  const now = new Date();
  const todayUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
  return selected > todayUtc;
}

export function toUTCDateOnly(value: string): Date {
  return parseDateOnlyUTC(value);
}

export const sponsorCreateSchema = z.object({
  fullName: z.string().trim().min(1, "fullName is required"),
  phone: z.string().trim().min(1, "phone is required"),
  email: z.string().trim().email("email is invalid").optional().or(z.literal(""))
});

export const bookingCreateSchema = z.object({
  sponsorId: z.number().int().positive("sponsorId must be positive"),
  bookingDate: z
    .string()
    .regex(ymdRegex, "bookingDate must be in YYYY-MM-DD format")
    .refine((value) => isFutureDateOnly(value), "bookingDate must be a future date"),
  foodNote: z.string().trim().optional(),
  mealType: z.enum(["morning", "lunch", "dinner"], {
    message: "mealType must be one of: morning, lunch, dinner"
  })
});

export const monthlyQuerySchema = z.object({
  month: z.coerce.number().int().min(1).max(12),
  year: z.coerce.number().int().min(2000).max(2100)
});

export const adminLoginSchema = z.object({
  username: z.string().trim().min(1, "username is required"),
  password: z.string().min(1, "password is required")
});
