import Button from "../components/ui/Button";
import Card from "../components/ui/Card";
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
    <Container className="mt-10 space-y-8">
      <FeaturesSection />
      <Card>
        <h1 className="text-3xl font-semibold text-secondary mb-4">
          Welcome to CEV Campus Marketplace
        </h1>
        <p className="text-muted mb-6">
          Buy, sell and explore hostel listings within your campus.
        </p>

        <div className="flex gap-4">
          <Button>Explore Marketplace</Button>
          <Button variant="outline">Browse Hostels</Button>
          
        </div>
      </Card>

     
    </Container>
    </>
  );
}

export default Home;