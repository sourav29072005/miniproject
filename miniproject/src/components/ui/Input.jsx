const Input = ({ 
  className = "", 
  error = false,
  label,
  icon: Icon,
  ...props 
}) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-secondary mb-2">
          {label}
        </label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted pointer-events-none" />
        )}
        <input
          className={`w-full border rounded-lg px-4 py-2.5 transition-all duration-300 focus:outline-none ${
            Icon ? "pl-10" : ""
          } ${
            error
              ? "border-danger focus:ring-2 focus:ring-danger/20 focus:border-danger"
              : "border-gray-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
          } ${className}`}
          {...props}
        />
      </div>
      {error && typeof error === "string" && (
        <p className="text-danger text-xs mt-1.5 font-medium">{error}</p>
      )}
    </div>
  );
};

export default Input;