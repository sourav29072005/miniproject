import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "./auth.css";

// Added setIsAdmin as a prop to sync with App.js immediately
function Login() {
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await api.post("auth/login", {
        email: email.trim(),
        password,
      });

      const { token, user } = response.data;

      // Store user and token
      localStorage.setItem("user", JSON.stringify({ ...user, token }));

      // Synchronize AuthContext immediately
      refreshUser();

      // Check if profile is complete (only for users, not admins)
      if (user.role === "user" && !user.department) {
        navigate("/setup-profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Login failed. Please check your credentials.";

      // Handle banned user
      if (errorData?.banned) {
        errorMessage = `Your account has been banned. ${errorData?.banReason ? `Reason: ${errorData.banReason}` : "Contact support for more information."}`;
      } else {
        errorMessage = errorData?.error || errorMessage;
      }

      setError(errorMessage);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="Enter College Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Enter Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>

        <p className="auth-footer">
          Don’t have an account? <Link to="/register" className="link">Register</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;