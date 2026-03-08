import Sidebar from "../components/sidebar";
import { Outlet } from "react-router-dom";
import TopHeader from "../components/ui/TopHeader";

function DashboardLayout({ setIsLoggedIn }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <Sidebar/>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
         
            <TopHeader />
         
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;