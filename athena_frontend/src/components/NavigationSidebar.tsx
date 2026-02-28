import React from 'react';
import { PanelLeftClose, PanelLeft } from 'lucide-react';

export interface NavigationItem {
    id: string;
    label: string;
    icon: React.ReactNode;
}

interface NavigationSidebarProps {
    logo: React.ReactNode;
    items: NavigationItem[];
    activeItemId: string;
    onNavigate: (id: string) => void;
    collapsed: boolean;
    onToggle: () => void;
}

export const NavigationSidebar: React.FC<NavigationSidebarProps> = ({
    logo,
    items,
    activeItemId,
    onNavigate,
    collapsed,
    onToggle,
}) => {
    return (
        <aside
            className={`flex flex-col min-h-screen items-start justify-between bg-dark border-r border-dark-border transition-all duration-300 ${collapsed ? "w-[72px]" : "w-72"
                }`}
            aria-label="Main navigation"
        >
            <div className="flex flex-col items-start gap-6 px-3 py-6 self-stretch w-full flex-1">
                {/* Logo + Collapse toggle */}
                <div className="flex items-center justify-between gap-2.5 px-3 py-2 w-full">
                    {collapsed ? (
                        /* When collapsed: logo is a button that expands the sidebar */
                        <button
                            onClick={onToggle}
                            className="flex items-center justify-center w-full cursor-pointer"
                            aria-label="Expand sidebar"
                        >
                            {logo}
                        </button>
                    ) : (
                        /* When expanded: logo + text, with collapse button */
                        <>
                            <div className="flex items-center gap-2 overflow-hidden">
                                {logo}
                                <span className="font-semibold text-2xl text-white tracking-widest whitespace-nowrap">
                                    Athena
                                </span>
                            </div>
                            <button
                                onClick={onToggle}
                                className="text-slate hover:text-white transition-colors cursor-pointer shrink-0"
                                aria-label="Collapse sidebar"
                            >
                                <PanelLeftClose className="w-5 h-5" />
                            </button>
                        </>
                    )}
                </div>

                {/* Navigation items */}
                <nav className="flex flex-col items-start gap-2 self-stretch w-full">
                    {items.map((item) => {
                        const isActive = activeItemId === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => onNavigate(item.id)}
                                title={collapsed ? item.label : undefined}
                                className={`flex items-center gap-3 p-3 self-stretch w-full rounded-lg transition-colors duration-200 cursor-pointer ${isActive ? "bg-blue hover:bg-blue-hover" : "bg-transparent hover:bg-dark-border"
                                    } ${collapsed ? "justify-center" : ""}`}
                                aria-current={isActive ? "page" : undefined}
                            >
                                <div className="relative w-6 h-6 flex items-center justify-center text-current shrink-0" aria-hidden="true">
                                    {item.icon}
                                </div>

                                {!collapsed && (
                                    <span
                                        className={`font-medium text-base whitespace-nowrap ${isActive ? "text-white" : "text-slate"
                                            }`}
                                    >
                                        {item.label}
                                    </span>
                                )}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Empty area click zone + expand button (only when collapsed) */}
            {collapsed && (
                <button
                    onClick={onToggle}
                    className="flex items-center justify-center px-3 py-5 self-stretch w-full border-t border-dark-border text-slate hover:text-white hover:bg-dark-border/50 transition-colors cursor-pointer"
                    aria-label="Expand sidebar"
                >
                    <PanelLeft className="w-5 h-5" />
                </button>
            )}
        </aside>
    );
};
