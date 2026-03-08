import { Bell, Check, ExternalLink } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import ProfileDrawer from "./ProfileDrawer";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { getNotifications, markNotificationAsRead, BASE_URL } from "../../api";

const routeTitles = {
  "/": "Home",
  "/marketplace": "Marketplace",
  "/add-item": "Sell Item",
  "/hostels": "Hostels & PGs",
  "/my-items": "My Items",
  "/notifications": "Notifications",
};

const TopHeader = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const title = routeTitles[location.pathname] || "Dashboard";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const notificationRef = useRef(null);

  const fetchNotifications = async () => {
    try {
      const response = await getNotifications();
      setNotifications(response.data);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    }
  };

  useEffect(() => {
    fetchNotifications();

    const interval = setInterval(fetchNotifications, 60000); // Poll every minute

    // Close dropdown on click outside
    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const initials = user?.name
    ? user.name.substring(0, 2).toUpperCase()
    : user?.email
      ? user.email.substring(0, 2).toUpperCase()
      : "US";

  const handleMarkAsRead = async (e, id) => {
    if (e && e.stopPropagation) e.stopPropagation();
    try {
      await markNotificationAsRead(id);
      setNotifications(notifications.map((n) => (n._id === id ? { ...n, isRead: true } : n)));
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleNotificationClick = (notification) => {
    if (!notification.isRead) {
      handleMarkAsRead(null, notification._id);
    }
    setShowNotifications(false);
    navigate("/my-items");
  };

  return (
    <>
      <div className="flex items-center justify-between mb-8 bg-header text-white px-6 py-4 rounded-xl2 shadow-card relative">
        <h1 className="text-2xl font-semibold">{title}</h1>

        <div className="flex items-center gap-6">
          {/* Notification */}
          <div className="relative" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-full hover:bg-white/10 transition"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-header">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 text-secondary animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-4 py-2 border-b border-gray-50 flex justify-between items-center">
                  <span className="font-bold text-sm">Recent Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="max-h-[320px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400 text-sm">
                      <Bell className="w-8 h-8 mx-auto mb-2 opacity-20" />
                      <p>No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 5).map((notification) => (
                      <div
                        key={notification._id}
                        className={`px-4 py-3 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${!notification.isRead ? "bg-primary/5" : ""
                          }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex justify-between items-start gap-2">
                          <p className={`text-xs ${!notification.isRead ? "text-secondary font-semibold" : "text-gray-500"}`}>
                            {notification.message}
                          </p>
                          {!notification.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(e, notification._id)}
                              className="p-1 hover:bg-primary/10 rounded-md text-primary transition-colors"
                            >
                              <Check className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        <span className="text-[10px] text-gray-400 mt-1 block">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="block px-4 py-2 text-center text-primary text-xs font-bold hover:bg-gray-50 transition-colors flex items-center justify-center gap-1 border-t border-gray-50"
                >
                  View All Notifications
                  <ExternalLink className="w-3 h-3" />
                </Link>
              </div>
            )}
          </div>

          {/* Profile Icon */}
          <div
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold cursor-pointer border-2 border-white/20 hover:border-white/50 transition-all font-outfit overflow-hidden"
          >
            {user?.profilePic ? (
              <img
                src={`${BASE_URL}/uploads/${user.profilePic}`}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              initials
            )}
          </div>
        </div>
      </div>

      <ProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={logout}
      />
    </>
  );
};

export default TopHeader;
