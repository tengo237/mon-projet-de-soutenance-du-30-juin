import { createContext, useContext, useEffect, useState } from "react";
import { api } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("mboa_access")) {
      api.me().then(setUser).catch(() => logout()).finally(() => setReady(true));
    } else {
      setReady(true);
    }
  }, []);

  function persist(data) {
    localStorage.setItem("mboa_access", data.access);
    if (data.refresh) localStorage.setItem("mboa_refresh", data.refresh);
  }

  async function login(phone, password) {
    const data = await api.login({ phone, password });
    persist(data);
    const me = await api.me();
    setUser(me);
    return me;
  }

  async function register(payload) {
    const data = await api.register(payload);
    persist(data);
    setUser(data.user);
    return data.user;
  }

  function logout() {
    localStorage.removeItem("mboa_access");
    localStorage.removeItem("mboa_refresh");
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
