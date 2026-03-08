import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api, { BASE_URL } from "../api";

function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchOrderDetails = useCallback(async () => {
    try {
      setLoading(true);
      // Fetch all orders for this user and find it
      const response = await api.get("orders/my-orders");
      const foundOrder = response.data.find((o) => o._id === id);

      if (foundOrder) {
        setOrder({
          id: foundOrder._id,
          itemId: foundOrder.itemId ? foundOrder.itemId._id : null,
          title: foundOrder.itemId ? foundOrder.itemId.title : "Unknown Item",
          image: foundOrder.itemId && foundOrder.itemId.image
            ? `${BASE_URL}/uploads/${foundOrder.itemId.image}`
            : null,
          price: foundOrder.price,
          seller: foundOrder.sellerId ? (foundOrder.sellerId.name || foundOrder.sellerId.email) : "Seller",
          sellerPic: foundOrder.sellerId?.profilePic,
          status: foundOrder.status,
          buyerConfirmed: foundOrder.buyerConfirmed,
          sellerConfirmed: foundOrder.sellerConfirmed,
          date: new Date(foundOrder.createdAt).toLocaleDateString(),
        });
      }
    } catch (error) {
      console.error("Failed to fetch order details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchOrderDetails();
  }, [id]);

  const markAsReceived = async () => {
    if (!window.confirm("Are you sure you want to mark this item as received?"))
      return;

    try {
      await api.put(`orders/${order.id}/confirm-receipt`);
      fetchOrderDetails();
    } catch (error) {
      console.error("Failed to confirm receipt:", error);
      alert("Failed to confirm receipt.");
    }
  };

  if (loading) {
    return <p className="p-6">Loading order details...</p>;
  }

  if (!order) {
    return <p className="p-6">Order not found.</p>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-8">Order Details</h1>

      <div className="grid md:grid-cols-2 gap-10 bg-white p-8 rounded-xl shadow-card">
        {/* LEFT SIDE - IMAGE */}
        <div className="flex justify-center">
          {order.image && (
            <img
              src={order.image}
              alt={order.title}
              className="w-72 h-72 object-cover rounded-lg border"
            />
          )}
        </div>

        {/* RIGHT SIDE - ORDER INFO */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-secondary">{order.title}</h2>

          <p className="text-gray-500">Order ID: {order.id}</p>

          <div className="border-t pt-4 space-y-2">
            <p>
              <span className="font-medium">Price:</span> ₹ {order.price}
            </p>

            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg my-4 border border-gray-100">
              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 border-2 border-white shadow-sm flex-shrink-0">
                {order.sellerPic ? (
                  <img
                    src={`${BASE_URL}/uploads/${order.sellerPic}`}
                    alt={order.seller}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-lg font-bold text-gray-500 uppercase">
                    {order.seller.charAt(0)}
                  </div>
                )}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">Seller Information</p>
                <p className="text-secondary font-semibold">
                  {order.seller}
                </p>
              </div>
            </div>

            <p>
              <span className="font-medium">Order Date:</span> {order.date}
            </p>

            {order.status === "Pending Seller Confirmation" ? (
              <p className="text-yellow-600 font-medium">
                Status: Pending Seller Confirmation
              </p>
            ) : order.status === "Pending Buyer Confirmation" ? (
              <p className="text-yellow-600 font-medium">
                Status: Waiting for you to mark as received
              </p>
            ) : order.status === "Delivered" ? (
              <p className="text-green-500 font-medium">Status: Delivered</p>
            ) : (
              <p className="text-yellow-600 font-medium">
                Status: {order.status}
              </p>
            )}
          </div>

          {/* ACTION BUTTONS */}
          <div className="flex gap-4 pt-6">
            {order.status !== "Cancelled" &&
              order.status !== "Delivered" &&
              !order.buyerConfirmed && (
                <button
                  onClick={markAsReceived}
                  className="bg-green-500 text-white px-5 py-2 rounded-lg hover:bg-green-600"
                >
                  Mark as Received
                </button>
              )}

            <button
              onClick={() => navigate("/my-orders")}
              className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100"
            >
              Back to Orders
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;