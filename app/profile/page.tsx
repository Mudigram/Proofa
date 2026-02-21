'use client';
import React, { useEffect, useState } from "react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/Animations";
import { getUserName } from "@/lib/StorageUtils";

export default function ProfilePage() {
    const [userName, setUserName] = useState("User");

    useEffect(() => {
        setUserName(getUserName());
    }, []);

    return (
        <PageTransition>
            <main className="app-container py-6 pb-24">
                <StaggerContainer>
                    <StaggerItem>
                        <div className="bg-gradient-to-br from-secondary-900 to-secondary-950 border border-secondary-800 rounded-[2.5rem] p-8 shadow-2xl mb-8 flex items-center gap-6 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-500/10 rounded-full blur-3xl" />
                            <div className="w-20 h-20 rounded-full bg-white/10 border border-white/10 flex items-center justify-center text-white shadow-xl relative z-10">
                                <svg width="40" height="40" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                                </svg>
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                                    {userName.toUpperCase()}
                                </h3>
                                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-primary-500 text-white text-[9px] font-black uppercase tracking-widest rounded-md mt-1">
                                    FREE TIER
                                </div>
                            </div>
                        </div>
                    </StaggerItem>

                    <StaggerItem>
                        <div className="flex flex-col gap-4">
                            {["Business Details", "Logo Settings", "Preferences", "Help & Support"].map((item) => (
                                <div key={item} className="bg-white border border-surface-100 p-5 rounded-3xl flex items-center justify-between group cursor-not-allowed opacity-60 hover:bg-surface-50 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-surface-50 flex items-center justify-center text-surface-400">
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                                                <line x1="9" y1="3" x2="9" y2="21" />
                                            </svg>
                                        </div>
                                        <span className="font-black text-surface-900 text-sm tracking-tight uppercase">{item}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold text-primary-500/50 uppercase tracking-widest">Upgrade</span>
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-surface-200">
                                            <polyline points="9 18 15 12 9 6" />
                                        </svg>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </StaggerItem>

                    <StaggerItem>
                        <button className="w-full mt-10 py-5 bg-surface-100 text-surface-400 font-black uppercase text-[10px] tracking-[0.3em] rounded-2xl active:scale-95 transition-all">
                            Sign Out
                        </button>
                    </StaggerItem>
                </StaggerContainer>
            </main>
        </PageTransition>
    );
}
