import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, ShieldCheck, Wallet, Bot, Settings, Cpu } from "lucide-react";
import { NavigationSidebar } from "./NavigationSidebar";
import type { NavigationItem } from "./NavigationSidebar";

const navigationItems: NavigationItem[] = [
    {
        id: "dashboard",
        label: "Dashboard",
        icon: <LayoutDashboard className="w-5 h-5" />,
    },
    {
        id: "whitelist",
        label: "Whitelist",
        icon: <ShieldCheck className="w-5 h-5" />,
    },
    {
        id: "transaction",
        label: "Transaction",
        icon: <Wallet className="w-5 h-5" />,
    },
    {
        id: "ai-agents",
        label: "AI Agents",
        icon: <Bot className="w-5 h-5" />,
    },
    {
        id: "settings",
        label: "Settings",
        icon: <Settings className="w-5 h-5" />,
    },
];

export const Sidebar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [collapsed, setCollapsed] = useState(false);

    const currentPath = location.pathname.replace("/", "") || "dashboard";
    const activeItem = navigationItems.some(item => item.id === currentPath)
        ? currentPath
        : "dashboard";

    const handleNavigate = (id: string) => {
        navigate(`/${id}`);
    };

    return (
        <NavigationSidebar
            logo={<Cpu className="w-8 h-8 text-blue" />}
            items={navigationItems}
            activeItemId={activeItem}
            onNavigate={handleNavigate}
            collapsed={collapsed}
            onToggle={() => setCollapsed(!collapsed)}
        />
    );
};
