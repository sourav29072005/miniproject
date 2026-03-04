import { Bell } from "lucide-react";
import { useLocation } from "react-router-dom";
import ProfileDrawer from "./ProfileDrawer";
import { useState } from "react";
const user = JSON.parse(localStorage.getItem("user"));
const email = user?.email || "user";
const initials = email.substring(0, 2).toUpperCase();

const routeTitles = {
  "/": "Home",
  "/marketplace": "Marketplace",
  "/add-item": "Sell Item",
  "/hostels": "Hostels & PGs",
  "/my-items": "My Items",
};

const TopHeader = () => {
  const location = useLocation();
  const title = routeTitles[location.pathname] || "Dashboard";

  // Drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between mb-8 bg-header text-white px-6 py-4 rounded-xl2 shadow-card">
        <h1 className="text-2xl font-semibold">
          {title}
        </h1>

        <div className="flex items-center gap-6">
          {/* Notification */}
          <button className="relative p-2 rounded-full hover:bg-white/10 transition">
            <Bell className="w-5 h-5 text-white" />
            <span className="absolute -top-1 -right-1 bg-danger text-white text-xs px-1.5 py-0.5 rounded-full">
              3
            </span>
          </button>

          {/* Profile Icon */}
          <div
            onClick={() => setDrawerOpen(true)}
            className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center font-semibold cursor-pointer"
          >
            {initials}
          </div>
        </div>
      </div>

      {/* Profile Drawer */}
      <ProfileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onLogout={() => {
          localStorage.removeItem("user");
          window.location.href = "/login";
        }}
      />
    </>
  );
};

export default TopHeader;