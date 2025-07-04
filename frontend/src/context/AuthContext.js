// src/context/AuthContext.js
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import axios from "../utils/axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(
    !!localStorage.getItem("token")
  );
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [loading, setLoading] = useState(true); // 🆕 Add loading state

  // ✅ Logout user
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
  }, []);

  // ✅ Fetch user profile with token header
  const fetchUserProfile = useCallback(async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get("/users/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setUser(res.data);
      setIsAuthenticated(true);
    } catch (err) {
      console.error("❌ Failed to fetch profile:", err.response?.data || err.message);
      logout();
    } finally {
      setLoading(false); // 🆕 Stop loading regardless
    }
  }, [token, logout]);

  // 🔁 Fetch profile when token changes
  useEffect(() => {
    fetchUserProfile();
  }, [token, fetchUserProfile]);

  // ✅ Login handler
  const login = useCallback((newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
    setIsAuthenticated(true);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        user,
        login,
        logout,
        token,
        fetchUserProfile,
        loading, // 🆕 expose loading
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
