import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../api";
import "../styles/adminItems.css";

function AdminItems() {
  const navigate = useNavigate();

  const [pendingItems, setPendingItems] = useState([]);
  const [approvedItems, setApprovedItems] = useState([]);
  const [view, setView] = useState("pending"); // pending | approved
  const [deleteId, setDeleteId] = useState(null);
  const [rejectId, setRejectId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [imageGalleryId, setImageGalleryId] = useState(null);
  const [search, setSearch] = useState("");

  const loadPendingItems = useCallback(async () => {
    try {
      const response = await api.get("items/pending");
      setPendingItems(response.data);
    } catch (err) {
      console.error("Failed to load pending items:", err);
    }
  }, []);

  const loadApprovedItems = useCallback(async () => {
    try {
      const response = await api.get("items");
      setApprovedItems(response.data);
    } catch (err) {
      console.error("Failed to load approved items:", err);
    }
  }, []);

  useEffect(() => {
    // 🔐 protect admin route
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || user.role !== "admin") {
      navigate("/");
      return;
    }

    loadPendingItems();
    loadApprovedItems();

    window.addEventListener("focus", () => {
      loadPendingItems();
      loadApprovedItems();
    });
    return () => window.removeEventListener("focus", loadPendingItems);
  }, [navigate, loadPendingItems, loadApprovedItems]);

  const items = view === "pending" ? pendingItems : approvedItems;

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const title = (item.title || "").toLowerCase();
      const seller = (item.user?.name || item.user?.email || "").toLowerCase();
      return q === "" || title.includes(q) || seller.includes(q);
    });
  }, [items, search]);

  const selectedItem = useMemo(() => {
    return items.find((i) => i._id === deleteId) || null;
  }, [items, deleteId]);

  const approveItem = async (itemId) => {
    try {
      await api.put(`items/approve/${itemId}`);
      loadPendingItems();
      loadApprovedItems();
    } catch (err) {
      console.error("Failed to approve item:", err);
      alert("Failed to approve item.");
    }
  };

  const submitRejection = async () => {
    if (!rejectionReason.trim()) {
      alert("Please provide a rejection reason.");
      return;
    }

    try {
      await api.put(`items/reject/${rejectId}`, { rejectionReason });
      setRejectId(null);
      setRejectionReason("");
      // Remove from pending items list
      setPendingItems(prev => prev.filter(item => item._id !== rejectId));
      alert("Item rejected and seller notified.");
    } catch (err) {
      console.error("Failed to reject item:", err);
      alert(err.response?.data?.error || "Failed to reject item.");
    }
  };

  const confirmDelete = async () => {
    try {
      await api.delete(`items/${deleteId}`);
      setDeleteId(null);
      loadPendingItems();
      loadApprovedItems();
    } catch (err) {
      console.error("Failed to delete item:", err);
      alert("Failed to delete item.");
    }
  };

  return (
    <div className="ai-container">
      {/* Header */}
      <div className="ai-header">
        <div>
          <h2 className="ai-title">Manage Items</h2>
          <p className="ai-subtitle">
            Approve pending items or manage approved marketplace listings.
          </p>
        </div>

        <button className="ai-back" onClick={() => navigate("/admin")}>
          Back to Admin
        </button>
      </div>

      {/* Stats */}
      <div className="ai-stats">
        <div className="ai-stat-card">
          <p className="ai-stat-label">Pending Approval</p>
          <h3 className="ai-stat-value">{pendingItems.length}</h3>
        </div>

        <div className="ai-stat-card">
          <p className="ai-stat-label">Approved Items</p>
          <h3 className="ai-stat-value">{approvedItems.length}</h3>
        </div>
      </div>

      {/* View Tabs */}
      <div className="ai-tabs">
        <button
          className={view === "pending" ? "ai-tab active" : "ai-tab"}
          onClick={() => {
            setView("pending");
            setSearch("");
          }}
        >
          📋 Pending Approval ({pendingItems.length})
        </button>
        <button
          className={view === "approved" ? "ai-tab active" : "ai-tab"}
          onClick={() => {
            setView("approved");
            setSearch("");
          }}
        >
          ✅ Approved ({approvedItems.length})
        </button>
      </div>

      {/* Search */}
      <div className="ai-filters">
        <input
          className="ai-search"
          type="text"
          placeholder="Search by title or seller..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <button
          className="ai-ghost"
          onClick={() => setSearch("")}
        >
          Clear
        </button>
      </div>

      {/* List */}
      <div className="ai-list">
        <div className="ai-count">
          Showing <b>{filteredItems.length}</b> of <b>{items.length}</b> items
        </div>

        {filteredItems.length === 0 ? (
          <div className="ai-empty-card">
            <h3>{view === "pending" ? "No pending items" : "No approved items"}</h3>
            <p>{view === "pending" ? "All items have been reviewed!" : "Approve items to see them here."}</p>
          </div>
        ) : (
          <div className="ai-grid">
            {filteredItems.map((item) => {
              const isSold = item.status === "sold";

              return (
                <div key={item._id} className="ai-card">
                  <div className="ai-imgwrap" onClick={() => setImageGalleryId(item._id)} style={{ cursor: 'pointer' }}>
                    {item.image || (item.images && item.images.length > 0) ? (
                      <img 
                        className="ai-img" 
                        src={`${BASE_URL}/uploads/${item.image || item.images[0]}`} 
                        alt={item.title}
                        title="Click to view all images"
                      />
                    ) : (
                      <div className="ai-img ai-placeholder">No Image</div>
                    )}

                    {(item.images && item.images.length > 1) && (
                      <span className="ai-image-count">+{item.images.length - 1}</span>
                    )}

                    <span className={isSold ? "ai-badge sold" : "ai-badge avail"}>
                      {isSold ? "SOLD" : "AVAILABLE"}
                    </span>
                  </div>

                  <div className="ai-info">
                    <div className="ai-title-row">
                      <h3 className="ai-name" title={item.title}>
                        {item.title}
                      </h3>
                      <p className="ai-price">₹ {item.price}</p>
                    </div>

                    <div className="ai-meta-row">
                      <span className="ai-pill">Category: {item.category || "-"}</span>
                      <span className="ai-pill">👤 {item.user?.name || item.user?.email || "-"}</span>
                    </div>

                    {item.description && <p className="ai-desc">{item.description}</p>}
                  </div>

                  <div className="ai-actions">
                    {view === "pending" ? (
                      <>
                        <button 
                          className="ai-success" 
                          onClick={() => approveItem(item._id)}
                        >
                          ✅ Approve
                        </button>

                        <button 
                          className="ai-danger" 
                          onClick={() => setRejectId(item._id)}
                        >
                          ❌ Reject
                        </button>
                      </>
                    ) : (
                      <button 
                        className="ai-danger" 
                        onClick={() => setDeleteId(item._id)}
                      >
                        🗑 Remove
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rejection Modal */}
      {rejectId && (
        <div className="ai-overlay">
          <div className="ai-modal">
            <h3>Reject Item</h3>
            <p className="ai-modal-text">
              You are about to reject: <b>{items.find((i) => i._id === rejectId)?.title || "this item"}</b>. The seller will be notified with your reason.
            </p>

            <label className="ai-modal-label">Rejection Reason</label>
            <textarea
              className="ai-modal-textarea"
              placeholder="Enter reason for rejection (e.g., Item condition unclear, Inappropriate content, Price too high, etc.)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              rows="4"
            />

            <div className="ai-modal-actions">
              <button 
                className="ai-ghost" 
                onClick={() => {
                  setRejectId(null);
                  setRejectionReason("");
                }}
              >
                Cancel
              </button>
              <button className="ai-danger" onClick={submitRejection}>
                Reject & Notify Seller
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="ai-overlay">
          <div className="ai-modal">
            <h3>Remove Item?</h3>
            <p className="ai-modal-text">
              You are about to remove: <b>{selectedItem?.title || "this item"}</b>. This cannot be undone.
            </p>

            <div className="ai-modal-actions">
              <button className="ai-ghost" onClick={() => setDeleteId(null)}>
                Cancel
              </button>
              <button className="ai-danger" onClick={confirmDelete}>
                Remove
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Gallery Modal */}
      {imageGalleryId && (
        <div className="ai-overlay" onClick={() => setImageGalleryId(null)}>
          <div className="ai-image-gallery-modal" onClick={(e) => e.stopPropagation()}>
            <button 
              className="ai-close-btn"
              onClick={() => setImageGalleryId(null)}
              title="Close gallery"
            >
              ✕
            </button>
            
            {(() => {
              const item = items.find(i => i._id === imageGalleryId);
              const images = item?.images || (item?.image ? [item.image] : []);
              
              return (
                <div className="ai-gallery-content">
                  <h3>{item?.title || "Item Images"}</h3>
                  
                  <div className="ai-gallery-info">
                    <p><strong>Category:</strong> {item?.category || "-"}</p>
                    <p><strong>Price:</strong> ₹ {item?.price || "-"}</p>
                    <p><strong>Seller:</strong> {item?.user?.name || item?.user?.email || "-"}</p>
                    <p><strong>Description:</strong> {item?.description || "-"}</p>
                  </div>

                  {images.length > 0 ? (
                    <div className="ai-gallery-grid">
                      {images.map((img, idx) => (
                        <div key={idx} className="ai-gallery-item">
                          <img 
                            src={`${BASE_URL}/uploads/${img}`} 
                            alt={`${item.title} - ${idx + 1}`}
                          />
                          <p className="ai-gallery-label">{idx + 1}/{images.length}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="ai-gallery-empty">No images available</p>
                  )}
                </div>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminItems;