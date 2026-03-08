const Input = ({ className = "", ...props }) => {
  return (
    <input
      className={`w-full border border-gray-300 rounded-xl2 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-primary ${className}`}
      {...props}
    />
  );
};

export default Input;