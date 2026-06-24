import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth";
import { api } from "../api";

export default function Profile() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState("infos");
  const [form, setForm] = useState({ full_name: user?.full_name || "", phone: user?.phone || "" });
  const [pwForm, setPwForm] = useState({ old_password: "", password: "", confirm: "" });
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  async function saveInfos() {
    setError(""); setSuccess(""); setBusy(true);
    try {
      await api.updateProfile({ full_name: form.full_name, phone: form.phone });
      setSuccess("Profil mis a jour !");
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function savePassword() {
    setError(""); setSuccess("");
    if (pwForm.password !== pwForm.confirm) { setError("Les mots de passe ne correspondent pas."); return; }
    if (pwForm.password.length < 6) { setError("Minimum 6 caracteres."); return; }
    setBusy(true);
    try {
      await api.updateProfile({ old_password: pwForm.old_password, password: pwForm.password });
      setSuccess("Mot de passe modifie ! Reconnectez-vous.");
      setTimeout(() => { logout(); navigate("/connexion"); }, 2000);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="page container" style={{ paddingTop: 40, maxWidth: 560 }}>
      <div style={{ display: "flex", alignItems: "center", gap: "1.2rem", marginBottom: "2rem" }}>
        <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--moss)",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: "1.6rem", color: "#fff", fontWeight: 700 }}>
          {(user?.full_name || user?.phone || "?")[0].toUpperCase()}
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: "1.4rem" }}>{user?.full_name || "Mon profil"}</h1>
          <p style={{ margin: ".2rem 0 0", color: "var(--mist)", fontSize: ".88rem" }}>{user?.phone}</p>
        </div>
      </div>

      <div style={{ display: "flex", gap: ".5rem", marginBottom: "1.5rem",
        borderBottom: "1px solid var(--border)", paddingBottom: ".5rem" }}>
        {[["infos","Informations"], ["password","Mot de passe"]].map(([k, l]) => (
          <button key={k} onClick={() => { setTab(k); setError(""); setSuccess(""); }}
            style={{ padding: ".5rem 1.2rem", borderRadius: 8, border: "none", cursor: "pointer",
              fontWeight: tab === k ? 600 : 400, fontSize: ".9rem",
              background: tab === k ? "var(--ink)" : "transparent",
              color: tab === k ? "#fff" : "var(--mist)" }}>{l}</button>
        ))}
      </div>

      {tab === "infos" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="field">
            <label>Nom complet</label>
            <input className="input" value={form.full_name}
              onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))} />
          </div>
          <div className="field">
            <label>Telephone</label>
            <input className="input" value={form.phone}
              onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
          </div>
          {error && <div className="form-error">{error}</div>}
          {success && <div style={{ color: "var(--moss)", fontSize: ".9rem", padding: ".6rem",
            background: "#f0fdf4", borderRadius: 8 }}>{success}</div>}
          <button className="btn btn-primary" onClick={saveInfos} disabled={busy}>
            {busy ? "Enregistrement..." : "Enregistrer"}
          </button>
        </div>
      )}

      {tab === "password" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="field">
            <label>Ancien mot de passe</label>
            <input className="input" type="password" value={pwForm.old_password}
              onChange={(e) => setPwForm((f) => ({ ...f, old_password: e.target.value }))} />
          </div>
          <div className="field">
            <label>Nouveau mot de passe</label>
            <input className="input" type="password" value={pwForm.password}
              onChange={(e) => setPwForm((f) => ({ ...f, password: e.target.value }))} />
          </div>
          <div className="field">
            <label>Confirmer</label>
            <input className="input" type="password" value={pwForm.confirm}
              onChange={(e) => setPwForm((f) => ({ ...f, confirm: e.target.value }))} />
          </div>
          {error && <div className="form-error">{error}</div>}
          {success && <div style={{ color: "var(--moss)", fontSize: ".9rem", padding: ".6rem",
            background: "#f0fdf4", borderRadius: 8 }}>{success}</div>}
          <button className="btn btn-primary" onClick={savePassword} disabled={busy}>
            {busy ? "Modification..." : "Modifier le mot de passe"}
          </button>
        </div>
      )}
    </div>
  );
}
