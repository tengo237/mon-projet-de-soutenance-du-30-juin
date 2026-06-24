import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api, fmtFCFA } from "../api";
import { useAuth } from "../auth";
import { Icon } from "../components/Icon";
import { AmenityChips, SafetyBadge, Stars } from "../components/Shared";
import ReviewSection from "../components/ReviewSection";

function todayPlus(days) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function Hotel() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [hotel, setHotel] = useState(null);
  const [roomId, setRoomId] = useState(null);
  const [checkin, setCheckin] = useState(todayPlus(1));
  const [checkout, setCheckout] = useState(todayPlus(3));
  const [guests, setGuests] = useState(1);
  const [payMode, setPayMode] = useState("mobile_money");
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.hotel(slug).then((h) => {
      setHotel(h);
      if (h.rooms?.length) setRoomId(h.rooms[0].id);
    });
  }, [slug]);

  const room = useMemo(
    () => hotel?.rooms?.find((r) => r.id === Number(roomId)),
    [hotel, roomId]
  );

  const nights = useMemo(() => {
    const a = new Date(checkin), b = new Date(checkout);
    return Math.max(Math.round((b - a) / 86400000), 1);
  }, [checkin, checkout]);

  const total = room ? room.price_per_night * nights : 0;

  if (!hotel) {
    return <div className="page container" style={{ paddingTop: 40 }}>
      <div className="skeleton" style={{ height: 340 }} />
    </div>;
  }

  async function book() {
    setError("");
    if (!user) { navigate("/connexion", { state: { from: "/hotels/" + slug } }); return; }
    if (new Date(checkout) <= new Date(checkin)) { setError("La date de depart doit suivre l arrivee."); return; }
    setBusy(true);
    try {
      const r = await api.createReservation({ room: room.id, checkin, checkout, guests, payment_mode: payMode });
      setReservation(r);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function pay(operator) {
    setBusy(true); setError("");
    try {
      const res = await api.pay(reservation.id, operator);
      setReservation(res.reservation);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="page">
      <div className="detail-hero">
        <div className="cover"><img src={hotel.cover_image_url} alt={hotel.name} /></div>
        <div className="container head">
          <Link to="/" style={{ color: "rgba(242,243,240,.7)", fontSize: ".9rem" }}>← Retour</Link>
          <h1 style={{ marginTop: ".6rem" }}>{hotel.name}</h1>
          <div className="place">
            <span><Icon name="pin" style={{ width: 15, height: 15, verticalAlign: "-2px" }} /> {hotel.quartier}, {hotel.city}</span>
            <SafetyBadge index={hotel.safety_index} />
            <Stars rating={hotel.rating} count={hotel.review_count} />
          </div>
        </div>
      </div>

      <div className="container detail-layout">
        <div className="detail-main">
          <p className="desc">{hotel.description}</p>
          <AmenityChips amenities={hotel.amenities} />
          {hotel.images?.length > 0 && (
            <>
              <h2 className="section-title">En images</h2>
              <div className="gallery">
                {[hotel.cover_image_url, ...hotel.images.map((i) => i.url)].slice(0, 6).map((u, i) => (
                  <img key={i} src={u} alt={hotel.name + " " + (i + 1)} loading="lazy" />
                ))}
              </div>
            </>
          )}
          <h2 className="section-title">Bon a savoir</h2>
          <p style={{ color: "var(--mist)", maxWidth: "60ch" }}>
            {hotel.address}. Indice de securite du quartier : {hotel.safety_index}/5.
          </p>
          <ReviewSection hotelSlug={slug} />
        </div>

        <aside className="book-panel">
          {!reservation ? (
            <>
              <div className="from">
                {fmtFCFA(room?.price_per_night || hotel.price_from)} <small>/ nuit</small>
              </div>
              <div className="field">
                <label>Type de chambre</label>
                <select className="select" value={roomId || ""} onChange={(e) => setRoomId(e.target.value)}>
                  {hotel.rooms?.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.room_type} · {fmtFCFA(r.price_per_night)} · {r.capacity} pers.
                    </option>
                  ))}
                </select>
              </div>
              <div className="field row2">
                <div>
                  <label>Arrivee</label>
                  <input className="input" type="date" value={checkin} onChange={(e) => setCheckin(e.target.value)} />
                </div>
                <div>
                  <label>Depart</label>
                  <input className="input" type="date" value={checkout} onChange={(e) => setCheckout(e.target.value)} />
                </div>
              </div>
              <div className="field">
                <label>Voyageurs</label>
                <input className="input" type="number" min="1" max="8" value={guests}
                       onChange={(e) => setGuests(Number(e.target.value))} />
              </div>
              <div className="field">
                <label>Paiement</label>
                <div className="pay-toggle">
                  <button className={"pay-opt " + (payMode === "mobile_money" ? "active" : "")}
                          onClick={() => setPayMode("mobile_money")}>Mobile Money</button>
                  <button className={"pay-opt " + (payMode === "on_arrival" ? "active" : "")}
                          onClick={() => setPayMode("on_arrival")}>A l arrivee</button>
                </div>
              </div>
              <div className="total-line">
                <span>{nights} nuit{nights > 1 ? "s" : ""}</span>
                <span className="t">{fmtFCFA(total)}</span>
              </div>
              {error && <div className="form-error">{error}</div>}
              <button className="btn btn-primary btn-block" onClick={book} disabled={busy}>
                {busy ? "Un instant..." : "Reserver"}
              </button>
              <p style={{ fontSize: ".78rem", color: "var(--mist)", marginTop: ".7rem", textAlign: "center" }}>
                Sans engagement, tu confirmes le paiement apres.
              </p>
            </>
          ) : (
            <div className="confirm">
              <span className="eyebrow" style={{ color: "var(--moss)" }}>Reservation enregistree</span>
              <div className="code" style={{ marginTop: ".4rem" }}>{reservation.code}</div>
              <p style={{ margin: ".6rem 0", color: "var(--ink-soft)" }}>
                {reservation.status === "confirmed"
                  ? "C est confirme. Bon sejour a " + hotel.city + " !"
                  : reservation.payment_mode === "mobile_money"
                    ? "Choisis ton operateur pour finaliser le paiement."
                    : "L hote va confirmer ta chambre. Tu paieras a l arrivee."}
              </p>
              {error && <div className="form-error">{error}</div>}
              {reservation.status !== "confirmed" && reservation.payment_mode === "mobile_money" && (
                <div className="row2" style={{ marginTop: ".6rem" }}>
                  <button className="btn btn-lamp" onClick={() => pay("orange_money")} disabled={busy}>Orange Money</button>
                  <button className="btn btn-lamp" onClick={() => pay("mtn_momo")} disabled={busy}>MTN MoMo</button>
                </div>
              )}
              <Link to="/sejours" className="btn btn-ghost btn-block" style={{ marginTop: ".8rem" }}>
                Voir mes sejours
              </Link>
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
