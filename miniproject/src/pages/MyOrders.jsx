import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Review Modal State
  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewOrder, setReviewOrder] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");

  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("orders/my-orders");
      const data = response.data;

      // Map backend structure to frontend structure needed for rendering
      const formattedOrders = data.map((order) => {
        const hasItems = order.items && order.items.length > 0;
        
        const title = hasItems 
          ? (order.items.length === 1 ? order.items[0].itemTitle : `${order.items.length} Items Order`)
          : (order.itemId ? order.itemId.title : (order.itemTitle || "Unknown Item (Deleted)"));
        
        let image = null;
        if (hasItems && order.items[0].itemImage) {
          image = `${BASE_URL}/uploads/${order.items[0].itemImage}`;
        } else if (order.itemId && order.itemId.image) {
          image = `${BASE_URL}/uploads/${order.itemId.image}`;
        } else if (order.itemImage) {
          image = `${BASE_URL}/uploads/${order.itemImage}`;
        }

        return {
          id: order._id,
          itemId: hasItems ? order.items[0].itemId : (order.itemId ? order.itemId._id : null),
          title: title,
          image: image,
          price: order.totalPrice || order.price,
        seller: order.sellerId ? (order.sellerId.name || order.sellerId.email) : "Unknown",
        sellerId: order.sellerId ? (order.sellerId._id || order.sellerId) : null,
        sellerPic: order.sellerId?.profilePic,
        status: order.status,
        buyerConfirmed: order.buyerConfirmed,
        sellerConfirmed: order.sellerConfirmed,
        hasReviewed: order.hasReviewed || false,
        time: new Date(order.createdAt).getTime(),
        createdAt: order.createdAt,
        updatedAt: order.updatedAt,
        handoverLocation: order.handoverLocation,
        customLocation: order.customLocation,
        handoverDate: order.handoverDate,
        handoverTime: order.handoverTime,
      };
      });
      setOrders(formattedOrders);
    } catch (error) {
      console.error("Failed to fetch orders from API:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const markAsReceived = async (orderId) => {
    if (!window.confirm("Are you sure you want to mark this item as received?"))
      return;

    try {
      await api.put(`orders/${orderId}/confirm-receipt`);
      fetchOrders(); // Refresh from backend
    } catch (error) {
      console.error("Failed to confirm receipt:", error);
      alert("Failed to confirm receipt. Please try again.");
    }
  };

  const cancelOrder = async (orderId) => {
    if (!window.confirm("Are you sure you want to cancel this order? Item will be back to marketplace."))
      return;

    try {
      await api.put(`orders/${orderId}/cancel`);
      fetchOrders();
    } catch (error) {
      console.error("Failed to cancel order:", error);
      alert(error.response?.data?.error || "Failed to cancel order.");
    }
  };

  const contactSeller = async (sellerId) => {
    if (!sellerId) return alert("Seller information missing.");
    try {
      const res = await api.post("chat/start", { recipientId: sellerId });
      navigate(`/chat?convo=${res.data._id}`);
    } catch(err) {
      console.error("Failed to start chat", err);
      alert("Failed to connect to seller.");
    }
  };

  const submitReview = async () => {
    if (!comment.trim()) return alert("Please provide a comment for your review.");
    try {
      await api.post("reviews", {
        orderId: reviewOrder.id,
        rating,
        comment
      });
      alert("Review submitted successfully! Thank you.");
      setReviewModalOpen(false);
      setComment("");
      setRating(5);
    } catch (err) {
      alert(err.response?.data?.error || "Failed to submit review.");
    }
  };

  if (loading) {
    return <div className="p-6">Loading orders...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-6 lg:py-10">
      <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">My Orders</h1>
      <p className="text-slate-500 mb-8 font-medium">Track and manage your past purchases.</p>

      {orders.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => {
            return (
              <div
                key={order.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden transition hover:shadow-md"
              >
                {/* TOP: INFO */}
                <div className="p-5 flex flex-col sm:flex-row gap-5">
                  {/* Image */}
                  <div className="flex-shrink-0">
                    {order.image ? (
                      <img
                        src={order.image}
                        alt={order.title}
                        className="w-24 h-24 object-cover rounded-lg border border-gray-100"
                      />
                    ) : (
                      <div className="w-24 h-24 rounded-lg border border-gray-100 bg-gray-50 flex flex-col items-center justify-center text-gray-400 text-xs font-medium">
                        <span className="text-2xl mb-1">🖼</span>
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-1">
                      <h3 className="font-bold text-lg text-gray-900 leading-tight">
                        {order.title}
                      </h3>
                      
                      {/* Status Badges */}
                      {order.status === "Cancelled" && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-100 text-red-700">Cancelled</span>
                      )}
                      {order.status === "Delivered" && (
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Delivered</span>
                      )}
                      {order.status === "Pending Seller Confirmation" && (
                         <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-800">Pending Seller</span>
                      )}
                      {order.status === "Pending Buyer Confirmation" && (
                         <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-800">Confirm Receipt</span>
                      )}
                      {order.status === "Pending" && (
                         <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-100 text-purple-700">Processing</span>
                      )}
                    </div>

                    <p className="text-sm text-gray-500 mb-3 tracking-wide">Order #{order.id.slice(-6).toUpperCase()}</p>
                    
                    <div className="flex items-center gap-2 mb-3">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-200 border border-gray-300">
                        {order.sellerPic ? (
                          <img src={`${BASE_URL}/uploads/${order.sellerPic}`} alt={order.seller} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-500 uppercase">
                            {order.seller.charAt(0)}
                          </div>
                        )}
                      </div>
                      <p className="text-sm font-medium text-gray-700">Sold by {order.seller}</p>
                    </div>

                    {/* Handover Info */}
                    {order.status !== "Delivered" && (order.handoverLocation || order.handoverDate) && (
                      <div className="text-sm bg-blue-50/50 text-blue-900 p-3 rounded-lg border border-blue-100 inline-block w-full sm:w-auto">
                        <div className="flex items-start gap-2">
                          <span className="text-blue-500 mt-0.5">🤝</span>
                          <div>
                            <p className="mb-0.5"><strong>Location:</strong> {order.handoverLocation === 'Custom Location' ? order.customLocation : order.handoverLocation || 'TBD'}</p>
                            {order.handoverDate ? (
                              <p className="mb-0"><strong>Schedule:</strong> {new Date(order.handoverDate).toLocaleDateString()} at {order.handoverTime}</p>
                            ) : (
                              <p className="mb-0 text-blue-500 text-xs font-semibold uppercase tracking-wide">Awaiting Schedule from Seller</p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* BOTTOM: ACTIONS */}
                <div className="bg-gray-50/80 p-4 border-t border-gray-100 flex flex-wrap items-center justify-end gap-3">
                  {order.sellerId && (
                    <button
                      onClick={() => contactSeller(order.sellerId)}
                      className="px-4 py-2 rounded-lg text-sm font-bold text-blue-600 bg-blue-100 hover:bg-blue-200 transition-colors flex items-center gap-2"
                    >
                      <span>💬</span> Message Seller
                    </button>
                  )}

                  <Link
                    to={`/order-details/${order.id}`}
                    className="px-4 py-2 rounded-lg text-sm font-bold text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 transition-colors"
                  >
                    View Details
                  </Link>

                  {order.status !== "Cancelled" &&
                    order.status !== "Delivered" &&
                    !order.buyerConfirmed && (
                      <button
                        onClick={() => markAsReceived(order.id)}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-md hover:shadow-lg transition-all"
                      >
                        ✓ Mark Received
                      </button>
                    )}

                  {order.status === "Pending" && (Date.now() - order.time < 1 * 60 * 60 * 1000) && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="px-5 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-all hover:shadow-sm"
                    >
                      ✕ Cancel
                    </button>
                  )}
                  
                  {order.status === "Delivered" && !order.hasReviewed && (
                     <button
                       onClick={() => {
                         setReviewOrder(order);
                         setRating(5);
                         setComment("");
                         setReviewModalOpen(true);
                       }}
                       className="px-4 py-2 rounded-lg text-sm font-bold text-yellow-700 bg-yellow-100 border border-yellow-300 hover:bg-yellow-200 transition-colors"
                     >
                       ⭐ Leave Review
                     </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* REVIEW MODAL */}
      {reviewModalOpen && reviewOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
              <h3 className="font-bold text-lg text-gray-800">Review Seller</h3>
              <button 
                onClick={() => setReviewModalOpen(false)}
                className="text-gray-400 hover:text-red-500 font-bold text-xl"
              >✕</button>
            </div>
            
            <div className="p-5 space-y-4">
              <div className="flex items-center gap-3 bg-blue-50/50 p-3 rounded-lg border border-blue-100">
                <img 
                  src={reviewOrder.image} 
                  alt={reviewOrder.title} 
                  className="w-12 h-12 object-cover rounded shadow-sm"
                  onError={(e) => { e.target.style.display = 'none'; }}
                />
                <div>
                  <p className="font-semibold text-gray-800 text-sm leading-tight">{reviewOrder.title}</p>
                  <p className="text-xs text-gray-500 mt-1">Sold by {reviewOrder.seller}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`text-3xl transition-transform hover:scale-110 ${rating >= star ? 'text-yellow-400 drop-shadow-sm' : 'text-gray-200'}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Comment</label>
                <textarea
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none resize-none"
                  rows="3"
                  placeholder="How was your experience buying from this seller?"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                ></textarea>
              </div>
            </div>

            <div className="p-5 border-t border-gray-100 bg-gray-50 flex gap-3 justify-end">
              <button
                onClick={() => setReviewModalOpen(false)}
                className="px-4 py-2 font-semibold text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition"
              >
                Cancel
              </button>
              <button
                onClick={submitReview}
                className="px-4 py-2 font-bold text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 transition"
                disabled={!comment.trim() || !rating}
              >
                Submit Review
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default MyOrders;