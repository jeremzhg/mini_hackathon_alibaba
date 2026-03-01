import { Download } from "lucide-react";
import { PageHeader } from "./ui/PageHeader";
import { TransactionTable } from "./TransactionTable";
import { TRANSACTIONS } from "../data/transactions";

// ── Component ──────────────────────────────────────────────────────────

export const TransactionSection = () => {
    const totalSpend = TRANSACTIONS.filter(
        (t) => t.status !== "Blocked"
    ).reduce((sum, t) => sum + Math.abs(parseFloat(t.amount.replace(/[^0-9.-]/g, ""))), 0);

    const handleExport = () => {
        const headers = ["ID", "Description", "Category", "Date", "Time", "Amount", "Status"];
        const rows = TRANSACTIONS.map((t) =>
            [t.id, t.description, t.category, t.timestamp, t.time, t.amount, t.status].join(",")
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
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#2d3648] text-slate text-sm hover:bg-[#2d3648] hover:text-white transition-colors cursor-pointer"
                >
                    <Download className="w-4 h-4" />
                    Export
                </button>
            </PageHeader>

            {/* Summary Cards */}
            <div className="flex flex-wrap gap-4">
                <div className="flex-1 min-w-[200px] flex flex-col gap-2 p-5 bg-darkish-grey rounded-xl border border-dark-border">
                    <span className="text-slate text-sm font-medium">Total Spend</span>
                    <span className="text-red-400 text-2xl font-bold">
                        -${totalSpend.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="flex-1 min-w-[200px] flex flex-col gap-2 p-5 bg-darkish-grey rounded-xl border border-dark-border">
                    <span className="text-slate text-sm font-medium">Blocked Transactions</span>
                    <span className="text-yellow-400 text-2xl font-bold">
                        {TRANSACTIONS.filter((t) => t.status === "Blocked").length}
                    </span>
                </div>
            </div>

            {/* Shared Transaction Table */}
            <div className="pb-8">
                <TransactionTable
                    data={TRANSACTIONS}
                    defaultPerPage={5}
                    showStatusFilter
                    showPerPageSelector
                />
            </div>
        </>
    );
};
