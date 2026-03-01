import { useState, useEffect, useCallback } from "react";
import { Globe, Plus, Trash2, Cloud, Lock, Network, Loader2 } from "lucide-react";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { Select } from "./ui/Select";
import { Badge } from "./ui/Badge";
import { Toggle } from "./ui/Toggle";
import { PageHeader } from "./ui/PageHeader";
import { TablePagination } from "./ui/TablePagination";
import { getCategories, updateCategoryDomains, type ApiCategory } from "../services/api";

interface WhitelistDomain {
    id: string;
    domain: string;
    status: "Active" | "Verify";
    dateAdded: string;
    icon: React.ReactNode;
    httpsRequired: boolean;
    subdomainsIncluded: boolean;
}

// ── Component ───────────────────────────────────────────────────────────

export const WhitelistManagementSection = () => {
    const [domainInput, setDomainInput] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const [activeAccount, setActiveAccount] = useState("");
    const [httpsRequired, setHttpsRequired] = useState(true);
    const [subdomainsIncluded, setSubdomainsIncluded] = useState(true);
    const [validationError, setValidationError] = useState("");
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const itemsPerPage = 10;

    // Data from API
    const [apiCategories, setApiCategories] = useState<ApiCategory[]>([]);
    const [domainsByAccount, setDomainsByAccount] = useState<Record<string, WhitelistDomain[]>>({});

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const cats = await getCategories();
            setApiCategories(cats);

            // Build domain map from API data
            const domainMap: Record<string, WhitelistDomain[]> = {};
            for (const cat of cats) {
                domainMap[cat.name] = cat.domains.map((d, i) => ({
                    id: `${cat.name}-${i}`,
                    domain: d,
                    status: "Active" as const,
                    dateAdded: "—",
                    icon: d.includes("cloud") || d.includes("aws") || d.includes("azure")
                        ? <Cloud className="w-4 h-4" />
                        : <Globe className="w-4 h-4" />,
                    httpsRequired: true,
                    subdomainsIncluded: false,
                }));
            }
            setDomainsByAccount(domainMap);

            // Set the first category as active if not already set
            if (cats.length > 0 && !activeAccount) {
                setActiveAccount(cats[0].name);
            }
        } catch (err) {
            console.error("Failed to load categories:", err);
        } finally {
            setIsLoading(false);
        }
    }, [activeAccount]);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const whitelistDomains = domainsByAccount[activeAccount] ?? [];

    const handleAccountChange = (accountName: string) => {
        setActiveAccount(accountName);
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

    const handleAddToWhitelist = async () => {
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

        // Optimistic UI update
        const newDomains = [...whitelistDomains, newDomain];
        setDomainsByAccount((prev) => ({
            ...prev,
            [activeAccount]: newDomains,
        }));
        setDomainInput("");
        setValidationError("");

        // Persist to backend
        setIsSaving(true);
        try {
            await updateCategoryDomains(activeAccount, newDomains.map((d) => d.domain));
        } catch (err) {
            console.error("Failed to update domains:", err);
            // Revert on failure
            setDomainsByAccount((prev) => ({
                ...prev,
                [activeAccount]: whitelistDomains,
            }));
        } finally {
            setIsSaving(false);
        }
    };

    const handleRemoveDomain = async (domainId: string) => {
        const removedDomains = whitelistDomains.filter((d) => d.id !== domainId);

        // Optimistic UI update
        setDomainsByAccount((prev) => ({
            ...prev,
            [activeAccount]: removedDomains,
        }));

        // Persist to backend
        try {
            await updateCategoryDomains(activeAccount, removedDomains.map((d) => d.domain));
        } catch (err) {
            console.error("Failed to update domains:", err);
            // Revert on failure
            setDomainsByAccount((prev) => ({
                ...prev,
                [activeAccount]: whitelistDomains,
            }));
        }
    };

    const totalPages = Math.ceil(whitelistDomains.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedDomains = whitelistDomains.slice(startIndex, startIndex + itemsPerPage);

    if (isLoading) {
        return (
            <>
                <PageHeader
                    title="Whitelist Management"
                    subtitle="Define trusted domains for each spending category."
                />
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue animate-spin" />
                </div>
            </>
        );
    }

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
                            {apiCategories.length === 0 ? (
                                <p className="text-slate text-sm">No categories found. Create a category first.</p>
                            ) : (
                                <Select id="category-select" value={activeAccount} onChange={(e) => handleAccountChange(e.target.value)}>
                                    {apiCategories.map((cat) => (
                                        <option key={cat.id} value={cat.name}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </Select>
                            )}
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
                                <Button onClick={handleAddToWhitelist} className="whitespace-nowrap" disabled={isSaving}>
                                    {isSaving ? (
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    ) : (
                                        <Plus className="w-5 h-5 mr-2" />
                                    )}
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
                                    {whitelistDomains.length === 0 && (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-slate text-sm">
                                                No whitelisted domains for this category.
                                            </td>
                                        </tr>
                                    )}
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
