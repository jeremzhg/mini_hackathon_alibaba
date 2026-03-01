import { useState, useEffect, useCallback } from "react";
import {
    getDashboardData,
    getHistory,
    type DashboardStat,
    type ChartDataPoint,
    type ApiHistoryItem,
} from "../services/api";
import type { Transaction } from "../data/transactions";

interface UseDashboardDataReturn {
    stats: DashboardStat[];
    chartData: ChartDataPoint[];
    transactions: Transaction[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

/** Map a backend history item to the UI Transaction type. */
function historyToTransaction(item: ApiHistoryItem): Transaction {
    const isBlocked = item.decision === "BLOCK";
    return {
        id: `TXN-${item.id.toString().padStart(3, "0")}`,
        timestamp: item.timestamp.split("T")[0],
        time: item.timestamp.split("T")[1]?.slice(0, 8) ?? "",
        type: "outbound",
        description: item.user_task.length > 50 ? item.user_task.slice(0, 50) + "…" : item.user_task,
        category: item.active_account_category,
        categoryColor: "bg-[#60a5fa]",
        amount: `-$${item.transaction_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        currency: "USD",
        status: isBlocked ? "Blocked" : "Allowed",
    };
}

export function useDashboardData(): UseDashboardDataReturn {
    const [stats, setStats] = useState<DashboardStat[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const [dashData, history] = await Promise.all([
                getDashboardData(),
                getHistory(),
            ]);
            setStats(dashData.stats);
            setChartData(dashData.chartData);
            setTransactions(history.map(historyToTransaction));
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load dashboard data"
            );
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { stats, chartData, transactions, isLoading, error, refetch: fetchData };
}
