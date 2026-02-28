import React from 'react';

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: 'success' | 'warning' | 'info' | 'default';
    dot?: boolean;
}

export const Badge = ({ className = '', variant = 'default', dot = false, children, ...props }: BadgeProps) => {
    const variants = {
        success: 'bg-[#10b9811a] border-[#10b98133] text-emerald-400',
        warning: 'bg-[#f59e0b1a] border-[#f59e0b33] text-amber-400',
        info: 'bg-[#1e3a8a4c] border-[#1e3a8a80] text-blue',
        default: 'bg-dark-border border-dark-border text-slate'
    };

    const dotColors = {
        success: 'bg-emerald-500',
        warning: 'bg-amber-500',
        info: 'bg-blue',
        default: 'bg-slate'
    };

    return (
        <div
            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-solid text-xs font-medium whitespace-nowrap ${variants[variant]} ${className}`}
            {...props}
        >
            {dot && (
                <div className={`w-1.5 h-1.5 rounded-full ${dotColors[variant]}`} />
            )}
            {children}
        </div>
    );
};

