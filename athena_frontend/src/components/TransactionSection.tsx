import { useState, useEffect, useCallback } from "react";
import { Download, Loader2 } from "lucide-react";
import { PageHeader } from "./ui/PageHeader";
import { TransactionTable } from "./TransactionTable";
import { getHistory, type ApiHistoryItem } from "../services/api";
import type { Transaction } from "../data/transactions";

// ── Map history to transaction ─────────────────────────────────────────

function historyToTransaction(item: ApiHistoryItem): Transaction {
    const isBlocked = item.decision === "BLOCK";
    return {
        id: `TXN-${item.id.toString().padStart(3, "0")}`,
        timestamp: item.timestamp.split("T")[0],
        time: item.timestamp.split("T")[1]?.slice(0, 8) ?? "",
        type: "outbound",
        description:
            item.user_task.length > 50
                ? item.user_task.slice(0, 50) + "…"
                : item.user_task,
        category: item.active_account_category,
        categoryColor: "bg-[#60a5fa]",
        amount: `-$${item.transaction_amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
        currency: "USD",
        status: isBlocked ? "Blocked" : "Allowed",
    };
}

// ── Component ──────────────────────────────────────────────────────────

export const TransactionSection = () => {
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchTransactions = useCallback(async () => {
        setIsLoading(true);
        try {
            const history = await getHistory();
            setTransactions(history.map(historyToTransaction));
        } catch (err) {
            console.error("Failed to load history:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchTransactions();
    }, [fetchTransactions]);

    const totalSpend = transactions
        .filter((t) => t.status !== "Blocked")
        .reduce(
            (sum, t) =>
                sum + Math.abs(parseFloat(t.amount.replace(/[^0-9.-]/g, ""))),
            0
        );

    const handleExport = () => {
        const headers = [
            "ID",
            "Description",
            "Category",
            "Date",
            "Time",
            "Amount",
            "Status",
        ];
        const rows = transactions.map((t) =>
            [
                t.id,
                t.description,
                t.category,
                t.timestamp,
                t.time,
                t.amount,
                t.status,
            ].join(",")
        );
        const csv = [headers.join(","), ...rows].join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `athena_transactions_${new Date().toISOString().slice(0, 10)}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    return (
        <>
            <PageHeader
                title="Transactions"
                subtitle="View and manage credit card spending activity."
            >
                <button
                    onClick={handleExport}
                    disabled={transactions.length === 0}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2d3648] text-slate text-sm hover:bg-[#2d3648] hover:text-white transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </PageHeader>

            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue animate-spin" />
                </div>
            ) : (
                <>
                    {/* Summary Cards */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px] flex flex-col gap-2 p-5 bg-darkish-grey rounded-xl border border-dark-border">
                            <span className="text-slate text-sm font-medium">
                                Total Spend
                            </span>
                            <span className="text-red-400 text-2xl font-bold">
                                -$
                                {totalSpend.toLocaleString("en-US", {
                                    minimumFractionDigits: 2,
                                })}
                            </span>
                        </div>
                        <div className="flex-1 min-w-[200px] flex flex-col gap-2 p-5 bg-darkish-grey rounded-xl border border-dark-border">
                            <span className="text-slate text-sm font-medium">
                                Blocked Transactions
                            </span>
                            <span className="text-yellow-400 text-2xl font-bold">
                                {
                                    transactions.filter(
                                        (t) => t.status === "Blocked"
                                    ).length
                                }
                            </span>
                        </div>
                    </div>

                    {/* Transaction Table */}
                    <div className="pb-8">
                        <TransactionTable
                            data={transactions}
                            defaultPerPage={5}
                            showStatusFilter
                            showPerPageSelector
                        />
                    </div>
                </>
            )}
        </>
    );
};
