import { useNavigate } from "react-router-dom";
import Container from "../components/ui/Container";
import HeroSlider from "../components/HeroSlider";
import campus3 from "../assets/campus/campus3.jpg";
import campus2 from "../assets/campus/campus2.jpg";
import campus1 from "../assets/campus/campus1.jpg";
import FeaturesSection from "../components/FeaturesSection";
import { ShoppingBag, Building2, ArrowRight } from "lucide-react";

function Home() {
  const navigate = useNavigate();

  return (
    <>
      <HeroSlider
        slides={[
          {
            image: campus3,
            title: "Welcome to CEV Connect",
            subtitle: "Your Campus Marketplace & Hostel Portal",
          },
          {
            image: campus2,
            title: "Buy. Sell. Explore.",
            subtitle: "Everything Students Need in One Place",
          },
          {
            image: campus1,
            title: "Find The Best Hostels",
            subtitle: "Safe, Verified & Student Friendly",
          },
        ]}
      />

      <Container className="mt-8 space-y-12">
        {/* Features Section */}
        <FeaturesSection />

        {/* Stats Banner */}
        <div className="rounded-2xl bg-gradient-to-r from-primary via-blue-600 to-indigo-600 p-8 sm:p-10 text-white shadow-xl">
          <p className="text-center text-xs uppercase tracking-widest font-bold text-white/60 mb-6">Platform at a Glance</p>
          <div className="grid grid-cols-3 divide-x divide-white/20 text-center">
            <div className="px-6">
              <p className="text-4xl md:text-5xl font-black mb-1">5K+</p>
              <p className="text-sm font-semibold text-white/70">Active Students</p>
            </div>
            <div className="px-6">
              <p className="text-4xl md:text-5xl font-black mb-1">2K+</p>
              <p className="text-sm font-semibold text-white/70">Items Listed</p>
            </div>
            <div className="px-6">
              <p className="text-4xl md:text-5xl font-black mb-1">50+</p>
              <p className="text-sm font-semibold text-white/70">Hostels Listed</p>
            </div>
          </div>
        </div>

        {/* CTA Cards */}
        <div className="grid md:grid-cols-2 gap-6 pb-4">
          {/* Marketplace CTA */}
          <button
            onClick={() => navigate("/marketplace")}
            className="group relative overflow-hidden rounded-2xl bg-secondary text-white p-8 text-left shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
          >
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-white/5 rounded-full" />
            <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-white/5 rounded-full" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mb-5">
                <ShoppingBag size={24} className="text-white" />
              </div>
              <h3 className="text-2xl font-black mb-2 leading-tight">Campus Marketplace</h3>
              <p className="text-white/60 text-sm mb-6 leading-relaxed">Buy and sell textbooks, electronics, hostel essentials and more with fellow students.</p>
              <span className="inline-flex items-center gap-2 font-bold text-sm group-hover:gap-3 transition-all">
                Browse Items <ArrowRight size={16} />
              </span>
            </div>
          </button>

          {/* Hostels CTA */}
          <button
            onClick={() => navigate("/hostels")}
            className="group relative overflow-hidden rounded-2xl bg-white border border-gray-100 text-secondary p-8 text-left shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1 hover:border-primary/20"
          >
            <div className="absolute -top-8 -right-8 w-40 h-40 bg-primary/3 rounded-full" />
            <div className="absolute -bottom-10 -left-6 w-32 h-32 bg-primary/5 rounded-full" />
            <div className="relative z-10">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-5">
                <Building2 size={24} className="text-primary" />
              </div>
              <h3 className="text-2xl font-black mb-2 leading-tight">Hostel Directory</h3>
              <p className="text-gray-500 text-sm mb-6 leading-relaxed">Explore verified campus hostels, check amenities, availability and warden contacts all in one place.</p>
              <span className="inline-flex items-center gap-2 font-bold text-sm text-primary group-hover:gap-3 transition-all">
                Explore Hostels <ArrowRight size={16} />
              </span>
            </div>
          </button>
        </div>
      </Container>

      {/* Footer Spacing */}
      <div className="h-16" />
    </>
  );
}

export default Home;
