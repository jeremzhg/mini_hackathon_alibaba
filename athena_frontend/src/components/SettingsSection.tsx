import { useState, useEffect, useCallback } from "react";
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
    Loader2,
    Check,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Input } from "./ui/Input";
import { Button } from "./ui/Button";
import { Select } from "./ui/Select";
import { Toggle } from "./ui/Toggle";
import { PageHeader } from "./ui/PageHeader";
import {
    getProfile,
    updateProfile,
    changePassword,
    regenerateApiKey,
    type ProfileData,
} from "../services/api";

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

    // Profile state
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [timezone, setTimezone] = useState("utc+7");
    const [twoFaEnabled, setTwoFaEnabled] = useState(false);
    const [sessionTimeout, setSessionTimeout] = useState("30");
    const [emailNotifs, setEmailNotifs] = useState(true);
    const [threatAlerts, setThreatAlerts] = useState(true);
    const [weeklyReport, setWeeklyReport] = useState(false);
    const [agentStatusAlerts, setAgentStatusAlerts] = useState(true);
    const [apiKey, setApiKey] = useState("");
    const [showApiKey, setShowApiKey] = useState(false);

    // UI state
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [passwordModal, setPasswordModal] = useState(false);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [passwordError, setPasswordError] = useState("");
    const [passwordSuccess, setPasswordSuccess] = useState("");
    const [isChangingPassword, setIsChangingPassword] = useState(false);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [copied, setCopied] = useState(false);

    const loadProfile = useCallback(async () => {
        setIsLoading(true);
        try {
            const profile: ProfileData = await getProfile();
            setName(profile.name);
            setEmail(profile.email);
            setTimezone(profile.timezone);
            setTwoFaEnabled(profile.two_fa_enabled);
            setSessionTimeout(profile.session_timeout.toString());
            setEmailNotifs(profile.email_notifications);
            setThreatAlerts(profile.threat_alerts);
            setWeeklyReport(profile.weekly_report);
            setAgentStatusAlerts(profile.agent_status_alerts);
            setApiKey(profile.api_key);
        } catch (err) {
            console.error("Failed to load profile:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadProfile();
    }, [loadProfile]);

    const handleSave = async () => {
        setIsSaving(true);
        setSaveSuccess(false);
        try {
            await updateProfile({
                name,
                email,
                timezone,
                two_fa_enabled: twoFaEnabled,
                session_timeout: parseInt(sessionTimeout),
                email_notifications: emailNotifs,
                threat_alerts: threatAlerts,
                weekly_report: weeklyReport,
                agent_status_alerts: agentStatusAlerts,
            });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 2000);
        } catch (err) {
            console.error("Failed to save profile:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChangePassword = async () => {
        if (newPassword.length < 8) {
            setPasswordError("New password must be at least 8 characters");
            return;
        }
        setIsChangingPassword(true);
        setPasswordError("");
        setPasswordSuccess("");
        try {
            await changePassword(currentPassword, newPassword);
            setPasswordSuccess("Password changed successfully!");
            setCurrentPassword("");
            setNewPassword("");
            setTimeout(() => {
                setPasswordModal(false);
                setPasswordSuccess("");
            }, 1500);
        } catch (err) {
            setPasswordError("Current password is incorrect");
        } finally {
            setIsChangingPassword(false);
        }
    };

    const handleRegenerateKey = async () => {
        setIsRegenerating(true);
        try {
            const result = await regenerateApiKey();
            setApiKey(result.api_key);
        } catch (err) {
            console.error("Failed to regenerate API key:", err);
        } finally {
            setIsRegenerating(false);
        }
    };

    const handleCopyKey = () => {
        navigator.clipboard.writeText(apiKey);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
    };

    const handleLogout = () => {
        navigate("/login");
    };

    if (isLoading) {
        return (
            <>
                <PageHeader title="Settings" subtitle="Configure your account and credit card preferences." />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue animate-spin" />
                </div>
            </>
        );
    }

    return (
        <>
            <PageHeader
                title="Settings"
                subtitle="Configure your account and credit card preferences."
            >
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="border-red-500/30! text-red-400! hover:bg-red-500/10!"
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
                                src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${name || "User"}`}
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
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : saveSuccess ? (
                                <Check className="w-4 h-4 mr-2 text-emerald-400" />
                            ) : (
                                <Save className="w-4 h-4 mr-2" />
                            )}
                            {saveSuccess ? "Saved!" : "Save Changes"}
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
                        <Button variant="outline" className="w-fit" onClick={() => setPasswordModal(true)}>
                            Change Password
                        </Button>
                    </div>
                </SettingsCard>

                {/* Password Modal */}
                {passwordModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setPasswordModal(false)} />
                        <div className="relative w-full max-w-md p-6 bg-dark rounded-2xl border border-dark-border shadow-2xl flex flex-col gap-5">
                            <h2 className="font-bold text-white text-lg">Change Password</h2>
                            <div className="flex flex-col gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-white" htmlFor="current-pw">Current Password</label>
                                    <Input id="current-pw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-sm font-medium text-white" htmlFor="new-pw">New Password</label>
                                    <Input id="new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="At least 8 characters" />
                                </div>
                                {passwordError && <p className="text-red-400 text-sm">{passwordError}</p>}
                                {passwordSuccess && <p className="text-emerald-400 text-sm">{passwordSuccess}</p>}
                            </div>
                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button variant="outline" onClick={() => setPasswordModal(false)}>Cancel</Button>
                                <Button onClick={handleChangePassword} disabled={isChangingPassword || !currentPassword || !newPassword}>
                                    {isChangingPassword ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
                                    Change Password
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

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
                                        {showApiKey ? apiKey : "•".repeat(Math.min(apiKey.length, 30))}
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
                                        onClick={handleCopyKey}
                                        className="p-3 rounded-lg border border-[#2d3648] text-slate hover:text-white hover:bg-[#2d3648] transition-colors cursor-pointer"
                                        aria-label="Copy API key"
                                    >
                                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>
                        </div>
                        <Button variant="outline" className="w-fit" onClick={handleRegenerateKey} disabled={isRegenerating}>
                            {isRegenerating ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                            Regenerate Key
                        </Button>
                    </div>
                </SettingsCard>
            </div>
        </>
    );
};
