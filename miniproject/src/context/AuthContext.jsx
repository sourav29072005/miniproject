import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = () => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    // Strict check: User must exist AND have a token to be considered logged in
    if (storedUser && storedUser.token) {
      setIsLoggedIn(true);
      setIsAdmin(storedUser.role === "admin");
      setUser(storedUser);
    } else {
      setIsLoggedIn(false);
      setIsAdmin(false);
      setUser(null);
      // Clean up potentially broken storage
      if (storedUser) localStorage.removeItem("user");
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const refreshUser = () => {
    checkAuth();
  };

  const logout = () => {
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    setIsAdmin(false);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        isLoggedIn,
        isAdmin,
        user,
        setIsLoggedIn,
        setIsAdmin,
        refreshUser,
        logout,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);