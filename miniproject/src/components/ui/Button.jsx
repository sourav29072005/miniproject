const Button = ({
  children,
  variant = "primary",
  className = "",
  ...props
}) => {
  const base =
    "px-4 py-2 rounded-xl2 font-medium transition duration-200";

  const variants = {
    primary:
      "bg-primary text-white hover:bg-primaryDark",
    secondary:
      "bg-secondary text-white hover:opacity-90",
    outline:
      "border border-primary text-primary hover:bg-primary hover:text-white",
    danger:
      "bg-danger text-white hover:opacity-90",
  };

  return (
    <button
      className={`${base} ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;