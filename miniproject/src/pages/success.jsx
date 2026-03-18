import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/success.css";

function Success() {
  const navigate = useNavigate();
  const location = useLocation();

  const [verified, setVerified] = useState(false);
  const [msg, setMsg] = useState("");

  const paymentMethod = useMemo(() => {
    return localStorage.getItem("paymentMethod") || "";
  }, []);

  const isCOD = paymentMethod === "cod";

  useEffect(() => {
    // ✅ Prefer route state first (most reliable)
    const idFromState = Number(location.state?.paymentItemId);
    const idFromStorage = Number(localStorage.getItem("paymentItemId"));

    const paymentId = idFromState || idFromStorage;

    if (!paymentId) {
      setMsg("No recent payment was found. (You may have refreshed the page.)");
      setVerified(true);
      return;
    }

    // cleanup
    localStorage.removeItem("paymentItemId");
    localStorage.removeItem("selectedItemId");
    localStorage.removeItem("paymentDone");

    setMsg(
      isCOD
        ? "Your order has been placed. Please pay cash on delivery."
        : "Your payment has been completed successfully."
    );
    setVerified(true);

    // optional cleanup
    setTimeout(() => localStorage.removeItem("paymentMethod"), 500);
  }, [location.state, navigate, isCOD]);

  if (!verified) return null;

  const goHome = () => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "admin") navigate("/admin");
    else navigate("/");
  };

  return (
    <div className="success-container">
      <div className="success-card">
        <div className="checkmark-circle">
          <span className="checkmark">✓</span>
        </div>

        <h2>{isCOD ? "Order Placed!" : "Payment Successful!"}</h2>
        <p>{msg}</p>

        <div className="success-buttons">
          <button className="market-btn" onClick={() => navigate("/marketplace")}>
            Go to Marketplace
          </button>

          <button className="home-btn" onClick={goHome}>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default Success;