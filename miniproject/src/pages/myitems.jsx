import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../api";
import "../styles/myitems.css";

function MyItems() {
  const navigate = useNavigate();
  const [myItems, setMyItems] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteId, setDeleteId] = useState(null);
  const [updateConfirmItem, setUpdateConfirmItem] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Filter state
  const [filter, setFilter] = useState("All"); // "All", "Available", "Sold", "Delivered"

  // Scheduling state
  const [schedulingItem, setSchedulingItem] = useState(null);
  const [handoverDate, setHandoverDate] = useState("");
  const [handoverTime, setHandoverTime] = useState("");

  const loadMyItems = async () => {
    try {
      setLoading(true);
      const [itemsResponse, salesResponse] = await Promise.all([
        api.get("items/my"),
        api.get("orders/my-sales"),
      ]);
      const itemsData = itemsResponse.data;
      const salesData = salesResponse.data;

      const formattedItems = [];
      
      // Process active listings
      itemsData.forEach((item) => {
        const activeOrder = salesData.find(
          (o) => {
            const hasLegacyMatch = o.itemId && (o.itemId._id === item._id || o.itemId === item._id);
            const hasArrayMatch = o.items && o.items.some(i => (i.itemId?._id || i.itemId)?.toString() === item._id.toString());
            return (hasLegacyMatch || hasArrayMatch) && o.status !== "Cancelled";
          }
        );

        formattedItems.push({
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
          isDeleted: false,
          activeOrder: activeOrder
            ? {
              id: activeOrder._id,
              buyerConfirmed: activeOrder.buyerConfirmed,
              sellerConfirmed: activeOrder.sellerConfirmed,
              status: activeOrder.status,
              buyer: activeOrder.buyerId
                ? activeOrder.buyerId.name || activeOrder.buyerId.email
                : "Unknown",
              buyerId: activeOrder.buyerId ? (activeOrder.buyerId._id || activeOrder.buyerId) : null,
              createdAt: activeOrder.createdAt,
              handoverLocation: activeOrder.handoverLocation,
              customLocation: activeOrder.customLocation,
              handoverDate: activeOrder.handoverDate,
              handoverTime: activeOrder.handoverTime,
            }
            : null,
        });
      });

      // Process "ghost" orders (orders where the item has been deleted)
      salesData.forEach((order) => {
         if (order.status === "Cancelled") return;
         
         // Combine legacy and new items into one array to check
         const orderItemsToCheck = order.items && order.items.length > 0 
           ? order.items 
           : (order.itemId || order.itemTitle ? [{ itemId: order.itemId, itemTitle: order.itemTitle, itemImage: order.itemImage, price: order.price }] : []);

         orderItemsToCheck.forEach((orderedItem) => {
            // Check if this specific item still exists in itemsData
            const itemStillExists = orderedItem.itemId && itemsData.some(i => i._id === (orderedItem.itemId._id || orderedItem.itemId));

            if (!itemStillExists) {
               // Create a ghost card for this specific deleted item
               let image = null;
               if (orderedItem.itemId && orderedItem.itemId.image) {
                 image = `${BASE_URL}/uploads/${orderedItem.itemId.image}`;
               } else if (orderedItem.itemImage) {
                 image = `${BASE_URL}/uploads/${orderedItem.itemImage}`;
               }

               formattedItems.push({
                 id: `ghost-${order._id}-${orderedItem.itemId?._id || orderedItem.itemId || Math.random()}`,
                 title: (orderedItem.itemId && orderedItem.itemId.title) ? orderedItem.itemId.title : (orderedItem.itemTitle || "Unknown Item (Deleted)"),
                 description: "You have deleted this item from your listings, but its order history remains.",
                 price: orderedItem.price || order.price,
                 category: "Unknown",
                 approved: true,
                 rejectionReason: null,
                 rejectedAt: null,
                 image: image,
                 status: order.status === "Delivered" ? "delivered" : "sold",
                 isDeleted: true,
                 activeOrder: {
                   id: order._id,
                   buyerConfirmed: order.buyerConfirmed,
                   sellerConfirmed: order.sellerConfirmed,
                   status: order.status,
                   buyer: order.buyerId
                     ? order.buyerId.name || order.buyerId.email
                     : "Unknown",
                   buyerId: order.buyerId ? (order.buyerId._id || order.buyerId) : null,
                   createdAt: order.createdAt,
                   handoverLocation: order.handoverLocation,
                   customLocation: order.customLocation,
                   handoverDate: order.handoverDate,
                   handoverTime: order.handoverTime,
                 }
               });
            }
         });
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

  const submitSchedule = async () => {
    if (!handoverDate || !handoverTime) {
      alert("Please select both date and time.");
      return;
    }
    try {
      await api.put(`orders/${schedulingItem.activeOrder.id}/schedule`, {
        handoverDate,
        handoverTime
      });
      setSchedulingItem(null);
      loadMyItems();
    } catch (error) {
      alert(error.response?.data?.error || "Failed to schedule handover.");
    }
  };

  const contactBuyer = async (buyerId) => {
    if (!buyerId) return alert("Buyer information missing.");
    try {
      const res = await api.post("chat/start", { recipientId: buyerId });
      navigate(`/chat?convo=${res.data._id}`);
    } catch(err) {
      console.error("Failed to start chat", err);
      alert("Failed to connect to buyer.");
    }
  };

  const isUpcomingHandover = (date, time) => {
    if (!date || !time) return false;
    const handoverDateTime = new Date(`${date.split('T')[0]}T${time}`);
    const now = new Date();
    const diffMs = handoverDateTime - now;
    return diffMs > 0 && diffMs <= 24 * 60 * 60 * 1000;
  };

  const isOverdue = (date, time) => {
    if (!date || !time) return false;
    const handoverDateTime = new Date(`${date.split('T')[0]}T${time}`);
    const now = new Date();
    return handoverDateTime < now;
  };

  const availableCount = myItems.filter(i => i.status === "available").length;
  const soldCount = myItems.filter(i => i.status === "sold").length;
  const deliveredCount = myItems.filter(i => i.status === "delivered").length;

  const filteredItems = myItems.filter((item) => {
    if (filter === "All") return true;
    if (filter === "Available") return item.status === "available";
    if (filter === "Sold") return item.status === "sold";
    if (filter === "Delivered") return item.status === "delivered";
    return true;
  });

  const getStatusBadges = (item) => {
    const badges = [];
    
    if (!item.approved && item.rejectionReason) {
      badges.push({ cls: "badge-rejected", label: "Rejected" });
    } else if (!item.approved) {
      badges.push({ cls: "badge-unapproved", label: "Pending Approval" });
    } else if (item.status === "sold") {
      badges.push({ cls: "badge-sold", label: "Sold" });
    } else if (item.status === "delivered") {
      badges.push({ cls: "badge-sold", label: "Delivered" });
    } else {
      badges.push({ cls: "badge-available", label: "Available" });
    }

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
    if (!item.activeOrder) return false;
    if (item.activeOrder.buyerConfirmed) return true; // Bypass timer if buyer already confirmed
    if (!item.activeOrder.createdAt) return false;
    
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
    return item.activeOrder.buyerConfirmed ? "✅ Confirm Handover" : "✅ Handed Over";
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
          <div 
            className={`stat-pill ${filter === "All" ? "active" : ""}`}
            onClick={() => setFilter("All")}
            style={{ cursor: "pointer", opacity: filter === "All" ? 1 : 0.5, transition: "opacity 0.2s" }}
            title="Show all items"
          >
            <span className="stat-count">{myItems.length}</span> Total
          </div>
          <div 
            className={`stat-pill ${filter === "Available" ? "active" : ""}`}
            onClick={() => setFilter("Available")}
            style={{ cursor: "pointer", opacity: filter === "Available" ? 1 : 0.5, transition: "opacity 0.2s" }}
            title="Show available items"
          >
            <span className="stat-count" style={{ color: "#16a34a" }}>{availableCount}</span> Available
          </div>
          <div 
            className={`stat-pill ${filter === "Sold" ? "active" : ""}`}
            onClick={() => setFilter("Sold")}
            style={{ cursor: "pointer", opacity: filter === "Sold" ? 1 : 0.5, transition: "opacity 0.2s" }}
            title="Show sold (pending delivery) items"
          >
            <span className="stat-count" style={{ color: "#f59e0b" }}>{soldCount}</span> Sold
          </div>
          <div 
            className={`stat-pill ${filter === "Delivered" ? "active" : ""}`}
            onClick={() => setFilter("Delivered")}
            style={{ cursor: "pointer", opacity: filter === "Delivered" ? 1 : 0.5, transition: "opacity 0.2s" }}
            title="Show delivered items"
          >
            <span className="stat-count" style={{ color: "#2563eb" }}>{deliveredCount}</span> Delivered
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
      ) : filteredItems.length === 0 ? (
        <p className="no-items">📭 No items match the filter '{filter}'.</p>
      ) : (
        <div className="items-grid">
          {filteredItems.map((item) => {
            const statusText = getStatusText(item);
            const badges = getStatusBadges(item);

            return (
              <div key={item.id} className={`item-card ${item.rejectionReason ? 'rejected-item' : ''}`}>
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

                <div className="item-card-body">
                  <p className="item-card-title">{item.title}</p>
                  <p className="item-card-price">₹ {item.price}</p>
                  <p className="item-card-desc">{item.description}</p>

                  {item.rejectionReason && (
                    <div className="rejection-alert">
                      <strong>⚠️ Rejected:</strong> {item.rejectionReason}
                    </div>
                  )}

                  {!item.rejectionReason && statusText && (
                    <div className="item-card-status-row">
                      <span className="order-info-text">{statusText}</span>
                    </div>
                  )}
                  {item.activeOrder && (
                    <>
                      <span className="order-info-text">Buyer: {item.activeOrder.buyer}</span>
                      
                      {/* Handover Details */}
                      {item.status !== "delivered" && (item.activeOrder.handoverLocation || item.activeOrder.handoverDate) && (
                        <div className="handover-box">
                          <div className="handover-header">
                            <span>🤝</span> Handover Details
                          </div>
                          
                          <div className="handover-row">
                            <span>Location:</span>
                            <strong>{item.activeOrder.handoverLocation === 'Custom Location' ? item.activeOrder.customLocation : item.activeOrder.handoverLocation || 'TBD'}</strong>
                          </div>
                          
                          <div className="handover-row">
                            <span>Schedule:</span>
                            {item.activeOrder.handoverDate ? (
                              <strong>{new Date(item.activeOrder.handoverDate).toLocaleDateString()} @ {item.activeOrder.handoverTime}</strong>
                            ) : (
                              <span style={{color: '#d97706', fontStyle: 'italic', fontWeight: 600}}>Awaiting scheduling</span>
                            )}
                          </div>

                          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                            {isUpcomingHandover(item.activeOrder.handoverDate, item.activeOrder.handoverTime) && (
                              <div className="handover-warning-upcoming">⏱️ Upcoming &lt; 24h</div>
                            )}
                            {isOverdue(item.activeOrder.handoverDate, item.activeOrder.handoverTime) && (
                              <div className="handover-warning-overdue">🚨 Overdue</div>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* ACTIONS */}
                {/* ACTIONS */}
                <div className="item-actions">
                  {/* Management row (Edit / Delete) */}
                  {item.status !== "sold" && item.status !== "delivered" && (
                    <div className="actions-row management-actions">
                      <button className="action-btn btn-edit" onClick={() => setEditingItem({ ...item })}>
                        ✏️ Edit
                      </button>
                      <button className="action-btn btn-delete" onClick={() => setDeleteId(item.id)}>
                        🗑 Delete
                      </button>
                    </div>
                  )}

                  {/* Order processing row (Schedule / Message / Confirm) */}
                  {(item.status === "sold" || item.status === "delivered") && item.activeOrder && (
                    <div className="actions-row order-actions">
                      {item.status === "sold" && item.activeOrder.buyerId && (
                        <button 
                          className="action-btn btn-message" 
                          onClick={() => contactBuyer(item.activeOrder.buyerId)}
                        >
                          💬 Message
                        </button>
                      )}

                      {item.status === "sold" && (
                        <button 
                          className="action-btn btn-schedule" 
                          onClick={() => {
                            setSchedulingItem(item);
                            setHandoverDate(item.activeOrder.handoverDate ? item.activeOrder.handoverDate.split('T')[0] : "");
                            setHandoverTime(item.activeOrder.handoverTime || "");
                          }}
                        >
                          🗓️ Schedule
                        </button>
                      )}

                      {item.status === "sold" && !item.activeOrder.sellerConfirmed && (
                        <button 
                          className="action-btn btn-handover full-width" 
                          onClick={() => confirmHandedOver(item.id)}
                          disabled={!canSellerHandover(item)}
                          style={{ opacity: canSellerHandover(item) ? 1 : 0.5, cursor: canSellerHandover(item) ? 'pointer' : 'not-allowed' }}
                        >
                          {getHandoverButtonText(item)}
                        </button>
                      )}

                      <button 
                         className="action-btn full-width"
                         style={{ backgroundColor: "#f3f4f6", color: "#374151" }}
                         onClick={() => navigate(`/order-details/${item.activeOrder.id}`)}
                      >
                        📄 View Order Details
                      </button>
                    </div>
                  )}
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

      {/* SCHEDULE MODAL */}
      {schedulingItem && (
        <div className="delete-overlay">
          <div className="delete-modal" style={{textAlign: "left"}}>
            <h3 style={{marginBottom: "12px", textAlign: "center"}}>🗓️ Schedule Handover</h3>
            <p style={{fontSize:"14px", marginBottom: "8px"}}>
              <strong>Location Requested:</strong> {schedulingItem.activeOrder.handoverLocation === 'Custom Location' ? schedulingItem.activeOrder.customLocation : schedulingItem.activeOrder.handoverLocation || "TBD"}
            </p>
            <p style={{fontSize:"14px", marginBottom: "16px", color: "#666"}}>
              Provide the exact date and time you will handover the item to the buyer.
            </p>
            
            <label style={{display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "bold"}}>Date</label>
            <input 
              type="date"
              value={handoverDate}
              onChange={(e) => setHandoverDate(e.target.value)}
              style={{width: "100%", padding: "8px", marginBottom: "12px", border: "1px solid #ccc", borderRadius: "4px"}}
            />

            <label style={{display: "block", marginBottom: "4px", fontSize: "14px", fontWeight: "bold"}}>Time</label>
            <input 
              type="time"
              value={handoverTime}
              onChange={(e) => setHandoverTime(e.target.value)}
              style={{width: "100%", padding: "8px", marginBottom: "20px", border: "1px solid #ccc", borderRadius: "4px"}}
            />

            <div className="delete-actions">
              <button className="cancel-delete" onClick={() => setSchedulingItem(null)}>Cancel</button>
              <button className="confirm-update" onClick={submitSchedule}>Save Schedule</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyItems;