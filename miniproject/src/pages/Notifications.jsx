import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { getNotifications, markNotificationAsRead, clearNotifications } from "../api";
import { Bell, Check, Clock, Trash2 } from "lucide-react";

function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchNotifications = async () => {
        try {
            const response = await getNotifications();
            setNotifications(response.data);
        } catch (error) {
            console.error("Failed to fetch notifications:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNotifications();
        // Optional: Poll for new notifications every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAsRead = async (e, id) => {
        if (e && e.stopPropagation) e.stopPropagation();
        try {
            await markNotificationAsRead(id);
            setNotifications(
                notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n))
            );
        } catch (error) {
            console.error("Failed to mark as read:", error);
        }
    };

    const handleClearRead = async () => {
        try {
            await clearNotifications();
            setNotifications(notifications.filter((n) => !n.isRead));
        } catch (error) {
            console.error("Failed to clear notifications:", error);
        }
    };

    const handleNotificationClick = (notification) => {
        if (!notification.isRead) {
            handleMarkAsRead(null, notification._id);
        }
        // Redirect only for order-related and approved item notifications
        if (notification.type === "Order Placed" || notification.type === "Order Cancelled" || notification.type === "Item Approved") {
            navigate("/my-items");
        }
        // Item Rejected notifications stay on page to show full message
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        );
    }

    const readCount = notifications.filter(n => n.isRead).length;

    return (
        <div className="max-w-4xl mx-auto p-6">
            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary/10 rounded-xl text-primary">
                        <Bell className="w-6 h-6" />
                    </div>
                    <h1 className="text-3xl font-bold text-secondary">Your Notifications</h1>
                </div>

                {readCount > 0 && (
                    <button
                        onClick={handleClearRead}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-xl transition-all font-medium text-sm group"
                    >
                        <Trash2 className="w-4 h-4 group-hover:shake" />
                        Clear Read
                    </button>
                )}
            </div>

            <div className="space-y-4">
                {notifications.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Bell className="w-8 h-8 text-gray-300" />
                        </div>
                        <p className="text-gray-500 text-lg">No notifications yet</p>
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification._id}
                            onClick={() => handleNotificationClick(notification)}
                            className={`bg-white rounded-2xl shadow-sm border p-6 transition-all ${
                                notification.type === "Item Rejected" 
                                    ? "cursor-default" 
                                    : "cursor-pointer hover:shadow-md"
                            } ${notification.isRead
                                ? "border-gray-100 opacity-75"
                                : "border-primary/20 bg-primary/5"
                                }`}
                        >
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold ${notification.type === "Order Placed"
                                                ? "bg-green-100 text-green-700"
                                                : notification.type === "Item Approved"
                                                ? "bg-blue-100 text-blue-700"
                                                : notification.type === "Item Rejected"
                                                ? "bg-orange-100 text-orange-700"
                                                : "bg-red-100 text-red-700"
                                                }`}
                                        >
                                            {notification.type}
                                        </span>
                                        <div className="flex items-center gap-1 text-gray-400 text-xs">
                                            <Clock className="w-3 h-3" />
                                            {new Date(notification.createdAt).toLocaleString()}
                                        </div>
                                    </div>
                                    <p className={`text-lg transition-all ${notification.isRead ? "text-gray-600" : "text-secondary font-medium"}`}>
                                        {notification.message}
                                    </p>
                                </div>

                                {!notification.isRead && (
                                    <button
                                        onClick={(e) => handleMarkAsRead(e, notification._id)}
                                        className="p-2 hover:bg-white rounded-lg transition-colors text-primary group"
                                        title="Mark as read"
                                    >
                                        <Check className="w-5 h-5 group-hover:scale-110 transition-transform" />
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export default Notifications;
