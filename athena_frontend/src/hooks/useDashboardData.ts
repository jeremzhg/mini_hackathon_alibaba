import { useState, useEffect, useCallback } from "react";
import {
    getDashboardData,
    getHistory,
    type DashboardStat,
    type ChartDataPoint,
    type TimeRange,
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

export function useDashboardData(timeRange: TimeRange = "24h"): UseDashboardDataReturn {
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
                getDashboardData(timeRange),
                getHistory(),
            ]);
            setStats(dashData.stats);
            setChartData(dashData.chartData);
            setTransactions(history.map(item => {
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
            }));
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load dashboard data"
            );
        } finally {
            setIsLoading(false);
        }
    }, [timeRange]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { stats, chartData, transactions, isLoading, error, refetch: fetchData };
}
