"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
    ShieldCheck,
    Users,
    Crown,
    FileText,
    TrendingUp,
    Copy,
    Check,
    Search,
    RefreshCw,
    Mail,
    ArrowUpRight,
    Lock,
    Building2,
    Calendar,
    DollarSign,
    LogOut,
    ExternalLink
} from "lucide-react";
import { useToast } from "@/components/ui/Toast";

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
}

export default function AdminDashboardPage() {
    const { showToast } = useToast();
    const [adminKey, setAdminKey] = useState("");
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [stats, setStats] = useState<StatsData | null>(null);
    const [users, setUsers] = useState<UserRecord[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [planFilter, setPlanFilter] = useState<"all" | "free" | "pro" | "business">("all");
    const [copiedCategory, setCopiedCategory] = useState<string | null>(null);
    const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

    // ── Fetch Data ─────────────────────────────────────────────────────────────
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
                setUsers(data.users);
                setIsAuthenticated(true);
                setLastRefreshed(new Date());
                sessionStorage.setItem("proofa_admin_token", key);
            } else {
                showToast(data.error || "Invalid admin key", "error");
                sessionStorage.removeItem("proofa_admin_token");
                setIsAuthenticated(false);
            }
        } catch (error) {
            console.error("Admin fetch error:", error);
            showToast("Failed to load admin data", "error");
        } finally {
            setIsLoading(false);
        }
    }, [showToast]);

    // Check stored session token on mount
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
        showToast("Logged out from Admin HQ", "info");
    };

    // ── Copy Emails Helper ─────────────────────────────────────────────────────
    const copyEmails = (filter?: "pro" | "free") => {
        let filtered = users.filter(u => u.email && u.email !== "No email");
        if (filter === "pro") {
            filtered = filtered.filter(u => u.plan === "pro" || u.plan === "business");
        } else if (filter === "free") {
            filtered = filtered.filter(u => u.plan === "free");
        }

        const emailList = filtered.map(u => u.email).join(", ");
        if (!emailList) {
            showToast("No emails found for this segment", "info");
            return;
        }

        navigator.clipboard.writeText(emailList);
        const label = filter ? `${filter.toUpperCase()} users` : "all users";
        setCopiedCategory(filter || "all");
        showToast(`Copied ${filtered.length} emails (${label}) to clipboard! 📋`, "success");
        setTimeout(() => setCopiedCategory(null), 2500);
    };

    // ── Filtered Users ─────────────────────────────────────────────────────────
    const filteredUsers = users.filter((u) => {
        const matchesPlan =
            planFilter === "all" ||
            (planFilter === "pro" && (u.plan === "pro" || u.plan === "business")) ||
            u.plan === planFilter;

        const q = searchQuery.toLowerCase();
        const matchesSearch =
            !searchQuery ||
            u.email.toLowerCase().includes(q) ||
            (u.businessName && u.businessName.toLowerCase().includes(q)) ||
            (u.name && u.name.toLowerCase().includes(q));

        return matchesPlan && matchesSearch;
    });

    // ── Render: Locked Screen ──────────────────────────────────────────────────
    if (!isAuthenticated) {
        return (
            <main className="app-container min-h-screen py-20 flex items-center justify-center px-4">
                <div className="w-full max-w-sm bg-white dark:bg-surface-900 border border-surface-200 dark:border-surface-800 rounded-3xl p-8 shadow-xl text-center">
                    <div className="w-16 h-16 bg-primary-50 dark:bg-primary-950/50 text-primary-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-sm">
                        <Lock size={28} />
                    </div>
                    <h1 className="text-xl font-black uppercase tracking-tight text-surface-900 dark:text-surface-50 mb-1">
                        Proofa HQ Admin
                    </h1>
                    <p className="text-xs text-surface-500 dark:text-surface-400 font-medium mb-6">
                        Enter your administrative passkey to access platform analytics and customer directory.
                    </p>

                    <form onSubmit={handleLogin} className="flex flex-col gap-3">
                        <input
                            type="password"
                            placeholder="Enter Admin Key"
                            value={adminKey}
                            onChange={(e) => setAdminKey(e.target.value)}
                            className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl px-4 py-3 text-sm font-semibold text-center tracking-widest focus:outline-none focus:ring-2 focus:ring-primary-500"
                            autoFocus
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-3.5 bg-primary-500 hover:bg-primary-600 active:scale-95 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-md transition-all flex items-center justify-center gap-2"
                        >
                            {isLoading ? <RefreshCw size={16} className="animate-spin" /> : "Unlock Dashboard"}
                        </button>
                    </form>

                    <div className="mt-6 pt-5 border-t border-surface-100 dark:border-surface-800">
                        <Link href="/" className="text-xs text-surface-400 hover:text-surface-600 dark:hover:text-surface-200 font-bold">
                            ← Return to Proofa
                        </Link>
                    </div>
                </div>
            </main>
        );
    }

    // ── Render: Authenticated Admin Dashboard ──────────────────────────────────
    return (
        <main className="app-container min-h-screen py-8 pb-32 max-w-5xl mx-auto px-4">
            {/* Top Navigation & Status Bar */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live Telemetry
                        </span>
                        {lastRefreshed && (
                            <span className="text-[11px] text-surface-400 font-medium">
                                Updated {lastRefreshed.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                        )}
                    </div>
                    <h1 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-surface-900 dark:text-surface-50">
                        Proofa Command Center
                    </h1>
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => fetchData(adminKey)}
                        disabled={isLoading}
                        className="px-3.5 py-2 rounded-xl bg-surface-100 dark:bg-surface-800 hover:bg-surface-200 dark:hover:bg-surface-700 text-surface-700 dark:text-surface-300 text-xs font-bold flex items-center gap-2 transition-all active:scale-95"
                    >
                        <RefreshCw size={14} className={isLoading ? "animate-spin" : ""} />
                        Refresh
                    </button>
                    <button
                        onClick={handleLogout}
                        className="px-3.5 py-2 rounded-xl bg-red-50 dark:bg-red-950/40 hover:bg-red-100 text-red-600 dark:text-red-400 text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95"
                    >
                        <LogOut size={14} />
                        Exit
                    </button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            {stats && (
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
                    {/* Stat 1: Total Users */}
                    <div className="bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-surface-400">
                                Total Users
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-500 flex items-center justify-center">
                                <Users size={16} />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-surface-50 leading-none">
                            {stats.totalUsers}
                        </p>
                        <p className="text-xs text-surface-500 font-medium mt-2 flex items-center gap-1">
                            <span className="text-emerald-500 font-bold">+{stats.newUsers7d}</span> past 7 days
                        </p>
                    </div>

                    {/* Stat 2: Paying Subscriptions */}
                    <div className="bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-surface-400">
                                Paid Subscriptions
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-500 flex items-center justify-center">
                                <Crown size={16} />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-surface-50 leading-none">
                            {stats.planCounts.pro + stats.planCounts.business}
                        </p>
                        <p className="text-xs text-surface-500 font-medium mt-2">
                            {stats.planCounts.pro} Pro · {stats.planCounts.business} Business
                        </p>
                    </div>

                    {/* Stat 3: Estimated MRR */}
                    <div className="bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-surface-400">
                                Estimated MRR
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-500 flex items-center justify-center">
                                <TrendingUp size={16} />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-surface-50 leading-none">
                            ₦{stats.estimatedMRR.toLocaleString()}
                        </p>
                        <p className="text-xs text-surface-500 font-medium mt-2">
                            Recurring monthly run rate
                        </p>
                    </div>

                    {/* Stat 4: Total Documents */}
                    <div className="bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800 rounded-3xl p-5 shadow-sm">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-surface-400">
                                Docs Generated
                            </span>
                            <div className="w-8 h-8 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-500 flex items-center justify-center">
                                <FileText size={16} />
                            </div>
                        </div>
                        <p className="text-2xl sm:text-3xl font-black text-surface-900 dark:text-surface-50 leading-none">
                            {stats.totalDocs}
                        </p>
                        <p className="text-xs text-surface-500 font-medium mt-2">
                            {stats.docTypeCounts.receipt} receipts · {stats.docTypeCounts.invoice} invoices
                        </p>
                    </div>
                </div>
            )}

            {/* Marketing & Email Action Strip */}
            <div className="bg-surface-900 text-white rounded-3xl p-6 mb-8 shadow-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                    <h3 className="text-base font-black uppercase tracking-wider text-white">
                        Marketing & Customer Outreach
                    </h3>
                    <p className="text-xs text-white/70 mt-1 max-w-xl">
                        Copy customer emails with one tap to send feature announcements, onboarding tips, or personal check-in emails.
                    </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <button
                        onClick={() => copyEmails()}
                        className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                    >
                        {copiedCategory === "all" ? <Check size={14} className="text-emerald-400" /> : <Copy size={14} />}
                        Copy All ({users.length})
                    </button>
                    <button
                        onClick={() => copyEmails("pro")}
                        className="px-3.5 py-2.5 bg-primary-500 hover:bg-primary-600 active:scale-95 text-white rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 shadow-sm transition-all"
                    >
                        {copiedCategory === "pro" ? <Check size={14} /> : <Crown size={14} />}
                        Copy Paid ({(stats?.planCounts.pro || 0) + (stats?.planCounts.business || 0)})
                    </button>
                    <button
                        onClick={() => copyEmails("free")}
                        className="px-3.5 py-2.5 bg-white/10 hover:bg-white/20 active:scale-95 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all"
                    >
                        {copiedCategory === "free" ? <Check size={14} className="text-emerald-400" /> : <Mail size={14} />}
                        Copy Free ({stats?.planCounts.free || 0})
                    </button>
                </div>
            </div>

            {/* Customer Directory Header & Controls */}
            <div className="bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800 rounded-3xl p-5 mb-4 shadow-sm">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <div className="relative flex-1">
                        <Search size={16} className="absolute left-3.5 top-3.5 text-surface-400" />
                        <input
                            type="text"
                            placeholder="Search by email, business name, or founder..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-2xl pl-10 pr-4 py-2.5 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                    </div>

                    <div className="flex bg-surface-100 dark:bg-surface-800 p-1 rounded-2xl shrink-0">
                        {(["all", "free", "pro"] as const).map((filter) => (
                            <button
                                key={filter}
                                onClick={() => setPlanFilter(filter)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${
                                    planFilter === filter
                                        ? "bg-white dark:bg-surface-900 text-primary-600 dark:text-primary-400 shadow-sm"
                                        : "text-surface-500 hover:text-surface-800"
                                }`}
                            >
                                {filter === "pro" ? "Pro & Team" : filter}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white dark:bg-surface-900 border border-surface-200/80 dark:border-surface-800 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-surface-100 dark:border-surface-800 bg-surface-50/60 dark:bg-surface-800/40 text-[10px] font-black uppercase tracking-wider text-surface-400">
                                <th className="py-3.5 px-5">User & Business</th>
                                <th className="py-3.5 px-4">Tier</th>
                                <th className="py-3.5 px-4 text-center">Docs</th>
                                <th className="py-3.5 px-4">Joined</th>
                                <th className="py-3.5 px-4">Last Active</th>
                                <th className="py-3.5 px-5 text-right">Reach Out</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-surface-100 dark:divide-surface-800 text-xs">
                            {filteredUsers.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-12 text-center text-surface-400 font-medium">
                                        No users found matching your search.
                                    </td>
                                </tr>
                            ) : (
                                filteredUsers.map((u) => {
                                    const isPaid = u.plan === "pro" || u.plan === "business";
                                    const signupDate = new Date(u.createdAt).toLocaleDateString("en-GB", {
                                        day: "numeric",
                                        month: "short",
                                        year: "numeric",
                                    });

                                    const lastSeen = u.lastSignInAt
                                        ? new Date(u.lastSignInAt).toLocaleDateString("en-GB", {
                                              day: "numeric",
                                              month: "short",
                                          })
                                        : "Never";

                                    return (
                                        <tr key={u.id} className="hover:bg-surface-50/80 dark:hover:bg-surface-800/30 transition-colors">
                                            {/* User & Business */}
                                            <td className="py-4 px-5">
                                                <div className="flex flex-col">
                                                    <span className="font-extrabold text-surface-900 dark:text-surface-50">
                                                        {u.businessName || u.name || "Unnamed Business"}
                                                    </span>
                                                    <span className="text-[11px] text-surface-400 font-medium">
                                                        {u.email}
                                                    </span>
                                                </div>
                                            </td>

                                            {/* Tier Badge */}
                                            <td className="py-4 px-4">
                                                <span
                                                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                                        u.plan === "business"
                                                            ? "bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300"
                                                            : u.plan === "pro"
                                                            ? "bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300"
                                                            : "bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400"
                                                    }`}
                                                >
                                                    {isPaid && <Crown size={11} />}
                                                    {u.plan}
                                                </span>
                                            </td>

                                            {/* Docs Count */}
                                            <td className="py-4 px-4 text-center font-bold text-surface-800 dark:text-surface-200">
                                                {u.docCount}
                                            </td>

                                            {/* Joined */}
                                            <td className="py-4 px-4 text-surface-500 font-medium text-[11px]">
                                                {signupDate}
                                            </td>

                                            {/* Last Active */}
                                            <td className="py-4 px-4 text-surface-500 font-medium text-[11px]">
                                                {lastSeen}
                                            </td>

                                            {/* Contact */}
                                            <td className="py-4 px-5 text-right">
                                                <a
                                                    href={`mailto:${u.email}?subject=Quick question from Proofa&body=Hi ${u.businessName || 'there'},%0D%0A%0D%0AThank you for using Proofa! I wanted to check in and see how everything is working for your business.%0D%0A%0D%0ABest,%0D%0AProofa Team`}
                                                    className="inline-flex items-center gap-1 text-[11px] font-bold text-primary-500 hover:text-primary-600 bg-primary-50 dark:bg-primary-950/40 px-2.5 py-1 rounded-lg transition-colors"
                                                >
                                                    <Mail size={12} />
                                                    Email
                                                </a>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    );
}
