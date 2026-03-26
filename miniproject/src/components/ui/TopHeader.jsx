import { Bell, Check, ExternalLink, Menu, X, Mail, ShoppingCart, MessageCircle } from "lucide-react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import ProfileDrawer from "./ProfileDrawer";
import Messages from "../Messages";
import { useState, useEffect, useRef } from "react";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import api, { getNotifications, markNotificationAsRead, BASE_URL } from "../../api";
import { io } from "socket.io-client";
import { getImageUrl } from "../../utils/urlHelper";

const routeTitles = {
  "/": "Home",
  "/marketplace": "Marketplace",
  "/add-item": "Sell Item",
  "/hostels": "Hostels & PGs",
  "/my-items": "My Items",
  "/notifications": "Notifications",
};

const TopHeader = ({ sidebarOpen = false, setSidebarOpen = () => { } }) => {
  const { user, logout } = useAuth();
  const { cartItems } = useCart();
  const location = useLocation();
  const navigate = useNavigate();
  const title = routeTitles[location.pathname] || "Dashboard";

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showMessages, setShowMessages] = useState(false);
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  const [unreadAdminMsgCount, setUnreadAdminMsgCount] = useState(0);
  const notificationRef = useRef(null);

  const fetchData = async () => {
    try {
      // Fetch both notifications and chat counts in parallel
      const [notifRes, chatRes, adminMsgRes] = await Promise.all([
        getNotifications().catch(e => ({ data: [] })),
        api.get("chat/unread-count").catch(e => ({ data: { unreadCount: 0 } })),
        api.get("messages/unread-count").catch(e => ({ data: { unreadCount: 0 } }))
      ]);
      setNotifications(notifRes.data);
      setUnreadChatCount(chatRes.data.unreadCount || 0);
      setUnreadAdminMsgCount(adminMsgRes.data.unreadCount || 0);
    } catch (error) {
      console.error("Failed to fetch header data:", error);
    }
  };

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 60000); // Poll every minute

    // Socket listener for new unread chats anywhere in the app
    const socket = io(BASE_URL.replace("/api", ""));
    socket.on("new_unread_message", () => {
      // Refresh just the chat count when a new message event arrives
      api.get("chat/unread-count").then(res => setUnreadChatCount(res.data.unreadCount || 0)).catch(console.error);
    });

    const handleClickOutside = (event) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      clearInterval(interval);
      socket.disconnect();
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
      <div className="flex items-center justify-between mb-1 bg-gradient-primary text-white px-3 md:px-8 py-2.5 md:py-5 rounded-2xl shadow-lg relative overflow-visible z-10">
        {/* Background decoration */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -right-20 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
        </div>

        {/* Content */}
        <div className="relative z-10 flex items-center gap-1 md:gap-4 flex-shrink-0">
          {/* Hamburger Menu - Mobile Only */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-1.5 hover:bg-white/20 rounded-lg transition-colors flex-shrink-0"
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? (
              <X className="w-5 h-5 text-white" />
            ) : (
              <Menu className="w-5 h-5 text-white" />
            )}
          </button>

          <div className="flex-shrink-0">
            {/* <p className="text-sm text-blue-100 mb-1">Current Page</p> */}
            <h1 className="text-lg sm:text-xl md:text-3xl font-bold truncate max-w-[120px] sm:max-w-none">{title}</h1>
          </div>
        </div>

        <div className="relative z-20 flex items-center gap-1 md:gap-4 ml-auto">
          {/* Cart Icon */}
          <button
            onClick={() => navigate("/cart")}
            className="relative p-1.5 md:p-2.5 rounded-full hover:bg-white/20 transition-all duration-300 flex-shrink-0"
            title="Cart"
          >
            <ShoppingCart className="w-4 h-4 md:w-5 h-5 text-white" />
            {cartItems?.length > 0 && (
              <span className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-red-500 text-white text-[8px] md:text-[10px] font-bold px-1 md:px-1.5 py-0.5 rounded-full min-w-[15px] md:min-w-[18px] text-center border border-primaryDark animate-pulse">
                {cartItems.length > 9 ? "9+" : cartItems.length}
              </span>
            )}
          </button>

          {/* System Messages Icon - Hidden on very small screens */}
          <button
            onClick={() => setShowMessages(true)}
            className="relative p-1.5 md:p-2.5 rounded-full hover:bg-white/20 transition-all duration-300 flex-shrink-0 hidden xs:block"
            title="System Messages"
          >
            <Mail className="w-4 h-4 md:w-5 h-5 text-white" />
            {unreadAdminMsgCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-red-500 text-white text-[8px] md:text-[10px] font-bold px-1 md:px-1.5 py-0.5 rounded-full min-w-[15px] md:min-w-[18px] text-center border border-primaryDark animate-pulse">
                {unreadAdminMsgCount > 9 ? "9+" : unreadAdminMsgCount}
              </span>
            )}
          </button>

          {/* Chat Icon */}
          <button
            onClick={() => navigate("/chat")}
            className="relative p-1.5 md:p-2.5 rounded-full hover:bg-white/20 transition-all duration-300 flex-shrink-0"
            title="Chat"
          >
            <MessageCircle className="w-4 h-4 md:w-5 h-5 text-white" />
            {unreadChatCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 md:-top-1 md:-right-1 bg-red-500 text-white text-[8px] md:text-[10px] font-bold px-1 md:px-1.5 py-0.5 rounded-full min-w-[15px] md:min-w-[18px] text-center border border-primaryDark animate-pulse">
                {unreadChatCount > 9 ? "9+" : unreadChatCount}
              </span>
            )}
          </button>

          {/* Notification - Hidden on very small screens, accessible in menu */}
          <div className="relative hidden sm:block" ref={notificationRef}>
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2.5 rounded-full hover:bg-white/20 transition-all duration-300"
              title="Notifications"
            >
              <Bell className="w-5 h-5 text-white" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-danger text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center border-2 border-primaryDark animate-pulse">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 mt-4 w-96 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
                <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
                  <span className="font-bold text-secondary">Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-1 rounded-full font-bold">
                      {unreadCount} New
                    </span>
                  )}
                </div>

                <div className="max-h-[400px] overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                      <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p className="text-sm font-medium">No notifications yet</p>
                    </div>
                  ) : (
                    notifications.slice(0, 6).map((notification) => (
                      <div
                        key={notification._id}
                        className={`px-6 py-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-50 last:border-0 ${!notification.isRead ? "bg-primary/5" : ""
                          }`}
                        onClick={() => handleNotificationClick(notification)}
                      >
                        <div className="flex justify-between items-start gap-3">
                          <p className={`text-sm leading-relaxed ${!notification.isRead ? "text-secondary font-semibold" : "text-gray-600"}`}>
                            {notification.message}
                          </p>
                          {!notification.isRead && (
                            <button
                              onClick={(e) => handleMarkAsRead(e, notification._id)}
                              className="p-1 hover:bg-primary/20 rounded-md text-primary transition-colors flex-shrink-0"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 mt-2 block">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    ))
                  )}
                </div>

                <Link
                  to="/notifications"
                  onClick={() => setShowNotifications(false)}
                  className="block px-6 py-3 text-center text-primary text-sm font-semibold hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 border-t border-gray-100"
                >
                  View All Notifications
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
              </div>
            )}
          </div>

          {/* Profile Icon */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="w-8 h-8 md:w-11 md:h-11 rounded-full bg-white/20 hover:bg-white/30 flex items-center justify-center font-semibold cursor-pointer border-2 border-white/30 transition-all duration-300 hover:scale-105 overflow-hidden flex-shrink-0 ml-1"
            title="Profile"
          >
            {user?.profilePic ? (
              <img
                src={getImageUrl(user.profilePic)}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-white text-xs sm:text-sm md:text-base font-bold">{initials}</span>
            )}
          </button>
        </div>
      </div>

      <ProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={logout}
      />

      <Messages isOpen={showMessages} onClose={() => setShowMessages(false)} />
    </>
  );
};

export default TopHeader;
