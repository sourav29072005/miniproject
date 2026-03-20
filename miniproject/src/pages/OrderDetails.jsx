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
      // Fetch both buyer and seller orders to find the match
      const [ordersRes, salesRes] = await Promise.all([
        api.get("orders/my-orders").catch(() => ({ data: [] })),
        api.get("orders/my-sales").catch(() => ({ data: [] }))
      ]);
      const myOrders = ordersRes.data || [];
      const mySales = salesRes.data || [];
      
      let foundOrder = myOrders.find((o) => o._id === id);
      let isSellerView = false;
      
      if (!foundOrder) {
        foundOrder = mySales.find((o) => o._id === id);
        if (foundOrder) isSellerView = true;
      }

      if (foundOrder) {
        
        const hasItems = foundOrder.items && foundOrder.items.length > 0;
        const title = hasItems 
          ? (foundOrder.items.length === 1 ? foundOrder.items[0].itemTitle : `${foundOrder.items.length} Items Ordered Together`)
          : (foundOrder.itemId ? foundOrder.itemId.title : (foundOrder.itemTitle || "Unknown Item (Deleted)"));
        
        let image = null;
        if (hasItems && foundOrder.items[0].itemImage) {
          image = `${BASE_URL}/uploads/${foundOrder.items[0].itemImage}`;
        } else if (foundOrder.itemId && foundOrder.itemId.image) {
          image = `${BASE_URL}/uploads/${foundOrder.itemId.image}`;
        } else if (foundOrder.itemImage) {
          image = `${BASE_URL}/uploads/${foundOrder.itemImage}`;
        }

        setOrder({
          id: foundOrder._id,
          itemId: hasItems ? foundOrder.items[0].itemId : (foundOrder.itemId ? foundOrder.itemId._id : null),
          title: title,
          image: image,
          price: foundOrder.totalPrice || foundOrder.price,
          itemsList: foundOrder.items || [],
          seller: isSellerView 
             ? (foundOrder.buyerId ? (foundOrder.buyerId.name || foundOrder.buyerId.email) : "Buyer")
             : (foundOrder.sellerId ? (foundOrder.sellerId.name || foundOrder.sellerId.email) : "Seller"),
          sellerPic: isSellerView
             ? foundOrder.buyerId?.profilePic
             : foundOrder.sellerId?.profilePic,
          isSellerView: isSellerView,
          status: foundOrder.status,
          buyerConfirmed: foundOrder.buyerConfirmed,
          sellerConfirmed: foundOrder.sellerConfirmed,
          date: new Date(foundOrder.createdAt).toLocaleDateString(),
          createdAt: foundOrder.createdAt,
          updatedAt: foundOrder.updatedAt,
          handoverDate: foundOrder.handoverDate,
          handoverTime: foundOrder.handoverTime,
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
  }, [id, fetchOrderDetails]);

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

          <p className="text-gray-500">Order #{order.id.slice(-6).toUpperCase()}</p>

          <div className="border-t pt-4 space-y-2">
            {order.itemsList && order.itemsList.length > 1 && (
               <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                 <p className="text-sm font-semibold text-gray-500 mb-2">Items in this order:</p>
                 <ul className="list-disc pl-5 text-sm space-y-1">
                   {order.itemsList.map((i, idx) => (
                      <li key={idx} className="text-secondary">{i.itemTitle} (₹ {i.price})</li>
                   ))}
                 </ul>
               </div>
            )}
            <p>
              <span className="font-medium">Total Price:</span> ₹ {order.price}
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
                <p className="text-sm text-gray-500 font-medium">{order.isSellerView ? "Buyer Information" : "Seller Information"}</p>
                <p className="text-secondary font-semibold">
                  {order.seller}
                </p>
              </div>
            </div>

            <p>
              <span className="font-medium">Order Date:</span> {new Date(order.createdAt).toLocaleDateString()}
            </p>

            <p>
              <span className="font-medium">Handover Time:</span> {order.handoverDate ? `${new Date(order.handoverDate).toLocaleDateString()} at ${order.handoverTime}` : <>&nbsp;</>}
            </p>
            
            {order.status === "Delivered" && (
              <p>
                <span className="font-medium">Delivered Date:</span> {new Date(order.updatedAt).toLocaleDateString()}
              </p>
            )}

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
            {!order.isSellerView && order.status !== "Cancelled" &&
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
              onClick={() => navigate(order.isSellerView ? "/my-items" : "/my-orders")}
              className="border border-gray-300 px-5 py-2 rounded-lg hover:bg-gray-100"
            >
              {order.isSellerView ? "Back to Listings" : "Back to Orders"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderDetails;