import { useState } from "react";
import { Globe, Plus, Trash2, Cloud, Lock, Network } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Badge } from "./ui/Badge";
import { Toggle } from "./ui/Toggle";
import { PageHeader } from "./ui/PageHeader";
import { TablePagination } from "./ui/TablePagination";

interface WhitelistDomain {
    id: string;
    domain: string;
    status: "Active" | "Verify";
    dateAdded: string;
    icon: React.ReactNode;
    httpsRequired: boolean;
    subdomainsIncluded: boolean;
}

// ── Per-account seed data ───────────────────────────────────────────────

const CATEGORIES = [
    { id: "cloud-services", name: "Cloud Services" },
    { id: "software-licenses", name: "Software Licenses" },
    { id: "payment-fees", name: "Payment Fees" },
];

const INITIAL_DOMAINS: Record<string, WhitelistDomain[]> = {
    "cloud-services": [
        { id: "cs-1", domain: "aws.amazon.com", status: "Active", dateAdded: "Oct 24, 2023", icon: <Cloud className="w-4 h-4" />, httpsRequired: true, subdomainsIncluded: true },
        { id: "cs-2", domain: "alibabacloud.com", status: "Active", dateAdded: "Oct 22, 2023", icon: <Cloud className="w-4 h-4" />, httpsRequired: true, subdomainsIncluded: true },
        { id: "cs-3", domain: "console.cloud.google.com", status: "Active", dateAdded: "Oct 20, 2023", icon: <Cloud className="w-4 h-4" />, httpsRequired: true, subdomainsIncluded: false },
        { id: "cs-4", domain: "portal.azure.com", status: "Verify", dateAdded: "Nov 05, 2023", icon: <Cloud className="w-4 h-4" />, httpsRequired: true, subdomainsIncluded: false },
    ],
    "software-licenses": [
        { id: "sl-1", domain: "figma.com", status: "Active", dateAdded: "Nov 01, 2023", icon: <Globe className="w-4 h-4" />, httpsRequired: true, subdomainsIncluded: true },
        { id: "sl-2", domain: "github.com", status: "Active", dateAdded: "Oct 28, 2023", icon: <Globe className="w-4 h-4" />, httpsRequired: true, subdomainsIncluded: true },
        { id: "sl-3", domain: "workspace.google.com", status: "Active", dateAdded: "Oct 15, 2023", icon: <Globe className="w-4 h-4" />, httpsRequired: true, subdomainsIncluded: false },
        { id: "sl-4", domain: "slack.com", status: "Verify", dateAdded: "Nov 10, 2023", icon: <Globe className="w-4 h-4" />, httpsRequired: false, subdomainsIncluded: false },
    ],
    "payment-fees": [
        { id: "pf-1", domain: "stripe.com", status: "Active", dateAdded: "Sep 30, 2023", icon: <Globe className="w-4 h-4" />, httpsRequired: true, subdomainsIncluded: false },
        { id: "pf-2", domain: "paylabs.co.id", status: "Active", dateAdded: "Oct 05, 2023", icon: <Globe className="w-4 h-4" />, httpsRequired: true, subdomainsIncluded: true },
        { id: "pf-3", domain: "paypal.com", status: "Active", dateAdded: "Oct 10, 2023", icon: <Globe className="w-4 h-4" />, httpsRequired: true, subdomainsIncluded: true },
    ],
};

// ── Component ───────────────────────────────────────────────────────────

export const WhitelistManagementSection = () => {
    const [domainInput, setDomainInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeAccount, setActiveAccount] = useState("cloud-services");
    const [httpsRequired, setHttpsRequired] = useState(true);
    const [subdomainsIncluded, setSubdomainsIncluded] = useState(true);
    const [validationError, setValidationError] = useState("");
    const itemsPerPage = 10;

    const [domainsByAccount, setDomainsByAccount] = useState<Record<string, WhitelistDomain[]>>(INITIAL_DOMAINS);

    const whitelistDomains = domainsByAccount[activeAccount] ?? [];

    const handleAccountChange = (accountId: string) => {
        setActiveAccount(accountId);
        setCurrentPage(1);
    };

    const validateDomain = (raw: string): string | null => {
        const domain = raw.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
        if (!domain) return "Please enter a domain";

        if (!/^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?(\.[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/.test(domain)) {
            return "Invalid domain format (e.g., example.com)";
        }

        if (whitelistDomains.some((d) => d.domain === domain)) {
            return "This domain is already whitelisted";
        }

        return null;
    };

    const handleAddToWhitelist = () => {
        const domain = domainInput.trim().replace(/^https?:\/\//, "").replace(/\/+$/, "");
        const error = validateDomain(domainInput);
        if (error) {
            setValidationError(error);
            return;
        }

        const newDomain: WhitelistDomain = {
            id: Date.now().toString(),
            domain,
            status: "Verify",
            dateAdded: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
            icon: <Globe className="w-4 h-4" />,
            httpsRequired,
            subdomainsIncluded,
        };
        setDomainsByAccount((prev) => ({
            ...prev,
            [activeAccount]: [...(prev[activeAccount] ?? []), newDomain],
        }));
        setDomainInput("");
        setValidationError("");
    };

    const handleRemoveDomain = (domainId: string) => {
        setDomainsByAccount((prev) => ({
            ...prev,
            [activeAccount]: (prev[activeAccount] ?? []).filter((d) => d.id !== domainId),
        }));
    };

    const totalPages = Math.ceil(whitelistDomains.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDomains = whitelistDomains.slice(startIndex, startIndex + itemsPerPage);

    return (
        <>
            <PageHeader
                title="Whitelist Management"
                subtitle="Define trusted domains for each spending category."
            />

            <div className="flex flex-col gap-8 w-full">
                {/* Configuration Scope */}
                <section className="flex flex-col gap-3">
                    <h2 className="font-medium text-slate text-sm tracking-wide uppercase">Configuration Scope</h2>
                    <div className="p-6 bg-darkish-grey rounded-xl border border-dark-border shadow-sm">
                        <div className="flex flex-col max-w-md gap-2">
                            <label htmlFor="category-select" className="font-medium text-white text-sm">
                                Active Category
                            </label>
                            <Select id="category-select" value={activeAccount} onChange={(e) => handleAccountChange(e.target.value)}>
                                {CATEGORIES.map((cat) => (
                                    <option key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </option>
                                ))}
                            </Select>
                            <p className="text-slate text-xs mt-1">Select a spending category to manage its whitelisted domains.</p>
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
                                    onChange={(e) => {
                                        setDomainInput(e.target.value);
                                        if (validationError) setValidationError("");
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") handleAddToWhitelist();
                                    }}
                                    placeholder="e.g., paylabs.co.id"
                                    icon={<Globe className="w-5 h-5 text-slate" />}
                                    wrapperClassName="flex-1"
                                />
                                <Button onClick={handleAddToWhitelist} className="whitespace-nowrap">
                                    <Plus className="w-5 h-5 mr-2" />
                                    Add to Whitelist
                                </Button>
                            </div>
                            {validationError && (
                                <p className="text-red-400 text-xs mt-1">{validationError}</p>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-x-8 gap-y-3 mt-1">
                            <Toggle
                                enabled={httpsRequired}
                                onChange={() => setHttpsRequired(!httpsRequired)}
                                label="HTTPS Required"
                            />
                            <Toggle
                                enabled={subdomainsIncluded}
                                onChange={() => setSubdomainsIncluded(!subdomainsIncluded)}
                                label="Subdomains Included"
                            />
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
                            <table className="w-full min-w-[700px]">
                                <thead>
                                    <tr className="bg-[#10162280] border-b border-dark-border">
                                        <th className="text-left px-6 py-4 font-bold text-[#cbd5e1] text-xs tracking-wider">DOMAIN NAME</th>
                                        <th className="text-left px-6 py-4 font-bold text-[#cbd5e1] text-xs tracking-wider">STATUS</th>
                                        <th className="text-left px-6 py-4 font-bold text-[#cbd5e1] text-xs tracking-wider">OPTIONS</th>
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
                                                <div className="flex items-center gap-2 flex-wrap">
                                                    {domain.httpsRequired && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-xs font-medium">
                                                            <Lock className="w-3 h-3" />
                                                            HTTPS
                                                        </span>
                                                    )}
                                                    {domain.subdomainsIncluded && (
                                                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-blue/10 text-blue text-xs font-medium">
                                                            <Network className="w-3 h-3" />
                                                            Subs
                                                        </span>
                                                    )}
                                                    {!domain.httpsRequired && !domain.subdomainsIncluded && (
                                                        <span className="text-slate text-xs">—</span>
                                                    )}
                                                </div>
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
