import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { User, Mail, Lock, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";
import campus3 from "../assets/campus/campus3.jpg";
import logo from "../assets/logo.png";

function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { refreshUser } = useAuth();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    if (!email.endsWith("@cev.ac.in")) {
      setError("Registration restricted to @cev.ac.in emails only");
      setLoading(false);
      return;
    }

    try {
      const response = await api.post("auth/register", {
        name,
        email,
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem("user", JSON.stringify({ ...user, token }));

      // Synchronize AuthContext immediately
      refreshUser();

      setSuccess("Account created successfully! Preparing your profile...");
      setTimeout(() => {
        navigate("/setup-profile");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left side: Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-primaryDark">
        <img src={campus3} alt="Campus Registration" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-primary/60 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white w-full">
          <img src={logo} alt="CEV Connect Logo" className="w-24 h-24 object-contain mb-8 cursor-pointer drop-shadow-2xl bg-white rounded-2xl p-2" onClick={() => navigate("/")} />
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">Join the <br /><span className="text-amber-300">CEV Community.</span></h1>
          <p className="text-lg text-blue-50 max-w-md font-medium leading-relaxed">Create your free account to trade items safely, discover verified accommodations, and stay deeply connected with your campus.</p>
        </div>
      </div>

      {/* Right side: Registration Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-hidden">
        {/* Subtle decorative blob */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-amber-50 rounded-full filter blur-3xl opacity-50 z-0 pointer-events-none animate-pulse-soft"></div>

        <div className="w-full max-w-md animate-fade-in relative z-10">
          <div className="lg:hidden flex items-center gap-3 mb-8 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="CEV Connect Logo" className="w-12 h-12 object-contain drop-shadow-md bg-white rounded-xl p-1" />
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">CEV Connect</span>
          </div>

          <div className="text-center lg:text-left mb-8">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Create Account</h2>
            <p className="text-gray-500 font-medium text-lg">Sign up with your college email.</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-slide-up">
              <ShieldAlert className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 font-semibold text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3 animate-slide-up">
              <CheckCircle2 className="text-green-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-green-700 font-semibold text-sm">{success}</p>
            </div>
          )}

          <form onSubmit={handleRegister} className="space-y-5">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 tracking-wider uppercase drop-shadow-sm">Full Name</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <User size={22} strokeWidth={2.5} />
                </div>
                <input
                  type="text"
                  placeholder="e.g. John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-primary transition-all outline-none text-gray-900 font-bold placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-500 tracking-wider uppercase drop-shadow-sm">College Email</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Mail size={22} strokeWidth={2.5} />
                </div>
                <input
                  type="email"
                  placeholder="e.g. john@cev.ac.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-primary transition-all outline-none text-gray-900 font-bold placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 tracking-wider uppercase drop-shadow-sm">Password</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-primary transition-all outline-none text-gray-900 font-bold placeholder-gray-400 tracking-widest text-sm"
                    required
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 tracking-wider uppercase drop-shadow-sm whitespace-nowrap">Confirm</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                    <Lock size={18} strokeWidth={2.5} />
                  </div>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full pl-10 pr-3 py-3.5 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-primary transition-all outline-none text-gray-900 font-bold placeholder-gray-400 tracking-widest text-sm"
                    required
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primaryDark text-white py-4.8 rounded-2xl font-extrabold text-xl shadow-elevated transition-transform transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-3 mt-8"
            >
              {loading ? "Creating Account..." : <>Sign Up <ArrowRight size={24} strokeWidth={3} /></>}
            </button>
          </form>

          <p className="mt-10 text-center text-gray-500 font-medium">
            Already have an account?{" "}
            <Link to="/login" className="text-primary hover:text-primaryDark font-extrabold transition-colors">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;