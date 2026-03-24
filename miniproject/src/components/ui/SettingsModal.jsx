import { useState } from "react";
import { X, Lock, Trash2, Bell, Shield, Eye, EyeOff, Loader2 } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import api from "../../api";

function SettingsModal({ isOpen, onClose }) {
  const { logout } = useAuth();
  const [activeTab, setActiveTab] = useState("account"); // account | security | notifications
  
  // Password State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deletePassword, setDeletePassword] = useState(""); // For account deletion
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showDeletePass, setShowDeletePass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });

  // Notification Mock State
  const [notifications, setNotifications] = useState({
    orders: true,
    messages: true,
    promotions: false
  });

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return setMessage({ type: "error", text: "New passwords do not match" });
    }
    
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      await api.post("auth/change-password", { currentPassword, newPassword });
      setMessage({ type: "success", text: "Password updated successfully!" });
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setMessage({ type: "error", text: err.response?.data?.error || "Failed to update password" });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (!showDeletePass) {
      setShowDeletePass(true);
      return;
    }

    if (!deletePassword) {
      alert("Please enter your password to confirm account deletion.");
      return;
    }

    if (!window.confirm("CRITICAL: Are you sure you want to delete your account? This action is permanent and all your data (listings, orders, messages) will be lost forever.")) {
      return;
    }

    setLoading(true);
    try {
      await api.delete("auth/delete-account", { data: { password: deletePassword } });
      alert("Your account has been deleted.");
      logout();
    } catch (err) {
      alert(err.response?.data?.error || "Failed to delete account. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl overflow-hidden animate-fade-in flex flex-col md:flex-row h-[600px] max-h-[90vh]">
        
        {/* Sidebar Tabs */}
        <div className="w-full md:w-64 bg-gray-50 border-r p-6 space-y-2 flex flex-col">
          <h2 className="text-xl font-black text-gray-900 mb-6 px-2">Settings</h2>
          
          <button 
            onClick={() => setActiveTab("account")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'account' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Lock size={18} /> Account
          </button>
          
          <button 
            onClick={() => setActiveTab("notifications")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'notifications' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Bell size={18} /> Notifications
          </button>

          <button 
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all ${activeTab === 'security' ? 'bg-primary text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <Shield size={18} /> Security
          </button>

          <div className="mt-auto pt-6 border-t border-gray-200">
             {showDeletePass && (
               <div className="mb-4 space-y-2 px-2 animate-in fade-in slide-in-from-bottom-2">
                 <label className="text-[10px] font-black text-rose-400 uppercase tracking-widest">Verify Password</label>
                 <input 
                   type="password"
                   placeholder="Enter password..."
                   className="w-full bg-white border border-rose-100 rounded-lg px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-rose-500/20"
                   value={deletePassword}
                   onChange={(e) => setDeletePassword(e.target.value)}
                 />
               </div>
             )}
             <button 
              onClick={handleDeleteAccount}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl font-bold text-sm transition-all w-full text-left ${showDeletePass ? 'bg-rose-600 text-white shadow-md' : 'text-rose-600 hover:bg-rose-50'}`}
            >
              <Trash2 size={18} /> {showDeletePass ? "Confirm Delete" : "Delete Account"}
            </button>
            {showDeletePass && (
              <button 
                onClick={() => { setShowDeletePass(false); setDeletePassword(""); }}
                className="mt-2 text-[10px] font-black text-gray-400 uppercase tracking-widest px-4 hover:text-gray-600"
              >
                Cancel Deletion
              </button>
            )}
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <button onClick={onClose} className="absolute top-6 right-6 p-2 hover:bg-gray-100 rounded-full transition-colors">
            <X size={20} className="text-gray-400" />
          </button>

          {activeTab === 'account' && (
            <div className="space-y-8 animate-slide-in-right">
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-1">Change Password</h3>
                <p className="text-sm text-gray-500 mb-6">Update your security credentials regularly.</p>
                
                <form onSubmit={handleChangePassword} className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Current Password</label>
                    <div className="relative">
                      <input 
                        type={showCurrent ? "text" : "password"}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all pr-12"
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        required
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowCurrent(!showCurrent)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">New Password</label>
                      <div className="relative">
                        <input 
                          type={showNew ? "text" : "password"}
                          className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all pr-12"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          min={6}
                          required
                        />
                        <button 
                          type="button" 
                          onClick={() => setShowNew(!showNew)}
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                        >
                          {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Confirm New</label>
                      <input 
                        type={showNew ? "text" : "password"}
                        className="w-full bg-gray-50 border-2 border-transparent focus:border-primary focus:bg-white rounded-xl px-4 py-3 text-sm font-semibold outline-none transition-all"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  {message.text && (
                    <div className={`p-4 rounded-xl text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                      {message.text}
                    </div>
                  )}

                  <button 
                    disabled={loading}
                    className="w-full py-4 bg-primary text-white rounded-xl font-black text-sm uppercase tracking-widest hover:bg-primaryDark transition-all active:scale-[0.98] shadow-lg disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : "Update Password"}
                  </button>
                </form>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-8 animate-slide-in-right">
              <div>
                <h3 className="text-lg font-black text-gray-900 mb-1">Notification Preferences</h3>
                <p className="text-sm text-gray-500 mb-8">Choose how you want to be notified about campus activity.</p>
                
                <div className="space-y-4">
                  {[
                    { id: 'orders', label: 'Order Updates', desc: 'Get notified when an item is bought or received' },
                    { id: 'messages', label: 'Chat Messages', desc: 'Notifications for new messages in your inbox' },
                    { id: 'promotions', label: 'Platform News', desc: 'Updates about new features and campus events' }
                  ].map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-transparent hover:border-gray-200 transition-all">
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{item.label}</p>
                        <p className="text-xs text-gray-500">{item.desc}</p>
                      </div>
                      <button 
                        onClick={() => setNotifications({...notifications, [item.id]: !notifications[item.id]})}
                        className={`w-12 h-6 rounded-full transition-all relative ${notifications[item.id] ? 'bg-primary' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${notifications[item.id] ? 'right-1' : 'left-1'}`} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="space-y-8 animate-slide-in-right">
               <div>
                <h3 className="text-lg font-black text-gray-900 mb-1">Security & Sessions</h3>
                <p className="text-sm text-gray-500 mb-8">Manage your account security and active sessions.</p>
                
                <div className="p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                      <Shield size={20} />
                    </div>
                    <div>
                      <p className="font-bold text-gray-900 text-sm">Two-Factor Authentication</p>
                      <p className="text-xs text-gray-500">Add an extra layer of security to your account.</p>
                    </div>
                  </div>
                  <button className="w-full py-3 bg-white border-2 border-primary/20 text-primary rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-primary/5 transition-all">
                    Enable 2FA (Coming Soon)
                  </button>
                </div>

                <div className="mt-8">
                   <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1 mb-4">Active Sessions</p>
                   <div className="p-4 bg-gray-50 rounded-2xl flex items-center justify-between border border-transparent hover:border-gray-200">
                      <div className="flex items-center gap-3">
                         <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                         <div>
                            <p className="text-sm font-bold text-gray-900">Current Device</p>
                            <p className="text-[10px] text-gray-500 uppercase font-black">Online now • Browser Session</p>
                         </div>
                      </div>
                      <button className="text-[10px] font-black text-primary uppercase tracking-wider hover:underline">Log out all devices</button>
                   </div>
                </div>
              </div>
            </div>
          )}

        </div>

      </div>
    </div>
  );
}

export default SettingsModal;
