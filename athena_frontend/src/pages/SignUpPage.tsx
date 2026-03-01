import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Eye, EyeOff, CreditCard } from "lucide-react";
import { GiSpartanHelmet } from "react-icons/gi";

import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export const SignUpPage = () => {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!fullName.trim()) newErrors.fullName = "Full name is required";
    if (!email.match(/^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/)) {
      newErrors.email = "Please enter a valid email address";
    }
    if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (validate()) {
      console.log("Form submitted:", { fullName, email, password });
      navigate("/dashboard");
    }
  };

  const handleGoogleRegister = () => {
    console.log("Register with Google clicked");
  };

  return (
    <div className="flex min-h-screen bg-dark w-full overflow-hidden text-white font-sans">
      {/* Left Marketing Section */}
      <section className="hidden lg:flex flex-col relative flex-1 bg-[#0b0e14] border-r border-dark-border overflow-hidden">
        {/* Full background image */}
        <div className="absolute inset-0 z-0">
          <img
            src="/auth-bg.png"
            alt=""
            className="w-full h-full object-cover opacity-60"
          />
        </div>
        {/* Bottom gradient so text is readable */}
        <div className="absolute inset-0 z-[1] bg-gradient-to-t from-[#0b0e14] via-[#0b0e14]/60 to-transparent" />

        {/* Content */}
        <div className="relative z-10 flex flex-col h-full p-12">
          <header className="mb-auto flex items-center gap-2">
            <GiSpartanHelmet className="w-8 h-8 text-blue" />
            <span className="font-bold text-2xl tracking-widest text-white">Athena</span>
          </header>

          <div className="flex flex-col gap-6 max-w-xl self-start mt-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 w-fit rounded-full border border-blue bg-dark/50 backdrop-blur-sm">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-hover opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-hover"></span>
              </span>
              <span className="font-semibold text-xs tracking-wide">Live Spending Protection</span>
            </div>

            <h2 className="text-4xl font-bold leading-tight mt-4">
              Control your spending with{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue to-teal-400">
                AI-powered limits
              </span>
              .
            </h2>

            <p className="text-slate text-lg leading-relaxed max-w-md">
              Athena monitors your credit card usage in real-time, enforcing category budgets and blocking unauthorized transactions before they go through.
            </p>
          </div>
        </div>
      </section>

      {/* Right Sign Up Section */}
      <section className="flex flex-col flex-1 items-center justify-center p-8 lg:p-12 relative overflow-y-auto w-full">
        <div className="flex flex-col w-full max-w-md gap-8">
          <header className="flex flex-col items-center gap-2 text-center">
            {/* Mobile-only logo */}
            <div className="flex items-center gap-2 mb-4 lg:hidden">
              <GiSpartanHelmet className="w-8 h-8 text-blue" />
              <span className="font-bold text-2xl tracking-widest">Athena</span>
            </div>
            <h1 className="font-bold text-3xl tracking-tight">Create your Account</h1>
            <p className="text-slate text-base">Start protecting your credit card spending today.</p>
          </header>

          <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="full-name">
                Full Name
              </label>
              <Input
                id="full-name"
                type="text"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value);
                  if (errors.fullName) setErrors({ ...errors, fullName: "" });
                }}
                required
                autoComplete="name"
              />
              {errors.fullName && <span className="text-red-500 text-xs">{errors.fullName}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="email">
                Email address
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@company.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: "" });
                }}
                required
                autoComplete="email"
              />
              {errors.email && <span className="text-red-500 text-xs">{errors.email}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium" htmlFor="password">
                Create Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors({ ...errors, password: "" });
                  }}
                  required
                  minLength={8}
                  autoComplete="new-password"
                  className="pr-10"
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate hover:text-white transition-colors"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5 opacity-70 hover:opacity-100" />
                  ) : (
                    <Eye className="w-5 h-5 opacity-70 hover:opacity-100" />
                  )}
                </button>
              </div>
              {errors.password && <span className="text-red-500 text-xs">{errors.password}</span>}
            </div>

            <Button type="submit" className="w-full mt-2" size="lg">
              <CreditCard className="w-5 h-5 mr-2" />
              Create Account
            </Button>

            <div className="flex items-center gap-4 py-2">
              <hr className="flex-1 border-dark-border" />
              <span className="text-slate text-xs font-medium uppercase tracking-wider">Or register with</span>
              <hr className="flex-1 border-dark-border" />
            </div>

            <Button type="button" variant="outline" className="w-full gap-3" size="lg" onClick={handleGoogleRegister}>
              <span className="font-bold text-lg mr-1 text-slate">G</span>
              Register with Google
            </Button>
          </form>

          <footer className="text-center mt-4 text-sm text-slate">
            Already have an account?{" "}
            <Link to="/login" className="font-semibold text-blue hover:text-blue-hover transition-colors">
              Log in here
            </Link>
          </footer>
        </div>
      </section>
    </div>
  );
};
