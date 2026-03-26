import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../api";
import { getImageUrl } from "../utils/urlHelper";
import { 
  Package, MapPin, Calendar, Clock, MessageCircle, 
  CheckCircle, XCircle, Star, ChevronRight, ShoppingBag
} from "lucide-react";

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
          image = getImageUrl(order.items[0].itemImage);
        } else if (order.itemId && order.itemId.image) {
          image = getImageUrl(order.itemId.image);
        } else if (order.itemImage) {
          image = getImageUrl(order.itemImage);
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
    return (
      <div className="bg-gray-50 min-h-screen py-16 flex justify-center items-start">
        <div className="flex flex-col items-center gap-4 text-gray-400">
          <Package className="w-12 h-12 animate-pulse" />
          <p className="font-medium">Loading your orders...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* HEADER SECTION */}
        <div className="mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-3 bg-blue-100/50 text-blue-600 rounded-xl shadow-sm border border-blue-100">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
                My Orders
              </h1>
            </div>
            <p className="text-gray-500 font-medium ml-14">
              Track, manage, and review your purchases.
            </p>
          </div>
        </div>

        {orders.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center flex flex-col items-center justify-center min-h-[400px]">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
              <Package className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-500 mb-8 max-w-sm">You haven&apos;t purchased anything yet. Start exploring the marketplace to find great deals!</p>
            <Link to="/marketplace" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-colors shadow-sm">
              Browse Marketplace
            </Link>
          </div>
        ) : (
          <div className="grid gap-6">
            {orders.map((order) => {
              // Status Styling
              let statusStyle = "bg-gray-100 text-gray-700";
              let StatusIcon = Package;
              
              if (order.status === "Cancelled") {
                statusStyle = "bg-rose-50 text-rose-700 border-rose-200";
                StatusIcon = XCircle;
              } else if (order.status === "Delivered") {
                statusStyle = "bg-emerald-50 text-emerald-700 border-emerald-200";
                StatusIcon = CheckCircle;
              } else if (order.status === "Pending Seller Confirmation") {
                statusStyle = "bg-amber-50 text-amber-700 border-amber-200";
                StatusIcon = Clock;
              } else if (order.status === "Pending Buyer Confirmation") {
                statusStyle = "bg-blue-50 text-blue-700 border-blue-200";
                StatusIcon = CheckCircle;
              } else if (order.status === "Pending") {
                statusStyle = "bg-indigo-50 text-indigo-700 border-indigo-200";
                StatusIcon = Clock;
              }

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden hover:shadow-md transition-shadow group flex flex-col"
                >
                  {/* Order Header */}
                  <div className="bg-gray-50/80 border-b border-gray-100 px-4 sm:px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm flex-1">
                      <div>
                        <p className="text-gray-500 font-medium mb-0.5 uppercase tracking-wider text-[10px]">Order Placed</p>
                        <p className="font-semibold text-gray-900">{new Date(order.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                      </div>
                      <div className="w-px bg-gray-200 hidden sm:block"></div>
                      <div>
                        <p className="text-gray-500 font-medium mb-0.5 uppercase tracking-wider text-[10px]">Total</p>
                        <p className="font-semibold text-gray-900">₹{order.price?.toLocaleString() || 'N/A'}</p>
                      </div>
                      <div className="w-px bg-gray-200 hidden sm:block"></div>
                      <div>
                        <p className="text-gray-500 font-medium mb-0.5 uppercase tracking-wider text-[10px]">Order ID</p>
                        <p className="font-semibold text-gray-900 uppercase">#{order.id.slice(-8)}</p>
                      </div>
                    </div>
                    
                    <div className="flex-shrink-0">
                      <Link
                        to={`/order-details/${order.id}`}
                        className="text-sm font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 group/link"
                      >
                       Order Details <ChevronRight className="w-4 h-4 transition-transform group-hover/link:translate-x-1" />
                      </Link>
                    </div>
                  </div>

                  {/* Main Order Content */}
                  <div className="p-4 sm:p-6 flex flex-col md:flex-row gap-5 sm:gap-6 flex-1">
                    {/* Image */}
                    <div className="flex-shrink-0">
                      {order.image ? (
                        <div className="relative w-full h-48 md:w-32 md:h-32 rounded-xl overflow-hidden border border-gray-100 shadow-[0_2px_8px_-4px_rgba(0,0,0,0.1)]">
                          <img
                            src={order.image}
                            alt={order.title}
                            className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                          />
                        </div>
                      ) : (
                        <div className="w-full h-48 md:w-32 md:h-32 rounded-xl border border-gray-100 bg-gray-50 flex flex-col items-center justify-center text-gray-400">
                          <Package className="w-8 h-8 mb-2 opacity-30" />
                          <span className="text-xs font-medium uppercase tracking-wider">No Image</span>
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 flex flex-col">
                      <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-3">
                        <h3 className="font-bold text-lg sm:text-xl text-gray-900 line-clamp-2 leading-tight">
                          {order.title}
                        </h3>
                        {/* Status Badge */}
                        <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-1.5 whitespace-nowrap shadow-sm ${statusStyle}`}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          <span>
                            {order.status === "Pending Seller Confirmation" ? "Pending Seller" : 
                             order.status === "Pending Buyer Confirmation" ? "Confirm Receipt" : 
                             order.status === "Pending" ? "Processing" : order.status}
                          </span>
                        </div>
                      </div>
                      
                      {/* Seller Info */}
                      <div className="flex items-center gap-2.5 mb-5">
                        <div className="w-7 h-7 rounded-full overflow-hidden bg-white border-2 border-white shadow-[0_0_0_1px_rgba(0,0,0,0.1)] flex-shrink-0">
                          {order.sellerPic ? (
                            <img src={getImageUrl(order.sellerPic)} alt={order.seller} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-600 bg-gray-100 uppercase">
                              {order.seller.charAt(0)}
                            </div>
                          )}
                        </div>
                        <p className="text-sm font-medium text-gray-500">Sold by <span className="text-gray-900 font-bold">{order.seller}</span></p>
                      </div>

                      {/* Handover Details */}
                      {order.status !== "Delivered" && order.status !== "Cancelled" && (order.handoverLocation || order.handoverDate) && (
                        <div className="mt-auto bg-gradient-to-br from-blue-50 to-indigo-50/30 rounded-xl p-3.5 border border-blue-100/60 flex flex-col sm:flex-row gap-4 sm:gap-6 shadow-[inset_0_1px_4px_-1px_rgba(255,255,255,0.7)]">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="p-1.5 bg-blue-100 rounded-lg shrink-0 mt-0.5">
                              <MapPin className="w-4 h-4 text-blue-600" />
                            </div>
                            <div>
                              <p className="text-[10px] text-blue-600/80 font-bold uppercase tracking-wider mb-0.5">Location</p>
                              <p className="text-sm font-semibold text-gray-900">
                                {order.handoverLocation === 'Custom Location' ? order.customLocation : order.handoverLocation || 'TBD'}
                              </p>
                            </div>
                          </div>
                          
                          <div className="w-px bg-blue-200/50 hidden sm:block"></div>
                          
                          <div className="flex items-start gap-3 flex-1">
                            {order.handoverDate ? (
                              <>
                                <div className="p-1.5 bg-blue-100 rounded-lg shrink-0 mt-0.5">
                                  <Calendar className="w-4 h-4 text-blue-600" />
                                </div>
                                <div>
                                  <p className="text-[10px] text-blue-600/80 font-bold uppercase tracking-wider mb-0.5">Schedule</p>
                                  <p className="text-sm font-semibold text-gray-900">
                                    {new Date(order.handoverDate).toLocaleDateString()} at {order.handoverTime}
                                  </p>
                                </div>
                              </>
                            ) : (
                              <>
                                <div className="p-1.5 bg-gray-100 rounded-lg shrink-0 mt-0.5">
                                  <Clock className="w-4 h-4 text-gray-500" />
                                </div>
                                <div className="flex items-center h-full">
                                  <p className="text-sm font-semibold text-gray-600">Awaiting Schedule</p>
                                </div>
                              </>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions Row */}
                  <div className="bg-white border-t border-gray-100 p-4 sm:px-6 flex flex-wrap-reverse items-center justify-end gap-3 mt-auto">
                    {order.sellerId && (
                      <button
                        onClick={() => contactSeller(order.sellerId)}
                        className="w-full sm:w-auto px-4 py-2.5 rounded-xl text-sm font-bold text-gray-700 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all flex items-center justify-center gap-2 sm:mr-auto"
                      >
                        <MessageCircle className="w-4 h-4" /> Message Seller
                      </button>
                    )}

                    {order.status !== "Cancelled" &&
                      order.status !== "Delivered" &&
                      !order.buyerConfirmed && (
                        <button
                          onClick={() => markAsReceived(order.id)}
                          className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 shadow-[0_4px_12px_-4px_rgba(16,185,129,0.5)] hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4.5 h-4.5" /> Mark as Received
                        </button>
                      )}

                    {order.status === "Pending" && (Date.now() - order.time < 1 * 60 * 60 * 1000) && (
                      <button
                        onClick={() => cancelOrder(order.id)}
                        className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors flex items-center justify-center"
                      >
                        Cancel Order
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
                         className="w-full sm:w-auto px-6 py-2.5 rounded-xl text-sm font-bold text-yellow-800 bg-yellow-100 hover:bg-yellow-200 transition-colors flex items-center justify-center gap-2"
                       >
                         <Star className="w-4.5 h-4.5 fill-current" /> Leave a Review
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
          <div className="fixed inset-0 z-50 flex justify-center items-center p-4">
            <div className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity" onClick={() => setReviewModalOpen(false)}></div>
            <div className="bg-white rounded-[2rem] shadow-2xl w-full max-w-md overflow-hidden transform transition-all relative z-10 scale-100 animate-in fade-in zoom-in duration-300">
              <div className="absolute top-4 right-4">
                <button 
                  onClick={() => setReviewModalOpen(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors focus:outline-none"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
              
              <div className="px-8 pt-10 pb-6 text-center border-b border-gray-100 bg-gray-50/50">
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-100 to-yellow-50 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm border border-yellow-100/50">
                  <Star className="w-8 h-8 text-yellow-500 fill-current drop-shadow-sm" />
                </div>
                <h3 className="font-extrabold text-2xl text-gray-900 mb-2">Rate your purchase</h3>
                <p className="text-gray-500 text-sm font-medium">How was your experience buying from {reviewOrder.seller}?</p>
              </div>
              
              <div className="p-8 space-y-6">
                <div className="flex justify-center gap-1.5 mb-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className={`transition-all transform hover:scale-110 p-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 rounded-full`}
                    >
                      <Star className={`w-10 h-10 ${rating >= star ? 'text-yellow-400 fill-current drop-shadow-md' : 'text-gray-200 stroke-[1.5px]'}`} />
                    </button>
                  ))}
                </div>
                <p className="text-center text-sm font-bold text-gray-700 -mt-2 mb-6">
                  {rating === 5 ? "Excellent!" : rating === 4 ? "Very Good" : rating === 3 ? "Average" : rating === 2 ? "Poor" : "Terrible"}
                </p>

                <div>
                  <textarea
                    className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:bg-white focus:ring-[3px] focus:ring-blue-500/20 focus:border-blue-500/50 outline-none resize-none transition-all placeholder-gray-400 font-medium text-gray-700 shadow-sm"
                    rows="3"
                    placeholder="Tell others what you think..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                  ></textarea>
                </div>
              </div>

              <div className="px-8 pb-8 pt-2 flex gap-3">
                <button
                  onClick={() => setReviewModalOpen(false)}
                  className="flex-1 py-3.5 font-bold text-gray-600 bg-white border-2 border-gray-200 rounded-2xl hover:bg-gray-50 hover:border-gray-300 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={submitReview}
                  className="flex-1 py-3.5 font-bold text-white bg-blue-600 rounded-2xl shadow-md hover:shadow-lg hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:-translate-y-0.5 active:translate-y-0 disabled:transform-none"
                  disabled={!comment.trim() || !rating}
                >
                  Submit
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default MyOrders;