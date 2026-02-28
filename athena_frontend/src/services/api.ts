/**
 * API service layer for the Athena frontend.
 * Provides typed fetch wrappers for all backend endpoints.
 * Currently uses dummy data via Promise.resolve() since no backend exists,
 * but the HTTP request structure is ready to swap in.
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// ── Types ──────────────────────────────────────────────────────────────

export interface DashboardStat {
    id: string;
    title: string;
    value: string;
    subtitle: string;
    subtitleColor: "emerald" | "red" | "slate";
    iconType: "server" | "search" | "shield" | "bot";
    trend?: "up" | "down" | "neutral";
}

export interface Interception {
    id: string;
    timestamp: string;
    time: string;
    agentId: string;
    agentColor: string;
    targetDomain: string;
    category: string;
    status: "ALLOW" | "BLOCK";
}

export interface ChartDataPoint {
    time: string;
    allowed: number;
    blocked: number;
}

export interface DashboardData {
    stats: DashboardStat[];
    interceptions: Interception[];
    chartData: ChartDataPoint[];
}

// ── Generic fetch wrapper ──────────────────────────────────────────────

async function apiClient<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    try {
        const response = await fetch(url, {
            headers: {
                "Content-Type": "application/json",
                ...options?.headers,
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`API error: ${response.status} ${response.statusText}`);
        }

        return response.json() as Promise<T>;
    } catch (error) {
        // In development with no backend, fall back to dummy data
        console.warn(`API call to ${endpoint} failed, using fallback data:`, error);
        throw error;
    }
}

// ── Dummy data ─────────────────────────────────────────────────────────

const DUMMY_STATS: DashboardStat[] = [
    {
        id: "system-status",
        title: "System Status",
        value: "Operational",
        subtitle: "99.99% Uptime",
        subtitleColor: "emerald",
        iconType: "server",
        trend: "up",
    },
    {
        id: "transactions-scanned",
        title: "Transactions Scanned (24h)",
        value: "1,492",
        subtitle: "+12% vs yesterday",
        subtitleColor: "emerald",
        iconType: "search",
        trend: "up",
    },
    {
        id: "threats-intercepted",
        title: "Threats Intercepted",
        value: "18",
        subtitle: "High Severity",
        subtitleColor: "red",
        iconType: "shield",
    },
    {
        id: "active-agents",
        title: "Active AI Agents",
        value: "3",
        subtitle: "Monitoring Active",
        subtitleColor: "slate",
        iconType: "bot",
    },
];

const DUMMY_INTERCEPTIONS: Interception[] = [
    {
        id: "1",
        timestamp: "2023-10-27",
        time: "10:45:00",
        agentId: "Agent-Alpha",
        agentColor: "bg-[#60a5fa]",
        targetDomain: "stripe.com",
        category: "Payment",
        status: "ALLOW",
    },
    {
        id: "2",
        timestamp: "2023-10-27",
        time: "10:42:15",
        agentId: "Agent-Beta",
        agentColor: "bg-purple-400",
        targetDomain: "suspicious-site.xyz",
        category: "Phishing",
        status: "BLOCK",
    },
    {
        id: "3",
        timestamp: "2023-10-27",
        time: "10:30:22",
        agentId: "Agent-Alpha",
        agentColor: "bg-[#60a5fa]",
        targetDomain: "aws.amazon.com",
        category: "Infrastructure",
        status: "ALLOW",
    },
    {
        id: "4",
        timestamp: "2023-10-27",
        time: "10:15:00",
        agentId: "Agent-Gamma",
        agentColor: "bg-yellow-400",
        targetDomain: "unknown-api.io",
        category: "Data Exfil",
        status: "BLOCK",
    },
    {
        id: "5",
        timestamp: "2023-10-27",
        time: "09:58:33",
        agentId: "Agent-Alpha",
        agentColor: "bg-[#60a5fa]",
        targetDomain: "github.com",
        category: "Development",
        status: "ALLOW",
    },
    {
        id: "6",
        timestamp: "2023-10-27",
        time: "09:45:12",
        agentId: "Agent-Beta",
        agentColor: "bg-purple-400",
        targetDomain: "malware-c2.net",
        category: "Malware",
        status: "BLOCK",
    },
    {
        id: "7",
        timestamp: "2023-10-26",
        time: "23:12:44",
        agentId: "Agent-Gamma",
        agentColor: "bg-yellow-400",
        targetDomain: "slack.com",
        category: "Communication",
        status: "ALLOW",
    },
    {
        id: "8",
        timestamp: "2023-10-26",
        time: "22:01:09",
        agentId: "Agent-Alpha",
        agentColor: "bg-[#60a5fa]",
        targetDomain: "crypto-drain.xyz",
        category: "Fraud",
        status: "BLOCK",
    },
];

const DUMMY_CHART_DATA: ChartDataPoint[] = [
    { time: "00:00", allowed: 45, blocked: 8 },
    { time: "02:00", allowed: 32, blocked: 5 },
    { time: "04:00", allowed: 28, blocked: 3 },
    { time: "06:00", allowed: 52, blocked: 7 },
    { time: "08:00", allowed: 95, blocked: 12 },
    { time: "10:00", allowed: 128, blocked: 18 },
    { time: "12:00", allowed: 142, blocked: 15 },
    { time: "14:00", allowed: 118, blocked: 22 },
    { time: "16:00", allowed: 135, blocked: 14 },
    { time: "18:00", allowed: 98, blocked: 10 },
    { time: "20:00", allowed: 72, blocked: 6 },
    { time: "22:00", allowed: 55, blocked: 4 },
    { time: "23:59", allowed: 48, blocked: 3 },
];

// ── API functions ──────────────────────────────────────────────────────

export async function getDashboardData(): Promise<DashboardData> {
    try {
        return await apiClient<DashboardData>("/dashboard");
    } catch {
        // Simulate a network delay for realistic loading states
        await new Promise((resolve) => setTimeout(resolve, 600));
        return {
            stats: DUMMY_STATS,
            interceptions: DUMMY_INTERCEPTIONS,
            chartData: DUMMY_CHART_DATA,
        };
    }
}

export async function getDashboardStats(): Promise<DashboardStat[]> {
    try {
        return await apiClient<DashboardStat[]>("/dashboard/stats");
    } catch {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return DUMMY_STATS;
    }
}

export async function getInterceptions(): Promise<Interception[]> {
    try {
        return await apiClient<Interception[]>("/dashboard/interceptions");
    } catch {
        await new Promise((resolve) => setTimeout(resolve, 400));
        return DUMMY_INTERCEPTIONS;
    }
}

export async function getChartData(): Promise<ChartDataPoint[]> {
    try {
        return await apiClient<ChartDataPoint[]>("/dashboard/chart");
    } catch {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return DUMMY_CHART_DATA;
    }
}
