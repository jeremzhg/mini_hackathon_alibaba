import { useState } from "react";
import { Eye, EyeOff, Cpu } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

export const LoginPage = () => {
    const navigate = useNavigate();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Sign in with:", { email, password });
        navigate("/dashboard");
    };

    const handleGoogleSignIn = () => {
        console.log("Continue with Google");
    };

    return (
        <div className="flex min-h-screen bg-dark w-full overflow-hidden text-white font-sans">
            {/* Left Marketing Section */}
            <section className="hidden lg:flex flex-col relative flex-1 bg-[#0b0e14] border-r border-dark-border overflow-hidden">
                <div className="absolute inset-0 bg-[linear-gradient(124deg,rgba(19,91,236,0.2)_0%,rgba(11,14,20,1)_50%,rgba(11,14,20,1)_100%)] opacity-60 z-0" />
                <div className="absolute top-[-205px] -left-16 w-[500px] h-[500px] bg-[#135bec1a] rounded-full blur-[60px] z-0" />
                <div className="absolute inset-0 z-0 bg-dark opacity-50" />

                <div className="relative z-10 flex flex-col h-full p-12">
                    <header className="mb-auto flex items-center gap-2">
                        <Cpu className="w-8 h-8 text-blue" />
                        <span className="font-bold text-2xl tracking-widest text-white">Athena</span>
                    </header>

                    <div className="flex flex-col gap-6 max-w-xl self-start mt-auto">
                        <div className="inline-flex items-center gap-2 px-3 py-1.5 w-fit rounded-full border border-blue bg-dark/50 backdrop-blur-sm">
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-hover opacity-75" />
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-hover" />
                            </span>
                            <span className="font-semibold text-xs tracking-wide">Active Threat Monitoring</span>
                        </div>

                        <h2 className="text-4xl font-bold leading-tight mt-4">
                            Welcome back to{" "}
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue to-teal-400">
                                Athena
                            </span>
                            .
                        </h2>

                        <p className="text-slate text-lg leading-relaxed max-w-md">
                            Sign in to monitor your AI agents, review security alerts, and manage transaction policies.
                        </p>
                    </div>
                </div>
            </section>

            {/* Right Sign In Section */}
            <section className="flex flex-col flex-1 items-center justify-center p-8 lg:p-12 relative overflow-y-auto w-full">
                <div className="flex flex-col w-full max-w-md gap-8">
                    <header className="flex flex-col items-center gap-2 text-center">
                        <h1 className="font-bold text-3xl tracking-tight">Welcome Back</h1>
                        <p className="text-slate text-base">Secure your autonomous AI agents.</p>
                    </header>

                    <form className="flex flex-col gap-5 w-full" onSubmit={handleSubmit}>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium" htmlFor="login-email">
                                Email address
                            </label>
                            <Input
                                id="login-email"
                                type="email"
                                placeholder="admin@company.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                                <label className="text-sm font-medium" htmlFor="login-password">
                                    Password
                                </label>
                                <button
                                    type="button"
                                    className="text-blue text-xs font-medium hover:underline cursor-pointer"
                                >
                                    Forgot your password?
                                </button>
                            </div>
                            <div className="relative">
                                <Input
                                    id="login-password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    autoComplete="current-password"
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
                        </div>

                        <Button type="submit" className="w-full mt-2" size="lg">
                            Sign In
                        </Button>

                        <div className="flex items-center gap-4 py-2">
                            <hr className="flex-1 border-dark-border" />
                            <span className="text-slate text-xs font-medium uppercase tracking-wider">Or continue with</span>
                            <hr className="flex-1 border-dark-border" />
                        </div>

                        <Button type="button" variant="outline" className="w-full gap-3" size="lg" onClick={handleGoogleSignIn}>
                            <span className="font-bold text-lg mr-1 text-slate">G</span>
                            Continue with Google
                        </Button>
                    </form>

                    <footer className="text-center mt-4 text-sm text-slate">
                        Don't have an account?{" "}
                        <Link to="/signup" className="font-semibold text-blue hover:text-blue-hover transition-colors">
                            Sign Up here
                        </Link>
                    </footer>
                </div>
            </section>
        </div>
    );
};
