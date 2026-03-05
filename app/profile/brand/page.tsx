"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, Palette, Loader2, Sparkles } from "lucide-react";
import { ColorPicker, PRESET_COLORS } from "@/components/ui/ColorPicker";
import { LogoUpload } from "@/components/ui/LogoUpload";
import { updateProfile } from "@/lib/auth";
import { uploadLogo, deleteLogo } from "@/lib/storage";

const CURRENCIES = [
    { code: "NGN", symbol: "₦", label: "Nigerian Naira" },
    { code: "USD", symbol: "$", label: "US Dollar" },
    { code: "GBP", symbol: "£", label: "British Pound" },
    { code: "EUR", symbol: "€", label: "Euro" },
];

export default function BrandIdentityPage() {
    const { user, profile, isPro, isAuthenticated, isLoading: authLoading, refreshProfile } = useAuth();
    const router = useRouter();

    const [selectedColor, setSelectedColor] = useState(PRESET_COLORS[0].hex);
    const [logoUrl, setLogoUrl] = useState<string | undefined>(undefined);
    const [logoFile, setLogoFile] = useState<string | null>(null); // base64 for pending upload
    const [selectedCurrency, setSelectedCurrency] = useState("NGN");
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/auth/login?from=/profile/brand");
        } else if (profile) {
            if (profile.primaryColor) setSelectedColor(profile.primaryColor);
            if (profile.logoUrl) setLogoUrl(profile.logoUrl);
            if (profile.defaultCurrency) setSelectedCurrency(profile.defaultCurrency);
        }
    }, [authLoading, isAuthenticated, profile, router]);

    const handleSave = async () => {
        if (!user) return;
        setIsSaving(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        try {
            let finalLogoUrl = logoUrl;

            // 1. Handle Logo Upload if needed
            if (logoFile) {
                const { url, error: uploadErr } = await uploadLogo(user.id, logoFile);
                if (uploadErr) {
                    setErrorMsg("Logo upload failed: " + uploadErr);
                    setIsSaving(false);
                    return;
                }
                finalLogoUrl = url || undefined;

                // Cleanup old logo if it was a storage URL
                if (profile?.logoUrl && profile.logoUrl.includes("supabase.co")) {
                    await deleteLogo(profile.logoUrl);
                }
            } else if (logoUrl === undefined && profile?.logoUrl) {
                // User removed the logo
                if (profile.logoUrl.includes("supabase.co")) {
                    await deleteLogo(profile.logoUrl);
                }
                finalLogoUrl = ""; // empty string to clear DB field
            }

            // 2. Update Profile
            const { error } = await updateProfile(user.id, {
                primary_color: selectedColor,
                logo_url: finalLogoUrl === "" ? null : finalLogoUrl,
                default_currency: selectedCurrency,
            });

            if (error) {
                setErrorMsg(error.message);
            } else {
                setSuccessMsg("Brand identity updated successfully!");
                setLogoFile(null); // Reset pending upload
                await refreshProfile(); // pull the new data into context
                setTimeout(() => setSuccessMsg(null), 3000);
            }
        } catch (err: any) {
            setErrorMsg(err.message || "An unexpected error occurred.");
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading) {
        return (
            <main className="app-container min-h-screen pb-24 pt-8 flex items-center justify-center">
                <div className="w-8 h-8 rounded-full border-4 border-primary-200 border-t-primary-500 animate-spin"></div>
            </main>
        );
    }

    if (!isPro) {
        return (
            <main className="app-container min-h-screen pb-24 pt-8 flex flex-col">
                <header className="mb-8 flex items-center justify-between relative">
                    <button onClick={() => router.back()} className="w-10 h-10 bg-white border border-surface-200 rounded-full flex items-center justify-center text-surface-600 shadow-sm active:scale-95 transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <h1 className="text-xl font-black text-surface-900 tracking-tight absolute left-1/2 -translate-x-1/2">Brand Identity</h1>
                    <div className="w-10 h-10"></div>
                </header>

                <div className="flex-1 flex flex-col items-center justify-center text-center px-4 -mt-20">
                    <div className="w-24 h-24 bg-gradient-to-br from-purple-100 to-primary-50 rounded-3xl flex items-center justify-center text-purple-500 mb-6 shadow-xl shadow-purple-500/10 rotate-3">
                        <Palette size={40} className="opacity-80 drop-shadow-sm" />
                    </div>
                    <h2 className="text-3xl font-black text-surface-900 mb-3 tracking-tight">Pro Feature</h2>
                    <p className="text-surface-500 text-sm font-medium mb-8 max-w-[260px] leading-relaxed">
                        Customize receipts and invoices to match your unique brand colors perfectly.
                    </p>
                    <div className="flex -space-x-3 mb-8">
                        {PRESET_COLORS.slice(0, 4).map(c => (
                            <div key={c.id} className="w-8 h-8 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c.hex }} />
                        ))}
                    </div>
                    <Link
                        href="/pricing"
                        className="bg-surface-900 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-surface-900/20 active:scale-95 transition-all text-sm w-full max-w-xs"
                    >
                        Unlock Brand Colors
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="app-container min-h-screen pb-24 pt-8">
            <header className="mb-8 flex items-center justify-between relative">
                <button onClick={() => router.back()} className="w-10 h-10 bg-white border border-surface-200 rounded-full flex items-center justify-center text-surface-600 shadow-sm active:scale-95 transition-all">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                    <Palette size={20} className="text-primary-500" />
                    <h1 className="text-xl font-black text-surface-900 tracking-tight">Brand Identity</h1>
                </div>
                <div className="w-10 h-10"></div>
            </header>

            {/* Logo Section */}
            <div className="bg-white border-2 border-surface-100 rounded-[2rem] p-6 shadow-sm mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary-50 text-primary-500 rounded-xl flex items-center justify-center">
                        <Sparkles size={20} />
                    </div>
                    <div>
                        <h2 className="font-extrabold text-black">Permanent Logo</h2>
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest">Saved & restored automatically</p>
                    </div>
                </div>

                <LogoUpload
                    value={logoFile || logoUrl}
                    onChange={(val) => {
                        if (!val) {
                            setLogoUrl(undefined);
                            setLogoFile(null);
                        } else {
                            setLogoFile(val);
                        }
                    }}
                />
            </div>

            {/* Currency Section */}
            <div className="bg-white border-2 border-surface-100 rounded-[2rem] p-6 shadow-sm mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center">
                        <Palette size={20} />
                    </div>
                    <div>
                        <h2 className="font-extrabold text-black">Preferred Currency</h2>
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest">Defaults for all forms</p>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    {CURRENCIES.map((curr) => (
                        <button
                            key={curr.code}
                            onClick={() => setSelectedCurrency(curr.code)}
                            className={`flex flex-col items-center justify-center p-4 rounded-[1.5rem] border-2 transition-all active:scale-95 ${selectedCurrency === curr.code
                                ? "bg-amber-500 border-amber-500 text-white shadow-lg shadow-amber-500/20"
                                : "bg-surface-50 border-surface-100 text-surface-400 hover:border-surface-200"
                                }`}
                        >
                            <span className="text-xl font-black mb-1">{curr.symbol}</span>
                            <span className="text-[10px] font-black uppercase tracking-widest">{curr.code}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color Section */}
            <div className="bg-white border-2 border-surface-100 rounded-[2rem] p-6 shadow-sm mb-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 bg-primary-50 text-primary-500 rounded-xl flex items-center justify-center">
                        <Palette size={20} />
                    </div>
                    <div>
                        <h2 className="font-extrabold text-black">Primary Brand Color</h2>
                        <p className="text-[11px] font-bold text-surface-400 uppercase tracking-widest">Applied to templates instantly</p>
                    </div>
                </div>

                <ColorPicker
                    value={selectedColor}
                    onChange={setSelectedColor}
                />

                {/* Live Color Preview inside the settings */}
                <div className="mt-8 p-6 rounded-2xl border-2 border-dashed border-surface-200 flex flex-col items-center justify-center bg-surface-50">
                    <p className="text-xs font-bold text-surface-500 mb-4 uppercase tracking-widest">Preview</p>
                    <div
                        className="font-extrabold px-6 py-3 rounded-xl text-white shadow-lg transition-colors flex items-center gap-2"
                        style={{ backgroundColor: selectedColor }}
                    >
                        <span>Total:</span>
                        <span>{CURRENCIES.find(c => c.code === selectedCurrency)?.symbol}150,000</span>
                    </div>
                </div>
            </div>

            {errorMsg && (
                <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-4 py-3 rounded-xl mb-6">
                    {errorMsg}
                </div>
            )}
            {successMsg && (
                <div className="bg-green-50 border border-green-100 text-green-600 text-sm font-bold px-4 py-3 rounded-xl mb-6">
                    {successMsg}
                </div>
            )}

            <button
                onClick={handleSave}
                disabled={isSaving || (profile?.primaryColor === selectedColor && profile?.logoUrl === logoUrl && !logoFile && profile?.defaultCurrency === selectedCurrency)}
                className="w-full bg-surface-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-surface-900/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none"
            >
                {isSaving ? (
                    <Loader2 size={20} className="animate-spin" />
                ) : (
                    "Save Brand Identity"
                )}
            </button>
            <p className="text-[10px] text-surface-400 font-black uppercase tracking-[0.15em] text-center mt-4">
                UPDATES APPLY TO ALL NEW DOCUMENTS
            </p>
        </main>
    );
}
