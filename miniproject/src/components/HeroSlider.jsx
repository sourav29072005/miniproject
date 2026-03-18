import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const HeroSlider = ({ slides = [] }) => {
  const [current, setCurrent] = useState(0);
  const [parallaxOffset, setParallaxOffset] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [slides.length]);

  // Handle parallax effect on mouse move
  useEffect(() => {
    const handleMouseMove = (e) => {
      const { clientY } = e;
      const windowHeight = window.innerHeight;
      const offset = (clientY / windowHeight) * 30;
      setParallaxOffset(offset);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Handle parallax effect on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setParallaxOffset(scrollY * 0.5);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const prev = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const next = () => setCurrent((prev) => (prev + 1) % slides.length);

  return (
    <div className="relative w-full h-[420px] md:h-[520px] lg:h-[700px] overflow-hidden bg-secondary">
      {slides.map((slide, index) => (
        <div
          key={index}
          className={`absolute w-full h-full transition-opacity duration-1000 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        >
          {/* Parallax Image Layer */}
          <div
            className="absolute inset-0 overflow-hidden"
            style={{
              transform: `translateY(${parallaxOffset * 0.3}px)`,
            }}
          >
            <img
              src={slide.image}
              alt="Campus"
              className="w-full h-full object-cover scale-110 transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* Gradient Overlays */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />

          {/* Animated Text Content */}
          <div className={`absolute bottom-12 left-4 sm:left-8 md:left-12 lg:left-16 text-white max-w-2xl drop-shadow-xl transition-all duration-700 transform ${
            index === current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}>
            <div className="mb-2 inline-block px-4 py-1 rounded-full bg-primary/80 backdrop-blur-sm">
              <span className="text-sm font-semibold">CEV Campus</span>
            </div>
            <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-3 leading-tight">
              {slide.title}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-100 max-w-lg">
              {slide.subtitle}
            </p>
          </div>
        </div>
      ))}

      {/* Navigation Buttons */}
      <button
        onClick={prev}
        className="absolute left-4 md:left-8 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Previous slide"
      >
        <ChevronLeft size={28} />
      </button>

      <button
        onClick={next}
        className="absolute right-4 md:right-8 top-1/2 transform -translate-y-1/2 z-10 bg-white/20 hover:bg-white/40 backdrop-blur-sm text-white p-3 rounded-full transition-all duration-300 hover:scale-110"
        aria-label="Next slide"
      >
        <ChevronRight size={28} />
      </button>

      {/* Enhanced Dots Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-3 z-10">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrent(index)}
            className={`transition-all duration-300 rounded-full ${
              index === current
                ? "bg-white w-8 h-2 shadow-lg"
                : "bg-white/40 hover:bg-white/70 w-2 h-2"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Slide Counter */}
      <div className="absolute top-6 right-6 z-10 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white font-semibold">
        {current + 1} / {slides.length}
      </div>
    </div>
  );
};

export default HeroSlider;