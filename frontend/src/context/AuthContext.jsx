// src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { authApi } from "../api/auth";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(() => {
    try { return JSON.parse(localStorage.getItem("nova_user")); } catch { return null; }
  });
  const [loading, setLoading] = useState(true);

  // On mount: verify token is still valid
  useEffect(() => {
    const token = localStorage.getItem("nova_access_token");
    if (!token) { setLoading(false); return; }

    authApi.me()
      .then(({ data }) => setUser(data))
      .catch(() => {
        // Token invalid — clear everything
        localStorage.removeItem("nova_access_token");
        localStorage.removeItem("nova_refresh_token");
        localStorage.removeItem("nova_user");
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const login = useCallback(async (email, password) => {
    const { data } = await authApi.login({ email, password });
    localStorage.setItem("nova_access_token",  data.accessToken);
    localStorage.setItem("nova_refresh_token", data.refreshToken);
    localStorage.setItem("nova_user",          JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const register = useCallback(async (name, email, password) => {
    const { data } = await authApi.register({ name, email, password });
    localStorage.setItem("nova_access_token",  data.accessToken);
    localStorage.setItem("nova_refresh_token", data.refreshToken);
    localStorage.setItem("nova_user",          JSON.stringify(data.user));
    setUser(data.user);
    return data.user;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("nova_access_token");
    localStorage.removeItem("nova_refresh_token");
    localStorage.removeItem("nova_user");
    setUser(null);
  }, []);

  const updateUser = useCallback((updates) => {
    setUser(prev => {
      const next = { ...prev, ...updates };
      localStorage.setItem("nova_user", JSON.stringify(next));
      return next;
    });
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
};
