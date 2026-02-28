interface PageHeaderProps {
    title: string;
    subtitle: string;
    children?: React.ReactNode;
}

/**
 * Consistent page header used across all dashboard pages.
 * Optional children slot for action buttons (e.g. "Deploy Agent", "Export").
 */
export const PageHeader = ({ title, subtitle, children }: PageHeaderProps) => (
    <div className="flex flex-wrap items-center justify-between gap-4">
        <header className="flex flex-col gap-1">
            <h1 className="font-bold text-white text-2xl">{title}</h1>
            <p className="text-slate text-sm">{subtitle}</p>
        </header>
        {children}
    </div>
);
