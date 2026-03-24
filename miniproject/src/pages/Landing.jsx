import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { ShieldCheck, Zap, Wallet, ArrowRight, TrendingUp, Sparkles } from "lucide-react";
import campus1 from "../assets/campus/campus1.jpg";
import campus2 from "../assets/campus/campus2.jpg";
import campus3 from "../assets/campus/campus3.jpg";
import logo from "../assets/logo.png";
import Footer from "../components/ui/Footer";

function Landing() {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const heroImages = [campus1, campus2, campus3];

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentImageIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000); // Cross-fade every 4 seconds
    return () => clearInterval(timer);
  }, [heroImages.length]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans overflow-hidden">
      {/* Sticky Glassmorphism Navbar */}
      <nav 
        className={`fixed top-0 w-full z-50 transition-all duration-300 ${
          scrolled 
            ? "bg-white/85 backdrop-blur-md shadow-sm py-4" 
            : "bg-transparent py-6"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="CEV Connect" className={`w-14 h-14 object-contain transition-all ${scrolled ? 'drop-shadow-md' : 'drop-shadow-lg'}`} />
            <div className="flex flex-col">
              <span className={`text-xl font-extrabold tracking-tight leading-none text-gray-900`}>CEV Connect</span>
              <span className={`text-[10px] font-bold tracking-widest uppercase text-primary mt-0.5`}>Campus Portal</span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-5">
            <button 
              className="text-gray-700 hover:text-gray-900 font-bold transition-colors px-4 py-2 hidden sm:block"
              onClick={() => navigate("/login")}
            >
              Sign In
            </button>
            <button 
              className="bg-primary hover:bg-primaryDark text-white px-6 py-2.5 rounded-full font-bold shadow-hover transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2"
              onClick={() => navigate("/register")}
            >
              Get Started <ArrowRight size={18} strokeWidth={3} />
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-36 pb-20 lg:pt-48 lg:pb-32 overflow-hidden px-4">
        {/* Decorative background blobs */}
        <div className="absolute top-0 right-0 -translate-y-12 translate-x-1/3 w-[800px] h-[800px] bg-blue-100/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-pulse-soft"></div>
        <div className="absolute top-40 left-0 -translate-x-1/3 w-[600px] h-[600px] bg-amber-50/50 rounded-full mix-blend-multiply filter blur-3xl opacity-50 animate-float"></div>

        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 lg:gap-8 items-center relative z-10">
          <div className="animate-slide-up order-2 lg:order-1 mt-8 lg:mt-0">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 font-bold text-sm mb-8 border border-blue-100 shadow-sm">
              <Sparkles size={16} className="text-amber-500" /> Welcome to the Future of Campus Life
            </div>
            <h1 className="text-5xl lg:text-[5rem] font-extrabold text-gray-900 tracking-tight leading-[1.05] mb-8">
              Your Campus. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-500 to-indigo-600">
                Connected.
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 max-w-lg leading-relaxed font-medium">
              Discover verified hostels, buy and sell textbooks, and explore everything CEV Campus has to offer—all in one secure place.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <button 
                onClick={() => navigate("/register")}
                className="bg-gray-900 text-white hover:bg-gray-800 px-8 py-4.5 rounded-2xl font-bold text-lg shadow-elevated transition-transform hover:-translate-y-1 flex items-center justify-center gap-3"
              >
                Join the Network <ArrowRight size={20} strokeWidth={3} />
              </button>
              <button 
                onClick={() => navigate("/login")}
                className="bg-white text-gray-900 border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 px-8 py-4.5 rounded-2xl font-bold text-lg shadow-sm transition-all flex items-center justify-center"
              >
                Sign In to Account
              </button>
            </div>
            
            <div className="flex items-center gap-4 text-sm font-semibold text-gray-500">
              <div className="flex -space-x-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 border-4 border-white flex items-center justify-center text-blue-700 font-black text-xs shadow-sm z-30">JD</div>
                <div className="w-12 h-12 rounded-full bg-green-100 border-4 border-white flex items-center justify-center text-green-700 font-black text-xs shadow-sm z-20">AK</div>
                <div className="w-12 h-12 rounded-full bg-amber-100 border-4 border-white flex items-center justify-center text-amber-700 font-black text-xs shadow-sm z-10">SM</div>
              </div>
              <p className="leading-tight">Trusted by <br /><span className="text-gray-900 font-black text-base">5,000+</span> CEV students</p>
            </div>
          </div>
          
          <div className="relative animate-fade-in order-1 lg:order-2 lg:ml-auto w-full max-w-lg mx-auto">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-[12px] border-white bg-white transform rotate-2 hover:rotate-0 transition-transform duration-500 h-[550px]">
              {heroImages.map((img, index) => (
                <img 
                  key={index}
                  src={img} 
                  alt={`Campus Life ${index + 1}`} 
                  className={`w-full h-full object-cover absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`} 
                />
              ))}
              <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/20 to-transparent z-10"></div>
              <div className="absolute bottom-10 left-8 right-8 text-white z-20">
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="bg-white/20 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Verified Listings</span>
                  <span className="bg-primary/90 backdrop-blur-md px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">Campus Secure</span>
                </div>
                <h3 className="text-3xl font-extrabold tracking-tight leading-tight">Experience CEV Together</h3>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bento Grid Features */}
      <section className="py-32 bg-white relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl lg:text-5xl font-extrabold text-gray-900 tracking-tight mb-6 leading-tight">Everything you need, <br />in one ecosystem.</h2>
            <p className="text-xl text-gray-500 font-medium">We've built the ultimate platform to help you navigate campus life, find shelter, and trade essentials securely.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 bg-gradient-light p-12 rounded-[2.5rem] group hover:shadow-hover transition-all duration-300 border border-gray-100">
              <div className="w-20 h-20 bg-white rounded-[1.5rem] shadow-sm flex items-center justify-center text-primary mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <ShieldCheck size={40} strokeWidth={2} />
              </div>
              <h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Safe & Verified Community</h3>
              <p className="text-gray-600 text-xl max-w-md font-medium leading-relaxed">Every user and hostel listing is strictly authenticated. Say goodbye to anonymous scams and deal with your actual peers safely.</p>
            </div>
            
            <div className="bg-blue-50 border border-blue-100 p-12 rounded-[2.5rem] group hover:shadow-hover transition-all duration-300">
              <div className="w-20 h-20 bg-blue-600 rounded-[1.5rem] shadow-md flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                <Zap size={40} strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-4 tracking-tight">Lightning Fast</h3>
              <p className="text-gray-600 text-lg font-medium leading-relaxed">List your items or secure a hostel bed in just a few taps.</p>
            </div>

            <div className="bg-amber-50 border border-amber-100 p-12 rounded-[2.5rem] group hover:shadow-hover transition-all duration-300">
              <div className="w-20 h-20 bg-amber-500 rounded-[1.5rem] shadow-md flex items-center justify-center text-white mb-8 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-300">
                <Wallet size={40} strokeWidth={2} />
              </div>
              <h3 className="text-2xl font-extrabold text-gray-900 mb-4 tracking-tight">Budget Friendly</h3>
              <p className="text-gray-600 text-lg font-medium leading-relaxed">Save hundreds by shopping campus pre-owned essentials directly from seniors.</p>
            </div>

            <div className="md:col-span-2 bg-gray-900 p-12 rounded-[2.5rem] text-white group hover:shadow-2xl transition-all duration-300 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-80 h-80 bg-primary/40 rounded-full mix-blend-screen filter blur-[80px] opacity-60 group-hover:opacity-100 transition-opacity duration-500 translate-x-1/3 -translate-y-1/3"></div>
              <div className="relative z-10">
                <div className="w-20 h-20 bg-gray-800 rounded-[1.5rem] border border-gray-700 flex items-center justify-center text-blue-400 mb-8 group-hover:scale-110 group-hover:-rotate-3 transition-transform duration-300">
                  <TrendingUp size={40} strokeWidth={2} />
                </div>
                <h3 className="text-3xl font-extrabold mb-4 tracking-tight">Elevate Your Lifestyle</h3>
                <p className="text-gray-400 text-xl max-w-lg font-medium leading-relaxed">Access premium verified hostels near campus. View detailed amenities, read verified student reviews, and book with confidence.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 bg-gradient-primary relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 mix-blend-overlay"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-gray-900/20 to-transparent"></div>
        <div className="max-w-4xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">Ready to join <br />the network?</h2>
          <p className="text-2xl text-blue-100/90 mb-12 max-w-2xl mx-auto font-medium leading-relaxed">
            Stop waiting and start exploring. Create your free account today and unlock the full potential of CEV Campus.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-6">
            <button 
              onClick={() => navigate("/register")}
              className="bg-white text-primary px-12 py-5 rounded-2xl font-extrabold text-xl shadow-elevated hover:bg-gray-50 hover:shadow-2xl transition-all hover:-translate-y-1 flex items-center justify-center gap-3"
            >
              Sign Up For Free <ArrowRight size={22} strokeWidth={3} />
            </button>
            <button 
              onClick={() => navigate("/login")}
              className="bg-primaryDark/50 backdrop-blur-sm text-white border-2 border-white/20 px-12 py-5 rounded-2xl font-extrabold text-xl hover:bg-white/10 transition-all flex items-center justify-center"
            >
              Log In to Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <div className="w-full">
        <Footer />
      </div>
    </div>
  );
}

export default Landing;
