"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { ChevronLeft, Loader2, User, Building2, Mail } from "lucide-react";
import { updateProfile } from "@/lib/auth";
import { Input } from "@/components/ui/FormInput";

export default function AccountSettingsPage() {
    const { user, profile, isAuthenticated, isLoading: authLoading, refreshProfile } = useAuth();
    const router = useRouter();

    const [businessName, setBusinessName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/auth/login?from=/profile/settings");
        } else if (profile) {
            setBusinessName(profile.businessName || profile.name || "");
        }
    }, [authLoading, isAuthenticated, profile, router]);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;

        setIsSaving(true);
        setErrorMsg(null);
        setSuccessMsg(null);

        const { error } = await updateProfile(user.id, {
            business_name: businessName.trim(),
        });

        if (error) {
            setErrorMsg(error.message);
        } else {
            setSuccessMsg("Profile updated successfully!");
            await refreshProfile();
            setTimeout(() => setSuccessMsg(null), 3000);
        }
        setIsSaving(false);
    };

    if (authLoading) {
        return (
            <main className="app-container min-h-screen pb-24 pt-8 flex items-center justify-center">
                <Loader2 size={32} className="animate-spin text-primary-500" />
            </main>
        );
    }

    const hasChanges = businessName.trim() !== (profile?.businessName || profile?.name || "");

    return (
        <main className="app-container min-h-screen pb-24 pt-8">
            <header className="mb-8 flex items-center justify-between relative">
                <button onClick={() => router.back()} className="w-10 h-10 bg-white border border-surface-200 rounded-full flex items-center justify-center text-surface-600 shadow-sm active:scale-95 transition-all">
                    <ChevronLeft size={20} />
                </button>
                <div className="flex items-center gap-2 absolute left-1/2 -translate-x-1/2">
                    <User size={20} className="text-primary-500" />
                    <h1 className="text-xl font-black text-surface-900 tracking-tight">Account Settings</h1>
                </div>
                <div className="w-10 h-10"></div>
            </header>

            <form onSubmit={handleSave} className="flex flex-col gap-6">
                <div className="bg-white border-2 border-surface-100 rounded-[2rem] p-6 shadow-sm">
                    <div className="mb-6 flex justify-center">
                        <div className="relative">
                            <div className="w-24 h-24 bg-gradient-to-br from-primary-100 to-primary-50 rounded-full flex flex-col items-center justify-center shadow-inner border-4 border-white">
                                <span className="text-3xl font-black text-primary-600">
                                    {businessName?.[0]?.toUpperCase() || <User size={32} />}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest pl-1">Email Address</label>
                            <div className="relative flex items-center">
                                <Mail size={16} className="absolute left-4 text-surface-400" />
                                <input
                                    type="email"
                                    value={user?.email || ""}
                                    disabled
                                    className="w-full pl-11 pr-4 py-3.5 bg-surface-50 border-2 border-transparent rounded-xl text-surface-500 font-bold opacity-70 cursor-not-allowed"
                                />
                            </div>
                            <p className="text-[10px] text-surface-400 font-semibold pl-1">Email cannot be changed right now.</p>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black text-surface-500 uppercase tracking-widest pl-1">Business / Profile Name</label>
                            <div className="relative flex items-center">
                                <Building2 size={16} className="absolute left-4 text-surface-400" />
                                <input
                                    type="text"
                                    value={businessName}
                                    onChange={(e) => setBusinessName(e.target.value)}
                                    placeholder="Your Business Name"
                                    className="w-full pl-11 pr-4 py-3.5 bg-surface-50 border-2 border-surface-100 rounded-xl text-black font-bold focus:border-primary-500 focus:bg-white transition-colors"
                                    required
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {errorMsg && (
                    <div className="bg-red-50 border border-red-100 text-red-600 text-sm font-bold px-4 py-3 rounded-xl">
                        {errorMsg}
                    </div>
                )}
                {successMsg && (
                    <div className="bg-green-50 border border-green-100 text-green-600 text-sm font-bold px-4 py-3 rounded-xl">
                        {successMsg}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={isSaving || !hasChanges}
                    className="w-full bg-primary-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:shadow-none mt-2"
                >
                    {isSaving ? <Loader2 size={20} className="animate-spin" /> : "Save Changes"}
                </button>
            </form>
        </main>
    );
}
