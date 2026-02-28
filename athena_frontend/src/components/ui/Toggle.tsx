interface ToggleProps {
    enabled: boolean;
    onChange: () => void;
    label: string;
}

/**
 * Reusable toggle switch with label.
 * Used in Settings (2FA, notifications) and AI Agents (enable/disable).
 */
export const Toggle = ({ enabled, onChange, label }: ToggleProps) => (
    <button
        onClick={onChange}
        className="flex items-center gap-3 cursor-pointer group"
        aria-label={label}
    >
        <div
            className={`relative w-11 h-6 rounded-full transition-colors ${enabled ? "bg-blue" : "bg-[#2d3648]"
                }`}
        >
            <div
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${enabled ? "translate-x-5" : ""
                    }`}
            />
        </div>
        <span className="text-sm text-slate group-hover:text-white transition-colors">
            {label}
        </span>
    </button>
);
