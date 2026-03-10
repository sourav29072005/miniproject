import { useState } from "react";
import Sidebar from "../components/sidebar";
import { Outlet } from "react-router-dom";
import TopHeader from "../components/ui/TopHeader";

function DashboardLayout({ setIsLoggedIn }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const closeSidebar = () => setSidebarOpen(false);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed md:relative left-0 top-0 h-screen z-40 transition-transform duration-300 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <Sidebar closeSidebar={closeSidebar} />
      </div>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto relative z-0 flex flex-col">
        <TopHeader sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;