import { Search } from "lucide-react";

interface SearchInputProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
}

/**
 * Reusable search input with icon, used across tables and filter bars.
 */
export const SearchInput = ({
    value,
    onChange,
    placeholder = "Search...",
    className = "w-64",
}: SearchInputProps) => (
    <div className={`relative ${className}`}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate" />
        <input
            className="w-full pl-9 pr-4 py-2 bg-[#101622] rounded-lg border border-[#2d3648] text-sm text-white placeholder:text-slate focus:outline-none focus:border-blue transition-colors"
            placeholder={placeholder}
            type="search"
            value={value}
            onChange={(e) => onChange(e.target.value)}
        />
    </div>
);
