import Button from "../components/ui/Button";
import Container from "../components/ui/Container";
import HeroSlider from "../components/HeroSlider";
import campus3 from "../assets/campus/campus3.jpg";
import campus2 from "../assets/campus/campus2.jpg";
import campus1 from "../assets/campus/campus1.jpg";
import FeaturesSection from "../components/FeaturesSection";

function Home() {
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

      <Container className="mt-16 space-y-20">
        {/* Features Section */}
        <FeaturesSection />

        {/* Welcome Card */}
        <div className="bg-white rounded-2xl p-8 sm:p-12 border border-gray-100 shadow-card">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-secondary mb-4 leading-tight">
                Welcome to CEV Campus Marketplace
              </h1>
              <p className="text-lg text-muted mb-8 leading-relaxed">
                Buy, sell and explore hostel listings within your campus. Our platform
                connects students, simplifies exchanges, and brings the campus community together. Start browsing now!
              </p>

              <div className="flex flex-wrap gap-4">
                <Button size="lg" className="px-8">
                  Explore Marketplace
                </Button>
                <Button variant="outline" size="lg" className="px-8">
                  Browse Hostels
                </Button>
              </div>

              {/* Stats */}
              <div className="mt-12 grid grid-cols-3 gap-6">
                <div>
                  <p className="text-3xl font-bold text-primary">5K+</p>
                  <p className="text-sm text-muted">Active Users</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">2K+</p>
                  <p className="text-sm text-muted">Listings</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-primary">50+</p>
                  <p className="text-sm text-muted">Hostels</p>
                </div>
              </div>
            </div>

            {/* Illustration/Icon */}
            <div className="flex-1 hidden md:flex justify-center">
              <div className="relative w-64 h-64">
                <div className="absolute inset-0 bg-gradient-primary/5 rounded-full blur-3xl" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-40 h-40 bg-gradient-primary rounded-full opacity-10" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>

      {/* Footer Spacing */}
      <div className="h-16" />
    </>
  );
}

export default Home;