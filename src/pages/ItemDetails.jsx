import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../styles/itemdetails.css";

function ItemDetails() {

  const [item, setItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();

  // ✅ detect admin route
  const isAdminView = location.pathname.includes("/admin");

  const loadItem = useCallback(() => {

    const selectedId =
      Number(localStorage.getItem("selectedItemId"));

    if (!selectedId) {
      navigate(isAdminView ? "/admin/items" : "/marketplace");
      return;
    }

    const storedItems =
      JSON.parse(localStorage.getItem("items")) || [];

    const freshItem = storedItems.find(
      (i) => i.id === selectedId
    );

    if (!freshItem) {
      navigate(isAdminView ? "/admin/items" : "/marketplace");
      return;
    }

    setItem(freshItem);

  }, [navigate, isAdminView]);

  useEffect(() => {

    loadItem();

    window.addEventListener("focus", loadItem);

    return () =>
      window.removeEventListener("focus", loadItem);

  }, [loadItem]);

  if (!item) {
    return <p>Loading item details...</p>;
  }

  const contactSeller = () => {
    alert(`Contact Seller: ${item.seller}`);
  };

  const confirmBuy = () => {

    const storedItems =
      JSON.parse(localStorage.getItem("items")) || [];

    const freshItem = storedItems.find(
      (i) => i.id === item.id
    );

    if (!freshItem || freshItem.status === "sold") {
      alert("Sorry! This item has just been sold.");
      navigate("/marketplace");
      return;
    }

    localStorage.setItem("paymentItemId", item.id);

    setShowModal(false);
    navigate("/payment");
  };

  return (
    <div className="details-container">

      {/* ✅ ADMIN HEADER */}
      {isAdminView && (
        <div style={{marginBottom:"20px"}}>
          <button
            className="btn-ghost"
            onClick={() => navigate("/admin/items")}
          >
            ← Back to Admin Items
          </button>
        </div>
      )}

      <div className="details-card">

        <img src={item.image} alt={item.title} />

        <div className="details-info">

          <h2>{item.title}</h2>

          <p className="details-desc">
            {item.description}
          </p>

          <p className="details-price">
            ₹ {item.price}
          </p>

          <p className="details-seller">
            Seller: {item.seller}
          </p>

          <p className={
            item.status === "sold"
              ? "status-sold"
              : "status-available"
          }>
            {item.status === "sold"
              ? "Unavailable"
              : "Available"}
          </p>

          {/* ✅ ADMIN DOES NOT SEE BUY BUTTON */}
          {!isAdminView && (
            <div className="details-actions">

              <button
                className="contact-btn"
                onClick={contactSeller}
              >
                Contact Seller
              </button>

              {item.status !== "sold" ? (
                <button
                  className="buy-final-btn"
                  onClick={() => setShowModal(true)}
                >
                  Proceed to Payment
                </button>
              ) : (
                <button
                  className="buy-final-btn"
                  disabled
                >
                  Sold Out
                </button>
              )}

            </div>
          )}

        </div>

      </div>

      {/* PAYMENT CONFIRMATION MODAL */}
      {!isAdminView && showModal && (
        <div className="modal-overlay">
          <div className="modal-box">

            <h3>Confirm Purchase</h3>

            <p>
              You are about to pay ₹{item.price} for this item.
            </p>

            <div className="modal-buttons">

              <button
                className="cancel-btn"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>

              <button
                className="confirm-btn"
                onClick={confirmBuy}
              >
                Proceed
              </button>

            </div>

          </div>
        </div>
      )}

    </div>
  );
}

export default ItemDetails;