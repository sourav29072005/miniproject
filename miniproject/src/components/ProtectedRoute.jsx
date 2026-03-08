import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ProtectedRoute = ({ children, requireAdmin }) => {
  const { isLoggedIn, isAdmin, loading } = useAuth();

  if (loading) return null;

  if (!isLoggedIn) return <Navigate to="/login" />;

  if (requireAdmin && !isAdmin) return <Navigate to="/" />;

  return children;
};

export default ProtectedRoute;