import { useNavigate } from "react-router-dom";
import logo from "../../assets/logo.png";

const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-gray-300 py-12 md:py-16 border border-gray-800 w-full mt-auto rounded-[2rem] shadow-2xl">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-12 lg:gap-16">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-4 mb-6">
            <img src={logo} alt="CEV Connect" className="w-12 h-12 object-contain bg-white rounded-xl p-1 shadow-sm" />
            <span className="text-2xl font-extrabold text-white tracking-tight">CEV Connect</span>
          </div>
          <p className="text-gray-400 text-sm max-w-sm leading-relaxed mb-6 font-medium">
            The premier marketplace and housing platform built exclusively for the CEV campus community. Safe, fast, and reliable.
          </p>
        </div>
        
        <div>
          <h4 className="text-white font-bold text-xs mb-5 tracking-widest uppercase">Platform</h4>
          <ul className="space-y-3 font-semibold text-sm">
            <li><button onClick={() => navigate("/marketplace")} className="text-gray-400 hover:text-white transition-colors">Marketplace</button></li>
            <li><button onClick={() => navigate("/hostels")} className="text-gray-400 hover:text-white transition-colors">Hostels</button></li>
            <li><button onClick={() => navigate("/register")} className="text-gray-400 hover:text-white transition-colors">Create Account</button></li>
            <li><button onClick={() => navigate("/login")} className="text-gray-400 hover:text-white transition-colors">Sign In</button></li>
          </ul>
        </div>
        
        <div>
          <h4 className="text-white font-bold text-xs mb-5 tracking-widest uppercase">Support</h4>
          <ul className="space-y-3 font-semibold text-sm">
            <li><button className="text-gray-400 hover:text-white transition-colors cursor-pointer">Help Center</button></li>
            <li><button className="text-gray-400 hover:text-white transition-colors cursor-pointer">Safety Guidelines</button></li>
            <li><button className="text-gray-400 hover:text-white transition-colors cursor-pointer">Terms of Service</button></li>
            <li><button className="text-gray-400 hover:text-white transition-colors cursor-pointer">Privacy Policy</button></li>
          </ul>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 mt-12 pt-8 border-t border-gray-800/50 text-center text-gray-500 font-semibold text-xs">
        <p>&copy; {new Date().getFullYear()} CEV Campus Connect. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
