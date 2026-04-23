import React, { createContext, useContext, useEffect, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

function persistSession(token, user) {
  localStorage.setItem("pixelpost_token", token);
  localStorage.setItem("pixelpost_user", JSON.stringify(user));
}

function clearSession() {
  localStorage.removeItem("pixelpost_token");
  localStorage.removeItem("pixelpost_user");
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("pixelpost_user");
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("pixelpost_token");

    if (!token) {
      setLoading(false);
      return;
    }

    api.get("/auth/me")
      .then((res) => {
        setUser(res.data.user);
        localStorage.setItem("pixelpost_user", JSON.stringify(res.data.user));
      })
      .catch(() => {
        clearSession();
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const signIn = async (email, password) => {
    const res = await api.post("/auth/signin", { email, password });
    persistSession(res.data.token, res.data.user);
    setUser(res.data.user);
    return res.data.user;
  };

  const signUp = async (name, email, password) => {
    const res = await api.post("/auth/signup", { name, email, password });
    persistSession(res.data.token, res.data.user);
    setUser(res.data.user);
    return res.data.user;
  };

  const updateProfile = async (name) => {
    const res = await api.patch("/auth/profile", { name });
    localStorage.setItem("pixelpost_user", JSON.stringify(res.data.user));
    setUser(res.data.user);
    return res.data.user;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.patch("/auth/password", { currentPassword, newPassword });
    return res.data;
  };

  const logout = () => {
    clearSession();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: Boolean(user),
        signIn,
        signUp,
        updateProfile,
        changePassword,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
