import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    icon?: React.ReactNode;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ className = '', icon, children, ...props }, ref) => {
        return (
            <div className="relative w-full">
                <select
                    ref={ref}
                    className={`appearance-none w-full bg-[#101622] text-white p-4 pr-10 rounded-lg border border-[#2d3442] focus:border-blue focus:ring-1 focus:ring-blue outline-none transition-all cursor-pointer ${className}`}
                    {...props}
                >
                    {children}
                </select>
                <div className="absolute right-4 top-1/2 transform -translate-y-1/2 pointer-events-none text-slate">
                    {icon || (
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="1.67" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    )}
                </div>
            </div>
        );
    }
);

Select.displayName = 'Select';

