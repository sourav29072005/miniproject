const Card = ({ children, className = "" }) => {
  return (
    <div
      className={`bg-white shadow-card rounded-xl2 p-6 ${className}`}
    >
      {children}
    </div>
  );
};

export default Card;