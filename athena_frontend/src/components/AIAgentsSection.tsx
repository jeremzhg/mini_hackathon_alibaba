import { useState } from "react";
import {
    Bot,
    Plus,
    Activity,
    Shield,
    Zap,
    Clock,
    Power,
    PowerOff,
} from "lucide-react";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { PageHeader } from "./ui/PageHeader";

// ── Types ──────────────────────────────────────────────────────────────

interface AIAgent {
    id: string;
    name: string;
    type: string;
    status: "Active" | "Paused" | "Error";
    lastActive: string;
    threatsBlocked: number;
    transactionsScanned: number;
    uptime: string;
    color: string;
}

// ── Dummy Data ──────────────────────────────────────────────────────────

const INITIAL_AGENTS: AIAgent[] = [
    {
        id: "agent-alpha",
        name: "Agent-Alpha",
        type: "Transaction Monitor",
        status: "Active",
        lastActive: "Just now",
        threatsBlocked: 12,
        transactionsScanned: 842,
        uptime: "99.97%",
        color: "bg-[#60a5fa]",
    },
    {
        id: "agent-beta",
        name: "Agent-Beta",
        type: "Threat Detector",
        status: "Active",
        lastActive: "2 min ago",
        threatsBlocked: 47,
        transactionsScanned: 1203,
        uptime: "99.99%",
        color: "bg-purple-400",
    },
    {
        id: "agent-gamma",
        name: "Agent-Gamma",
        type: "Anomaly Scanner",
        status: "Paused",
        lastActive: "15 min ago",
        threatsBlocked: 3,
        transactionsScanned: 156,
        uptime: "95.20%",
        color: "bg-yellow-400",
    },
];

const AGENT_TYPES = ["Transaction Monitor", "Threat Detector", "Anomaly Scanner", "Compliance Auditor"];
const COLORS = ["bg-[#60a5fa]", "bg-purple-400", "bg-yellow-400", "bg-emerald-400", "bg-pink-400"];

// ── Agent Card ──────────────────────────────────────────────────────────

const AgentCard = ({ agent }: { agent: AIAgent }) => {
    const [isEnabled, setIsEnabled] = useState(agent.status === "Active");

    return (
        <div className="flex flex-col gap-5 p-6 bg-darkish-grey rounded-xl border border-dark-border shadow-sm hover:border-[#3d4d6d] transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#ffffff0a]">
                        <Bot className="w-5 h-5 text-blue" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{agent.name}</span>
                            <div className={`w-2 h-2 rounded-full ${agent.color}`} />
                        </div>
                        <span className="text-slate text-xs">{agent.type}</span>
                    </div>
                </div>
                <Badge
                    variant={agent.status === "Active" ? "success" : agent.status === "Paused" ? "warning" : "default"}
                    dot
                >
                    {agent.status}
                </Badge>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-3 gap-4">
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-slate">
                        <Shield className="w-3.5 h-3.5" />
                        <span className="text-xs">Threats Blocked</span>
                    </div>
                    <span className="text-white font-semibold text-lg">{agent.threatsBlocked}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-slate">
                        <Activity className="w-3.5 h-3.5" />
                        <span className="text-xs">Scanned</span>
                    </div>
                    <span className="text-white font-semibold text-lg">{agent.transactionsScanned.toLocaleString()}</span>
                </div>
                <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1 text-slate">
                        <Zap className="w-3.5 h-3.5" />
                        <span className="text-xs">Uptime</span>
                    </div>
                    <span className="text-white font-semibold text-lg">{agent.uptime}</span>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                <div className="flex items-center gap-1.5 text-slate text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    Last active: {agent.lastActive}
                </div>
                <button
                    onClick={() => setIsEnabled(!isEnabled)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${isEnabled
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-[#ffffff0a] text-slate hover:bg-[#ffffff15]"
                        }`}
                >
                    {isEnabled ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                    {isEnabled ? "Running" : "Paused"}
                </button>
            </div>
        </div>
    );
};

// ── Main Component ──────────────────────────────────────────────────────

export const AIAgentsSection = () => {
    const [agents, setAgents] = useState<AIAgent[]>(INITIAL_AGENTS);
    const [showModal, setShowModal] = useState(false);
    const [newAgentName, setNewAgentName] = useState("");
    const [newAgentType, setNewAgentType] = useState(AGENT_TYPES[0]);

    const handleDeploy = () => {
        if (!newAgentName.trim()) return;
        const newAgent: AIAgent = {
            id: `agent-${Date.now()}`,
            name: newAgentName.trim(),
            type: newAgentType,
            status: "Active",
            lastActive: "Just now",
            threatsBlocked: 0,
            transactionsScanned: 0,
            uptime: "100.00%",
            color: COLORS[agents.length % COLORS.length],
        };
        setAgents([...agents, newAgent]);
        setNewAgentName("");
        setNewAgentType(AGENT_TYPES[0]);
        setShowModal(false);
    };

    return (
        <>
            <PageHeader
                title="AI Agents"
                subtitle="Monitor and configure your autonomous security agents."
            >
                <Button onClick={() => setShowModal(true)}>
                    <Plus className="w-5 h-5 mr-2" />
                    Deploy Agent
                </Button>
            </PageHeader>

            {/* Deploy Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowModal(false)} />
                    <div className="relative w-full max-w-md p-6 bg-dark rounded-2xl border border-dark-border shadow-2xl flex flex-col gap-5">
                        <h2 className="font-bold text-white text-lg">Deploy New Agent</h2>
                        <div className="flex flex-col gap-4">
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-white" htmlFor="agent-name">Agent Name</label>
                                <Input
                                    id="agent-name"
                                    value={newAgentName}
                                    onChange={(e) => setNewAgentName(e.target.value)}
                                    placeholder="e.g., Agent-Delta"
                                />
                            </div>
                            <div className="flex flex-col gap-2">
                                <label className="text-sm font-medium text-white" htmlFor="agent-type">Agent Type</label>
                                <Select id="agent-type" value={newAgentType} onChange={(e) => setNewAgentType(e.target.value)}>
                                    {AGENT_TYPES.map((type) => (
                                        <option key={type} value={type}>{type}</option>
                                    ))}
                                </Select>
                            </div>
                        </div>
                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => setShowModal(false)}>Cancel</Button>
                            <Button onClick={handleDeploy} disabled={!newAgentName.trim()}>
                                <Plus className="w-4 h-4 mr-2" />
                                Deploy
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Summary Stats */}
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[180px] flex items-center gap-3 p-4 bg-darkish-grey rounded-xl border border-dark-border">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10">
                        <Activity className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate text-xs">Active Agents</span>
                        <span className="text-white font-bold text-xl">{agents.filter((a) => a.status === "Active").length}</span>
                    </div>
                </div>
                <div className="flex-1 min-w-[180px] flex items-center gap-3 p-4 bg-darkish-grey rounded-xl border border-dark-border">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10">
                        <Shield className="w-5 h-5 text-red-400" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate text-xs">Total Threats Blocked</span>
                        <span className="text-white font-bold text-xl">{agents.reduce((s, a) => s + a.threatsBlocked, 0)}</span>
                    </div>
                </div>
                <div className="flex-1 min-w-[180px] flex items-center gap-3 p-4 bg-darkish-grey rounded-xl border border-dark-border">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue/10">
                        <Zap className="w-5 h-5 text-blue" />
                    </div>
                    <div className="flex flex-col">
                        <span className="text-slate text-xs">Avg Uptime</span>
                        <span className="text-white font-bold text-xl">98.39%</span>
                    </div>
                </div>
            </div>

            {/* Agent Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                {agents.map((agent) => (
                    <AgentCard key={agent.id} agent={agent} />
                ))}
            </div>
        </>
    );
};
