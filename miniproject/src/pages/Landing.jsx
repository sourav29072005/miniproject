import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import HeroSlider from "../components/HeroSlider";
import campus3 from "../assets/campus/campus3.jpg";
import campus2 from "../assets/campus/campus2.jpg";
import campus1 from "../assets/campus/campus1.jpg";
import FeaturesSection from "../components/FeaturesSection";

function Landing() {
  const navigate = useNavigate();

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="sticky top-0 z-50 bg-white shadow-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-lg">
              C
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-bold text-primary leading-tight">CEV</span>
              <span className="text-xs text-muted">CONNECT</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="md"
              onClick={() => navigate("/login")}
            >
              Sign In
            </Button>
            <Button 
              size="md"
              onClick={() => navigate("/register")}
            >
              Get Started
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Slider */}
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

      <Container className="mt-16 space-y-20">
        {/* Features Section */}
        <FeaturesSection />

        {/* Call to Action Section */}
        <section className="py-20 bg-gradient-primary rounded-3xl text-white text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-lg text-blue-100 mb-10 max-w-3xl mx-auto leading-relaxed">
            Join thousands of students buying and selling on CEV Campus. Sign up now
            and get exclusive access to verified listings and hostel information.
          </p>
          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-4">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-blue-50 px-8"
              onClick={() => navigate("/register")}
            >
              Create Account Now
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-white text-white hover:bg-white/20 px-8"
              onClick={() => navigate("/login")}
            >
              Already Have an Account?
            </Button>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-20">
          <h2 className="text-4xl font-bold text-secondary mb-12 text-center">Why Choose CEV Connect?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">🛡️</span>
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">Safe & Verified</h3>
              <p className="text-muted leading-relaxed">
                All sellers and hostels are verified. Secure transactions and transparent communication.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">⚡</span>
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">Quick & Easy</h3>
              <p className="text-muted leading-relaxed">
                Post items in minutes, find hostels instantly. Simple interface designed for students.
              </p>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-card hover:shadow-elevated transition-all duration-300">
              <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                <span className="text-2xl">💰</span>
              </div>
              <h3 className="text-xl font-bold text-secondary mb-3">Budget Friendly</h3>
              <p className="text-muted leading-relaxed">
                Save money by buying pre-owned items. Find hostels at affordable prices on campus.
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-16 bg-gradient-light rounded-2xl">
          <div className="grid grid-cols-3 gap-8">
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2">5K+</p>
              <p className="text-lg text-muted font-semibold">Active Users</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2">2K+</p>
              <p className="text-lg text-muted font-semibold">Active Listings</p>
            </div>
            <div className="text-center">
              <p className="text-4xl md:text-5xl font-bold text-primary mb-2">50+</p>
              <p className="text-lg text-muted font-semibold">Verified Hostels</p>
            </div>
          </div>
        </section>
      </Container>

      {/* Footer */}
      <footer className="mt-20 bg-secondary text-white py-12">
        <Container>
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center font-bold text-sm">C</div>
                <span className="font-bold">CEV CONNECT</span>
              </div>
              <p className="text-gray-400 text-sm">Campus marketplace and hostel portal for students.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button onClick={() => navigate("/login")} className="hover:text-white transition">Sign In</button></li>
                <li><button onClick={() => navigate("/register")} className="hover:text-white transition">Sign Up</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Help Center</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button className="hover:text-white transition cursor-pointer">Help Center</button></li>
                <li><button className="hover:text-white transition cursor-pointer">Contact Us</button></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-gray-400">
                <li><button className="hover:text-white transition cursor-pointer">Privacy Policy</button></li>
                <li><button className="hover:text-white transition cursor-pointer">Terms of Service</button></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 pt-8 text-center text-gray-400 text-sm">
            <p>&copy; 2024 CEV Campus Connect. All rights reserved.</p>
          </div>
        </Container>
      </footer>

      {/* Footer Spacing */}
      <div className="h-8" />
    </>
  );
}

export default Landing;
