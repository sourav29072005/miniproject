import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./auth.css";

// Added setIsAdmin as a prop to sync with App.js immediately
function Login({ setIsLoggedIn, setIsAdmin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();

    // 🔐 ADMIN LOGIN 
    // Matching the @cev.com domain used in your App.js logic
    if (
      email.trim() === "admin@cev.com" && 
      password === "admin123"
    ) {
      const adminUser = {
        email: email.trim(),
        role: "admin"
      };

      localStorage.setItem("user", JSON.stringify(adminUser));

      // Update both states so App.js knows to show the Admin route
      setIsAdmin(true);
      setIsLoggedIn(true);
      
      // Navigate to root; App.js will now redirect this to /admin
      navigate("/"); 
      return;
    }

    // 👤 NORMAL USER LOGIN
    const normalUser = {
      email: email.trim(),
      role: "user"
    };

    localStorage.setItem("user", JSON.stringify(normalUser));

    // Ensure state reflects a non-admin user
    setIsAdmin(false);
    setIsLoggedIn(true);

    // Send normal users to Home
    navigate("/");
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h1 className="auth-title">Login</h1>

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
          Don’t have an account? <span className="link">Register</span>
        </p>
      </div>
    </div>
  );
}

export default Login;