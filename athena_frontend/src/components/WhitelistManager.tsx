import { useState } from "react";
import { Globe, Plus, Trash2, Cloud } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Badge } from "./ui/Badge";
import { PageHeader } from "./ui/PageHeader";
import { TablePagination } from "./ui/TablePagination";

interface WhitelistDomain {
    id: string;
    domain: string;
    status: "Active" | "Verify";
    dateAdded: string;
    icon: React.ReactNode;
}

export const WhitelistManagementSection = () => {
    const [domainInput, setDomainInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const aiAccounts = [
        { id: "cloud-infrastructure", name: "Cloud Infrastructure (ID: 8821-X)" },
        { id: "payment-gateway", name: "Payment Gateway (ID: 4192-A)" },
        { id: "data-processing", name: "Data Processing (ID: 2910-B)" },
    ];
    const [activeAccount, setActiveAccount] = useState("cloud-infrastructure");
    const itemsPerPage = 10;
    const [whitelistDomains, setWhitelistDomains] = useState<WhitelistDomain[]>([
        {
            id: "1",
            domain: "aws.amazon.com",
            status: "Active",
            dateAdded: "Oct 24, 2023",
            icon: <Cloud className="w-4 h-4" />,
        },
        {
            id: "2",
            domain: "alibabacloud.com",
            status: "Active",
            dateAdded: "Oct 22, 2023",
            icon: <Cloud className="w-4 h-4" />,
        },
        {
            id: "3",
            domain: "paylabs.co.id",
            status: "Verify",
            dateAdded: "Nov 01, 2023",
            icon: <Globe className="w-4 h-4" />,
        },
        {
            id: "4",
            domain: "paylabs.co.id",
            status: "Verify",
            dateAdded: "Nov 01, 2023",
            icon: <Globe className="w-4 h-4" />,
        },
        {
            id: "5",
            domain: "paylabs.co.id",
            status: "Verify",
            dateAdded: "Nov 01, 2023",
            icon: <Globe className="w-4 h-4" />,
        },
        {
            id: "6",
            domain: "paylabs.co.id",
            status: "Verify",
            dateAdded: "Nov 01, 2023",
            icon: <Globe className="w-4 h-4" />,
        },
        {
            id: "7",
            domain: "paylabs.co.id",
            status: "Verify",
            dateAdded: "Nov 01, 2023",
            icon: <Globe className="w-4 h-4" />,
        },
        {
            id: "8",
            domain: "paylabs.co.id",
            status: "Verify",
            dateAdded: "Nov 01, 2023",
            icon: <Globe className="w-4 h-4" />,
        },
    ]);

    const handleAddToWhitelist = () => {
        if (!domainInput.trim()) return;
        const newDomain: WhitelistDomain = {
            id: Date.now().toString(),
            domain: domainInput,
            status: "Verify",
            dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            icon: <Globe className="w-4 h-4" />,
        };
        setWhitelistDomains([...whitelistDomains, newDomain]);
        setDomainInput("");
    };

    const handleRemoveDomain = (domainId: string) => {
        setWhitelistDomains(whitelistDomains.filter((d) => d.id !== domainId));
    };

    const totalPages = Math.ceil(whitelistDomains.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDomains = whitelistDomains.slice(startIndex, startIndex + itemsPerPage);

    return (
        <>
            <PageHeader
                title="Whitelist Management"
                subtitle="Define strict domain access rules for your AI agents."
            />

            <div className="flex flex-col gap-8 w-full">
                {/* Configuration Scope */}
                <section className="flex flex-col gap-3">
                    <h2 className="font-medium text-slate text-sm tracking-wide uppercase">Configuration Scope</h2>
                    <div className="p-6 bg-darkish-grey rounded-xl border border-dark-border shadow-sm">
                        <div className="flex flex-col max-w-md gap-2">
                            <label htmlFor="ai-account-select" className="font-medium text-white text-sm">
                                Active AI Account
                            </label>
                            <Select id="ai-account-select" value={activeAccount} onChange={(e) => setActiveAccount(e.target.value)}>
                                {aiAccounts.map((account) => (
                                    <option key={account.id} value={account.id}>
                                        {account.name}
                                    </option>
                                ))}
                            </Select>
                            <p className="text-slate text-xs mt-1">Select the AI agent account context for these whitelist rules.</p>
                        </div>
                    </div>
                </section>

                {/* Add New Entry */}
                <section className="flex flex-col gap-3">
                    <h2 className="font-medium text-slate text-sm tracking-wide uppercase">Add New Entry</h2>
                    <div className="p-6 bg-darkish-grey rounded-xl border border-dark-border shadow-sm flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <label htmlFor="trusted-domain-input" className="font-medium text-white text-sm">
                                Trusted Domain
                            </label>
                            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                                <Input
                                    id="trusted-domain-input"
                                    value={domainInput}
                                    onChange={(e) => setDomainInput(e.target.value)}
                                    placeholder="e.g., paylabs.co.id"
                                    icon={<Globe className="w-5 h-5 text-slate" />}
                                    wrapperClassName="flex-1"
                                />
                                <Button onClick={handleAddToWhitelist} className="whitespace-nowrap">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add to Whitelist
                                </Button>
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-2 ml-1">
                            <label className="flex items-center gap-2 text-sm text-slate cursor-pointer hover:text-white transition-colors">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-dark-border bg-darkish-grey text-blue focus:ring-blue focus:ring-offset-dark focus:ring-2"
                                    defaultChecked
                                />
                                HTTPS Required
                            </label>
                            <label className="flex items-center gap-2 text-sm text-slate cursor-pointer hover:text-white transition-colors">
                                <input
                                    type="checkbox"
                                    className="w-4 h-4 rounded border-dark-border bg-darkish-grey text-blue focus:ring-blue focus:ring-offset-dark focus:ring-2"
                                    defaultChecked
                                />
                                Subdomains Included
                            </label>
                        </div>
                    </div>
                </section>

                {/* Active Whitelist */}
                <section className="flex flex-col gap-3 pb-8">
                    <div className="flex items-center gap-3">
                        <h2 className="font-medium text-slate text-sm tracking-wide uppercase">Active Whitelist</h2>
                        <span className="px-2 py-0.5 rounded-full bg-blue/10 text-blue text-xs font-semibold">
                            {whitelistDomains.length} active domains
                        </span>
                    </div>

                    <div className="flex flex-col bg-darkish-grey rounded-xl border border-dark-border shadow-sm overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-[550px]">
                                <thead>
                                    <tr className="bg-[#10162280] border-b border-dark-border">
                                        <th className="text-left px-6 py-4 font-bold text-[#cbd5e1] text-xs tracking-wider">DOMAIN NAME</th>
                                        <th className="text-left px-6 py-4 font-bold text-[#cbd5e1] text-xs tracking-wider">STATUS</th>
                                        <th className="text-left px-6 py-4 font-bold text-[#cbd5e1] text-xs tracking-wider">DATE ADDED</th>
                                        <th className="text-right px-6 py-4 font-bold text-[#cbd5e1] text-xs tracking-wider">ACTIONS</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {paginatedDomains.map((domain, index) => (
                                        <tr
                                            key={domain.id}
                                            className={`hover:bg-[#ffffff05] transition-colors ${index > 0 ? "border-t border-dark-border" : ""}`}
                                        >
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-8 h-8 rounded bg-[#ffffff1a] text-white" aria-hidden="true">
                                                        {domain.icon}
                                                    </div>
                                                    <span className="font-medium text-white text-sm">{domain.domain}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                <Badge variant={domain.status === "Active" ? "success" : "warning"} dot>
                                                    {domain.status}
                                                </Badge>
                                            </td>
                                            <td className="px-6 py-4">
                                                <time className="text-[#9da6b9] text-sm">{domain.dateAdded}</time>
                                            </td>
                                            <td className="px-6 py-4 text-right">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={() => handleRemoveDomain(domain.id)}
                                                    aria-label={`Remove ${domain.domain}`}
                                                >
                                                    <Trash2 className="w-4 h-4 text-slate hover:text-red-500 transition-colors" />
                                                </Button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <TablePagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            totalItems={whitelistDomains.length}
                            startIndex={startIndex}
                            itemsPerPage={itemsPerPage}
                            onPageChange={setCurrentPage}
                        />
                    </div>
                </section>
            </div>
        </>
    );
};
