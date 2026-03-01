'use client';
import React, { useEffect, useState } from "react";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/Animations";
import { getUserName } from "@/lib/StorageUtils";
import { useToast } from "@/components/ui/Toast";
import Image from "next/image";
import { Crown, Zap, ShieldCheck, CreditCard as CardIcon, LogOut, ExternalLink, Users, BarChart3, Receipt, Globe, Headset } from "lucide-react";

export default function ProfilePage() {
    const [userName, setUserName] = useState("User");
    const { showToast } = useToast();

    useEffect(() => {
        setUserName(getUserName());
    }, []);

    const handleSubscribe = (plan: string) => {
        showToast(`${plan} Plan is coming soon! Stay tuned.`, "info");
    };

    const plans = [
        {
            id: "pro",
            name: "Pro Plan",
            tagline: "Brand Authority Upgrade",
            price: "₦2,500",
            period: "/ month",
            color: "bg-primary-500",
            textColor: "text-white",
            features: [
                { icon: ShieldCheck, title: "Remove Watermark + HD", desc: "Clean, professional document exports" },
                { icon: Crown, title: "Custom Brand Colors", desc: "Match your IG/WhatsApp identity" },
                { icon: CardIcon, title: "Bank Account Vault", desc: "Save & switch multiple bank details" },
                { icon: Globe, title: "Naira / Dollar Toggle", desc: "For digital & cross-border sellers" },
                { icon: Headset, title: "Priority Tech Support", desc: "Fast-track help for your needs" },
            ]
        },
        {
            id: "business",
            name: "Business",
            tagline: "Operational Upgrade",
            price: "₦5,000",
            period: "/ month",
            color: "bg-gray-900",
            textColor: "text-white",
            features: [
                { icon: Users, title: "Multi-Attendant Sync", desc: "Real-time sales tracking across team" },
                { icon: BarChart3, title: "Business Dashboard", desc: "Track sales daily metrics & health" },
                { icon: Receipt, title: "Smart VAT / Tax Assist", desc: "Simplified 7.5% auto-calculation" },
                { icon: Headset, title: "Dedicated Support", desc: "24/7 priority business assistance" },
            ]
        }
    ];

    return (
        <PageTransition>
            <main className="app-container py-6 pb-32">
                <StaggerContainer>
                    {/* Profile Header */}
                    <StaggerItem>
                        <div className="bg-gray-950 border border-gray-800 rounded-[2.5rem] p-8 shadow-2xl mb-8 flex items-center gap-6 relative overflow-hidden group">
                            <div className="w-24 h-24 rounded-full bg-gray-800/50 border border-gray-700/50 flex items-center justify-center p-5 shadow-xl relative z-10 overflow-hidden">
                                <Image
                                    src="/Logo/Proofa orange icon.png"
                                    alt="Proofa Logo"
                                    width={80}
                                    height={80}
                                    className="object-contain"
                                    priority
                                />
                            </div>
                            <div className="relative z-10">
                                <h3 className="text-2xl font-black text-white tracking-tight leading-tight">
                                    {userName.toUpperCase()}
                                </h3>
                                <div className="inline-flex items-center gap-2 px-2 py-0.5 bg-gray-800 text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-md mt-1 border border-gray-700">
                                    FREE TIER
                                </div>
                            </div>
                        </div>
                    </StaggerItem>

                    {/* Pricing Tiers */}
                    <div className="flex flex-col gap-6 mb-12">
                        {plans.map((plan) => (
                            <StaggerItem key={plan.id}>
                                <div className={`${plan.color} rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden group border border-white/5`}>
                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <h2 className={`text-2xl font-black ${plan.textColor} uppercase tracking-tight`}>{plan.name}</h2>
                                                <p className={`${plan.textColor}/70 text-xs font-bold uppercase tracking-widest`}>{plan.tagline}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className={`text-2xl font-black ${plan.textColor}`}>{plan.price}</div>
                                                <div className={`${plan.textColor}/50 text-[10px] font-black uppercase tracking-widest`}>{plan.period}</div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4 mb-8">
                                            {plan.features.map((f, i) => (
                                                <div key={i} className={`flex items-center gap-4 ${plan.id === 'pro' ? 'bg-white/10' : 'bg-white/5'} rounded-2xl p-4 border border-white/5`}>
                                                    <div className={`w-10 h-10 rounded-xl ${plan.id === 'pro' ? 'bg-white/20' : 'bg-gray-800'} flex items-center justify-center text-white`}>
                                                        <f.icon size={20} />
                                                    </div>
                                                    <div>
                                                        <p className={`text-xs font-black ${plan.textColor} uppercase tracking-tight`}>{f.title}</p>
                                                        <p className={`text-[10px] ${plan.textColor}/60 font-medium`}>{f.desc}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <button
                                            onClick={() => handleSubscribe(plan.name)}
                                            className={`w-full bg-white ${plan.id === 'pro' ? 'text-primary-600' : 'text-gray-900'} font-black py-5 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all uppercase text-xs tracking-widest`}
                                        >
                                            Subscribe to {plan.name}
                                            <Zap size={16} fill="currentColor" />
                                        </button>
                                    </div>
                                </div>
                            </StaggerItem>
                        ))}
                    </div>

                    {/* Footer Actions */}
                    <StaggerItem>
                        <div className="flex flex-col gap-4 items-center">
                            <button className="flex items-center gap-2 px-8 py-4 text-gray-400 font-black uppercase text-[10px] tracking-[0.3em] hover:text-red-500 transition-colors">
                                <LogOut size={14} />
                                Sign Out
                            </button>
                            <a
                                href="https://mudiaga-dev.vercel.app/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="px-6 py-3 bg-gray-50 overflow-hidden relative rounded-full text-[10px] font-black text-primary-600 uppercase tracking-[0.2em] hover:bg-primary-500 hover:text-white transition-all transform active:scale-95 group/mudi"
                            >
                                <span className="relative z-10">Built with ❤️ by Mudi</span>
                            </a>
                        </div>
                    </StaggerItem>
                </StaggerContainer>
            </main>
        </PageTransition >
    );
}
