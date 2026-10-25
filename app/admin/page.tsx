"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";

// ── Types ────────────────────────────────────────────────────────────────────

interface UserRecord {
    id: string;
    email: string;
    name: string | null;
    businessName: string | null;
    plan: "free" | "pro" | "business" | string;
    subscriptionStatus: string;
    createdAt: string;
    lastSignInAt: string | null;
    docCount: number;
    totalVolume: number;
    latestDoc: string | null;
}

export interface ShadowLead {
    id: string;
    userId: string | null;
    businessName: string;
    contactPhone: string | null;
    contactEmail: string | null;
    devicePlatform: string;
    isPWA: boolean;
    totalDocs: number;
    receiptCount: number;
    invoiceCount: number;
    orderCount: number;
    totalVolumeNGN: number;
    totalVolumeUSD: number;
    topItems: string[];
    featureTags: string[];
    firstSeenAt: string;
    lastActiveAt: string;
    lastEvent: string;
}

interface StatsData {
    totalUsers: number;
    newUsers7d: number;
    newUsers30d: number;
    planCounts: {
        free: number;
        pro: number;
        business: number;
    };
    estimatedMRR: number;
    totalDocs: number;
    docTypeCounts: {
        receipt: number;
        invoice: number;
        order: number;
    };
    totalVolumeNGN: number;
    totalVolumeUSD: number;
    shadowMerchantsCount?: number;
    shadowTotalVolumeNGN?: number;
    shadowLeadsWithPhone?: number;
    shadowHighVolumeCount?: number;
    shadowBrandConsciousCount?: number;
}

type TabType = "users" | "shadow" | "insights" | "outreach";
type SortOption = "newest" | "oldest" | "most_docs" | "highest_volume";

export default function AdminPage() {
    const { showToast } = useToast();

    // Auth & Loading
    const [adminKey, setAdminKey] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    // Data
    const [stats, setStats] = useState<StatsData | null>(null);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [shadowLeads, setShadowLeads] = useState<ShadowLead[]>([]);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    // UI State
    const [activeTab, setActiveTab] = useState<TabType>("users");
    const [searchQuery, setSearchQuery] = useState("");
    const [planFilter, setPlanFilter] = useState<"all" | "paid" | "free">("all");
    const [shadowTagFilter, setShadowTagFilter] = useState<string>("all");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
    const [selectedShadow, setSelectedShadow] = useState<ShadowLead | null>(null);
    const [copiedKey, setCopiedKey] = useState<string | null>(null);

    // ── Data Fetching ────────────────────────────────────────────────────────
    const fetchData = useCallback(async (key: string) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/admin/overview", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-admin-key": key,
                },
                body: JSON.stringify({ adminKey: key }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                setStats(data.stats);
                setUsers(data.users || []);
                setShadowLeads(data.shadowLeads || []);
                setIsAuthenticated(true);
                setLastRefreshed(new Date());
                sessionStorage.setItem("proofa_admin_token", key);
            } else {
                showToast(data.error || "Authentication failed", "error");
                sessionStorage.removeItem("proofa_admin_token");
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Admin fetch error:", error);
            showToast("Failed to retrieve admin telemetry", "error");
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    useEffect(() => {
        const storedKey = sessionStorage.getItem("proofa_admin_token");
        if (storedKey) {
            setAdminKey(storedKey);
            fetchData(storedKey);
        }
    }, [fetchData]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminKey.trim()) return;
        fetchData(adminKey.trim());
    };

    const handleLogout = () => {
        sessionStorage.removeItem("proofa_admin_token");
        setAdminKey("");
        setIsAuthenticated(false);
        setStats(null);
        setUsers([]);
        setSelectedUser(null);
        setSelectedShadow(null);
        showToast("Session terminated", "info");
    };

    // ── Export CSV Helper ────────────────────────────────────────────────────
    const exportCSV = () => {
        if (!users.length) return;
        const headers = ["ID", "Email", "Business Name", "Plan", "Status", "Docs Created", "Volume (NGN)", "Joined Date", "Last Active"];
        const rows = users.map(u => [
            u.id,
            `"${u.email}"`,
            `"${u.businessName || u.name || ''}"`,
            u.plan,
            u.subscriptionStatus,
            u.docCount,
            u.totalVolume,
            `"${u.createdAt}"`,
            `"${u.lastSignInAt || ''}"`,
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `proofa_customers_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Customer database exported to CSV", "success");
    };

    // ── Export Shadow Leads CSV ──────────────────────────────────────────────
    const exportShadowCSV = () => {
        if (!shadowLeads.length) return;
        const headers = ["Shadow ID", "Business Name", "Contact Phone", "Platform", "PWA", "Docs Count", "Volume (NGN)", "Top Items", "Tags", "First Seen", "Last Active"];
        const rows = shadowLeads.map(s => [
            s.id,
            `"${s.businessName || 'Anonymous'}"`,
            `"${s.contactPhone || ''}"`,
            s.devicePlatform,
            s.isPWA ? "Yes" : "No",
            s.totalDocs,
            s.totalVolumeNGN,
            `"${(s.topItems || []).join('; ')}"`,
            `"${(s.featureTags || []).join('; ')}"`,
            `"${s.firstSeenAt}"`,
            `"${s.lastActiveAt}"`,
        ]);

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `proofa_shadow_leads_${new Date().toISOString().split("T")[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        showToast("Shadow leads database exported to CSV", "success");
    };

    // ── Copy Helper ──────────────────────────────────────────────────────────
    const copyToClipboard = (text: string, id: string, message = "Copied to clipboard") => {
        navigator.clipboard.writeText(text);
        setCopiedKey(id);
        showToast(message, "success");
        setTimeout(() => setCopiedKey(null), 2000);
    };

    // ── Filtered & Sorted Users ──────────────────────────────────────────────
    const filteredUsers = useMemo(() => {
        return users
            .filter(u => {
                const isPaid = u.plan === "pro" || u.plan === "business";
                if (planFilter === "paid" && !isPaid) return false;
                if (planFilter === "free" && isPaid) return false;

                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase().trim();
                return (
                    u.email.toLowerCase().includes(q) ||
                    (u.businessName && u.businessName.toLowerCase().includes(q)) ||
                    (u.name && u.name.toLowerCase().includes(q)) ||
                    u.id.toLowerCase().includes(q)
                );
            })
            .sort((a, b) => {
                if (sortBy === "newest") return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                if (sortBy === "most_docs") return b.docCount - a.docCount;
                if (sortBy === "highest_volume") return b.totalVolume - a.totalVolume;
                return 0;
            });
    }, [users, planFilter, searchQuery, sortBy]);

    // ── Filtered & Sorted Shadow Leads ───────────────────────────────────────
    const filteredShadowLeads = useMemo(() => {
        return shadowLeads
            .filter(s => {
                if (shadowTagFilter === "with_phone" && !s.contactPhone) return false;
                if (shadowTagFilter === "high_volume" && s.totalVolumeNGN < 100000) return false;
                if (shadowTagFilter === "brand" && !s.featureTags.includes("Brand Conscious")) return false;
                if (shadowTagFilter === "invoice" && !s.featureTags.includes("Invoicing Focus")) return false;
                if (shadowTagFilter === "frequent" && s.totalDocs < 3) return false;

                if (!searchQuery.trim()) return true;
                const q = searchQuery.toLowerCase().trim();
                return (
                    s.businessName.toLowerCase().includes(q) ||
                    (s.contactPhone && s.contactPhone.toLowerCase().includes(q)) ||
                    s.id.toLowerCase().includes(q) ||
                    s.topItems.some(i => i.toLowerCase().includes(q)) ||
                    s.featureTags.some(t => t.toLowerCase().includes(q))
                );
            })
            .sort((a, b) => {
                if (sortBy === "newest") return new Date(b.lastActiveAt).getTime() - new Date(a.lastActiveAt).getTime();
                if (sortBy === "oldest") return new Date(a.firstSeenAt).getTime() - new Date(b.firstSeenAt).getTime();
                if (sortBy === "most_docs") return b.totalDocs - a.totalDocs;
                if (sortBy === "highest_volume") return b.totalVolumeNGN - a.totalVolumeNGN;
                return 0;
            });
    }, [shadowLeads, shadowTagFilter, searchQuery, sortBy]);

    // ── Authentication Screen (Minimalist Slate) ─────────────────────────────
    if (!isAuthenticated) {
        return (
            <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0C0C0C] text-[#111111] dark:text-[#EAEAEA] flex flex-col justify-between p-6 sm:p-12 font-sans selection:bg-[#EAEAEA] dark:selection:bg-[#222]">
                <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#1F1F1F] pb-4">
                    <span className="font-mono text-xs tracking-widest text-[#787774] uppercase">
                        PROOFA INTERNAL // ACCESS GATEWAY
                    </span>
                    <Link href="/" className="font-mono text-xs text-[#787774] hover:text-[#111] dark:hover:text-white transition-colors">
                        ← PROOFA.NG
                    </Link>
                </div>

                <div className="max-w-md w-full mx-auto my-auto py-12">
                    <div className="border border-[#EAEAEA] dark:border-[#1F1F1F] bg-white dark:bg-[#141414] p-8 sm:p-10 rounded-lg">
                        <div className="mb-8">
                            <span className="inline-block px-2.5 py-1 rounded text-[10px] font-mono tracking-widest uppercase bg-[#EDF3EC] dark:bg-[#152617] text-[#346538] dark:text-[#86EFAC] mb-3">
                                SECURE TELEMETRY
                            </span>
                            <h1 className="text-2xl font-bold tracking-tight text-[#111] dark:text-[#FFF]">
                                System Terminal
                            </h1>
                            <p className="text-xs text-[#787774] mt-1.5 leading-relaxed">
                                Enter administrative passkey to authenticate session and access customer operations.
                            </p>
                        </div>

                        <form onSubmit={handleLogin} className="space-y-4">
                            <div>
                                <label className="block text-[11px] font-mono text-[#787774] uppercase tracking-wider mb-2">
                                    ACCESS_KEY
                                </label>
                                <input
                                    type="password"
                                    placeholder="••••••••••••••••"
                                    value={adminKey}
                                    onChange={(e) => setAdminKey(e.target.value)}
                                    className="w-full bg-[#F7F6F3] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#262626] rounded px-3.5 py-2.5 text-xs font-mono tracking-widest text-[#111] dark:text-white focus:outline-none focus:border-[#111] dark:focus:border-white transition-colors"
                                    autoFocus
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full bg-[#111111] hover:bg-[#333333] dark:bg-[#EEEEEE] dark:hover:bg-[#CCCCCC] dark:text-[#111] text-white text-xs font-medium py-3 rounded active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {isLoading ? "VERIFYING..." : "AUTHENTICATE"}
                            </button>
                        </form>
                    </div>
                </div>

                <div className="text-center border-t border-[#EAEAEA] dark:border-[#1F1F1F] pt-4">
                    <span className="font-mono text-[10px] text-[#A1A1AA]">
                        PROOFA TECHNOLOGIES LTD · CONFIDENTIAL & PROPRIETARY
                    </span>
                </div>
            </div>
        );
    }

    // ── Main Admin Panel View ────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0C0C0C] text-[#111111] dark:text-[#EAEAEA] font-sans selection:bg-[#EAEAEA] dark:selection:bg-[#222]">
            {/* Top Workspace Bar */}
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[#EAEAEA] dark:border-[#1F1F1F] px-6 lg:px-12 py-3.5 transition-colors">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="font-bold text-sm tracking-tight text-[#111] dark:text-white flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#e8590c] inline-block" />
                            Proofa Terminal
                        </Link>
                        <span className="hidden sm:inline-block text-[#D4D4D8] dark:text-[#333]">/</span>
                        <span className="hidden sm:inline-block font-mono text-[11px] text-[#787774] tracking-wider uppercase">
                            Overview & Customer Registry
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        {lastRefreshed && (
                            <span className="hidden md:inline-block font-mono text-[11px] text-[#787774]">
                                SYNC: {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                            </span>
                        )}

                        <button
                            onClick={() => fetchData(adminKey)}
                            disabled={isLoading}
                            className="border border-[#EAEAEA] dark:border-[#262626] hover:bg-[#F7F6F3] dark:hover:bg-[#1F1F1F] text-[#111] dark:text-white px-3 py-1.5 rounded text-xs font-mono transition-colors active:scale-[0.98]"
                        >
                            {isLoading ? "SYNCING..." : "REFRESH"}
                        </button>

                        <button
                            onClick={handleLogout}
                            className="bg-[#FDEBEC] dark:bg-[#2D1618] hover:bg-[#FCD8DA] text-[#9F2F2D] dark:text-[#F87171] px-3 py-1.5 rounded text-xs font-mono transition-colors active:scale-[0.98]"
                        >
                            LOCK
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content Area */}
            <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-8">

                {/* Header Title & Tab Navigation */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[#EAEAEA] dark:border-[#1F1F1F] pb-6">
                    <div>
                        <div className="flex items-center gap-2 mb-1.5">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-[#346538] dark:bg-[#86EFAC]" />
                            <span className="font-mono text-[10px] tracking-widest text-[#787774] uppercase">
                                PRODUCTION CLUSTER // ONLINE
                            </span>
                        </div>
                        <h1 className="text-3xl font-extrabold tracking-tight text-[#111] dark:text-white">
                            Executive Telemetry
                        </h1>
                    </div>

                    {/* Tabs */}
                    <div className="flex items-center gap-1 border border-[#EAEAEA] dark:border-[#222] bg-[#F7F6F3] dark:bg-[#161616] p-1 rounded-md">
                        <button
                            onClick={() => setActiveTab("users")}
                            className={`px-3.5 py-1.5 rounded text-xs font-medium transition-colors ${
                                activeTab === "users"
                                    ? "bg-white dark:bg-[#222] text-[#111] dark:text-white shadow-sm"
                                    : "text-[#787774] hover:text-[#111] dark:hover:text-white"
                            }`}
                        >
                            Registered ({users.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("shadow")}
                            className={`px-3.5 py-1.5 rounded text-xs font-medium transition-colors flex items-center gap-1.5 ${
                                activeTab === "shadow"
                                    ? "bg-white dark:bg-[#222] text-[#111] dark:text-white shadow-sm"
                                    : "text-[#787774] hover:text-[#111] dark:hover:text-white"
                            }`}
                        >
                            <span className="w-1.5 h-1.5 rounded-full bg-[#e8590c] inline-block animate-pulse" />
                            Shadow Leads ({shadowLeads.length})
                        </button>
                        <button
                            onClick={() => setActiveTab("insights")}
                            className={`px-3.5 py-1.5 rounded text-xs font-medium transition-colors ${
                                activeTab === "insights"
                                    ? "bg-white dark:bg-[#222] text-[#111] dark:text-white shadow-sm"
                                    : "text-[#787774] hover:text-[#111] dark:hover:text-white"
                            }`}
                        >
                            Product Telemetry
                        </button>
                        <button
                            onClick={() => setActiveTab("outreach")}
                            className={`px-3.5 py-1.5 rounded text-xs font-medium transition-colors ${
                                activeTab === "outreach"
                                    ? "bg-white dark:bg-[#222] text-[#111] dark:text-white shadow-sm"
                                    : "text-[#787774] hover:text-[#111] dark:hover:text-white"
                            }`}
                        >
                            Outreach & CRM
                        </button>
                    </div>
                </div>

                {/* ── BENTO TELEMETRY GRID ───────────────────────────────────── */}
                {stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Box 1: Registered Accounts */}
                        <div className="bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#222] rounded-lg p-6 flex flex-col justify-between">
                            <div>
                                <span className="font-mono text-[10px] tracking-widest text-[#787774] uppercase block mb-1">
                                    REGISTERED MERCHANTS
                                </span>
                                <div className="text-3xl font-extrabold font-mono text-[#111] dark:text-white tabular-nums">
                                    {stats.totalUsers}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#EAEAEA] dark:border-[#222] flex items-center justify-between font-mono text-[11px] text-[#787774]">
                                <span>+ {stats.newUsers7d} past 7d</span>
                                <span>+ {stats.newUsers30d} past 30d</span>
                            </div>
                        </div>

                        {/* Box 2: Paid Subscriptions */}
                        <div className="bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#222] rounded-lg p-6 flex flex-col justify-between">
                            <div>
                                <span className="font-mono text-[10px] tracking-widest text-[#787774] uppercase block mb-1">
                                    PAID SUBSCRIBERS
                                </span>
                                <div className="text-3xl font-extrabold font-mono text-[#111] dark:text-white tabular-nums flex items-baseline gap-2">
                                    {stats.planCounts.pro + stats.planCounts.business}
                                    <span className="text-xs font-normal text-[#787774]">accounts</span>
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#EAEAEA] dark:border-[#222] flex items-center justify-between font-mono text-[11px]">
                                <span className="text-[#956400] dark:text-[#FDE68A]">{stats.planCounts.pro} Pro (₦2.5k)</span>
                                <span className="text-[#5B3E8C] dark:text-[#C4B5FD]">{stats.planCounts.business} Business</span>
                            </div>
                        </div>

                        {/* Box 3: Monthly Run Rate */}
                        <div className="bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#222] rounded-lg p-6 flex flex-col justify-between">
                            <div>
                                <span className="font-mono text-[10px] tracking-widest text-[#787774] uppercase block mb-1">
                                    ESTIMATED MRR
                                </span>
                                <div className="text-3xl font-extrabold font-mono text-[#111] dark:text-white tabular-nums">
                                    ₦{stats.estimatedMRR.toLocaleString()}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#EAEAEA] dark:border-[#222] flex items-center justify-between font-mono text-[11px] text-[#787774]">
                                <span>Annual run rate:</span>
                                <span className="text-[#111] dark:text-white font-bold">₦{(stats.estimatedMRR * 12).toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Box 4: Document Throughput */}
                        <div className="bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#222] rounded-lg p-6 flex flex-col justify-between">
                            <div>
                                <span className="font-mono text-[10px] tracking-widest text-[#787774] uppercase block mb-1">
                                    DOCUMENT THROUGHPUT
                                </span>
                                <div className="text-3xl font-extrabold font-mono text-[#111] dark:text-white tabular-nums">
                                    {stats.totalDocs}
                                </div>
                            </div>
                            <div className="mt-4 pt-3 border-t border-[#EAEAEA] dark:border-[#222] flex items-center justify-between font-mono text-[11px] text-[#787774]">
                                <span>{stats.docTypeCounts.receipt} receipts</span>
                                <span>{stats.docTypeCounts.invoice} invoices</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 1: USERS DIRECTORY ─────────────────────────────────── */}
                {activeTab === "users" && (
                    <div className="space-y-4">
                        {/* Toolbar: Search, Filters, Export */}
                        <div className="bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#222] rounded-lg p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
                            {/* Search */}
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    placeholder="Filter by name, business, email, or user ID..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#F7F6F3] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#262626] rounded px-3.5 py-2 text-xs font-mono text-[#111] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#111] dark:focus:border-white transition-colors"
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-3 top-2.5 font-mono text-[10px] text-[#787774] hover:text-[#111]"
                                    >
                                        CLEAR
                                    </button>
                                )}
                            </div>

                            {/* Plan Pill Filters */}
                            <div className="flex items-center gap-1 border border-[#EAEAEA] dark:border-[#262626] rounded p-0.5 bg-[#F7F6F3] dark:bg-[#1A1A1A]">
                                {(["all", "paid", "free"] as const).map((tier) => (
                                    <button
                                        key={tier}
                                        onClick={() => setPlanFilter(tier)}
                                        className={`px-3 py-1.5 rounded text-[11px] font-mono uppercase tracking-wider transition-colors ${
                                            planFilter === tier
                                                ? "bg-white dark:bg-[#262626] text-[#111] dark:text-white font-bold shadow-xs"
                                                : "text-[#787774] hover:text-[#111] dark:hover:text-white"
                                        }`}
                                    >
                                        {tier}
                                    </button>
                                ))}
                            </div>

                            {/* Sort Selector */}
                            <select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value as SortOption)}
                                className="bg-[#F7F6F3] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#262626] rounded px-3 py-2 text-xs font-mono text-[#111] dark:text-white focus:outline-none"
                            >
                                <option value="newest">Sort: Newest</option>
                                <option value="oldest">Sort: Oldest</option>
                                <option value="most_docs">Sort: Most Docs</option>
                                <option value="highest_volume">Sort: Highest Volume</option>
                            </select>

                            {/* Action: Export CSV */}
                            <button
                                onClick={exportCSV}
                                className="border border-[#EAEAEA] dark:border-[#262626] bg-white dark:bg-[#161616] hover:bg-[#F7F6F3] dark:hover:bg-[#202020] text-[#111] dark:text-white px-3 py-2 rounded text-xs font-mono flex items-center justify-center gap-1.5 transition-colors active:scale-[0.98]"
                            >
                                <span>EXPORT CSV</span>
                            </button>
                        </div>

                        {/* Customer Table */}
                        <div className="bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#222] rounded-lg overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#EAEAEA] dark:border-[#222] bg-[#F7F6F3] dark:bg-[#161616] text-[10px] font-mono tracking-widest uppercase text-[#787774]">
                                            <th className="py-3 px-5">Customer / Entity</th>
                                            <th className="py-3 px-4">Tier</th>
                                            <th className="py-3 px-4 text-right">Throughput</th>
                                            <th className="py-3 px-4 text-right">Gross Volume</th>
                                            <th className="py-3 px-4">Registration</th>
                                            <th className="py-3 px-4">Last Activity</th>
                                            <th className="py-3 px-5 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#1F1F1F] text-xs">
                                        {filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={7} className="py-16 text-center text-[#787774] font-mono">
                                                    NO MATCHING RECORDS LOCATED IN REGISTRY
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((u) => {
                                                const isPro = u.plan === "pro";
                                                const isBusiness = u.plan === "business";

                                                const badgeBg = isBusiness
                                                    ? "bg-[#F4F0FB] dark:bg-[#221C30] text-[#5B3E8C] dark:text-[#C4B5FD]"
                                                    : isPro
                                                    ? "bg-[#FBF3DB] dark:bg-[#2D2310] text-[#956400] dark:text-[#FDE68A]"
                                                    : "bg-[#F4F4F5] dark:bg-[#1F1F23] text-[#52525B] dark:text-[#A1A1AA]";

                                                return (
                                                    <tr
                                                        key={u.id}
                                                        onClick={() => setSelectedUser(u)}
                                                        className="hover:bg-[#FBFBFA] dark:hover:bg-[#1A1A1A] cursor-pointer transition-colors"
                                                    >
                                                        {/* User / Entity */}
                                                        <td className="py-3.5 px-5">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-[#111] dark:text-white">
                                                                    {u.businessName || u.name || "Sole Vendor"}
                                                                </span>
                                                                <span className="font-mono text-[11px] text-[#787774]">
                                                                    {u.email}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Tier */}
                                                        <td className="py-3.5 px-4">
                                                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-mono tracking-wider uppercase font-bold ${badgeBg}`}>
                                                                {u.plan}
                                                            </span>
                                                        </td>

                                                        {/* Docs */}
                                                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#111] dark:text-white font-medium">
                                                            {u.docCount} docs
                                                        </td>

                                                        {/* Volume */}
                                                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#111] dark:text-white">
                                                            ₦{u.totalVolume.toLocaleString()}
                                                        </td>

                                                        {/* Registration */}
                                                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#787774]">
                                                            {new Date(u.createdAt).toLocaleDateString("en-GB", {
                                                                day: "numeric",
                                                                month: "short",
                                                                year: "numeric",
                                                            })}
                                                        </td>

                                                        {/* Last Activity */}
                                                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#787774]">
                                                            {u.lastSignInAt
                                                                ? new Date(u.lastSignInAt).toLocaleDateString("en-GB", {
                                                                      day: "numeric",
                                                                      month: "short",
                                                                  })
                                                                : "Never"}
                                                        </td>

                                                        {/* Quick Direct Email */}
                                                        <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                                                            <a
                                                                href={`mailto:${u.email}?subject=Quick question from Proofa&body=Hi ${u.businessName || 'there'},%0D%0A%0D%0AI noticed you recently used Proofa for your business receipts. How has the experience been so far?%0D%0A%0D%0ABest,%0D%0AProofa Operations`}
                                                                className="inline-block border border-[#EAEAEA] dark:border-[#262626] hover:bg-[#111] hover:text-white dark:hover:bg-white dark:hover:text-[#111] text-[#787774] px-2.5 py-1 rounded font-mono text-[11px] transition-colors"
                                                            >
                                                                CONTACT
                                                            </a>
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-3 border-t border-[#EAEAEA] dark:border-[#222] bg-[#F7F6F3] dark:bg-[#161616] flex items-center justify-between font-mono text-[11px] text-[#787774]">
                                <span>SHOWING {filteredUsers.length} OF {users.length} RECORDS</span>
                                <span>CLICK ROW TO INSPECT METADATA</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB: SHADOW LEADS & MERCHANT INTELLIGENCE ─────────────── */}
                {activeTab === "shadow" && (
                    <div className="space-y-6">
                        {/* Shadow Summary Banner */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#222] rounded-lg p-5">
                                <span className="font-mono text-[10px] tracking-widest text-[#787774] uppercase block mb-1">
                                    DISCOVERED MERCHANTS
                                </span>
                                <div className="text-2xl font-extrabold font-mono text-[#111] dark:text-white">
                                    {stats?.shadowMerchantsCount ?? shadowLeads.length}
                                </div>
                                <span className="text-xs text-[#787774] mt-1 block">Active guest & free users</span>
                            </div>

                            <div className="bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#222] rounded-lg p-5">
                                <span className="font-mono text-[10px] tracking-widest text-[#787774] uppercase block mb-1">
                                    CONTACTABLE LEADS
                                </span>
                                <div className="text-2xl font-extrabold font-mono text-[#346538] dark:text-[#86EFAC]">
                                    {stats?.shadowLeadsWithPhone ?? shadowLeads.filter(s => s.contactPhone).length}
                                </div>
                                <span className="text-xs text-[#787774] mt-1 block">WhatsApp phone captured</span>
                            </div>

                            <div className="bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#222] rounded-lg p-5">
                                <span className="font-mono text-[10px] tracking-widest text-[#787774] uppercase block mb-1">
                                    UNTRACKED SHADOW REVENUE
                                </span>
                                <div className="text-2xl font-extrabold font-mono text-[#111] dark:text-white">
                                    ₦{(stats?.shadowTotalVolumeNGN ?? 0).toLocaleString()}
                                </div>
                                <span className="text-xs text-[#787774] mt-1 block">Total gross volume generated</span>
                            </div>

                            <div className="bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#222] rounded-lg p-5">
                                <span className="font-mono text-[10px] tracking-widest text-[#787774] uppercase block mb-1">
                                    HIGH INTENT TARGETS
                                </span>
                                <div className="text-2xl font-extrabold font-mono text-[#e8590c]">
                                    {shadowLeads.filter(s => s.featureTags.includes("Brand Conscious") || s.featureTags.includes("High Volume")).length}
                                </div>
                                <span className="text-xs text-[#787774] mt-1 block">High-volume / Brand intent</span>
                            </div>
                        </div>

                        {/* Search & Tag Filter Bar */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-[#141414] p-4 rounded-lg border border-[#EAEAEA] dark:border-[#222]">
                            <div className="flex-1 max-w-md">
                                <input
                                    type="text"
                                    placeholder="Search by business name, phone, item keywords..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#F7F6F3] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#262626] rounded px-3.5 py-2 text-xs font-mono text-[#111] dark:text-white placeholder-[#A1A1AA] focus:outline-none focus:border-[#111] dark:focus:border-white transition-colors"
                                />
                            </div>

                            <div className="flex flex-wrap items-center gap-2">
                                <button
                                    onClick={() => setShadowTagFilter("all")}
                                    className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                                        shadowTagFilter === "all"
                                            ? "bg-[#111] text-white dark:bg-white dark:text-[#111]"
                                            : "border border-[#EAEAEA] dark:border-[#262626] text-[#787774] hover:text-[#111] dark:hover:text-white"
                                    }`}
                                >
                                    ALL ({shadowLeads.length})
                                </button>
                                <button
                                    onClick={() => setShadowTagFilter("with_phone")}
                                    className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                                        shadowTagFilter === "with_phone"
                                            ? "bg-[#111] text-white dark:bg-white dark:text-[#111]"
                                            : "border border-[#EAEAEA] dark:border-[#262626] text-[#787774] hover:text-[#111] dark:hover:text-white"
                                    }`}
                                >
                                    📞 WITH PHONE ({shadowLeads.filter(s => s.contactPhone).length})
                                </button>
                                <button
                                    onClick={() => setShadowTagFilter("high_volume")}
                                    className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                                        shadowTagFilter === "high_volume"
                                            ? "bg-[#111] text-white dark:bg-white dark:text-[#111]"
                                            : "border border-[#EAEAEA] dark:border-[#262626] text-[#787774] hover:text-[#111] dark:hover:text-white"
                                    }`}
                                >
                                    💰 &gt;₦100K VOLUME ({shadowLeads.filter(s => s.totalVolumeNGN >= 100000).length})
                                </button>
                                <button
                                    onClick={() => setShadowTagFilter("brand")}
                                    className={`px-3 py-1.5 rounded text-xs font-mono transition-colors ${
                                        shadowTagFilter === "brand"
                                            ? "bg-[#111] text-white dark:bg-white dark:text-[#111]"
                                            : "border border-[#EAEAEA] dark:border-[#262626] text-[#787774] hover:text-[#111] dark:hover:text-white"
                                    }`}
                                >
                                    🎨 LOGO INTENT ({shadowLeads.filter(s => s.featureTags.includes("Brand Conscious")).length})
                                </button>
                                <button
                                    onClick={exportShadowCSV}
                                    className="border border-[#EAEAEA] dark:border-[#262626] hover:bg-[#F7F6F3] dark:hover:bg-[#1A1A1A] text-[#111] dark:text-white px-3 py-1.5 rounded text-xs font-mono transition-colors"
                                >
                                    EXPORT CSV
                                </button>
                            </div>
                        </div>

                        {/* Shadow Table */}
                        <div className="border border-[#EAEAEA] dark:border-[#222] bg-white dark:bg-[#141414] rounded-lg overflow-hidden shadow-xs">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-[#EAEAEA] dark:border-[#1F1F1F] font-mono text-[11px] text-[#787774] uppercase tracking-wider bg-[#F7F6F3]/50 dark:bg-[#161616]/50">
                                            <th className="py-3 px-5">Merchant / Shadow ID</th>
                                            <th className="py-3 px-4">WhatsApp Contact</th>
                                            <th className="py-3 px-4 text-right">Docs</th>
                                            <th className="py-3 px-4 text-right">Volume</th>
                                            <th className="py-3 px-4">Behavioral Tags</th>
                                            <th className="py-3 px-4">Top Items</th>
                                            <th className="py-3 px-4">Last Active</th>
                                            <th className="py-3 px-5 text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-[#EAEAEA] dark:divide-[#1F1F1F] text-xs">
                                        {filteredShadowLeads.length === 0 ? (
                                            <tr>
                                                <td colSpan={8} className="py-16 text-center text-[#787774] font-mono">
                                                    NO SHADOW MERCHANTS MATCHING FILTER
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredShadowLeads.map((s) => {
                                                const firstItem = s.topItems?.[0] || "products";
                                                const waText = encodeURIComponent(
                                                    `Hello ${s.businessName || "there"}! 👋 I noticed you've been using Proofa to issue receipts for your ${firstItem}. How has the experience been? If you'd like your official business logo & custom branding without watermarks, I can activate a free 14-day Pro trial for you today.`
                                                );

                                                return (
                                                    <tr
                                                        key={s.id}
                                                        onClick={() => setSelectedShadow(s)}
                                                        className="hover:bg-[#FBFBFA] dark:hover:bg-[#1A1A1A] cursor-pointer transition-colors"
                                                    >
                                                        {/* Merchant Name & ID */}
                                                        <td className="py-3.5 px-5">
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-[#111] dark:text-white">
                                                                    {s.businessName || "Anonymous Vendor"}
                                                                </span>
                                                                <span className="font-mono text-[10px] text-[#787774]">
                                                                    {s.id.slice(0, 14)}... · {s.devicePlatform} {s.isPWA ? "(PWA)" : ""}
                                                                </span>
                                                            </div>
                                                        </td>

                                                        {/* Phone */}
                                                        <td className="py-3.5 px-4 font-mono text-[11px]">
                                                            {s.contactPhone ? (
                                                                <span className="text-[#346538] dark:text-[#86EFAC] font-medium">
                                                                    +{s.contactPhone}
                                                                </span>
                                                            ) : (
                                                                <span className="text-[#A1A1AA]">Not captured</span>
                                                            )}
                                                        </td>

                                                        {/* Docs */}
                                                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#111] dark:text-white font-medium">
                                                            {s.totalDocs}
                                                        </td>

                                                        {/* Volume */}
                                                        <td className="py-3.5 px-4 text-right font-mono tabular-nums text-[#111] dark:text-white">
                                                            ₦{s.totalVolumeNGN.toLocaleString()}
                                                        </td>

                                                        {/* Behavioral Tags */}
                                                        <td className="py-3.5 px-4">
                                                            <div className="flex flex-wrap gap-1 max-w-[220px]">
                                                                {s.featureTags.slice(0, 2).map((t) => (
                                                                    <span
                                                                        key={t}
                                                                        className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-mono tracking-wide ${
                                                                            t === "High Volume"
                                                                                ? "bg-[#FEF3C7] dark:bg-[#78350F] text-[#92400E] dark:text-[#FDE68A]"
                                                                                : t === "Brand Conscious"
                                                                                ? "bg-[#EDE9FE] dark:bg-[#4C1D95] text-[#6D28D9] dark:text-[#DDD6FE]"
                                                                                : "bg-[#F3F4F6] dark:bg-[#1F2937] text-[#4B5563] dark:text-[#9CA3AF]"
                                                                        }`}
                                                                    >
                                                                        {t}
                                                                    </span>
                                                                ))}
                                                                {s.featureTags.length > 2 && (
                                                                    <span className="text-[9px] font-mono text-[#787774]">
                                                                        +{s.featureTags.length - 2}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </td>

                                                        {/* Top Items */}
                                                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#787774] truncate max-w-[150px]">
                                                            {s.topItems.length > 0 ? s.topItems.slice(0, 2).join(", ") : "—"}
                                                        </td>

                                                        {/* Last Active */}
                                                        <td className="py-3.5 px-4 font-mono text-[11px] text-[#787774]">
                                                            {new Date(s.lastActiveAt).toLocaleDateString("en-GB", {
                                                                day: "numeric",
                                                                month: "short",
                                                            })}
                                                        </td>

                                                        {/* 1-Click WhatsApp Pitch */}
                                                        <td className="py-3.5 px-5 text-right" onClick={(e) => e.stopPropagation()}>
                                                            {s.contactPhone ? (
                                                                <a
                                                                    href={`https://wa.me/${s.contactPhone}?text=${waText}`}
                                                                    target="_blank"
                                                                    rel="noopener noreferrer"
                                                                    className="inline-block bg-[#25D366] hover:bg-[#20BA5A] text-white px-2.5 py-1 rounded font-mono text-[11px] transition-colors"
                                                                >
                                                                    PITCH WA
                                                                </a>
                                                            ) : (
                                                                <button
                                                                    onClick={() => setSelectedShadow(s)}
                                                                    className="inline-block border border-[#EAEAEA] dark:border-[#262626] hover:bg-[#111] hover:text-white dark:hover:bg-white dark:hover:text-[#111] text-[#787774] px-2.5 py-1 rounded font-mono text-[11px] transition-colors"
                                                                >
                                                                    INSPECT
                                                                </button>
                                                            )}
                                                        </td>
                                                    </tr>
                                                );
                                            })
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <div className="p-3 border-t border-[#EAEAEA] dark:border-[#222] bg-[#F7F6F3] dark:bg-[#161616] flex items-center justify-between font-mono text-[11px] text-[#787774]">
                                <span>SHOWING {filteredShadowLeads.length} OF {shadowLeads.length} SHADOW LEADS</span>
                                <span>CLICK ROW TO INSPECT DOSSIER</span>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 2: PRODUCT TELEMETRY & INSIGHTS ────────────────────── */}
                {activeTab === "insights" && stats && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Document Type Distribution */}
                        <div className="bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#222] rounded-lg p-6">
                            <span className="font-mono text-[10px] tracking-widest text-[#787774] uppercase block mb-1">
                                FORMAT DISTRIBUTION
                            </span>
                            <h3 className="text-lg font-bold text-[#111] dark:text-white mb-6">
                                Documents by Category
                            </h3>

                            <div className="space-y-4">
                                <div>
                                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                                        <span>Receipts (Sales proof)</span>
                                        <span className="font-bold">{stats.docTypeCounts.receipt} ({stats.totalDocs ? Math.round((stats.docTypeCounts.receipt / stats.totalDocs) * 100) : 0}%)</span>
                                    </div>
                                    <div className="w-full h-2 bg-[#F4F4F5] dark:bg-[#222] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#e8590c]"
                                            style={{ width: `${stats.totalDocs ? (stats.docTypeCounts.receipt / stats.totalDocs) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                                        <span>Invoices (Billable)</span>
                                        <span className="font-bold">{stats.docTypeCounts.invoice} ({stats.totalDocs ? Math.round((stats.docTypeCounts.invoice / stats.totalDocs) * 100) : 0}%)</span>
                                    </div>
                                    <div className="w-full h-2 bg-[#F4F4F5] dark:bg-[#222] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#1F6C9F]"
                                            style={{ width: `${stats.totalDocs ? (stats.docTypeCounts.invoice / stats.totalDocs) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>

                                <div>
                                    <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                                        <span>Order Summaries</span>
                                        <span className="font-bold">{stats.docTypeCounts.order} ({stats.totalDocs ? Math.round((stats.docTypeCounts.order / stats.totalDocs) * 100) : 0}%)</span>
                                    </div>
                                    <div className="w-full h-2 bg-[#F4F4F5] dark:bg-[#222] rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-[#346538]"
                                            style={{ width: `${stats.totalDocs ? (stats.docTypeCounts.order / stats.totalDocs) * 100 : 0}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Revenue Currency Breakdown */}
                        <div className="bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#222] rounded-lg p-6">
                            <span className="font-mono text-[10px] tracking-widest text-[#787774] uppercase block mb-1">
                                CURRENCY SEGREGATION
                            </span>
                            <h3 className="text-lg font-bold text-[#111] dark:text-white mb-6">
                                Total Processed by Currency
                            </h3>

                            <div className="space-y-4">
                                <div className="p-4 rounded border border-[#EAEAEA] dark:border-[#222] bg-[#F7F6F3] dark:bg-[#181818]">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs text-[#787774]">NGN Volume</span>
                                        <span className="font-mono text-sm font-bold text-[#111] dark:text-white">
                                            ₦{stats.totalVolumeNGN.toLocaleString()}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-4 rounded border border-[#EAEAEA] dark:border-[#222] bg-[#F7F6F3] dark:bg-[#181818]">
                                    <div className="flex items-center justify-between">
                                        <span className="font-mono text-xs text-[#787774]">USD Volume</span>
                                        <span className="font-mono text-sm font-bold text-[#111] dark:text-white">
                                            ${stats.totalVolumeUSD.toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── TAB 3: OUTREACH & CRM ───────────────────────────────────── */}
                {activeTab === "outreach" && (
                    <div className="space-y-6">
                        {/* Segment Copy Strip */}
                        <div className="bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#222] rounded-lg p-6">
                            <h3 className="text-base font-bold text-[#111] dark:text-white mb-1">
                                Segment Email Broadcast Exporter
                            </h3>
                            <p className="text-xs text-[#787774] mb-4">
                                Copy clean comma-separated email lists to paste directly into your email client, BCC field, or newsletter provider.
                            </p>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button
                                    onClick={() => {
                                        const emails = users.map(u => u.email).filter(Boolean).join(", ");
                                        copyToClipboard(emails, "all_emails", `Copied ${users.length} emails to clipboard`);
                                    }}
                                    className="border border-[#EAEAEA] dark:border-[#262626] hover:bg-[#F7F6F3] dark:hover:bg-[#1A1A1A] p-4 rounded text-left transition-colors"
                                >
                                    <span className="font-mono text-[10px] text-[#787774] block uppercase">ALL REGISTERED</span>
                                    <span className="font-bold text-sm block my-1">{users.length} Recipient(s)</span>
                                    <span className="font-mono text-[11px] text-[#e8590c]">
                                        {copiedKey === "all_emails" ? "✓ COPIED" : "COPY LIST →"}
                                    </span>
                                </button>

                                <button
                                    onClick={() => {
                                        const emails = users.filter(u => u.plan === "pro" || u.plan === "business").map(u => u.email).filter(Boolean).join(", ");
                                        copyToClipboard(emails, "paid_emails", `Copied paid users to clipboard`);
                                    }}
                                    className="border border-[#EAEAEA] dark:border-[#262626] hover:bg-[#F7F6F3] dark:hover:bg-[#1A1A1A] p-4 rounded text-left transition-colors"
                                >
                                    <span className="font-mono text-[10px] text-[#787774] block uppercase">PAID (PRO & BIZ)</span>
                                    <span className="font-bold text-sm block my-1">{(stats?.planCounts.pro || 0) + (stats?.planCounts.business || 0)} Customer(s)</span>
                                    <span className="font-mono text-[11px] text-[#e8590c]">
                                        {copiedKey === "paid_emails" ? "✓ COPIED" : "COPY LIST →"}
                                    </span>
                                </button>

                                <button
                                    onClick={() => {
                                        const emails = users.filter(u => u.plan === "free").map(u => u.email).filter(Boolean).join(", ");
                                        copyToClipboard(emails, "free_emails", `Copied free users to clipboard`);
                                    }}
                                    className="border border-[#EAEAEA] dark:border-[#262626] hover:bg-[#F7F6F3] dark:hover:bg-[#1A1A1A] p-4 rounded text-left transition-colors"
                                >
                                    <span className="font-mono text-[10px] text-[#787774] block uppercase">FREE TRIAL USERS</span>
                                    <span className="font-bold text-sm block my-1">{stats?.planCounts.free || 0} User(s)</span>
                                    <span className="font-mono text-[11px] text-[#e8590c]">
                                        {copiedKey === "free_emails" ? "✓ COPIED" : "COPY LIST →"}
                                    </span>
                                </button>
                            </div>
                        </div>

                        {/* Direct Outreach Templates */}
                        <div className="bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#222] rounded-lg p-6">
                            <h3 className="text-base font-bold text-[#111] dark:text-white mb-1">
                                High-Conversion Outreach Blueprints
                            </h3>
                            <p className="text-xs text-[#787774] mb-6">
                                Click to copy pre-formatted outreach copy formulated for Nigerian SME retention and upgrades.
                            </p>

                            <div className="space-y-4">
                                <div className="border border-[#EAEAEA] dark:border-[#262626] rounded p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-mono text-[11px] font-bold text-[#111] dark:text-white uppercase">
                                            Template A: 1-on-1 Founder Check-In (For New Signups)
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(
                                                `Subject: Quick question from Proofa founder\n\nHi [Name],\n\nI noticed you signed up for Proofa recently for your business. I'm the founder and I personally check in with our first users.\n\nAre you having any trouble sending your receipts or adding your bank account details? If there's any feature you wish Proofa had, just reply to this email directly.\n\nBest,\nProofa Team`,
                                                "template_a",
                                                "Copied Template A"
                                            )}
                                            className="font-mono text-[11px] text-[#e8590c] hover:underline"
                                        >
                                            {copiedKey === "template_a" ? "✓ COPIED" : "COPY TEMPLATE"}
                                        </button>
                                    </div>
                                    <p className="text-xs font-mono text-[#787774] leading-relaxed">
                                        Subject: Quick question from Proofa founder...
                                    </p>
                                </div>

                                <div className="border border-[#EAEAEA] dark:border-[#262626] rounded p-4">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="font-mono text-[11px] font-bold text-[#111] dark:text-white uppercase">
                                            Template B: Free → Pro Conversion Nudge (Active Free Users)
                                        </span>
                                        <button
                                            onClick={() => copyToClipboard(
                                                `Subject: Upgrade your business branding on Proofa\n\nHi [Name],\n\nWe noticed you've been actively issuing receipts on Proofa! Your business looks much more official.\n\nIf you'd like to completely remove the Proofa watermark, add your custom business logo, and unlock unlimited HD WhatsApp exports, you can upgrade to Proofa Pro for just ₦2,500/month here:\nhttps://www.proofa.ng/pricing\n\nKeep up the great work!\nProofa Team`,
                                                "template_b",
                                                "Copied Template B"
                                            )}
                                            className="font-mono text-[11px] text-[#e8590c] hover:underline"
                                        >
                                            {copiedKey === "template_b" ? "✓ COPIED" : "COPY TEMPLATE"}
                                        </button>
                                    </div>
                                    <p className="text-xs font-mono text-[#787774] leading-relaxed">
                                        Subject: Upgrade your business branding on Proofa...
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>

            {/* ── CUSTOMER INSPECTION DRAWER ─────────────────────────────────── */}
            {selectedUser && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-white dark:bg-[#121212] border-l border-[#EAEAEA] dark:border-[#222] h-full overflow-y-auto p-8 shadow-2xl flex flex-col justify-between">
                        <div>
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#222] pb-4 mb-6">
                                <span className="font-mono text-[10px] tracking-widest text-[#787774] uppercase">
                                    CUSTOMER PROFILE RECORD
                                </span>
                                <button
                                    onClick={() => setSelectedUser(null)}
                                    className="font-mono text-xs text-[#787774] hover:text-[#111] dark:hover:text-white"
                                >
                                    [CLOSE ✕]
                                </button>
                            </div>

                            {/* Identity Title */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold tracking-tight text-[#111] dark:text-white">
                                    {selectedUser.businessName || selectedUser.name || "Sole Vendor"}
                                </h2>
                                <p className="font-mono text-xs text-[#787774] mt-1">
                                    {selectedUser.email}
                                </p>
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-4">
                                <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4 bg-[#F7F6F3] dark:bg-[#181818]">
                                    <span className="font-mono text-[10px] text-[#787774] uppercase block mb-1">USER_ID</span>
                                    <div className="flex items-center justify-between font-mono text-xs text-[#111] dark:text-white">
                                        <span className="truncate max-w-[280px]">{selectedUser.id}</span>
                                        <button
                                            onClick={() => copyToClipboard(selectedUser.id, "user_id_copy", "User ID copied")}
                                            className="text-[10px] text-[#e8590c] hover:underline uppercase ml-2 shrink-0"
                                        >
                                            {copiedKey === "user_id_copy" ? "COPIED" : "COPY"}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4">
                                        <span className="font-mono text-[10px] text-[#787774] uppercase block mb-1">SUBSCRIPTION</span>
                                        <span className="font-mono text-sm font-bold uppercase text-[#111] dark:text-white">
                                            {selectedUser.plan}
                                        </span>
                                    </div>
                                    <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4">
                                        <span className="font-mono text-[10px] text-[#787774] uppercase block mb-1">DOCUMENTS CREATED</span>
                                        <span className="font-mono text-sm font-bold text-[#111] dark:text-white">
                                            {selectedUser.docCount} docs
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4">
                                        <span className="font-mono text-[10px] text-[#787774] uppercase block mb-1">VOLUME RECORDED</span>
                                        <span className="font-mono text-sm font-bold text-[#111] dark:text-white">
                                            ₦{selectedUser.totalVolume.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4">
                                        <span className="font-mono text-[10px] text-[#787774] uppercase block mb-1">STATUS</span>
                                        <span className="font-mono text-xs font-bold uppercase text-[#346538] dark:text-[#86EFAC]">
                                            {selectedUser.subscriptionStatus}
                                        </span>
                                    </div>
                                </div>

                                <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4">
                                    <span className="font-mono text-[10px] text-[#787774] uppercase block mb-1">REGISTRATION TIMESTAMP</span>
                                    <span className="font-mono text-xs text-[#111] dark:text-white">
                                        {new Date(selectedUser.createdAt).toUTCString()}
                                    </span>
                                </div>

                                <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4">
                                    <span className="font-mono text-[10px] text-[#787774] uppercase block mb-1">LAST SIGN IN</span>
                                    <span className="font-mono text-xs text-[#111] dark:text-white">
                                        {selectedUser.lastSignInAt ? new Date(selectedUser.lastSignInAt).toUTCString() : "Never authenticated via password"}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons at drawer footer */}
                        <div className="pt-6 border-t border-[#EAEAEA] dark:border-[#222] space-y-2">
                            <a
                                href={`mailto:${selectedUser.email}?subject=Hello from Proofa&body=Hi ${selectedUser.businessName || 'there'},`}
                                className="w-full bg-[#111111] hover:bg-[#333333] dark:bg-[#EEEEEE] dark:hover:bg-[#CCCCCC] dark:text-[#111] text-white text-xs font-medium py-3 rounded flex items-center justify-center gap-2 transition-colors"
                            >
                                SEND DIRECT EMAIL
                            </a>
                            <button
                                onClick={() => setSelectedUser(null)}
                                className="w-full border border-[#EAEAEA] dark:border-[#222] hover:bg-[#F7F6F3] dark:hover:bg-[#1A1A1A] text-xs font-mono py-2.5 rounded transition-colors text-[#787774]"
                            >
                                DISMISS
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {/* ── SHADOW LEAD INSPECTION DRAWER ──────────────────────────────── */}
            {selectedShadow && (
                <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-xs transition-opacity animate-in fade-in duration-200">
                    <div className="w-full max-w-lg bg-white dark:bg-[#121212] border-l border-[#EAEAEA] dark:border-[#222] h-full overflow-y-auto p-8 shadow-2xl flex flex-col justify-between">
                        <div>
                            {/* Drawer Header */}
                            <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#1F1F1F] pb-4 mb-6">
                                <span className="font-mono text-xs tracking-wider uppercase text-[#787774]">
                                    SHADOW MERCHANT DOSSIER
                                </span>
                                <button
                                    onClick={() => setSelectedShadow(null)}
                                    className="font-mono text-xs text-[#787774] hover:text-[#111] dark:hover:text-white transition-colors"
                                >
                                    [CLOSE ✕]
                                </button>
                            </div>

                            {/* Identity Title */}
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold tracking-tight text-[#111] dark:text-white">
                                    {selectedShadow.businessName || "Anonymous Vendor"}
                                </h2>
                                <p className="font-mono text-xs text-[#e8590c] mt-1">
                                    {selectedShadow.contactPhone ? `WhatsApp: +${selectedShadow.contactPhone}` : "No phone captured"}
                                </p>
                            </div>

                            {/* Details Grid */}
                            <div className="space-y-4">
                                <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4 bg-[#F7F6F3] dark:bg-[#181818]">
                                    <span className="font-mono text-[10px] text-[#787774] uppercase block mb-1">SHADOW_ID</span>
                                    <div className="flex items-center justify-between font-mono text-xs text-[#111] dark:text-white">
                                        <span className="truncate max-w-[280px]">{selectedShadow.id}</span>
                                        <button
                                            onClick={() => copyToClipboard(selectedShadow.id, "shadow_id_copy", "Shadow ID copied")}
                                            className="text-[10px] text-[#e8590c] hover:underline uppercase ml-2 shrink-0"
                                        >
                                            {copiedKey === "shadow_id_copy" ? "COPIED" : "COPY"}
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4">
                                        <span className="font-mono text-[10px] text-[#787774] uppercase block mb-1">ENVIRONMENT</span>
                                        <span className="font-mono text-xs font-bold text-[#111] dark:text-white">
                                            {selectedShadow.devicePlatform} {selectedShadow.isPWA ? "(PWA Installed)" : "(Web)"}
                                        </span>
                                    </div>
                                    <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4">
                                        <span className="font-mono text-[10px] text-[#787774] uppercase block mb-1">DOCUMENTS EXPORTED</span>
                                        <span className="font-mono text-sm font-bold text-[#111] dark:text-white">
                                            {selectedShadow.totalDocs} ({selectedShadow.receiptCount}r / {selectedShadow.invoiceCount}i / {selectedShadow.orderCount}o)
                                        </span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4">
                                        <span className="font-mono text-[10px] text-[#787774] uppercase block mb-1">GROSS SHADOW VOLUME</span>
                                        <span className="font-mono text-sm font-bold text-[#111] dark:text-white">
                                            ₦{selectedShadow.totalVolumeNGN.toLocaleString()}
                                        </span>
                                    </div>
                                    <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4">
                                        <span className="font-mono text-[10px] text-[#787774] uppercase block mb-1">AUTH USER LINK</span>
                                        <span className="font-mono text-xs font-bold text-[#787774]">
                                            {selectedShadow.userId ? "Linked to Auth" : "Unauthenticated Guest"}
                                        </span>
                                    </div>
                                </div>

                                {/* Behavioral Tags */}
                                <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4">
                                    <span className="font-mono text-[10px] text-[#787774] uppercase block mb-2">TARGETING TAGS</span>
                                    <div className="flex flex-wrap gap-1.5">
                                        {selectedShadow.featureTags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 rounded text-[10px] font-mono bg-[#EDF3EC] dark:bg-[#152617] text-[#346538] dark:text-[#86EFAC] font-medium">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                {/* Discovered Catalog / Top Items */}
                                <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4">
                                    <span className="font-mono text-[10px] text-[#787774] uppercase block mb-2">TOP CATALOG ITEMS</span>
                                    {selectedShadow.topItems.length > 0 ? (
                                        <div className="flex flex-wrap gap-1.5">
                                            {selectedShadow.topItems.map(item => (
                                                <span key={item} className="px-2 py-0.5 rounded text-[11px] font-mono bg-[#F7F6F3] dark:bg-[#1A1A1A] text-[#111] dark:text-[#EAEAEA] border border-[#EAEAEA] dark:border-[#262626]">
                                                    {item}
                                                </span>
                                            ))}
                                        </div>
                                    ) : (
                                        <span className="font-mono text-xs text-[#787774]">No line item data logged yet</span>
                                    )}
                                </div>

                                <div className="border border-[#EAEAEA] dark:border-[#222] rounded p-4">
                                    <span className="font-mono text-[10px] text-[#787774] uppercase block mb-1">FIRST SEEN // LAST ACTIVE</span>
                                    <span className="font-mono text-xs text-[#111] dark:text-white block">
                                        First: {new Date(selectedShadow.firstSeenAt).toUTCString()}
                                    </span>
                                    <span className="font-mono text-xs text-[#787774] block mt-1">
                                        Active: {new Date(selectedShadow.lastActiveAt).toUTCString()}
                                    </span>
                                </div>
                            </div>
                        </div>

                        {/* Action buttons at drawer footer */}
                        <div className="pt-6 border-t border-[#EAEAEA] dark:border-[#222] space-y-2">
                            {selectedShadow.contactPhone ? (
                                <a
                                    href={`https://wa.me/${selectedShadow.contactPhone}?text=${encodeURIComponent(
                                        `Hello ${selectedShadow.businessName || "there"}! 👋 I noticed you've been using Proofa for your business receipts. How has the experience been? If you'd like your business logo & custom branding without watermarks, I can activate a free 14-day Pro trial for you today.`
                                    )}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="w-full bg-[#25D366] hover:bg-[#20BA5A] text-white text-xs font-medium py-3 rounded flex items-center justify-center gap-2 transition-colors"
                                >
                                    OPEN WHATSAPP CONVERSATION
                                </a>
                            ) : (
                                <button
                                    disabled
                                    className="w-full bg-[#EAEAEA] dark:bg-[#222] text-[#A1A1AA] text-xs font-mono py-3 rounded text-center cursor-not-allowed"
                                >
                                    PHONE NOT DETECTED YET
                                </button>
                            )}
                            <button
                                onClick={() => setSelectedShadow(null)}
                                className="w-full border border-[#EAEAEA] dark:border-[#222] hover:bg-[#F7F6F3] dark:hover:bg-[#1A1A1A] text-xs font-mono py-2.5 rounded transition-colors text-[#787774]"
                            >
                                DISMISS
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
