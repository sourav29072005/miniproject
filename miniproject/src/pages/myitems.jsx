import { useEffect, useState } from "react";
import api, { BASE_URL } from "../api";
import "../styles/myitems.css";

function MyItems() {
  const [myItems, setMyItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [updateConfirmItem, setUpdateConfirmItem] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMyItems = async () => {
    try {
      setLoading(true);
      const [itemsResponse, salesResponse] = await Promise.all([
        api.get("items/my"),
        api.get("orders/my-sales"),
      ]);
      const itemsData = itemsResponse.data;
      const salesData = salesResponse.data;

      const formattedItems = itemsData.map((item) => {
        const activeOrder = salesData.find(
          (o) =>
            o.itemId &&
            o.itemId._id === item._id &&
            o.status !== "Cancelled" &&
            o.status !== "Delivered"
        );

        return {
          id: item._id,
          title: item.title,
          description: item.description,
          price: item.price,
          category: item.category,
          approved: item.approved,
          rejectionReason: item.rejectionReason,
          rejectedAt: item.rejectedAt,
          image: item.images && item.images.length > 0
            ? `${BASE_URL}/uploads/${item.images[0]}`
            : item.image
              ? `${BASE_URL}/uploads/${item.image}`
              : null,
          status: item.status,
          activeOrder: activeOrder
            ? {
              id: activeOrder._id,
              buyerConfirmed: activeOrder.buyerConfirmed,
              sellerConfirmed: activeOrder.sellerConfirmed,
              status: activeOrder.status,
              buyer: activeOrder.buyerId
                ? activeOrder.buyerId.name || activeOrder.buyerId.email
                : "Unknown",
              createdAt: activeOrder.createdAt,
            }
            : null,
        };
      });

      setMyItems(formattedItems);
    } catch (error) {
      console.error("Failed to load items from API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMyItems(); }, []);

  const confirmDelete = async () => {
    try {
      await api.delete(`items/${deleteId}`);
      setDeleteId(null);
      loadMyItems();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to delete item.");
    }
  };

  const confirmHandedOver = async (itemId) => {
    const itemObj = myItems.find((i) => i.id === itemId);
    
    // Check if 1 hour has passed
    if (!canSellerHandover(itemObj)) {
      alert("You can only confirm handover 1 hour after the order is placed.");
      return;
    }
    
    if (!window.confirm("Mark this item as handed over to the buyer?")) return;
    const orderId = itemObj?.activeOrder?.id;
    if (!orderId) return;
    try {
      await api.put(`orders/${orderId}/confirm-handed-over`);
      loadMyItems();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to confirm handover.");
    }
  };

  const confirmUpdate = async () => {
    try {
      await api.put(`items/${updateConfirmItem.id}`, {
        title: updateConfirmItem.title,
        description: updateConfirmItem.description,
        price: updateConfirmItem.price,
      });
      setEditingItem(null);
      setUpdateConfirmItem(null);
      loadMyItems();
    } catch (error) {
      alert("Failed to update item.");
    }
  };

  const availableCount = myItems.filter(i => i.status === "available").length;
  const soldCount = myItems.filter(i => i.status !== "available").length;

  const getStatusBadges = (item) => {
    const badges = [];
    if (item.status === "sold") badges.push({ cls: "badge-sold", label: "Sold" });
    else if (item.status === "delivered") badges.push({ cls: "badge-sold", label: "Delivered" });
    else badges.push({ cls: "badge-available", label: "Available" });

    if (!item.approved && item.rejectionReason) badges.push({ cls: "badge-rejected", label: "Rejected ❌" });
    else if (!item.approved) badges.push({ cls: "badge-unapproved", label: "Pending Approval" });

    return badges;
  };

  const getStatusText = (item) => {
    if (item.rejectionReason) {
      return `⚠️ Item Rejected: ${item.rejectionReason}`;
    }
    if (item.status === "sold") {
      if (item.activeOrder?.sellerConfirmed) return "⏳ Waiting for buyer confirmation";
      if (item.activeOrder?.buyerConfirmed) return "📬 Confirm handover to complete";
      return "📦 Order placed – pending delivery";
    }
    if (item.status === "delivered") return "✅ Delivered";
    return null;
  };

  const canSellerHandover = (item) => {
    if (!item.activeOrder || !item.activeOrder.createdAt) return false;
    const orderTime = new Date(item.activeOrder.createdAt).getTime();
    const oneHourInMs = 1 * 60 * 60 * 1000;
    return Date.now() - orderTime >= oneHourInMs;
  };

  const getHandoverButtonText = (item) => {
    if (!canSellerHandover(item)) {
      const orderTime = new Date(item.activeOrder.createdAt).getTime();
      const timeRemaining = Math.ceil(((orderTime + 1 * 60 * 60 * 1000) - Date.now()) / 1000 / 60);
      return `⏳ Available in ${timeRemaining}m`;
    }
    return item.activeOrder.buyerConfirmed ? "✅ Confirm Handover" : "📦 Handed Over";
  };

  return (
    <div className="myitems-page">
      {/* PAGE HEADER */}
      <div className="myitems-header">
        <div>
          <h1 className="myitems-page-title">My Listings</h1>
          <p className="myitems-page-subtitle">Manage all your items for sale</p>
        </div>
      </div>

      {/* STATS */}
      {!loading && myItems.length > 0 && (
        <div className="myitems-stats">
          <div className="stat-pill">
            <span className="stat-count">{myItems.length}</span> Total
          </div>
          <div className="stat-pill">
            <span className="stat-count" style={{ color: "#16a34a" }}>{availableCount}</span> Available
          </div>
          <div className="stat-pill">
            <span className="stat-count" style={{ color: "#dc2626" }}>{soldCount}</span> Sold
          </div>
        </div>
      )}

      {/* EDIT FORM */}
      {editingItem && (
        <div className="edit-card">
          <h3>✏️ Edit Listing</h3>
          <label className="edit-field-label">Title</label>
          <input
            type="text"
            value={editingItem.title}
            onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
            placeholder="Item title"
          />
          <label className="edit-field-label">Description</label>
          <textarea
            value={editingItem.description}
            onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
            placeholder="Describe your item..."
          />
          <label className="edit-field-label">Price (₹)</label>
          <input
            type="number"
            value={editingItem.price}
            onChange={(e) => setEditingItem({ ...editingItem, price: e.target.value })}
            placeholder="Price"
          />
          <div className="edit-buttons">
            <button className="update-btn" onClick={() => setUpdateConfirmItem(editingItem)}>
              Save Changes
            </button>
            <button className="cancel-btn" onClick={() => setEditingItem(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ITEMS GRID */}
      {loading ? (
        <p className="no-items">Loading your listings...</p>
      ) : myItems.length === 0 ? (
        <p className="no-items">📭 You haven't listed any items yet.</p>
      ) : (
        <div className="items-grid">
          {myItems.map((item) => {
            const statusText = getStatusText(item);
            const badges = getStatusBadges(item);

            return (
              <div key={item.id} className="item-card">
                {/* IMAGE */}
                <div className="image-wrapper">
                  {item.image ? (
                    <img src={item.image} alt={item.title} />
                  ) : (
                    <div className="no-image-placeholder">
                      <span style={{ fontSize: 32 }}>🖼</span>
                      No Image
                    </div>
                  )}
                  <div className="status-badge-overlay">
                    {badges.map((b, i) => (
                      <span key={i} className={`badge ${b.cls}`}>{b.label}</span>
                    ))}
                  </div>
                </div>

                {/* BODY */}
                <div className="item-card-body">
                  <p className="item-card-title">{item.title}</p>
                  <p className="item-card-price">₹ {item.price}</p>
                  <p className="item-card-desc">{item.description}</p>

                  {statusText && (
                    <div className="item-card-status-row">
                      <span className="order-info-text">{statusText}</span>
                    </div>
                  )}
                  {item.activeOrder && (
                    <span className="order-info-text">Buyer: {item.activeOrder.buyer}</span>
                  )}
                </div>

                {/* ACTIONS */}
                <div className="item-actions">
                  {item.status !== "sold" && item.status !== "delivered" && (
                    <button className="action-btn btn-edit" onClick={() => setEditingItem({ ...item })}>
                      ✏️ Edit
                    </button>
                  )}

                  {item.status === "sold" && item.activeOrder && !item.activeOrder.sellerConfirmed && (
                    <button 
                      className="action-btn btn-handover" 
                      onClick={() => confirmHandedOver(item.id)}
                      disabled={!canSellerHandover(item)}
                      style={{ opacity: canSellerHandover(item) ? 1 : 0.5, cursor: canSellerHandover(item) ? 'pointer' : 'not-allowed' }}
                    >
                      {getHandoverButtonText(item)}
                    </button>
                  )}

                  <button
                    className="action-btn btn-delete"
                    onClick={() => setDeleteId(item.id)}
                  >
                    {item.status === "sold" || item.status === "delivered" ? "🗑 Remove" : "🗑 Delete"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteId && (
        <div className="delete-overlay">
          <div className="delete-modal">
            <h3>
              {myItems.find((i) => i.id === deleteId)?.status === "sold" ||
                myItems.find((i) => i.id === deleteId)?.status === "delivered"
                ? "Remove Listing?"
                : "Delete Item?"}
            </h3>
            <p>This action cannot be undone.</p>
            <div className="delete-actions">
              <button className="cancel-delete" onClick={() => setDeleteId(null)}>Cancel</button>
              <button className="confirm-delete" onClick={confirmDelete}>Yes, Delete</button>
            </div>
          </div>
        </div>
      )}

      {/* UPDATE CONFIRM MODAL */}
      {updateConfirmItem && (
        <div className="delete-overlay">
          <div className="delete-modal">
            <h3>Save Changes?</h3>
            <p>Update <strong>{updateConfirmItem.title}</strong> with the new details?</p>
            <div className="delete-actions">
              <button className="cancel-delete" onClick={() => setUpdateConfirmItem(null)}>Cancel</button>
              <button className="confirm-update" onClick={confirmUpdate}>✓ Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyItems;