import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import "./auth.css";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();
  const { setIsLoggedIn, setIsAdmin, refreshUser } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      const response = await api.post("auth/register", {
        name,
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem("user", JSON.stringify({ ...user, token }));

      // Synchronize AuthContext immediately
      refreshUser();

      setSuccess("Account created successfully! Let's set up your profile...");
      setTimeout(() => {
        navigate("/setup-profile");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Register</h1>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <input
            type="email"
            placeholder="College Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <input
            type="password"
            placeholder="Confirm Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-btn">
            Register
          </button>
        </form>

        <p className="auth-footer">
          Already have an account? <Link to="/login" className="link">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Register;