const Button = ({
  children,
  variant = "primary",
  className = "",
  size = "md",
  ...props
}) => {
  const base =
    "font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer border-none";

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-5 py-2.5 text-base",
    lg: "px-6 py-3 text-lg",
  };

  const variants = {
    primary:
      "bg-gradient-primary text-white shadow-md hover:shadow-hover hover:-translate-y-1 active:translate-y-0",
    secondary:
      "bg-secondary text-white hover:bg-opacity-90 shadow-md hover:shadow-lg hover:-translate-y-1",
    outline:
      "border-2 border-primary text-primary hover:bg-primary hover:text-white hover:shadow-lg hover:-translate-y-1 active:translate-y-0",
    danger:
      "bg-danger text-white hover:shadow-md hover:-translate-y-1 active:translate-y-0",
    light:
      "bg-binary/10 text-primary hover:bg-primary/20 hover:-translate-y-1",
  };

  return (
    <button
      className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;