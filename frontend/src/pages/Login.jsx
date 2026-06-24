import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../auth";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || "/";
  const [mode, setMode] = useState("login");
  const [phone, setPhone] = useState("");
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit() {
    setError(""); setBusy(true);
    try {
      let user;
      if (mode === "login") {
        user = await login(phone, password);
      } else {
        user = await register({ phone, full_name: fullName, password });
      }
      if (user?.is_staff) {
        navigate("/admin", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="page auth-wrap">
      <div className="auth-card">
        <p className="eyebrow">{mode === "login" ? "Content de te revoir" : "Bienvenue"}</p>
        <h2>{mode === "login" ? "Se connecter" : "Creer un compte"}</h2>
        {mode === "register" && (
          <div className="field">
            <label>Nom complet</label>
            <input className="input" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Ex : Aicha N." />
          </div>
        )}
        <div className="field">
          <label>Telephone</label>
          <input className="input" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="6XX XX XX XX" />
        </div>
        <div className="field">
          <label>Mot de passe</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </div>
        {error && <div className="form-error">{error}</div>}
        <button className="btn btn-primary btn-block" onClick={submit} disabled={busy} style={{ marginTop: 18 }}>
          {busy ? "Un instant..." : mode === "login" ? "Se connecter" : "Creer mon compte"}
        </button>
        <p style={{ marginTop: 16, fontSize: ".92rem", color: "var(--mist)" }}>
          {mode === "login" ? "Pas encore de compte ? " : "Deja inscrit ? "}
          <button className="toggle-link" onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>
            {mode === "login" ? "Creer un compte" : "Se connecter"}
          </button>
        </p>
        {mode === "login" && (
          <p style={{ marginTop: 14, fontSize: ".8rem", color: "var(--mist)", borderTop: "1px solid var(--line)", paddingTop: 12 }}>
            Compte demo : <span className="mono">690000000</span> / <span className="mono">demo1234</span>
          </p>
        )}
      </div>
    </div>
  );
}
