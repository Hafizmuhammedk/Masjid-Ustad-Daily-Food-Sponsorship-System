const logEl = document.getElementById("log");
const scheduleResultEl = document.getElementById("schedule-result");
const tokenOutput = document.getElementById("token-output");

let adminToken = "";

function log(message, data) {
  const now = new Date().toISOString();
  const payload = data ? `\n${JSON.stringify(data, null, 2)}` : "";
  logEl.textContent = `[${now}] ${message}${payload}\n\n` + logEl.textContent;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(path, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  });

  const contentType = response.headers.get("content-type") || "";
  const data = contentType.includes("application/json")
    ? await response.json()
    : await response.text();

  if (!response.ok) {
    throw { status: response.status, data };
  }

  return data;
}

document.getElementById("sponsor-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);

  const payload = {
    full_name: formData.get("full_name"),
    phone: formData.get("phone"),
    email: formData.get("email") || null,
  };

  try {
    const data = await apiRequest("/sponsors", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    log("Sponsor created", data);
    e.currentTarget.reset();
  } catch (err) {
    log(`Sponsor create failed (${err.status})`, err.data);
  }
});

document.getElementById("booking-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);

  const payload = {
    sponsor_id: Number(formData.get("sponsor_id")),
    booking_date: formData.get("booking_date"),
    food_note: formData.get("food_note") || null,
  };

  try {
    const data = await apiRequest("/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    log("Booking created", data);
    e.currentTarget.reset();
  } catch (err) {
    log(`Booking create failed (${err.status})`, err.data);
  }
});

document.getElementById("schedule-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const month = formData.get("month");
  const year = formData.get("year");

  try {
    const data = await apiRequest(`/bookings?month=${month}&year=${year}`);
    log("Schedule fetched", data);

    if (!data.length) {
      scheduleResultEl.innerHTML = "<p>No bookings found for selected month.</p>";
      return;
    }

    scheduleResultEl.innerHTML = `<ul>${data
      .map(
        (item) =>
          `<li><strong>${item.booking_date}</strong> - ${item.sponsor_name} (${item.status})${
            item.food_note ? ` - ${item.food_note}` : ""
          }</li>`,
      )
      .join("")}</ul>`;
  } catch (err) {
    log(`Schedule fetch failed (${err.status})`, err.data);
  }
});

document.getElementById("login-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);

  const payload = {
    username: formData.get("username"),
    password: formData.get("password"),
  };

  try {
    const data = await apiRequest("/admin/login", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    adminToken = data.access_token;
    tokenOutput.textContent = adminToken;
    log("Admin login successful", {
      token_type: data.token_type,
      expires_in_minutes: data.expires_in_minutes,
    });
    e.currentTarget.reset();
  } catch (err) {
    log(`Admin login failed (${err.status})`, err.data);
  }
});

document.getElementById("cancel-form").addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(e.currentTarget);
  const bookingId = formData.get("booking_id");

  if (!adminToken) {
    log("Cancel failed", { detail: "Please login as admin first." });
    return;
  }

  try {
    const data = await apiRequest(`/admin/bookings/${bookingId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${adminToken}`,
      },
    });
    log("Booking cancelled", data);
    e.currentTarget.reset();
  } catch (err) {
    log(`Booking cancel failed (${err.status})`, err.data);
  }
});
