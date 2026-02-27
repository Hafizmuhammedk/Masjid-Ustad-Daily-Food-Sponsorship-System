import { promises as fs } from "fs";
import path from "path";
import bcrypt from "bcryptjs";

export type Sponsor = {
  id: number;
  fullName: string;
  phone: string;
  email: string | null;
  createdAt: string;
};

export type Booking = {
  id: number;
  bookingDate: string;
  foodNote: string | null;
  mealType: "morning" | "lunch" | "dinner";
  status: string;
  sponsorId: number;
  createdAt: string;
};

export type Admin = {
  id: number;
  username: string;
  passwordHash: string;
  createdAt: string;
};

type LocalDb = {
  sponsors: Sponsor[];
  bookings: Booking[];
  admins: Admin[];
  counters: {
    sponsor: number;
    booking: number;
    admin: number;
  };
};

const dbPath = path.join(process.cwd(), "data", "local-db.json");

let writeQueue: Promise<unknown> = Promise.resolve();

function nowIso(): string {
  return new Date().toISOString();
}

async function ensureDbFile(): Promise<void> {
  await fs.mkdir(path.dirname(dbPath), { recursive: true });

  try {
    await fs.access(dbPath);
  } catch {
    const username = process.env.ADMIN_DEFAULT_USERNAME ?? "admin";
    const password = process.env.ADMIN_DEFAULT_PASSWORD ?? "admin12345";
    const passwordHash = await bcrypt.hash(password, 12);

    const initialDb: LocalDb = {
      sponsors: [],
      bookings: [],
      admins: [
        {
          id: 1,
          username,
          passwordHash,
          createdAt: nowIso()
        }
      ],
      counters: {
        sponsor: 0,
        booking: 0,
        admin: 1
      }
    };

    await fs.writeFile(dbPath, JSON.stringify(initialDb, null, 2), "utf8");
    return;
  }

  const raw = await fs.readFile(dbPath, "utf8");
  const db = JSON.parse(raw) as LocalDb;

  const username = process.env.ADMIN_DEFAULT_USERNAME ?? "admin";
  const password = process.env.ADMIN_DEFAULT_PASSWORD ?? "admin12345";

  const existingAdmin = db.admins.find((item) => item.username === username);
  let changed = false;

  const migratedBookings: Booking[] = [];
  for (const item of db.bookings as Array<
    Booking & {
      meals?: { morning?: boolean; lunch?: boolean; dinner?: boolean };
    }
  >) {
    if (item.mealType) {
      migratedBookings.push(item);
      continue;
    }

    const meals = item.meals ?? { morning: true, lunch: true, dinner: true };
    const slots: Array<"morning" | "lunch" | "dinner"> = [];
    if (meals.morning) slots.push("morning");
    if (meals.lunch) slots.push("lunch");
    if (meals.dinner) slots.push("dinner");
    if (slots.length === 0) slots.push("morning");

    for (const slot of slots) {
      const id = db.counters.booking + 1;
      db.counters.booking = id;
      migratedBookings.push({
        id,
        bookingDate: item.bookingDate,
        foodNote: item.foodNote ?? null,
        mealType: slot,
        status: item.status ?? "booked",
        sponsorId: item.sponsorId,
        createdAt: item.createdAt ?? nowIso()
      });
    }
    changed = true;
  }

  if (changed) {
    db.bookings = migratedBookings;
    db.counters.booking = migratedBookings.reduce((maxId, item) => Math.max(maxId, item.id), 0);
  }

  if (!existingAdmin) {
    const id = db.counters.admin + 1;
    db.counters.admin = id;
    db.admins.push({
      id,
      username,
      passwordHash: await bcrypt.hash(password, 12),
      createdAt: nowIso()
    });
    changed = true;
  } else {
    const matches = await bcrypt.compare(password, existingAdmin.passwordHash);
    if (!matches) {
      existingAdmin.passwordHash = await bcrypt.hash(password, 12);
      changed = true;
    }
  }

  if (changed) {
    await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
  }
}

export async function readDb(): Promise<LocalDb> {
  await ensureDbFile();
  const raw = await fs.readFile(dbPath, "utf8");
  return JSON.parse(raw) as LocalDb;
}

async function writeDb(db: LocalDb): Promise<void> {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2), "utf8");
}

export async function withDbWrite<T>(mutator: (db: LocalDb) => Promise<T> | T): Promise<T> {
  const runner = async () => {
    const db = await readDb();
    const result = await mutator(db);
    await writeDb(db);
    return result;
  };

  const resultPromise = writeQueue.then(runner, runner);
  writeQueue = resultPromise.then(
    () => undefined,
    () => undefined
  );
  return resultPromise;
}
