import React from 'react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    icon?: React.ReactNode;
    wrapperClassName?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = '', wrapperClassName = '', icon, ...props }, ref) => {
        return (
            <div className={`flex items-center gap-3 px-4 h-12 w-full bg-darkish-grey rounded-lg border border-dark-border focus-within:border-blue focus-within:ring-1 focus-within:ring-blue transition-all ${wrapperClassName}`}>
                {icon && <div className="text-slate flex-shrink-0">{icon}</div>}
                <input
                    ref={ref}
                    className={`flex-1 w-full bg-transparent border-none outline-none text-white placeholder:text-slate text-sm ${className}`}
                    {...props}
                />
            </div>
        );
    }
);

Input.displayName = 'Input';

