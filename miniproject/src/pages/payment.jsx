import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api";
import "../styles/payment.css";

function Payment() {
  const navigate = useNavigate();

  const [method, setMethod] = useState(""); // upi | card | netbanking | cod
  const [handoverLocation, setHandoverLocation] = useState("");
  const [customLocation, setCustomLocation] = useState("");
  const [processing, setProcessing] = useState(false);

  const [item, setItem] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    // ✅ Load item information from localStorage
    const paymentItemId = localStorage.getItem("paymentItemId");
    const paymentItemPrice = localStorage.getItem("paymentItemPrice");

    if (!paymentItemId) {
      navigate("/marketplace");
      return;
    }

    setItem({
      id: paymentItemId,
      price: paymentItemPrice,
      title: "Item for purchase", // Could fetch full details if needed
    });
    setChecking(false);
  }, [navigate]);

  const handlePayNow = async () => {
    if (!method) {
      alert("Please select a payment method.");
      return;
    }

    if (!handoverLocation) {
      alert("Please select a handover location.");
      return;
    }

    if (handoverLocation === "Custom Location" && !customLocation.trim()) {
      alert("Please specify your custom handover location.");
      return;
    }

    setProcessing(true);

    const itemId = localStorage.getItem("paymentItemId");
    const sellerId = localStorage.getItem("paymentItemSellerId");
    const price = localStorage.getItem("paymentItemPrice");

    try {
      await api.post("orders", {
        itemId,
        sellerId,
        price,
        handoverLocation,
        customLocation: handoverLocation === "Custom Location" ? customLocation.trim() : undefined,
      });

      // Clear payment info
      localStorage.removeItem("paymentItemId");
      localStorage.removeItem("paymentItemSellerId");
      localStorage.removeItem("paymentItemPrice");
      localStorage.setItem("paymentMethod", method);

      setProcessing(false);
      navigate("/success", { state: { paymentItemId: itemId } });
    } catch (err) {
      console.error("Order creation failed:", err);
      alert(err.response?.data?.error || "Payment processing failed. Please try again.");
      setProcessing(false);
    }
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

        {/* ✅ Handover Location Selection */}
        <div className="handover-section" style={{marginTop: "20px", marginBottom: "20px", textAlign: "left"}}>
          <p style={{ margin: "0 0 8px 0", fontWeight: 600 }}>Preferred Handover Location:</p>
          <select 
            value={handoverLocation} 
            onChange={(e) => setHandoverLocation(e.target.value)}
            disabled={processing}
            style={{width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", marginBottom: "10px", fontSize: "14px"}}
          >
            <option value="">-- Select Location --</option>
            <option value="Library">Library</option>
            <option value="Main Canteen">Main Canteen</option>
            <option value="Hostels Gate">Hostels Gate</option>
            <option value="Main Gate">Main Gate</option>
            <option value="Custom Location">Custom Location</option>
          </select>

          {handoverLocation === "Custom Location" && (
            <input 
              type="text" 
              value={customLocation}
              onChange={(e) => setCustomLocation(e.target.value)}
              placeholder="Enter specific location..."
              disabled={processing}
              style={{width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccc", fontSize: "14px"}}
            />
          )}
        </div>

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