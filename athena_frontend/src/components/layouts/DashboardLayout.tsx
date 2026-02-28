import { Outlet } from "react-router-dom";
import { Sidebar } from "../Sidebar";

/**
 * Shared layout route for all authenticated dashboard pages.
 * Rendered once via React Router layout route, so Sidebar never remounts
 * across page navigation — collapsed state persists.
 */
export const DashboardLayout = () => {
    return (
        <div className="flex h-screen bg-[#0b0e14] overflow-hidden text-white font-sans w-full">
            <Sidebar />
            <main className="flex flex-col flex-1 px-6 py-8 gap-6 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};
