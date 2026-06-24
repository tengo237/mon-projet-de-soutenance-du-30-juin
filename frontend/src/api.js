const BASE = "/api";

function token() {
  return localStorage.getItem("mboa_access");
}

async function request(path, opts = {}) {
  const { method = "GET", body, auth = false } = opts;
  const headers = { "Content-Type": "application/json" };
  if (auth && token()) headers["Authorization"] = "Bearer " + token();
  const res = await fetch(BASE + path, {
    method, headers,
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try { data = await res.json(); } catch (_) {}
  if (!res.ok) {
    const message = (data && (data.detail || data.message)) || "Une erreur est survenue.";
    throw new Error(message);
  }
  return data;
}

export const api = {
  // Public
  cities:    () => request("/cities"),
  quartiers: (citySlug) => request("/quartiers?city=" + citySlug),
  hotels:    (citySlug) => request("/hotels" + (citySlug ? "?city=" + citySlug : "")),
  hotel:     (slug) => request("/hotels/" + slug),
  search:    (payload) => request("/search", { method: "POST", body: payload }),
  assistant: (payload) => request("/assistant", { method: "POST", body: payload }),

  // Auth
  register:      (payload) => request("/auth/register", { method: "POST", body: payload }),
  login:         (payload) => request("/auth/login", { method: "POST", body: payload }),
  me:            () => request("/auth/me", { auth: true }),
  updateProfile: (payload) => request("/auth/profile", { method: "PATCH", body: payload, auth: true }),

  // Hotelier
  createHotel: (payload) => request("/hotels/create", { method: "POST", body: payload, auth: true }),

  // Admin
  adminHotels:       () => request("/admin/hotels", { auth: true }),
  verifyHotel:       (id, verified) => request("/admin/hotels/" + id + "/verify", { method: "PATCH", body: { is_verified: verified }, auth: true }),
  deleteHotel:       (id) => request("/admin/hotels/" + id, { method: "DELETE", auth: true }),
  adminStats:        () => request("/admin/stats", { auth: true }),
  adminReservations: () => request("/admin/reservations", { auth: true }),
  cancelReservation: (id) => request("/admin/reservations/" + id + "/cancel", { method: "PATCH", auth: true }),
  adminUsers:        () => request("/admin/users", { auth: true }),
  updateUser:        (id, payload) => request("/admin/users/" + id, { method: "PATCH", body: payload, auth: true }),

  // Reviews
  getReviews:   (hotelSlug) => request("/hotels/" + hotelSlug + "/reviews"),
  createReview: (hotelSlug, payload) => request("/hotels/" + hotelSlug + "/reviews", { method: "POST", body: payload, auth: true }),
  deleteReview: (id) => request("/reviews/" + id, { method: "DELETE", auth: true }),

  // Reservations
  createReservation: (payload) => request("/reservations", { method: "POST", body: payload, auth: true }),
  myReservations:    () => request("/reservations/mine", { auth: true }),
  pay:               (id, operator) => request("/reservations/" + id + "/pay", { method: "POST", body: { operator }, auth: true }),
};

export function fmtFCFA(n) {
  return new Intl.NumberFormat("fr-FR").format(n) + " FCFA";
}
