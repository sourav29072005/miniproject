import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Building2, Users } from "lucide-react";

function FeatureCard({ icon: Icon, title, description, delay }) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

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

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`bg-white rounded-xl p-6 shadow-sm border 
      transform transition-all duration-1000
      hover:-translate-y-2 hover:shadow-lg duration-300
      ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-16"}`}
    >
      <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-gray-100 mb-4">
        <Icon size={24} className="text-primary" />
      </div>

      <h3 className="text-lg font-semibold mb-2 text-secondary">
        {title}
      </h3>

      <p className="text-muted text-sm">
        {description}
      </p>
    </div>
  );
}

export default function FeaturesSection() {
  return (
    <section className="py-20">
      <div className="text-center mb-14">
        <h2 className="text-3xl font-bold text-secondary mb-4">
          Everything You Need
        </h2>

        <p className="text-muted max-w-xl mx-auto">
          From selling your old textbooks to checking hostel vacancies — we've
          got campus covered.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
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
    </section>
  );
}