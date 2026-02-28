interface TablePaginationProps {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    startIndex: number;
    itemsPerPage: number;
    onPageChange: (page: number) => void;
    onItemsPerPageChange?: (perPage: number) => void;
    itemsPerPageOptions?: number[];
}

/**
 * Reusable pagination footer for data tables.
 * Supports optional items-per-page selector.
 */
export const TablePagination = ({
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    itemsPerPage,
    onPageChange,
    onItemsPerPageChange,
    itemsPerPageOptions = [5, 10],
}: TablePaginationProps) => {
    const showEnd = Math.min(startIndex + itemsPerPage, totalItems);

    return (
        <footer className="flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-[#151a25] border-t border-[#2d3648]">
            <p className="text-slate text-xs">
                Showing{" "}
                <span className="font-medium text-[#cbd5e1]">{totalItems === 0 ? 0 : startIndex + 1}</span>{" "}
                to{" "}
                <span className="font-medium text-[#cbd5e1]">{showEnd}</span>{" "}
                of{" "}
                <span className="font-medium text-[#cbd5e1]">{totalItems}</span> results
            </p>

            <div className="flex items-center gap-3">
                {onItemsPerPageChange && (
                    <div className="flex items-center gap-1.5">
                        <span className="text-slate text-xs">Per page:</span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
                            className="px-2 py-1 bg-[#101622] rounded border border-[#2d3648] text-xs text-white focus:outline-none focus:border-blue cursor-pointer"
                        >
                            {itemsPerPageOptions.map((n) => (
                                <option key={n} value={n}>
                                    {n}
                                </option>
                            ))}
                        </select>
                    </div>
                )}

                <nav className="flex items-center gap-2" aria-label="Pagination">
                    <button
                        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-3 py-1 rounded border border-[#2d3648] font-medium text-[#94a3b8] text-xs hover:bg-[#2d3648] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages || totalPages === 0}
                        className="px-3 py-1 rounded border border-[#2d3648] font-medium text-[#94a3b8] text-xs hover:bg-[#2d3648] transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                        Next
                    </button>
                </nav>
            </div>
        </footer>
    );
};
