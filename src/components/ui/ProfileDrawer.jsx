import { X, User, Settings, LogOut, Pencil } from "lucide-react";

function ProfileDrawer({ open, onClose, onLogout }) {

  const user = JSON.parse(localStorage.getItem("user"));
  const email = user?.email || "user@cev.com";

  const initials = email.substring(0, 2).toUpperCase();

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
      <div className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center font-semibold text-lg">
        {initials}
      </div>

      <div>
        <p className="font-semibold text-secondary">
          {email}
        </p>

        <button className="flex items-center gap-1 text-sm text-primary hover:underline">
          <Pencil size={14} />
          Edit Profile
        </button>
      </div>

    </div>

    {/* Options right below profile */}
    <button className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-gray-100">
      <User size={18} />
      My Profile
    </button>

    <button className="flex items-center gap-3 w-full text-left p-3 rounded-lg hover:bg-gray-100">
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
    </>
  );
}

export default ProfileDrawer;