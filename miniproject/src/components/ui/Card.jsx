const Card = ({ children, className = "", hover = true }) => {
  return (
    <div
      className={`bg-white rounded-2xl p-6 sm:p-8 border border-gray-100 shadow-card transition-all duration-300 ${
        hover ? "hover:shadow-elevated hover:border-primary/30 hover:-translate-y-1" : ""
      } ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;