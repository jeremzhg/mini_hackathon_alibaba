import { useState } from "react";
import {
    User,
    Shield,
    Bell,
    Key,
    Save,
    Eye,
    EyeOff,
    Copy,
    RefreshCw,
    LogOut,
    Camera,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { Toggle } from "./ui/Toggle";
import { PageHeader } from "./ui/PageHeader";

// ── Section Wrapper ────────────────────────────────────────────────────

const SettingsCard = ({
    icon,
    title,
    description,
    children,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    children: React.ReactNode;
}) => (
    <section className="flex flex-col gap-6 p-4 sm:p-6 bg-darkish-grey rounded-xl border border-dark-border shadow-sm">
        <div className="flex items-center gap-3 pb-4 border-b border-dark-border">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#ffffff0a] shrink-0">{icon}</div>
            <div className="flex flex-col min-w-0">
                <h2 className="font-bold text-white text-base">{title}</h2>
                <p className="text-slate text-xs">{description}</p>
            </div>
        </div>
        {children}
    </section>
);

// ── Main Component ──────────────────────────────────────────────────────

export const SettingsSection = () => {
    const navigate = useNavigate();
    const [name, setName] = useState("John Doe");
    const [email, setEmail] = useState("johndoe@gmail.com");
    const [timezone, setTimezone] = useState("utc+7");
    const [twoFaEnabled, setTwoFaEnabled] = useState(true);
    const [sessionTimeout, setSessionTimeout] = useState("30");
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [threatAlerts, setThreatAlerts] = useState(true);
    const [weeklyReport, setWeeklyReport] = useState(false);
    const [agentStatusAlerts, setAgentStatusAlerts] = useState(true);
    const [showApiKey, setShowApiKey] = useState(false);

    const apiKey = "ak_live_a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6";

    const handleLogout = () => {
        navigate("/login");
    };

    return (
        <>
            <PageHeader
                title="Settings"
                subtitle="Configure your Athena account and preferences."
            >
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="!border-red-500/30 !text-red-400 hover:!bg-red-500/10"
                >
                    <LogOut className="w-4 h-4 mr-2" />
                    Log Out
                </Button>
            </PageHeader>

            <div className="flex flex-col gap-6">
                {/* Profile */}
                <SettingsCard
                    icon={<User className="w-5 h-5 text-blue" />}
                    title="Profile"
                    description="Manage your account information"
                >
                    {/* Avatar + Name */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="relative group">
                            <img
                                className="w-20 h-20 rounded-full object-cover border-2 border-dark-border"
                                alt="Profile picture"
                                src="https://api.dicebear.com/7.x/avataaars/svg?seed=John"
                            />
                            <button
                                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                                aria-label="Change avatar"
                            >
                                <Camera className="w-5 h-5 text-white" />
                            </button>
                        </div>
                        <div className="flex flex-col gap-0.5">
                            <span className="text-white font-semibold text-lg">{name}</span>
                            <span className="text-slate text-sm">{email}</span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white" htmlFor="settings-name">Display Name</label>
                            <Input id="settings-name" value={name} onChange={(e) => setName(e.target.value)} />
                        </div>
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white" htmlFor="settings-email">Email</label>
                            <Input id="settings-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                        </div>
                    </div>
                    <div className="flex flex-col gap-2 max-w-xs">
                        <label className="text-sm font-medium text-white" htmlFor="settings-timezone">Timezone</label>
                        <Select id="settings-timezone" value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                            <option value="utc-8">UTC-8 (Pacific)</option>
                            <option value="utc-5">UTC-5 (Eastern)</option>
                            <option value="utc+0">UTC+0 (London)</option>
                            <option value="utc+7">UTC+7 (Jakarta)</option>
                            <option value="utc+8">UTC+8 (Singapore)</option>
                            <option value="utc+9">UTC+9 (Tokyo)</option>
                        </Select>
                    </div>
                    <div className="flex justify-end">
                        <Button>
                            <Save className="w-4 h-4 mr-2" />
                            Save Changes
                        </Button>
                    </div>
                </SettingsCard>

                {/* Security */}
                <SettingsCard
                    icon={<Shield className="w-5 h-5 text-emerald-400" />}
                    title="Security"
                    description="Protect your account"
                >
                    <div className="flex flex-col gap-5">
                        <Toggle
                            enabled={twoFaEnabled}
                            onChange={() => setTwoFaEnabled(!twoFaEnabled)}
                            label="Two-Factor Authentication (2FA)"
                        />
                        <div className="flex flex-col gap-2 max-w-xs">
                            <label className="text-sm font-medium text-white" htmlFor="session-timeout">Session Timeout (minutes)</label>
                            <Select id="session-timeout" value={sessionTimeout} onChange={(e) => setSessionTimeout(e.target.value)}>
                                <option value="15">15 minutes</option>
                                <option value="30">30 minutes</option>
                                <option value="60">1 hour</option>
                                <option value="120">2 hours</option>
                            </Select>
                        </div>
                        <Button variant="outline" className="w-fit">
                            Change Password
                        </Button>
                    </div>
                </SettingsCard>

                {/* Notifications */}
                <SettingsCard
                    icon={<Bell className="w-5 h-5 text-yellow-400" />}
                    title="Notifications"
                    description="Choose what alerts you receive"
                >
                    <div className="flex flex-col gap-4">
                        <Toggle enabled={emailNotifs} onChange={() => setEmailNotifs(!emailNotifs)} label="Email Notifications" />
                        <Toggle enabled={threatAlerts} onChange={() => setThreatAlerts(!threatAlerts)} label="Real-time Threat Alerts" />
                        <Toggle enabled={weeklyReport} onChange={() => setWeeklyReport(!weeklyReport)} label="Weekly Security Report" />
                        <Toggle enabled={agentStatusAlerts} onChange={() => setAgentStatusAlerts(!agentStatusAlerts)} label="Agent Status Changes" />
                    </div>
                </SettingsCard>

                {/* API Keys */}
                <SettingsCard
                    icon={<Key className="w-5 h-5 text-purple-400" />}
                    title="API Keys"
                    description="Manage your API access credentials"
                >
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label className="text-sm font-medium text-white">Live API Key</label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                <div className="flex-1 flex items-center gap-3 px-4 h-12 bg-[#101622] rounded-lg border border-[#2d3648] font-mono text-sm text-slate overflow-hidden min-w-0">
                                    <span className="truncate">
                                        {showApiKey ? apiKey : "•".repeat(apiKey.length)}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <button
                                        onClick={() => setShowApiKey(!showApiKey)}
                                        className="p-3 rounded-lg border border-[#2d3648] text-slate hover:text-white hover:bg-[#2d3648] transition-colors cursor-pointer"
                                        aria-label={showApiKey ? "Hide API key" : "Show API key"}
                                    >
                                        {showApiKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                    </button>
                                    <button
                                        onClick={() => navigator.clipboard.writeText(apiKey)}
                                        className="p-3 rounded-lg border border-[#2d3648] text-slate hover:text-white hover:bg-[#2d3648] transition-colors cursor-pointer"
                                        aria-label="Copy API key"
                                    >
                                        <Copy className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="w-fit">
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Regenerate Key
                        </Button>
                    </div>
                </SettingsCard>
            </div>
        </>
    );
};
