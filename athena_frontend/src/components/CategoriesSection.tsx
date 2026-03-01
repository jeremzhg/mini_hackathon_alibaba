import { useState, useEffect, useCallback } from "react";
import {
    Tag,
    Plus,
    DollarSign,
    TrendingUp,
    Wallet,
    Pencil,
    Trash2,
    X,
    Power,
    PowerOff,
    Loader2,
} from "lucide-react";
import { Badge } from "./ui/Badge";
import { Button } from "./ui/Button";
import { Input } from "./ui/Input";
import { PageHeader } from "./ui/PageHeader";
import { getCategories, createCategory, deleteCategory, patchCategory, type ApiCategory } from "../services/api";

// ── Types ──────────────────────────────────────────────────────────────

interface Category {
    id: string;
    name: string;
    limit: number;
    spent: number;
    status: "Active" | "Inactive";
    color: string;
}

const COLORS = ["bg-[#60a5fa]", "bg-purple-400", "bg-emerald-400", "bg-pink-400", "bg-yellow-400", "bg-orange-400", "bg-cyan-400"];

/** Map an API category to the UI category shape. */
function apiToCategory(cat: ApiCategory, index: number): Category {
    return {
        id: `cat-${cat.id}`,
        name: cat.name,
        limit: cat.initial_limit,
        spent: cat.initial_limit - cat.remaining_budget,
        status: "Active",
        color: COLORS[index % COLORS.length],
    };
}

// ── Category Card ──────────────────────────────────────────────────────

const CategoryCard = ({
    category,
    onEdit,
    onDelete,
    onToggle,
}: {
    category: Category;
    onEdit: (cat: Category) => void;
    onDelete: (id: string) => void;
    onToggle: (id: string) => void;
}) => {
    const pct = category.limit > 0 ? Math.min((category.spent / category.limit) * 100, 100) : 0;
    const isOverBudget = category.spent > category.limit;

    return (
        <div className="flex flex-col gap-5 p-6 bg-darkish-grey rounded-xl border border-dark-border shadow-sm hover:border-[#3d4d6d] transition-colors">
            {/* Header */}
            <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-[#ffffff0a]">
                        <Tag className="w-5 h-5 text-blue" />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-base">{category.name}</span>
                            <div className={`w-2 h-2 rounded-full ${category.color}`} />
                        </div>
                        <span className="text-slate text-xs">
                            Limit: ${category.limit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </span>
                    </div>
                </div>
                <Badge
                    variant={category.status === "Active" ? "success" : "default"}
                    dot
                >
                    {category.status}
                </Badge>
            </div>

            {/* Spending Progress */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-slate">Spent</span>
                    <span className={`font-semibold ${isOverBudget ? "text-red-400" : "text-white"}`}>
                        ${category.spent.toLocaleString("en-US", { minimumFractionDigits: 2 })} / ${category.limit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                </div>
                <div className="w-full h-2 bg-[#ffffff0a] rounded-full overflow-hidden">
                    <div
                        className={`h-full rounded-full transition-all duration-500 ${isOverBudget ? "bg-red-500" : pct > 80 ? "bg-yellow-400" : "bg-emerald-400"
                            }`}
                        style={{ width: `${pct}%` }}
                    />
                </div>
                <span className="text-slate text-xs text-right">{pct.toFixed(1)}% used</span>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-dark-border">
                <div className="flex items-center gap-2">
                    <button
                        onClick={() => onEdit(category)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#ffffff0a] text-slate hover:bg-[#ffffff15] hover:text-white transition-colors cursor-pointer"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                    </button>
                    <button
                        onClick={() => onDelete(category.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-[#ffffff0a] text-slate hover:bg-red-500/20 hover:text-red-400 transition-colors cursor-pointer"
                    >
                        <Trash2 className="w-3.5 h-3.5" />
                        Delete
                    </button>
                </div>
                <button
                    onClick={() => onToggle(category.id)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${category.status === "Active"
                        ? "bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
                        : "bg-[#ffffff0a] text-slate hover:bg-[#ffffff15]"
                        }`}
                >
                    {category.status === "Active" ? <Power className="w-3.5 h-3.5" /> : <PowerOff className="w-3.5 h-3.5" />}
                    {category.status === "Active" ? "Active" : "Inactive"}
                </button>
            </div>
        </div>
    );
};

// ── Modal ───────────────────────────────────────────────────────────────

const CategoryModal = ({
    mode,
    initial,
    onSave,
    onClose,
    isSaving,
}: {
    mode: "add" | "edit";
    initial?: Category;
    onSave: (name: string, limit: number) => void;
    onClose: () => void;
    isSaving?: boolean;
}) => {
    const [name, setName] = useState(initial?.name ?? "");
    const [limit, setLimit] = useState(initial?.limit?.toString() ?? "");

    const handleSave = () => {
        const parsedLimit = parseFloat(limit);
        if (!name.trim() || isNaN(parsedLimit) || parsedLimit <= 0) return;
        onSave(name.trim(), parsedLimit);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-md p-6 bg-dark rounded-2xl border border-dark-border shadow-2xl flex flex-col gap-5">
                <div className="flex items-center justify-between">
                    <h2 className="font-bold text-white text-lg">
                        {mode === "add" ? "Add New Category" : "Edit Category"}
                    </h2>
                    <button onClick={onClose} className="text-slate hover:text-white transition-colors cursor-pointer">
                        <X className="w-5 h-5" />
                    </button>
                </div>
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white" htmlFor="cat-name">Category Name</label>
                        <Input
                            id="cat-name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="e.g., Cloud Services"
                        />
                    </div>
                    <div className="flex flex-col gap-2">
                        <label className="text-sm font-medium text-white" htmlFor="cat-limit">Spending Limit ($)</label>
                        <Input
                            id="cat-limit"
                            type="number"
                            value={limit}
                            onChange={(e) => setLimit(e.target.value)}
                            placeholder="e.g., 5000"
                            icon={<DollarSign className="w-5 h-5 text-slate" />}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-end gap-3 pt-2">
                    <Button variant="outline" onClick={onClose}>Cancel</Button>
                    <Button onClick={handleSave} disabled={!name.trim() || !limit || parseFloat(limit) <= 0 || isSaving}>
                        {isSaving ? (
                            <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving…</>
                        ) : mode === "add" ? (
                            <><Plus className="w-4 h-4 mr-2" />Add Category</>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// ── Main Component ──────────────────────────────────────────────────────

export const CategoriesSection = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [modalMode, setModalMode] = useState<"add" | "edit" | null>(null);
    const [editTarget, setEditTarget] = useState<Category | undefined>();

    const fetchCategories = useCallback(async () => {
        setIsLoading(true);
        try {
            const data = await getCategories();
            setCategories(data.map(apiToCategory));
        } catch (err) {
            console.error("Failed to load categories:", err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchCategories();
    }, [fetchCategories]);

    const handleAdd = async (name: string, limit: number) => {
        setIsSaving(true);
        try {
            await createCategory(name, limit);
            await fetchCategories();
            setModalMode(null);
        } catch (err) {
            console.error("Failed to create category:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleEdit = async (name: string, limit: number) => {
        if (!editTarget) return;
        setIsSaving(true);
        try {
            await patchCategory(editTarget.name, { name, limit });
            await fetchCategories();
            setModalMode(null);
            setEditTarget(undefined);
        } catch (err) {
            console.error("Failed to edit category:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        const cat = categories.find((c) => c.id === id);
        if (!cat) return;
        // Optimistic removal
        setCategories(categories.filter((c) => c.id !== id));
        try {
            await deleteCategory(cat.name);
        } catch (err) {
            console.error("Failed to delete category:", err);
            await fetchCategories(); // Revert on failure
        }
    };

    const handleToggle = (id: string) => {
        setCategories(categories.map((c) =>
            c.id === id ? { ...c, status: c.status === "Active" ? "Inactive" : "Active" } : c
        ));
    };

    const openEdit = (cat: Category) => {
        setEditTarget(cat);
        setModalMode("edit");
    };

    const totalBudget = categories.reduce((s, c) => s + c.limit, 0);
    const totalSpent = categories.reduce((s, c) => s + c.spent, 0);
    const activeCount = categories.filter((c) => c.status === "Active").length;

    return (
        <>
            <PageHeader
                title="Categories"
                subtitle="Manage spending categories and set budget limits for your credit card."
            >
                <Button onClick={() => { setEditTarget(undefined); setModalMode("add"); }}>
                    <Plus className="w-5 h-5 mr-2" />
                    Add Category
                </Button>
            </PageHeader>

            {/* Modal */}
            {modalMode && (
                <CategoryModal
                    mode={modalMode}
                    initial={editTarget}
                    onSave={modalMode === "add" ? handleAdd : handleEdit}
                    onClose={() => { setModalMode(null); setEditTarget(undefined); }}
                    isSaving={isSaving}
                />
            )}

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 text-blue animate-spin" />
                </div>
            ) : (
                <>
                    {/* Summary Stats */}
                    <div className="flex flex-wrap gap-4">
                        <div className="flex-1 min-w-[180px] flex items-center gap-3 p-4 bg-darkish-grey rounded-xl border border-dark-border">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-emerald-500/10">
                                <Tag className="w-5 h-5 text-emerald-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate text-xs">Active Categories</span>
                                <span className="text-white font-bold text-xl">{activeCount}</span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-[180px] flex items-center gap-3 p-4 bg-darkish-grey rounded-xl border border-dark-border">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-blue/10">
                                <Wallet className="w-5 h-5 text-blue" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate text-xs">Total Budget</span>
                                <span className="text-white font-bold text-xl">
                                    ${totalBudget.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                        <div className="flex-1 min-w-[180px] flex items-center gap-3 p-4 bg-darkish-grey rounded-xl border border-dark-border">
                            <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-red-500/10">
                                <TrendingUp className="w-5 h-5 text-red-400" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-slate text-xs">Total Spent</span>
                                <span className="text-white font-bold text-xl">
                                    ${totalSpent.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Category Cards */}
                    {categories.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-16 text-center">
                            <Tag className="w-12 h-12 text-slate mb-3" />
                            <h3 className="text-white font-bold text-lg mb-1">No categories yet</h3>
                            <p className="text-slate text-sm">Create your first category to start tracking budgets.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
                            {categories.map((cat) => (
                                <CategoryCard
                                    key={cat.id}
                                    category={cat}
                                    onEdit={openEdit}
                                    onDelete={handleDelete}
                                    onToggle={handleToggle}
                                />
                            ))}
                        </div>
                    )}
                </>
            )}
        </>
    );
};
