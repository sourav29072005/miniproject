import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Building2, Users } from "lucide-react";

function FeatureCard({ icon: Icon, title, description, delay }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  const [parallax, setParallax] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) observer.observe(ref.current);

    return () => observer.disconnect();
  }, []);

  // Add parallax effect
  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const offset = (rect.top / window.innerHeight) * 20;
        setParallax(offset);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      ref={ref}
      style={{
        transitionDelay: `${delay}ms`,
        transform: `translateY(${parallax}px)`,
      }}
      className={`relative group rounded-2xl p-8 bg-white backdrop-blur-sm border border-gray-100 shadow-card hover:shadow-elevated
      transform transition-all duration-500
      hover:-translate-y-2 hover:border-primary/30
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
    >
      {/* Background gradient on hover */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon Container */}
      <div className="relative z-10 w-14 h-14 flex items-center justify-center rounded-xl bg-gradient-primary/10 mb-6 group-hover:bg-gradient-primary/20 transition-colors duration-300">
        <Icon size={28} className="text-primary group-hover:scale-110 transition-transform duration-300" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <h3 className="text-xl font-bold mb-3 text-secondary group-hover:text-primary transition-colors duration-300">
          {title}
        </h3>

        <p className="text-muted text-sm leading-relaxed">
          {description}
        </p>
      </div>

      {/* Accent line */}
      <div className="absolute bottom-0 left-0 h-1 bg-gradient-primary rounded-full w-0 group-hover:w-full transition-all duration-500" />
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16 animate-fade-in">
          <div className="inline-block mb-4">
            <span className="inline-block px-4 py-2 rounded-full bg-primary/10 text-primary font-semibold text-sm">
              Our Features
            </span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4 leading-tight">
            Everything You Need
          </h2>

          <p className="text-muted max-w-2xl mx-auto text-lg">
            From selling your old textbooks to checking hostel vacancies — we've
            got campus covered.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-3 gap-8 lg:gap-10">
          <FeatureCard
            icon={ShoppingBag}
            title="Student Marketplace"
            description="List and browse pre-owned items from fellow students. Books, electronics, dorm gear and more."
            delay={0}
          />

          <FeatureCard
            icon={Building2}
            title="Hostel Directory"
            description="Explore all campus hostels, check amenities, occupancy rates and warden contacts."
            delay={150}
          />

          <FeatureCard
            icon={Users}
            title="Community Driven"
            description="Built by students, for students. Connect directly with sellers and hostel management."
            delay={300}
          />
        </div>
      </div>
    </section>
  );
}