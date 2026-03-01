/**
 * API service layer for the Athena frontend.
 * Provides typed fetch wrappers for all backend endpoints.
 */

const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://localhost:8000/api";

// ── Backend Types ──────────────────────────────────────────────────────

export interface ApiCategory {
    id: number;
    name: string;
    initial_limit: number;
    remaining_budget: number;
    domains: string[];
}

export interface ApiHistoryItem {
    id: number;
    user_task: string;
    active_account_category: string;
    transaction_amount: number;
    decision: "ALLOW" | "BLOCK";
    timestamp: string;
}

export interface InterceptRequest {
    user_task: string;
    active_account_category: string;
    transaction_amount: number;
}

export interface InterceptResponse {
    decision: "ALLOW" | "BLOCK";
    extracted_data: {
        target_domain: string;
        purchase_nature: string;
    };
    context_verification: {
        account_category: string;
        is_context_valid: boolean;
        context_reasoning: string;
    };
    whitelist_verification: {
        is_domain_approved: boolean;
        whitelist_reasoning: string;
    };
    limit_verification: {
        initial_limit: number;
        remaining_budget: number;
    };
    security_summary: string;
}

// ── Dashboard UI Types (derived from API data) ─────────────────────────

export interface DashboardStat {
    id: string;
    title: string;
    value: string;
    subtitle: string;
    subtitleColor: "emerald" | "red" | "slate";
    iconType: "server" | "search" | "shield" | "bot";
    trend?: "up" | "down" | "neutral";
}

export interface ChartDataPoint {
    time: string;
    allowed: number;
    blocked: number;
}

export interface DashboardData {
    stats: DashboardStat[];
    chartData: ChartDataPoint[];
}

// ── Generic fetch wrapper ──────────────────────────────────────────────

async function apiClient<T>(
    endpoint: string,
    options?: RequestInit
): Promise<T> {
    const url = `${API_BASE_URL}${endpoint}`;

    const response = await fetch(url, {
        headers: {
            "Content-Type": "application/json",
            ...options?.headers,
        },
        ...options,
    });

    if (!response.ok) {
        const errorBody = await response.text().catch(() => "");
        throw new Error(
            `API error: ${response.status} ${response.statusText}${errorBody ? ` — ${errorBody}` : ""}`
        );
    }

    return response.json() as Promise<T>;
}

// ── Category endpoints ─────────────────────────────────────────────────

export async function getCategories(): Promise<ApiCategory[]> {
    return apiClient<ApiCategory[]>("/v1/categories");
}

export async function createCategory(
    name: string,
    limit: number,
    domains: string[] = []
): Promise<{ status: string; category: string; limit: number; message: string }> {
    return apiClient("/v1/categories", {
        method: "POST",
        body: JSON.stringify({ name, limit, domains }),
    });
}

export async function updateCategoryDomains(
    categoryName: string,
    domains: string[]
): Promise<{ status: string; category: string; message: string }> {
    return apiClient(`/v1/categories/${encodeURIComponent(categoryName)}`, {
        method: "PUT",
        body: JSON.stringify({ domains }),
    });
}

// ── Intercept endpoint ─────────────────────────────────────────────────

export async function postIntercept(
    request: InterceptRequest
): Promise<InterceptResponse> {
    return apiClient<InterceptResponse>("/v1/intercept", {
        method: "POST",
        body: JSON.stringify(request),
    });
}

// ── History endpoint ───────────────────────────────────────────────────

export async function getHistory(): Promise<ApiHistoryItem[]> {
    return apiClient<ApiHistoryItem[]>("/v1/history");
}

// ── Dashboard data (derived from real endpoints) ───────────────────────

export async function getDashboardData(): Promise<DashboardData> {
    const [categories, history] = await Promise.all([
        getCategories(),
        getHistory(),
    ]);

    // Compute stats from real data
    const totalSpent = categories.reduce(
        (sum, c) => sum + (c.initial_limit - c.remaining_budget),
        0
    );
    const totalTransactions = history.length;
    const blockedCount = history.filter((h) => h.decision === "BLOCK").length;
    const activeCategories = categories.length;

    const stats: DashboardStat[] = [
        {
            id: "monthly-spend",
            title: "Monthly Spend",
            value: `$${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
            subtitle: `Across ${activeCategories} categories`,
            subtitleColor: totalSpent > 0 ? "red" : "slate",
            iconType: "server",
        },
        {
            id: "transactions-scanned",
            title: "Transactions Scanned",
            value: totalTransactions.toLocaleString(),
            subtitle: `${totalTransactions} total intercepts`,
            subtitleColor: "emerald",
            iconType: "search",
        },
        {
            id: "blocked-transactions",
            title: "Blocked Transactions",
            value: blockedCount.toString(),
            subtitle: "Over limit or unauthorized",
            subtitleColor: blockedCount > 0 ? "red" : "slate",
            iconType: "shield",
        },
        {
            id: "active-categories",
            title: "Active Categories",
            value: activeCategories.toString(),
            subtitle: "Budget tracking active",
            subtitleColor: "slate",
            iconType: "bot",
        },
    ];

    // Build chart data — group history by hour
    const hourBuckets: Record<string, { allowed: number; blocked: number }> = {};
    for (let h = 0; h < 24; h += 2) {
        const label = `${h.toString().padStart(2, "0")}:00`;
        hourBuckets[label] = { allowed: 0, blocked: 0 };
    }

    for (const item of history) {
        const date = new Date(item.timestamp);
        const hourSlot = Math.floor(date.getHours() / 2) * 2;
        const label = `${hourSlot.toString().padStart(2, "0")}:00`;
        if (hourBuckets[label]) {
            if (item.decision === "ALLOW") hourBuckets[label].allowed++;
            else hourBuckets[label].blocked++;
        }
    }

    const chartData: ChartDataPoint[] = Object.entries(hourBuckets).map(
        ([time, counts]) => ({ time, ...counts })
    );

    return { stats, chartData };
}

// ── Auth endpoints ─────────────────────────────────────────────────────

export interface AuthResponse {
    status: string;
    user_id: number;
    email: string;
    name: string;
    message: string;
}

export async function login(
    email: string,
    password: string
): Promise<AuthResponse> {
    return apiClient<AuthResponse>("/v1/auth/login", {
        method: "POST",
        body: JSON.stringify({ email, password }),
    });
}

export async function signup(
    email: string,
    password: string,
    name: string = ""
): Promise<AuthResponse> {
    return apiClient<AuthResponse>("/v1/auth/signup", {
        method: "POST",
        body: JSON.stringify({ email, password, name }),
    });
}

// ── Category delete/patch ──────────────────────────────────────────────

export async function deleteCategory(
    categoryName: string
): Promise<{ status: string; message: string }> {
    return apiClient(`/v1/categories/${encodeURIComponent(categoryName)}`, {
        method: "DELETE",
    });
}

export async function patchCategory(
    categoryName: string,
    updates: { name?: string; limit?: number }
): Promise<{
    status: string;
    category: string;
    initial_limit: number;
    remaining_budget: number;
    message: string;
}> {
    return apiClient(
        `/v1/categories/${encodeURIComponent(categoryName)}`,
        {
            method: "PATCH",
            body: JSON.stringify(updates),
        }
    );
}

// ── Settings endpoints ─────────────────────────────────────────────────

export interface ProfileData {
    name: string;
    email: string;
    timezone: string;
    two_fa_enabled: boolean;
    session_timeout: number;
    email_notifications: boolean;
    threat_alerts: boolean;
    weekly_report: boolean;
    agent_status_alerts: boolean;
    api_key: string;
}

export async function getProfile(): Promise<ProfileData> {
    return apiClient<ProfileData>("/v1/settings/profile");
}

export async function updateProfile(
    updates: Partial<Omit<ProfileData, "api_key">>
): Promise<{ status: string; message: string }> {
    return apiClient("/v1/settings/profile", {
        method: "PUT",
        body: JSON.stringify(updates),
    });
}

export async function changePassword(
    currentPassword: string,
    newPassword: string
): Promise<{ status: string; message: string }> {
    return apiClient("/v1/settings/password", {
        method: "PUT",
        body: JSON.stringify({
            current_password: currentPassword,
            new_password: newPassword,
        }),
    });
}

export async function regenerateApiKey(): Promise<{
    status: string;
    api_key: string;
}> {
    return apiClient("/v1/settings/api-key/regenerate", {
        method: "POST",
    });
}
