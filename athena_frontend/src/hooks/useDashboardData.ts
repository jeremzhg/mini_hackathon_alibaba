import { useState, useEffect, useCallback } from "react";
import {
    getDashboardData,
    type DashboardStat,
    type Interception,
    type ChartDataPoint,
} from "../services/api";

interface UseDashboardDataReturn {
    stats: DashboardStat[];
    interceptions: Interception[];
    chartData: ChartDataPoint[];
    isLoading: boolean;
    error: string | null;
    refetch: () => void;
}

export function useDashboardData(): UseDashboardDataReturn {
    const [stats, setStats] = useState<DashboardStat[]>([]);
    const [interceptions, setInterceptions] = useState<Interception[]>([]);
    const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            const data = await getDashboardData();
            setStats(data.stats);
            setInterceptions(data.interceptions);
            setChartData(data.chartData);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    return { stats, interceptions, chartData, isLoading, error, refetch: fetchData };
}
