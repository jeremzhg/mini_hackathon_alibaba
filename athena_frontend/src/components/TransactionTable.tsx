import { useState } from "react";
import { ArrowUpRight, ArrowDownLeft } from "lucide-react";
import { Badge } from "./ui/Badge";
import { SearchInput } from "./ui/SearchInput";
import { TablePagination } from "./ui/TablePagination";
import type { Transaction } from "../data/transactions";

// ── Helpers ─────────────────────────────────────────────────────────────

const getTypeIcon = (type: string) =>
    type === "inbound" ? (
        <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
    ) : (
        <ArrowUpRight className="w-4 h-4 text-red-400" />
    );

const getTypeClass = (type: string) =>
    type === "inbound" ? "bg-emerald-500/10" : "bg-red-500/10";

const getAmountClass = (type: string) =>
    type === "inbound" ? "text-emerald-400" : "text-red-400";

const getStatusVariant = (status: string) => {
    if (status === "Completed") return "success" as const;
    if (status === "Pending") return "warning" as const;
    return "default" as const;
};

// ── Props ───────────────────────────────────────────────────────────────

interface TransactionTableProps {
    /** Full transaction dataset to display */
    data: Transaction[];
    /** Default items per page */
    defaultPerPage?: number;
    /** Show search and filters bar */
    showFilters?: boolean;
    /** Show status filter dropdown */
    showStatusFilter?: boolean;
    /** Allow changing items per page (5 or 10) */
    showPerPageSelector?: boolean;
    /** Optional title for the section */
    title?: string;
}

// ── Component ───────────────────────────────────────────────────────────

export const TransactionTable = ({
    data,
    defaultPerPage = 5,
    showFilters = true,
    showStatusFilter = true,
    showPerPageSelector = true,
    title,
}: TransactionTableProps) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(defaultPerPage);

    const filteredData = data.filter((txn) => {
        const matchesSearch =
            txn.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.agent.toLowerCase().includes(searchQuery.toLowerCase()) ||
            txn.id.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus =
            statusFilter === "all" || txn.status.toLowerCase() === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleSearch = (value: string) => {
        setSearchQuery(value);
        setCurrentPage(1);
    };

    const handleStatusChange = (value: string) => {
        setStatusFilter(value);
        setCurrentPage(1);
    };

    const handlePerPageChange = (perPage: number) => {
        setItemsPerPage(perPage);
        setCurrentPage(1);
    };

    return (
        <section className="flex flex-col gap-4">
            {/* Optional title + filters bar */}
            {(title || showFilters) && (
                <div className="flex flex-wrap items-center justify-between gap-3">
                    {title && <h2 className="font-bold text-white text-lg">{title}</h2>}

                    {showFilters && (
                        <div className="flex flex-wrap items-center gap-2">
                            <SearchInput
                                value={searchQuery}
                                onChange={handleSearch}
                                placeholder="Search transactions..."
                            />
                            {showStatusFilter && (
                                <select
                                    value={statusFilter}
                                    onChange={(e) => handleStatusChange(e.target.value)}
                                    className="px-3 py-2 bg-[#101622] rounded-lg border border-[#2d3648] text-sm text-white focus:outline-none focus:border-blue transition-colors cursor-pointer"
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                </select>
                            )}
                        </div>
                    )}
                </div>
            )}

            {/* Table */}
            <div className="bg-darkish-grey rounded-xl border border-dark-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                        <thead>
                            <tr className="bg-[#151a25] border-b border-[#2d3648]">
                                <th className="text-left px-6 py-4 font-bold text-[#64748b] text-xs tracking-wider">
                                    TRANSACTION
                                </th>
                                <th className="text-left px-6 py-4 font-bold text-[#64748b] text-xs tracking-wider">
                                    AGENT
                                </th>
                                <th className="text-left px-6 py-4 font-bold text-[#64748b] text-xs tracking-wider">
                                    DATE
                                </th>
                                <th className="text-right px-6 py-4 font-bold text-[#64748b] text-xs tracking-wider">
                                    AMOUNT
                                </th>
                                <th className="text-right px-6 py-4 font-bold text-[#64748b] text-xs tracking-wider">
                                    STATUS
                                </th>

                            </tr>
                        </thead>
                        <tbody>
                            {paginatedData.map((txn, index) => (
                                <tr
                                    key={txn.id}
                                    className={`hover:bg-[#ffffff05] transition-colors ${index > 0 ? "border-t border-[#2d3648]" : ""
                                        }`}
                                >
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={`w-8 h-8 rounded-lg flex items-center justify-center ${getTypeClass(
                                                    txn.type
                                                )}`}
                                            >
                                                {getTypeIcon(txn.type)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-white text-sm font-medium">
                                                    {txn.description}
                                                </span>
                                                <span className="text-[#64748b] text-xs font-mono">
                                                    {txn.id}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <div
                                                className={`w-2 h-2 ${txn.agentColor} rounded-full`}
                                            />
                                            <span className="font-medium text-white text-sm">
                                                {txn.agent}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex flex-col">
                                            <span className="text-[#cbd5e1] text-sm">
                                                {txn.timestamp}
                                            </span>
                                            <span className="text-[#64748b] text-xs">{txn.time}</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <span
                                            className={`text-sm font-semibold ${getAmountClass(
                                                txn.type
                                            )}`}
                                        >
                                            {txn.amount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Badge variant={getStatusVariant(txn.status)} dot>
                                            {txn.status}
                                        </Badge>
                                    </td>

                                </tr>
                            ))}
                            {paginatedData.length === 0 && (
                                <tr>
                                    <td
                                        colSpan={5}
                                        className="px-6 py-12 text-center text-slate text-sm"
                                    >
                                        No transactions found matching your filters.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                <TablePagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredData.length}
                    startIndex={startIndex}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                    onItemsPerPageChange={showPerPageSelector ? handlePerPageChange : undefined}
                    itemsPerPageOptions={[5, 10]}
                />
            </div>
        </section>
    );
};
