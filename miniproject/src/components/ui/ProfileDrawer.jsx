import { useState } from "react";
import { X, User, Settings, LogOut, Pencil, Package, TrendingUp, ShoppingBag } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { BASE_URL } from "../../api";
import SettingsModal from "./SettingsModal";
import { getImageUrl } from "../../utils/urlHelper";

function ProfileDrawer({ open, onClose, onLogout }) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const email = user?.email || "user@cev.com";
  const name = user?.name || "User";

  const initials = user?.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email
      ? user.email.substring(0, 2).toUpperCase()
      : "US";
  const isProfileComplete = !!user?.department;

  return (
    <>
      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={onClose}
        />
      )}

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-80 bg-white shadow-xl z-50
        transform transition-transform duration-300
        ${open ? "translate-x-0" : "translate-x-full"}`}
      >

        {/* Header */}
        <div className="p-6 flex justify-between items-center border-b">
          <h2 className="text-lg font-semibold">Account</h2>

          <button onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="flex flex-col justify-between h-[calc(100%-72px)]">

          {/* Top Section */}
          <div className="p-6 space-y-4 border-b">

            <div className="flex items-center gap-4">

              {/* Avatar */}
              <div className="w-16 h-16 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xl overflow-hidden border-2 border-primary/20">
                {user?.profilePic ? (
                  <img
                    src={getImageUrl(user.profilePic)}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  initials
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="font-bold text-secondary text-lg truncate">
                  {name}
                </p>
                <p className="text-xs text-gray-500 truncate mb-2">
                  {email}
                </p>

                <button
                  onClick={() => { onClose(); navigate("/setup-profile"); }}
                  className="flex items-center gap-1 text-xs font-bold text-primary hover:text-primary/80 transition-colors bg-primary/10 px-2 py-1 rounded-md w-fit"
                >
                  <Pencil size={12} />
                  {isProfileComplete ? "Edit Profile" : "Complete Profile"}
                </button>
              </div>

            </div>

            {/* Options right below profile */}
            <button
              onClick={() => { onClose(); navigate("/profile"); }}
              className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-gray-100"
            >
              <User size={18} />
              My Profile
            </button>

            <button
              onClick={() => {
                onClose();
                navigate("/my-orders");
              }}
              className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-gray-100"
            >
              <ShoppingBag size={18} />
              My Orders
            </button>

            <button
              onClick={() => {
                onClose();
                navigate("/my-items");
              }}
              className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-gray-100"
            >
              <Package size={18} />
              My Listings
            </button>

            <button
              onClick={() => {
                onClose();
                navigate("/earnings");
              }}
              className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-gray-100"
            >
              <TrendingUp size={18} />
              Earnings
            </button>

            <button 
              onClick={() => setSettingsOpen(true)}
              className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-gray-100"
            >
              <Settings size={18} />
              Settings
            </button>

          </div>

          {/* Logout Bottom */}
          <div className="p-6 border-t">
            <button
              onClick={onLogout}
              className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-red-50 text-red-600"
            >
              <LogOut size={18} />
              Logout
            </button>
          </div>

        </div>
      </div>

      <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
    </>
  );
}

export default ProfileDrawer;