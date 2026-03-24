import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from "../api";
import { useAuth } from "../context/AuthContext";
import { Mail, Lock, ArrowRight, ShieldAlert } from "lucide-react";
import campus2 from "../assets/campus/campus2.jpg";
import logo from "../assets/logo.png";

function Login() {
  const { refreshUser } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("auth/login", {
        email: email.trim(),
        password,
      });

      const { token, user } = response.data;
      localStorage.setItem("user", JSON.stringify({ ...user, token }));
      refreshUser();

      if (user.role === "user" && !user.department) {
        navigate("/setup-profile");
      } else {
        navigate("/");
      }
    } catch (err) {
      const errorData = err.response?.data;
      let errorMessage = "Login failed. Please check your credentials.";

      if (errorData?.banned) {
        errorMessage = `Account Banned: ${errorData?.banReason || "Contact support."}`;
      } else {
        errorMessage = errorData?.error || errorMessage;
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50 font-sans">
      {/* Left side: Image/Branding (Hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[45%] relative overflow-hidden bg-primary">
        <img src={campus2} alt="Campus Login" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-primaryDark/80 to-transparent"></div>
        <div className="relative z-10 flex flex-col justify-end p-16 h-full text-white w-full">
          <img src={logo} alt="CEV Connect Logo" className="w-24 h-24 object-contain mb-8 cursor-pointer drop-shadow-2xl bg-white rounded-2xl p-2" onClick={() => navigate("/")} />
          <h1 className="text-5xl font-extrabold tracking-tight leading-tight mb-6">Welcome back to <br /><span className="text-blue-300">CEV Connect.</span></h1>
          <p className="text-lg text-blue-100/90 max-w-md font-medium leading-relaxed">Login to access the exclusive campus marketplace, secure verified hostels, and connect with your peers safely.</p>
        </div>
      </div>

      {/* Right side: Login Form */}
      <div className="w-full lg:w-[55%] flex items-center justify-center p-8 sm:p-12 lg:p-24 relative overflow-hidden">
        {/* Subtle decorative blob */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-50 rounded-full filter blur-3xl opacity-50 z-0 pointer-events-none animate-pulse-soft"></div>

        <div className="w-full max-w-md animate-fade-in relative z-10">
          <div className="lg:hidden flex items-center gap-3 mb-10 cursor-pointer" onClick={() => navigate("/")}>
            <img src={logo} alt="CEV Connect Logo" className="w-12 h-12 object-contain drop-shadow-md bg-white rounded-xl p-1" />
            <span className="text-3xl font-extrabold text-gray-900 tracking-tight">CEV Connect</span>
          </div>

          <div className="text-center lg:text-left mb-10">
            <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight mb-3">Sign in</h2>
            <p className="text-gray-500 font-medium text-lg">Enter your details below to continue</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3 animate-slide-up">
              <ShieldAlert className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
              <p className="text-red-700 font-semibold text-sm">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
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
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-primary transition-all outline-none text-gray-900 font-bold placeholder-gray-400"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-500 tracking-wider uppercase drop-shadow-sm">Password</label>
                <button type="button" className="text-sm font-bold text-primary hover:text-primaryDark transition-colors">Forgot password?</button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400">
                  <Lock size={22} strokeWidth={2.5} />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-white border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-primary transition-all outline-none text-gray-900 font-bold placeholder-gray-400 tracking-widest"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary hover:bg-primaryDark text-white py-4.8 rounded-2xl font-extrabold text-xl shadow-elevated transition-transform transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:hover:translate-y-0 flex items-center justify-center gap-3 mt-8"
            >
              {loading ? "Signing in..." : <>Sign In <ArrowRight size={24} strokeWidth={3} /></>}
            </button>
          </form>

          <p className="mt-12 text-center text-gray-500 font-medium">
            Don't have an account?{" "}
            <Link to="/register" className="text-primary hover:text-primaryDark font-extrabold transition-colors">
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;