"use client";

/**
 * /admin/segments — behavioural segmentation & targeting console.
 *
 * The overview page answers "how many". This answers "who, why, what do I do about
 * them". Scores and segment membership are computed server-side by lib/segmentation
 * so definitions cannot drift between pages.
 */

import React, { useState, useEffect, useCallback, useMemo } from "react";
import Link from "next/link";
import { useToast } from "@/components/ui/Toast";
import type { CustomerView, SegmentRollup, PopulationStats, LifecycleStage } from "@/lib/segmentation";

interface SegmentRowData extends SegmentRollup {
    exclusiveCount: number;
}

interface Report {
    generatedAt: string;
    lookbackDays: number;
    truncated: boolean;
    population: PopulationStats;
    stageCounts: Record<string, number>;
    unassignedCount: number;
    segments: SegmentRowData[];
    exclusiveLists: Record<string, string[]>;
    customers: CustomerView[];
}

const STAGE_ORDER: LifecycleStage[] = [
    "visitor",
    "first-win",
    "forming",
    "regular",
    "committed",
    "dormant",
    "lost",
    "at-risk-paid",
    "paying",
];

const STAGE_TONE: Record<string, string> = {
    visitor: "bg-[#F4F4F5] dark:bg-[#1F1F1F] text-[#787774]",
    "first-win": "bg-[#FFF4E6] dark:bg-[#2A1B0C] text-[#9A5B12]",
    forming: "bg-[#FFF4E6] dark:bg-[#2A1B0C] text-[#9A5B12]",
    regular: "bg-[#EDF3EC] dark:bg-[#152617] text-[#346538] dark:text-[#86EFAC]",
    committed: "bg-[#EDF3EC] dark:bg-[#152617] text-[#346538] dark:text-[#86EFAC]",
    dormant: "bg-[#FDF3D8] dark:bg-[#2A2410] text-[#8A6A12]",
    lost: "bg-[#FDEBEC] dark:bg-[#2D1618] text-[#9F2F2D] dark:text-[#F87171]",
    "at-risk-paid": "bg-[#FDEBEC] dark:bg-[#2D1618] text-[#9F2F2D] dark:text-[#F87171]",
    paying: "bg-[#EDF3EC] dark:bg-[#152617] text-[#346538] dark:text-[#86EFAC]",
};

const CHANNEL_TONE: Record<string, string> = {
    whatsapp: "bg-[#EDF3EC] dark:bg-[#152617] text-[#346538] dark:text-[#86EFAC]",
    email: "bg-[#EEF2FA] dark:bg-[#141B2C] text-[#2F5597] dark:text-[#93B4E8]",
    "in-product": "bg-[#FFF4E6] dark:bg-[#2A1B0C] text-[#9A5B12]",
    none: "bg-[#F4F4F5] dark:bg-[#1F1F1F] text-[#787774]",
};

function ngn(n: number): string {
    try {
        return new Intl.NumberFormat("en-NG", {
            style: "currency",
            currency: "NGN",
            maximumFractionDigits: 0,
        }).format(Math.round(n || 0));
    } catch {
        return "NGN " + Math.round(n || 0).toLocaleString();
    }
}

/** wa.me needs digits only, no plus sign. Numbers are normalised to 234... upstream. */
function waLink(phone: string | null): string | null {
    if (!phone) return null;
    const digits = String(phone).replace(/\D/g, "");
    if (digits.length < 10) return null;
    return "https://wa.me/" + digits;
}

function toCsv(rows: CustomerView[]): string {
    const header = [
        "key", "kind", "business_name", "stage", "plan", "rfm", "engagement",
        "purchase_intent", "health", "churn_risk", "exports_30d", "volume_90d",
        "days_since_last", "contact_channel", "contact", "segments",
    ];
    const esc = (v: unknown) => '"' + String(v ?? "").replace(/"/g, '""') + '"';
    const lines = rows.map((c) =>
        [
            c.identity.key,
            c.identity.kind,
            c.identity.businessName ?? "",
            c.stage,
            c.identity.plan,
            c.scores.rfm,
            c.scores.engagement,
            c.scores.purchaseIntent,
            c.scores.health ?? "",
            c.scores.churnRisk ?? "",
            c.attributes.exports30d,
            c.attributes.volume90d,
            c.attributes.daysSinceLast ?? "",
            c.attributes.contactable,
            // Only the customer's OWN contact detail is ever exported, never a buyer number.
            c.identity.phone ?? c.identity.email ?? "",
            c.segments.map((s) => s.id).join("|"),
        ]
            .map(esc)
            .join(","),
    );
    return [header.join(","), ...lines].join("\n");
}

export default function SegmentsPage() {
    const { showToast } = useToast();

    const [adminKey, setAdminKey] = useState("");
    const [authed, setAuthed] = useState(false);
    const [loading, setLoading] = useState(false);
    const [report, setReport] = useState<Report | null>(null);
    const [error, setError] = useState<string | null>(null);

    const [openSegment, setOpenSegment] = useState<string | null>(null);
    const [selected, setSelected] = useState<CustomerView | null>(null);
    const [contactableOnly, setContactableOnly] = useState(true);

    const fetchReport = useCallback(async (key: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch("/api/admin/segments", {
                method: "POST",
                headers: { "Content-Type": "application/json", "x-admin-key": key },
                body: JSON.stringify({ adminKey: key }),
            });
            const data = await res.json();
            if (!res.ok || data.error) {
                setError(
                    res.status === 503
                        ? "Admin access is not configured on this deployment. Set ADMIN_SECRET_KEY in the server environment."
                        : data.error || "Request failed (" + res.status + ")",
                );
                if (res.status === 401) setAuthed(false);
                return;
            }
            setReport(data);
        } catch {
            setError("Network error contacting the segmentation service.");
        } finally {
            setLoading(false);
        }
    }, []);

    // Restore the key for this browser session so a refresh does not force re-auth.
    useEffect(() => {
        const saved = typeof window !== "undefined" ? sessionStorage.getItem("proofa_admin_key") : null;
        if (saved) {
            setAdminKey(saved);
            setAuthed(true);
            void fetchReport(saved);
        }
    }, [fetchReport]);

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (!adminKey.trim()) return;
        sessionStorage.setItem("proofa_admin_key", adminKey.trim());
        setAuthed(true);
        void fetchReport(adminKey.trim());
    };

    // The send list is the EXCLUSIVE list: customers whose top-ranked segment is this
    // one. Using the inclusive list instead is how one merchant ends up in three
    // campaigns in the same week.
    const members = useMemo(() => {
        if (!report || !openSegment) return [];
        const exclusive = new Set(report.exclusiveLists[openSegment] ?? []);
        return report.customers
            .filter((c) => exclusive.has(c.identity.key))
            .filter((c) => (contactableOnly ? c.attributes.contactable !== "none" : true))
            .sort((a, b) => b.scores.rfm - a.scores.rfm || b.attributes.volume90d - a.attributes.volume90d);
    }, [report, openSegment, contactableOnly]);

    const exportCsv = (rows: CustomerView[], name: string) => {
        if (rows.length === 0) {
            showToast("Nothing to export for this selection", "error");
            return;
        }
        const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "proofa-" + name + "-" + new Date().toISOString().slice(0, 10) + ".csv";
        link.click();
        URL.revokeObjectURL(url);
        showToast("Exported " + rows.length + " customers", "success");
    };

    if (!authed) {
        return (
            <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0C0C0C] text-[#111111] dark:text-[#EAEAEA] flex flex-col justify-between p-6 sm:p-12 font-sans">
                <div className="flex items-center justify-between border-b border-[#EAEAEA] dark:border-[#1F1F1F] pb-4">
                    <span className="font-mono text-xs tracking-widest text-[#787774] uppercase">
                        PROOFA INTERNAL // SEGMENTATION
                    </span>
                    <Link href="/" className="font-mono text-xs text-[#787774] hover:text-[#111] dark:hover:text-white">
                        ← PROOFA.NG
                    </Link>
                </div>
                <div className="max-w-md w-full mx-auto my-auto py-12">
                    <div className="border border-[#EAEAEA] dark:border-[#1F1F1F] bg-white dark:bg-[#141414] p-8 rounded-lg">
                        <h1 className="text-2xl font-bold tracking-tight">Segment Console</h1>
                        <p className="text-xs text-[#787774] mt-1.5 leading-relaxed">
                            Behavioural scoring, computed segments and target lists.
                        </p>
                        <form onSubmit={handleLogin} className="mt-6 space-y-4">
                            <input
                                type="password"
                                placeholder="••••••••••••"
                                value={adminKey}
                                onChange={(e) => setAdminKey(e.target.value)}
                                className="w-full bg-[#F7F6F3] dark:bg-[#1A1A1A] border border-[#EAEAEA] dark:border-[#262626] rounded px-3.5 py-2.5 text-xs font-mono tracking-widest focus:outline-none focus:border-[#111] dark:focus:border-white"
                                autoFocus
                            />
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-[#111111] hover:bg-[#333] dark:bg-[#EEE] dark:text-[#111] text-white text-xs font-medium py-3 rounded active:scale-[0.98] transition-all disabled:opacity-50"
                            >
                                {loading ? "VERIFYING..." : "AUTHENTICATE"}
                            </button>
                        </form>
                        {error && <p className="mt-4 text-xs text-[#9F2F2D] dark:text-[#F87171] leading-relaxed">{error}</p>}
                    </div>
                </div>
                <div />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#FBFBFA] dark:bg-[#0C0C0C] text-[#111111] dark:text-[#EAEAEA] font-sans">
            <header className="sticky top-0 z-40 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md border-b border-[#EAEAEA] dark:border-[#1F1F1F] px-6 lg:px-12 py-3.5">
                <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="font-bold text-sm tracking-tight flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-[#e8590c] inline-block" />
                            Proofa Terminal
                        </Link>
                        <span className="hidden sm:inline-block text-[#D4D4D8]">/</span>
                        <span className="hidden sm:inline-block font-mono text-[11px] text-[#787774] tracking-wider uppercase">
                            Segments & Targeting
                        </span>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link
                            href="/admin"
                            className="border border-[#EAEAEA] dark:border-[#262626] hover:bg-[#F7F6F3] dark:hover:bg-[#1F1F1F] px-3 py-1.5 rounded text-xs font-mono"
                        >
                            ← OVERVIEW
                        </Link>
                        <button
                            onClick={() => fetchReport(adminKey)}
                            disabled={loading}
                            className="border border-[#EAEAEA] dark:border-[#262626] hover:bg-[#F7F6F3] dark:hover:bg-[#1F1F1F] px-3 py-1.5 rounded text-xs font-mono disabled:opacity-50"
                        >
                            {loading ? "SCORING..." : "RECOMPUTE"}
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-6 lg:px-12 py-8 space-y-8">
                <div className="border-b border-[#EAEAEA] dark:border-[#1F1F1F] pb-6">
                    <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Segments & Targeting</h1>
                    <p className="text-sm text-[#787774] mt-2 max-w-2xl leading-relaxed">
                        Every customer scored on recency, frequency and value, placed in a lifecycle stage and
                        matched to computed segments. Everything is recomputed from raw events on load — nothing
                        here is a stored tag that never expires.
                    </p>
                    {report?.truncated && (
                        <p className="mt-3 text-xs text-[#8A6A12] dark:text-[#ECC94B]">
                            Event scan hit the row cap, so counts below are a floor rather than a total.
                        </p>
                    )}
                </div>

                {!report && !loading && (
                    <div className="border border-[#EAEAEA] dark:border-[#1F1F1F] rounded-lg p-8 text-sm text-[#787774]">
                        {error ?? "Press RECOMPUTE to build the report."}
                    </div>
                )}

                {report && (
                    <>
                        <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                            {[
                                { label: "Customers assessed", value: String(report.population.totalCustomers) },
                                { label: "Paying", value: String(report.population.payingCustomers) },
                                { label: "Median exports / 30d", value: report.population.medianExports30d.toFixed(1) },
                                { label: "No segment matched", value: String(report.unassignedCount) },
                            ].map((m) => (
                                <div key={m.label} className="border border-[#EAEAEA] dark:border-[#1F1F1F] bg-white dark:bg-[#141414] rounded-lg p-4">
                                    <div className="font-mono text-[10px] tracking-widest text-[#787774] uppercase">{m.label}</div>
                                    <div className="text-2xl font-bold tracking-tight mt-1.5">{m.value}</div>
                                </div>
                            ))}
                        </section>

                        <section>
                            <h2 className="font-mono text-[10px] tracking-widest text-[#787774] uppercase mb-3">
                                Lifecycle distribution
                            </h2>
                            <div className="flex flex-wrap gap-2">
                                {STAGE_ORDER.filter((s) => report.stageCounts[s]).map((s) => (
                                    <span key={s} className={"px-2.5 py-1.5 rounded text-xs font-mono " + STAGE_TONE[s]}>
                                        {s} · {report.stageCounts[s]}
                                    </span>
                                ))}
                            </div>
                        </section>

                        <section>
                            <div className="flex flex-wrap items-end justify-between gap-2 mb-3">
                                <h2 className="font-mono text-[10px] tracking-widest text-[#787774] uppercase">
                                    Computed segments · ordered by priority
                                </h2>
                                <span className="font-mono text-[10px] text-[#A1A1AA]">
                                    TO ACTION = de-duplicated list, each customer counted once
                                </span>
                            </div>

                            <div className="border border-[#EAEAEA] dark:border-[#1F1F1F] rounded-lg overflow-hidden divide-y divide-[#EAEAEA] dark:divide-[#1F1F1F] bg-white dark:bg-[#141414]">
                                {report.segments.map((s) => (
                                    <div key={s.id}>
                                        <button
                                            onClick={() => setOpenSegment(openSegment === s.id ? null : s.id)}
                                            className="w-full text-left px-4 py-3.5 hover:bg-[#FBFBFA] dark:hover:bg-[#1A1A1A] transition-colors"
                                        >
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="font-mono text-[10px] text-[#A1A1AA] w-6">P{s.priority}</span>
                                                <span className="font-semibold text-sm">{s.name}</span>
                                                <span className={"px-2 py-0.5 rounded text-[10px] font-mono uppercase " + (CHANNEL_TONE[s.channel] ?? CHANNEL_TONE.none)}>
                                                    {s.channel}
                                                </span>
                                                <span className="font-mono text-[10px] text-[#787774]">→ {s.skill}</span>
                                                <span className="ml-auto flex items-center gap-4 font-mono text-xs">
                                                    <span>{s.count} match</span>
                                                    <span className="text-[#346538] dark:text-[#86EFAC]">{s.exclusiveCount} to action</span>
                                                    <span className="text-[#787774]">{ngn(s.volumeNgn)}</span>
                                                </span>
                                            </div>
                                            <p className="text-xs text-[#787774] mt-1.5 leading-relaxed pl-9">{s.rationale}</p>
                                        </button>

                                        {openSegment === s.id && (
                                            <div className="px-4 pb-5 pl-9 space-y-4 bg-[#FBFBFA] dark:bg-[#111111]">
                                                <div className="pt-3">
                                                    <div className="font-mono text-[10px] tracking-widest text-[#787774] uppercase mb-1">Play</div>
                                                    <p className="text-xs leading-relaxed max-w-3xl">{s.play}</p>
                                                </div>

                                                <div className="flex flex-wrap items-center gap-3">
                                                    <label className="flex items-center gap-2 text-xs text-[#787774] cursor-pointer select-none">
                                                        <input
                                                            type="checkbox"
                                                            checked={contactableOnly}
                                                            onChange={(e) => setContactableOnly(e.target.checked)}
                                                        />
                                                        Contactable only
                                                    </label>
                                                    <span className="font-mono text-[10px] text-[#A1A1AA]">{members.length} in list</span>
                                                    <button
                                                        onClick={() => exportCsv(members, s.id)}
                                                        className="border border-[#EAEAEA] dark:border-[#262626] hover:bg-white dark:hover:bg-[#1F1F1F] px-2.5 py-1 rounded text-[11px] font-mono"
                                                    >
                                                        EXPORT CSV
                                                    </button>
                                                </div>

                                                <div className="space-y-1.5">
                                                    {members.length === 0 && (
                                                        <p className="text-xs text-[#787774]">
                                                            Nobody in this list. If you expected people here, either relax the
                                                            contactable filter or check that the underlying event is being emitted.
                                                        </p>
                                                    )}
                                                    {members.map((c) => {
                                                        const wa = waLink(c.identity.phone ?? null);
                                                        return (
                                                            <div
                                                                key={c.identity.key}
                                                                className="flex flex-wrap items-center gap-3 bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#1F1F1F] rounded px-3 py-2"
                                                            >
                                                                <button onClick={() => setSelected(c)} className="text-left flex-1 min-w-[12rem]">
                                                                    <div className="text-xs font-medium hover:underline">
                                                                        {c.identity.businessName ?? c.identity.email ?? c.identity.key}
                                                                    </div>
                                                                    <div className="font-mono text-[10px] text-[#787774]">
                                                                        RFM {c.scores.rfm} · eng {c.scores.engagement} · intent {c.scores.purchaseIntent}
                                                                        {c.scores.health !== null ? " · health " + c.scores.health : ""}
                                                                    </div>
                                                                </button>
                                                                <span className="font-mono text-[10px] text-[#787774]">
                                                                    {c.attributes.exports30d}/30d · {ngn(c.attributes.volume90d)}
                                                                </span>
                                                                {wa && (
                                                                    <a
                                                                        href={wa}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="px-2 py-1 rounded text-[10px] font-mono bg-[#EDF3EC] dark:bg-[#152617] text-[#346538] dark:text-[#86EFAC]"
                                                                    >
                                                                        WHATSAPP
                                                                    </a>
                                                                )}
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </section>
                    </>
                )}
            </main>

            {selected && (
                <div
                    className="fixed inset-0 z-50 bg-black/40 flex items-end sm:items-center justify-center p-0 sm:p-6"
                    onClick={() => setSelected(null)}
                >
                    <div
                        className="w-full max-w-2xl max-h-[85vh] overflow-y-auto bg-white dark:bg-[#141414] border border-[#EAEAEA] dark:border-[#1F1F1F] rounded-t-lg sm:rounded-lg p-6 space-y-5"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-start justify-between gap-4">
                            <div>
                                <h3 className="text-lg font-bold tracking-tight">
                                    {selected.identity.businessName ?? selected.identity.email ?? selected.identity.key}
                                </h3>
                                <div className="font-mono text-[10px] text-[#787774] mt-1">
                                    {selected.identity.kind} · {selected.identity.plan} · {selected.identity.key}
                                </div>
                            </div>
                            <button
                                onClick={() => setSelected(null)}
                                className="font-mono text-xs text-[#787774] hover:text-[#111] dark:hover:text-white"
                            >
                                CLOSE
                            </button>
                        </div>

                        <p className="text-sm leading-relaxed border-l-2 border-[#e8590c] pl-3">{selected.narrative}</p>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                            {[
                                ["Stage", selected.stage],
                                ["RFM", selected.scores.recency + "/" + selected.scores.frequency + "/" + selected.scores.monetary],
                                ["Bucket", selected.scores.rfmBucket],
                                ["Churn", selected.scores.churnRisk ?? "n/a"],
                                ["Engagement", String(selected.scores.engagement)],
                                ["Intent", String(selected.scores.purchaseIntent)],
                                ["Health", selected.scores.health === null ? "n/a" : String(selected.scores.health)],
                                [
                                    "Own cadence",
                                    selected.attributes.medianActivityGapDays
                                        ? "~" + Math.round(selected.attributes.medianActivityGapDays) + "d"
                                        : "n/a",
                                ],
                            ].map(([k, v]) => (
                                <div key={k}>
                                    <div className="font-mono text-[10px] tracking-widest text-[#787774] uppercase">{k}</div>
                                    <div className="text-sm font-medium mt-0.5">{v}</div>
                                </div>
                            ))}
                        </div>

                        <div>
                            <div className="font-mono text-[10px] tracking-widest text-[#787774] uppercase mb-2">Attributes</div>
                            <div className="font-mono text-[11px] leading-relaxed text-[#787774] grid grid-cols-2 gap-x-4 gap-y-1">
                                <span>
                                    exports 7/30/90: {selected.attributes.exports7d}/{selected.attributes.exports30d}/
                                    {selected.attributes.exports90d}
                                </span>
                                <span>lifetime: {selected.attributes.exportsLifetime}</span>
                                <span>avg doc value: {ngn(selected.attributes.avgDocValue)}</span>
                                <span>receipt share: {(selected.attributes.receiptShare * 100).toFixed(0)}%</span>
                                <span>gate views 7d: {selected.attributes.paywallViews7d}</span>
                                <span>Pro taps 30d: {selected.attributes.proFeatureTaps30d}</span>
                                <span>Pro features used: {selected.attributes.proFeaturesUsed.join(", ") || "none"}</span>
                                <span>
                                    platform: {selected.attributes.platform}
                                    {selected.attributes.pwaInstalled ? " (PWA)" : ""}
                                </span>
                                <span>peak band: {selected.attributes.peakHourBand ?? "n/a"}</span>
                                <span>bank details saved: {selected.attributes.bankDetailsSaved ? "yes" : "no"}</span>
                                <span>contactable: {selected.attributes.contactable}</span>
                                <span>second export in 7d: {selected.attributes.secondExportWithin7d ? "yes" : "no"}</span>
                            </div>
                        </div>

                        <div>
                            <div className="font-mono text-[10px] tracking-widest text-[#787774] uppercase mb-2">
                                Segments · top first
                            </div>
                            <div className="space-y-1.5">
                                {selected.segments.length === 0 && (
                                    <p className="text-xs text-[#787774]">No segment matched.</p>
                                )}
                                {selected.segments.map((s) => (
                                    <div key={s.id} className="border border-[#EAEAEA] dark:border-[#1F1F1F] rounded px-3 py-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-mono text-[10px] text-[#A1A1AA]">P{s.priority}</span>
                                            <span className="text-xs font-medium">{s.name}</span>
                                            <span className="font-mono text-[10px] text-[#787774]">→ {s.skill}</span>
                                        </div>
                                        <p className="text-[11px] text-[#787774] mt-1 leading-relaxed">{s.play}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}