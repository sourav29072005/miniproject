import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api, { BASE_URL } from "../api";

function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await api.get("orders/my-orders");
      const data = response.data;

      // Map backend structure to frontend structure needed for rendering
      const formattedOrders = data.map((order) => ({
        id: order._id,
        itemId: order.itemId ? order.itemId._id : null,
        title: order.itemId ? order.itemId.title : null,
        image: order.itemId && order.itemId.image
          ? `${BASE_URL}/uploads/${order.itemId.image}`
          : null,
        price: order.price,
        seller: order.sellerId ? (order.sellerId.name || order.sellerId.email) : "Unknown",
        sellerPic: order.sellerId?.profilePic,
        status: order.status,
        buyerConfirmed: order.buyerConfirmed,
        sellerConfirmed: order.sellerConfirmed,
        time: new Date(order.createdAt).getTime(),
      }));
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
                className="bg-white p-4 rounded-lg shadow-card flex justify-between items-center"
              >
                {/* LEFT SIDE */}
                <div className="flex items-center gap-4">
                  {order.image ? (
                    <img
                      src={order.image}
                      alt={order.title}
                      className="w-16 h-16 object-cover rounded-lg border"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg border bg-gray-100 flex items-center justify-center text-gray-300 text-xs text-center leading-tight font-medium">
                      No<br />Image
                    </div>
                  )}

                  <div>
                    <h3 className="font-semibold text-secondary flex items-center gap-2">
                      {order.title || (
                        <span className="text-red-400 italic font-normal text-sm flex items-center gap-1">
                          ⚠ Item no longer available
                        </span>
                      )}
                    </h3>

                    <p className="text-sm text-gray-500">Order ID: {order.id}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-6 h-6 rounded-full overflow-hidden bg-gray-100 border">
                        {order.sellerPic ? (
                          <img src={`${BASE_URL}/uploads/${order.sellerPic}`} alt={order.seller} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] font-bold text-gray-400 uppercase">
                            {order.seller.charAt(0)}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">Seller: {order.seller}</p>
                    </div>

                    {order.status === "Cancelled" && (
                      <p className="text-red-500 text-sm font-medium">
                        Cancelled
                      </p>
                    )}

                    {order.status === "Pending Seller Confirmation" && (
                      <p className="text-yellow-600 text-sm font-medium">
                        Pending Seller Confirmation
                      </p>
                    )}

                    {order.status === "Pending Buyer Confirmation" && (
                      <p className="text-yellow-600 text-sm font-medium">
                        Waiting for you to mark as received
                      </p>
                    )}

                    {order.status === "Delivered" && (
                      <p className="text-green-500 text-sm font-medium">
                        Delivered
                      </p>
                    )}

                    {order.status === "Pending" && (
                      <p className="text-blue-500 text-sm font-medium">
                        Pending Delivery
                      </p>
                    )}
                  </div>
                </div>

                {/* RIGHT SIDE BUTTONS */}
                <div className="flex gap-3">
                  <Link
                    to={`/order-details/${order.id}`}
                    className="border border-primary text-primary px-3 py-2 rounded-lg hover:bg-primary hover:text-white transition"
                  >
                    View Details
                  </Link>

                  {order.status !== "Cancelled" &&
                    order.status !== "Delivered" &&
                    !order.buyerConfirmed && (
                      <button
                        onClick={() => markAsReceived(order.id)}
                        className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                      >
                        Mark as Received
                      </button>
                    )}

                  {order.status === "Pending" && (Date.now() - order.time < 1 * 60 * 60 * 1000) && (
                    <button
                      onClick={() => cancelOrder(order.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                      Cancel Order
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