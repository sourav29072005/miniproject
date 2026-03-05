import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/payment.css";

function Payment() {
  const navigate = useNavigate();

  const [method, setMethod] = useState(""); // upi | card | netbanking | cod
  const [processing, setProcessing] = useState(false);

  const [item, setItem] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // ✅ Load item safely from localStorage
    const paymentItemId = Number(localStorage.getItem("paymentItemId"));

    if (!paymentItemId) {
      navigate("/marketplace");
      return;
    }

    const items = JSON.parse(localStorage.getItem("items")) || [];
    const found = items.find((i) => i.id === paymentItemId);

    if (!found) {
      // item removed / deleted
      localStorage.removeItem("paymentItemId");
      navigate("/marketplace");
      return;
    }

    // Optional safety: if already sold, don't allow paying again
    if (found.status === "sold") {
      alert("This item is already sold.");
      localStorage.removeItem("paymentItemId");
      navigate("/marketplace");
      return;
    }

    setItem(found);
    setChecking(false);
  }, [navigate]);

  const handlePayNow = () => {
  if (!method) {
    alert("Please select a payment method.");
    return;
  }

  setProcessing(true);

  // ✅ store method for success page message
  localStorage.setItem("paymentMethod", method);

  // ✅ compatibility (if any old success logic checks this)
  localStorage.setItem("paymentDone", "true");

  const paymentItemId = Number(localStorage.getItem("paymentItemId"));

  const goSuccess = () => {
    setProcessing(false);
    navigate("/success", { state: { paymentItemId } }); // ✅ pass state
  };

  if (method === "cod") {
    setTimeout(goSuccess, 800);
    return;
  }

  setTimeout(goSuccess, 1500);
};

  const handleCancel = () => {
    if (processing) return;
    navigate("/item-details");
  };

  if (checking) {
    return (
      <div className="payment-container">
        <div className="payment-card">
          <h2>Secure Payment</h2>
          <p>Loading payment details...</p>
        </div>
      </div>
    );
  }

  if (!item) return null;

  return (
    <div className="payment-container">
      <div className="payment-card">
        <h2>Secure Payment</h2>
        <p>Select a payment method</p>

        {/* ✅ Item summary */}
        <div style={{ marginTop: 12, marginBottom: 14 }}>
          <p style={{ margin: 0, fontWeight: 700 }}>{item.title}</p>
          <p style={{ margin: "6px 0 0 0", color: "#666" }}>
            Amount to pay: <b>₹ {item.price}</b>
          </p>
        </div>

        {/* ✅ Payment options */}
        <label className="payment-method">
          <input
            type="radio"
            name="pay"
            value="upi"
            checked={method === "upi"}
            onChange={(e) => setMethod(e.target.value)}
            disabled={processing}
          />
          <span>UPI</span>
        </label>

        <label className="payment-method">
          <input
            type="radio"
            name="pay"
            value="card"
            checked={method === "card"}
            onChange={(e) => setMethod(e.target.value)}
            disabled={processing}
          />
          <span>Debit / Credit Card</span>
        </label>

        <label className="payment-method">
          <input
            type="radio"
            name="pay"
            value="netbanking"
            checked={method === "netbanking"}
            onChange={(e) => setMethod(e.target.value)}
            disabled={processing}
          />
          <span>Net Banking</span>
        </label>

        {/* ✅ COD */}
        <label className="payment-method">
          <input
            type="radio"
            name="pay"
            value="cod"
            checked={method === "cod"}
            onChange={(e) => setMethod(e.target.value)}
            disabled={processing}
          />
          <span>Cash on Delivery (COD)</span>
        </label>

        <button className="pay-now-btn" onClick={handlePayNow} disabled={processing}>
          {processing
            ? method === "cod"
              ? "Placing Order..."
              : "Processing Payment..."
            : method === "cod"
              ? "Place Order"
              : "Pay Now"}
        </button>

        <button className="cancel-pay-btn" onClick={handleCancel} disabled={processing}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default Payment;