import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api, fmtFCFA } from "../api";
import { useAuth } from "../auth";

const STATUS_LABELS = { pending: "En attente", confirmed: "Confirmée", cancelled: "Annulée" };

export default function Trips() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  function load() {
    setLoading(true);
    api.myReservations().then(setTrips).catch(() => setTrips([])).finally(() => setLoading(false));
  }
  useEffect(() => { if (user) load(); }, [user]);

  async function pay(id, operator) {
    setBusyId(id);
    try { await api.pay(id, operator); load(); } finally { setBusyId(null); }
  }

  if (!user) {
    return <div className="page container empty">
      <h3>Connecte-toi pour voir tes séjours</h3>
      <Link to="/connexion" className="btn btn-primary" style={{ marginTop: 14 }}>Se connecter</Link>
    </div>;
  }

  return (
    <div className="page container" style={{ paddingTop: 36, paddingBottom: 80 }}>
      <p className="eyebrow">Tes réservations</p>
      <h2 style={{ fontSize: "2rem", marginTop: ".3rem" }}>Mes séjours</h2>

      {loading ? (
        <div className="skeleton" style={{ height: 90, marginTop: 20 }} />
      ) : trips.length === 0 ? (
        <div className="empty">
          <h3>Aucun séjour pour l'instant</h3>
          <p>Quand tu réserves une chambre, elle apparaît ici avec son code.</p>
          <Link to="/" className="btn btn-primary" style={{ marginTop: 14 }}>Trouver un hôtel</Link>
        </div>
      ) : (
        trips.map((t) => (
          <div className="trip" key={t.id}>
            <div>
              <div className="code">{t.code}</div>
              <div style={{ marginTop: ".25rem" }}>
                <Link to={`/hotels/${t.hotel_slug}`} style={{ fontWeight: 600, color: "var(--moss)" }}>{t.hotel_name}</Link>
                <span style={{ color: "var(--mist)" }}> · {t.room_type}</span>
              </div>
              <div style={{ color: "var(--mist)", fontSize: ".9rem", marginTop: ".2rem" }}>
                {t.checkin} → {t.checkout} · {t.nights} nuit{t.nights > 1 ? "s" : ""} · {t.guests} pers.
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div className="mono" style={{ fontWeight: 600 }}>{fmtFCFA(t.amount)}</div>
              <span className={`status ${t.status}`} style={{ marginTop: ".4rem", display: "inline-block" }}>
                {STATUS_LABELS[t.status]}
              </span>
              {t.status === "pending" && t.payment_mode === "mobile_money" && (
                <div style={{ marginTop: ".5rem", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                  <button className="btn btn-lamp" style={{ padding: ".4rem .8rem", fontSize: ".82rem" }}
                          onClick={() => pay(t.id, "orange_money")} disabled={busyId === t.id}>OM</button>
                  <button className="btn btn-lamp" style={{ padding: ".4rem .8rem", fontSize: ".82rem" }}
                          onClick={() => pay(t.id, "mtn_momo")} disabled={busyId === t.id}>MoMo</button>
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
