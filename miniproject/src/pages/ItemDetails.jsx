import { useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api, { BASE_URL } from "../api";
import { useAuth } from "../context/AuthContext";
import "../styles/itemdetails.css";

function ItemDetails() {
  const [item, setItem] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lightboxImg, setLightboxImg] = useState(null);
  const { user } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const isAdminView = location.pathname.includes("/admin");

  const loadItem = useCallback(async () => {
    const selectedId = localStorage.getItem("selectedItemId");
    if (!selectedId) { navigate(isAdminView ? "/admin/items" : "/marketplace"); return; }

    try {
      setLoading(true);
      const response = await api.get(`items/${selectedId}`);
      const freshItem = response.data;
      if (!freshItem) { navigate(isAdminView ? "/admin/items" : "/marketplace"); return; }

      const allImages = freshItem.images && freshItem.images.length > 0
        ? freshItem.images.map(img => `${BASE_URL}/uploads/${img}`)
        : freshItem.image
          ? [freshItem.image.startsWith("data:") ? freshItem.image : `${BASE_URL}/uploads/${freshItem.image}`]
          : [];

      setItem({
        ...freshItem,
        id: freshItem._id,
        image: allImages[0] || null,
        allImages,
        seller: freshItem.user?.name || freshItem.user?.email || "Seller",
        sellerId: freshItem.user?._id || freshItem.user || "Unknown"
      });
    } catch (err) {
      console.error("Failed to load item:", err);
      navigate(isAdminView ? "/admin/items" : "/marketplace");
    } finally {
      setLoading(false);
    }
  }, [navigate, isAdminView]);

  useEffect(() => { loadItem(); }, [loadItem]);

  if (loading) return <p className="loading-text">Loading item details...</p>;
  if (!item) return <p className="loading-text">Item not found.</p>;

  const contactSeller = () => alert(`Contact Seller: ${item.seller}`);

  const confirmBuy = () => {
    if (item.status === "sold") { alert("Sorry! This item has just been sold."); navigate("/marketplace"); return; }
    localStorage.setItem("paymentItemId", item.id);
    localStorage.setItem("paymentItemSellerId", item.sellerId);
    localStorage.setItem("paymentItemPrice", item.price);
    setShowModal(false);
    navigate("/payment");
  };

  const lightboxIndex = lightboxImg ? item.allImages.indexOf(lightboxImg) : -1;
  const isSeller = user?.id && item.sellerId && user.id === item.sellerId.toString();

  return (
    <div className="details-page-wrapper">
      {/* BREADCRUMB */}
      <div className="details-breadcrumb">
        {isAdminView
          ? <button onClick={() => navigate("/admin/items")}>← Back to Admin Items</button>
          : <><button onClick={() => navigate("/marketplace")}>Marketplace</button> <span>›</span> <span>{item.title}</span></>
        }
      </div>

      {/* TWO-COLUMN GRID */}
      <div className="details-grid">

        {/* LEFT: IMAGE PANE */}
        <div className="details-image-pane">
          {item.image ? (
            <img
              src={item.image}
              alt={item.title}
              className="details-cover-img"
              onClick={() => setLightboxImg(item.image)}
              title="Click to view full size"
            />
          ) : (
            <div style={{ height: 260, background: "#f1f5f9", display: "flex", alignItems: "center", justifyContent: "center", color: "#94a3b8" }}>
              No Image
            </div>
          )}

          {/* Thumbnails inside the image pane */}
          {item.allImages && item.allImages.length > 1 && (
            <div className="details-thumbs-section">
              <p className="details-thumbs-label">All Photos ({item.allImages.length})</p>
              <div className="details-thumbs-grid">
                {item.allImages.map((src, i) => (
                  <div
                    key={i}
                    className={`extra-thumb-wrapper${i === 0 ? " cover" : ""}`}
                    onClick={() => setLightboxImg(src)}
                  >
                    <img src={src} alt={`photo-${i + 1}`} className="extra-thumb" />
                    {i === 0 && <span className="cover-badge">Cover</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT: INFO PANE */}
        <div className="details-info-pane">

          {/* Title + price + status */}
          <div className="info-card">
            <h1 className="item-title-text">{item.title}</h1>
            <div className="item-price-badge">₹ {item.price}</div>
            <div>
              <span className={`status-chip ${item.status === "sold" ? "sold" : "available"}`}>
                <span className="status-dot" />
                {item.status === "sold" ? "Unavailable" : "Available"}
              </span>
              <span className="category-tag">{item.category}</span>
            </div>
          </div>

          {/* Description */}
          <div className="info-card">
            <p className="desc-label">About this item</p>
            <p className="desc-text">{item.description}</p>
          </div>

          {/* Seller info */}
          <div className="info-card">
            <p className="desc-label">Sold by</p>
            <div
              className="seller-card-row"
              onClick={() => navigate(`/seller/${item.user?._id || item.user}`)}
            >
              <div className="seller-avatar-lg">
                {item.user?.profilePic ? (
                  <img src={`${BASE_URL}/uploads/${item.user.profilePic}`} alt={item.seller} />
                ) : (
                  <div className="initials">{item.seller.charAt(0).toUpperCase()}</div>
                )}
              </div>
              <div className="seller-text-col">
                <p className="seller-name-bold">{item.seller}</p>
                <p className="seller-profile-link">View full profile →</p>
              </div>
              <span className="seller-chevron">›</span>
            </div>
          </div>

          {/* Action buttons */}
          {!isAdminView && (
            <div className="action-card">
              {isSeller ? (
                <p className="own-item-notice">🏷️ This is your listing — you cannot purchase your own item.</p>
              ) : (
                <>
                  <button className="contact-btn" onClick={contactSeller}>✉ Contact Seller</button>
                  {item.status !== "sold" ? (
                    <button className="buy-final-btn" onClick={() => setShowModal(true)}>
                      🛒 Proceed to Payment
                    </button>
                  ) : (
                    <button className="buy-final-btn" disabled>Sold Out</button>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>

      {/* FULLSCREEN LIGHTBOX */}
      {lightboxImg && (
        <div className="lightbox-overlay" onClick={() => setLightboxImg(null)}>
          <button className="lightbox-close" onClick={() => setLightboxImg(null)}>✕</button>
          <div className="lightbox-nav" onClick={(e) => e.stopPropagation()}>
            {item.allImages.length > 1 && (
              <button className="lightbox-arrow left"
                onClick={() => setLightboxImg(item.allImages[(lightboxIndex - 1 + item.allImages.length) % item.allImages.length])}>
                &#8249;
              </button>
            )}
            <img src={lightboxImg} alt="Full view" className="lightbox-img" />
            {item.allImages.length > 1 && (
              <button className="lightbox-arrow right"
                onClick={() => setLightboxImg(item.allImages[(lightboxIndex + 1) % item.allImages.length])}>
                &#8250;
              </button>
            )}
          </div>
          <div className="lightbox-counter">{lightboxIndex + 1} / {item.allImages.length}</div>
        </div>
      )}

      {/* PAYMENT MODAL */}
      {!isAdminView && showModal && (
        <div className="modal-overlay">
          <div className="modal-box">
            <h3>Confirm Purchase</h3>
            <p>You are about to pay <strong>₹{item.price}</strong> for <strong>{item.title}</strong>.</p>
            <p className="text-sm text-red-500 mt-2 font-medium">Note: You can only cancel within 2 hours of purchase.</p>
            <div className="modal-buttons">
              <button className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="confirm-btn" onClick={confirmBuy}>✓ Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ItemDetails;