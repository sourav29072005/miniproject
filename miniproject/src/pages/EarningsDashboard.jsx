import { useEffect, useState } from "react";
import api, { BASE_URL } from "../api";
import { getImageUrl } from "../utils/urlHelper";

import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

function EarningsDashboard() {
  const [earningsData, setEarningsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        setLoading(true);
        const res = await api.get("auth/my-earnings");
        setEarningsData(res.data);
      } catch (err) {
        console.error("Failed to load earnings:", err);
      } finally {
        setLoading(false);
      }
    };
    if (user) {
      fetchEarnings();
    }
  }, [user]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading your earnings...</div>;
  }

  if (!earningsData) {
    return <div className="p-8 text-center text-red-500">Failed to load earnings data.</div>;
  }

  return (
    <div className="max-w-5xl mx-auto p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">Seller Dashboard</h1>
          <p className="text-slate-500 font-medium">Track your earnings, level progression, and successful handovers.</p>
        </div>
        <button 
          onClick={() => navigate(`/seller/${user.id}`)}
          className="px-5 py-2.5 bg-white border-2 border-slate-200 text-slate-700 font-bold rounded-xl shadow-sm hover:bg-slate-50 hover:shadow-md transition-all w-full sm:w-auto"
        >
          View Public Profile
        </button>
      </div>

      {/* METRICS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:-translate-y-1 hover:shadow-md transition-all">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Total Earnings</p>
          <h2 className="text-4xl font-extrabold text-green-600">₹{earningsData.totalEarnings}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:-translate-y-1 hover:shadow-md transition-all">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Completed Sales</p>
          <h2 className="text-4xl font-extrabold text-blue-600">{earningsData.completedSales}</h2>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:-translate-y-1 hover:shadow-md transition-all">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Current Level</p>
          <span className="px-5 py-2 bg-gradient-to-r from-indigo-500 to-indigo-600 text-white font-extrabold rounded-xl text-lg shadow-sm">
            {earningsData.sellerLevel}
          </span>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-center items-center text-center hover:-translate-y-1 hover:shadow-md transition-all">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-2">Average Rating</p>
          <h2 className="text-4xl font-extrabold text-yellow-500 flex items-center gap-2">
            ★ {earningsData.averageRating}
          </h2>
          <p className="text-xs text-gray-400 mt-2 font-medium">({earningsData.totalReviews} Reviews)</p>
        </div>
      </div>

      {/* LEVEL PROGRESSION INFO */}
      <div className="bg-blue-50/50 border border-blue-100 p-6 rounded-2xl mb-10">
        <h3 className="font-bold text-lg text-blue-900 mb-2">Progression Tiers</h3>
        <p className="text-sm text-blue-800 mb-4">Sell more items and receive good ratings to unlock higher seller badges!</p>
        <div className="flex flex-wrap gap-4 text-xs font-medium">
          <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-200">
            <strong>New Seller:</strong> Base level
          </div>
          <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-200">
            <strong>Intermediate:</strong> 2+ Sales, ★ 4.0+
          </div>
          <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-200">
            <strong>Advanced:</strong> 5+ Sales, ★ 4.2+
          </div>
          <div className="bg-white px-4 py-2 rounded shadow-sm border border-gray-200">
            <strong>Top Rated Seller:</strong> 10+ Sales, ★ 4.5+
          </div>
        </div>
      </div>

      {/* SALES HISTORY */}
      <h2 className="text-xl font-bold mb-4">Successful Handovers</h2>
      {earningsData.history && earningsData.history.length > 0 ? (
        <div className="space-y-4">
          {earningsData.history.map((order) => (
            <div key={order._id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex items-center justify-between transition hover:shadow-md cursor-pointer" onClick={() => navigate(`/order-details/${order._id}`)}>
              <div className="flex items-center gap-4">
                {order.itemId?.image ? (
                  <img src={getImageUrl(order.itemId.image)} alt={order.itemTitle} className="w-16 h-16 object-cover rounded-lg" />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded-lg flex items-center justify-center text-2xl">🖼</div>
                )}
                <div>
                  <h3 className="font-bold text-gray-900">{order.itemTitle}</h3>
                  <p className="text-sm text-gray-500">Delivered to: {order.buyerId?.name || "Buyer"}</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-lg font-bold text-green-600">+ ₹{order.price}</p>
                <p className="text-xs text-gray-400">{new Date(order.updatedAt).toLocaleDateString()}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white p-8 rounded-xl border border-gray-200 text-center text-gray-500">
          <p className="text-lg mb-2">Empty History</p>
          <p className="text-sm">You haven't completed any sales yet. Start selling to see your earnings grow!</p>
        </div>
      )}
    </div>
  );
}

export default EarningsDashboard;
