import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'outline' | 'ghost';
    size?: 'default' | 'icon' | 'lg';
    children: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className = '', variant = 'primary', size = 'default', children, ...props }, ref) => {

        const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue focus:ring-offset-2 focus:ring-offset-dark disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            primary: "bg-blue hover:bg-blue-hover text-white",
            outline: "border border-dark-border hover:bg-darkish-grey text-white",
            ghost: "hover:bg-dark-border text-slate hover:text-white"
        };

        const sizes = {
            default: "h-12 px-6 py-3", // matches the 48px heights
            icon: "h-10 w-10 p-2",
            lg: "h-12 px-8 w-full"
        };

        return (
            <button
                ref={ref}
                className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }
);

Button.displayName = 'Button';

