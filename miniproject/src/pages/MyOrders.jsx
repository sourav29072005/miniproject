import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("orders/my-orders");
      const data = response.data;

      // Map backend structure to frontend structure needed for rendering
      const formattedOrders = data.map((order) => {
        // Fallbacks for deleted items
        const title = order.itemId ? order.itemId.title : (order.itemTitle || "Unknown Item");
        
        let image = null;
        if (order.itemId && order.itemId.image) {
          image = `${BASE_URL}/uploads/${order.itemId.image}`;
        } else if (order.itemImage) {
          image = `${BASE_URL}/uploads/${order.itemImage}`;
        }

        return {
          id: order._id,
          itemId: order.itemId ? order.itemId._id : null,
          title: title,
          image: image,
          price: order.price,
        seller: order.sellerId ? (order.sellerId.name || order.sellerId.email) : "Unknown",
        sellerId: order.sellerId ? (order.sellerId._id || order.sellerId) : null,
        sellerPic: order.sellerId?.profilePic,
        status: order.status,
        buyerConfirmed: order.buyerConfirmed,
        sellerConfirmed: order.sellerConfirmed,
        time: new Date(order.createdAt).getTime(),
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

  if (loading) {
    return <div className="p-6">Loading orders...</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-6">My Orders</h1>

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
                    {(order.handoverLocation || order.handoverDate) && (
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
                        className="px-4 py-2 rounded-lg text-sm font-bold text-white bg-green-600 hover:bg-green-700 transition-colors shadow-sm"
                      >
                        ✓ Mark Received
                      </button>
                    )}

                  {order.status === "Pending" && (Date.now() - order.time < 1 * 60 * 60 * 1000) && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="px-4 py-2 rounded-lg text-sm font-bold text-red-600 bg-red-50 border border-red-200 hover:bg-red-100 transition-colors"
                    >
                      ✕ Cancel
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default MyOrders;