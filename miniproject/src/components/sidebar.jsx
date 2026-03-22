import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Plus, Building2, ChevronRight, MessageSquare, HelpCircle } from "lucide-react";
import logo from "../assets/logo.png";
import SupportModal from "./ui/SupportModal";

function Sidebar({ closeSidebar }) {
  const location = useLocation();
  const [supportOpen, setSupportOpen] = useState(false);

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { path: "/chat", label: "Messages", icon: MessageSquare },
    { path: "/add-item", label: "Sell Item", icon: Plus },
    { path: "/hostels", label: "Hostels", icon: Building2 },
  ];

  const linkClasses = (path) =>
    `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300 group ${
      location.pathname === path
        ? "bg-gradient-primary text-white shadow-md hover:bg-primaryDark hover:shadow-lg"
        : "text-secondary hover:bg-gray-50 text-gray-700"
    }`;

  const handleNavClick = () => {
    // Close sidebar on mobile when a link is clicked
    if (closeSidebar && window.innerWidth < 768) {
      closeSidebar();
    }
  };

  return (
    <>
      <div className="w-64 bg-white shadow-card flex flex-col p-6 h-screen sticky top-0">
        {/* Logo */}
        <Link 
          to="/" 
          onClick={handleNavClick}
          className="flex items-center gap-3 mb-10 group hover:opacity-80 transition-opacity"
        >
          <img src={logo} alt="CEV Connect" className="w-11 h-11 object-contain bg-primary/5 rounded-lg border border-primary/10 group-hover:shadow-md transition-shadow p-1" />
          <div className="flex flex-col">
            <span className="text-xl font-extrabold text-gray-900 leading-tight tracking-tight">CEV Connect</span>
            <span className="text-[10px] uppercase font-bold text-primary tracking-widest mt-0.5">Portal</span>
          </div>
        </Link>

        {/* Divider */}
        <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-6" />

        {/* Navigation */}
        <nav className="space-y-1 flex-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Link 
                key={item.path}
                to={item.path}
                onClick={handleNavClick}
                className={linkClasses(item.path)}
              >
                <Icon className={`w-5 h-5 transition-transform ${
                  isActive ? "text-white" : "group-hover:scale-110"
                }`} />
                <span className="font-medium text-sm">{item.label}</span>
                {isActive && (
                  <ChevronRight className="w-4 h-4 ml-auto text-white" />
                )}
              </Link>
            );
          })}
        </nav>

        {/* Footer Info */}
        <div className="pt-6 border-t border-gray-100">
          <div className="bg-gradient-to-br from-primary/5 to-primary/10 rounded-xl p-4 text-center">
            <HelpCircle size={22} className="text-primary mx-auto mb-2" />
            <p className="text-xs text-muted mb-2 font-semibold">Need Help?</p>
            <button
              onClick={() => setSupportOpen(true)}
              className="text-primary font-bold text-sm hover:text-primaryDark transition-colors underline-offset-2 hover:underline"
            >
              Contact Support
            </button>
          </div>
        </div>
      </div>

      <SupportModal isOpen={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}

export default Sidebar;