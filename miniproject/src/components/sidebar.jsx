import { Link, useLocation } from "react-router-dom";
import { Home, ShoppingBag, Plus, Building2, Package, ChevronRight } from "lucide-react";

function Sidebar({ closeSidebar }) {
  const location = useLocation();

  const navItems = [
    { path: "/", label: "Home", icon: Home },
    { path: "/marketplace", label: "Marketplace", icon: ShoppingBag },
    { path: "/add-item", label: "Sell Item", icon: Plus },
    { path: "/hostels", label: "Hostels", icon: Building2 },
    { path: "/my-items", label: "My Items", icon: Package },
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
    <div className="w-64 bg-white shadow-card flex flex-col p-6 h-screen sticky top-0">
      {/* Logo */}
      <Link 
        to="/" 
        onClick={handleNavClick}
        className="flex items-center gap-3 mb-10 group hover:opacity-80 transition-opacity"
      >
        <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-lg group-hover:shadow-lg transition-shadow">
          C
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-bold text-primary leading-tight">CEV</span>
          <span className="text-xs text-muted">CONNECT</span>
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
          <p className="text-xs text-muted mb-2">Need Help?</p>
          <button className="text-primary font-semibold text-sm hover:text-primaryDark transition-colors">
            Contact Support
          </button>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;