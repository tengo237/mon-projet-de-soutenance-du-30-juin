import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";

const STARS = [1, 2, 3, 4, 5];

export default function ReviewSection({ hotelSlug }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rating: 0, comment: "" });
  const [hover, setHover] = useState(0);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    api.getReviews(hotelSlug).then(setReviews).catch(() => {}).finally(() => setLoading(false));
  }, [hotelSlug]);

  const avg = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  async function submit() {
    if (!user) { navigate("/connexion"); return; }
    if (!form.rating) { setError("Choisissez une note."); return; }
    setError(""); setBusy(true);
    try {
      const r = await api.createReview(hotelSlug, form);
      setReviews((prev) => {
        const exists = prev.find((x) => x.is_mine);
        return exists ? prev.map((x) => x.is_mine ? r : x) : [r, ...prev];
      });
      setSuccess("Avis publie !");
      setForm({ rating: 0, comment: "" });
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function deleteReview(id) {
    if (!confirm("Supprimer votre avis ?")) return;
    try {
      await api.deleteReview(id);
      setReviews((prev) => prev.filter((r) => r.id !== id));
    } catch (e) { alert(e.message); }
  }

  return (
    <div style={{ marginTop: "2.5rem" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem", marginBottom: "1.2rem" }}>
        <h2 className="section-title" style={{ margin: 0 }}>Avis clients</h2>
        {avg && (
          <div style={{ display: "flex", alignItems: "center", gap: ".4rem" }}>
            <span style={{ fontSize: "1.4rem", fontWeight: 700 }}>{avg}</span>
            <span style={{ color: "#f59e0b", fontSize: "1.1rem" }}>
              {"\u2605".repeat(Math.round(avg))}{"\u2606".repeat(5 - Math.round(avg))}
            </span>
            <span style={{ color: "var(--mist)", fontSize: ".85rem" }}>({reviews.length} avis)</span>
          </div>
        )}
      </div>

      <div style={{ background: "var(--card)", border: "1px solid var(--border)",
        borderRadius: 14, padding: "1.25rem", marginBottom: "1.5rem" }}>
        <p style={{ margin: "0 0 .8rem", fontWeight: 600, fontSize: ".95rem" }}>
          {user ? "Laisser un avis" : "Connectez-vous pour laisser un avis"}
        </p>
        <div style={{ display: "flex", gap: ".3rem", marginBottom: ".8rem" }}>
          {STARS.map((s) => (
            <button key={s} onMouseEnter={() => setHover(s)} onMouseLeave={() => setHover(0)}
              onClick={() => setForm((f) => ({ ...f, rating: s }))}
              style={{ background: "none", border: "none", cursor: user ? "pointer" : "default",
                fontSize: "1.6rem", padding: "0 .1rem", lineHeight: 1,
                color: s <= (hover || form.rating) ? "#f59e0b" : "var(--border)",
                transition: "color .1s" }}>
              {"\u2605"}
            </button>
          ))}
          {form.rating > 0 && (
            <span style={{ color: "var(--mist)", fontSize: ".85rem", alignSelf: "center", marginLeft: ".4rem" }}>
              {["","Mauvais","Moyen","Bien","Tres bien","Excellent"][form.rating]}
            </span>
          )}
        </div>
        <textarea className="input" rows={3} placeholder="Partagez votre experience..."
          value={form.comment} onChange={(e) => setForm((f) => ({ ...f, comment: e.target.value }))}
          disabled={!user} style={{ resize: "vertical", marginBottom: ".8rem" }} />
        {error && <div className="form-error" style={{ marginBottom: ".6rem" }}>{error}</div>}
        {success && <div style={{ color: "var(--moss)", fontSize: ".88rem", marginBottom: ".6rem" }}>{success}</div>}
        <button className="btn btn-primary" onClick={submit} disabled={busy || !user}>
          {busy ? "Publication..." : "Publier mon avis"}
        </button>
      </div>

      {loading ? (
        <div className="skeleton" style={{ height: 80, borderRadius: 10 }} />
      ) : reviews.length === 0 ? (
        <p style={{ color: "var(--mist)", fontSize: ".9rem" }}>Aucun avis pour le moment. Soyez le premier !</p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: ".8rem" }}>
          {reviews.map((r) => (
            <div key={r.id} style={{ background: "var(--card)", border: "1px solid var(--border)",
              borderRadius: 12, padding: "1rem 1.1rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: ".6rem" }}>
                    <div style={{ width: 32, height: 32, borderRadius: "50%", background: "var(--moss)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      color: "#fff", fontWeight: 700, fontSize: ".85rem" }}>
                      {(r.user_name || "?")[0].toUpperCase()}
                    </div>
                    <span style={{ fontWeight: 600, fontSize: ".9rem" }}>{r.user_name}</span>
                    <span style={{ color: "#f59e0b", fontSize: ".95rem" }}>
                      {"\u2605".repeat(r.rating)}{"\u2606".repeat(5 - r.rating)}
                    </span>
                  </div>
                  {r.comment && (
                    <p style={{ margin: ".5rem 0 0 2.4rem", color: "var(--ink-soft)",
                      fontSize: ".88rem", lineHeight: 1.5 }}>{r.comment}</p>
                  )}
                </div>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: ".3rem" }}>
                  <span style={{ color: "var(--mist)", fontSize: ".75rem" }}>{r.created_at}</span>
                  {r.is_mine && (
                    <button onClick={() => deleteReview(r.id)}
                      style={{ background: "none", border: "none", color: "var(--mist)",
                        fontSize: ".75rem", cursor: "pointer", padding: 0 }}>
                      Supprimer
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
