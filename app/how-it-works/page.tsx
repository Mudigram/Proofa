"use client";

import Link from "next/link";
import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/Animations";

export default function HowItWorks() {
    return (
        <PageTransition>
            <main className="app-container py-6 pb-24">
                {/* Hero Section */}
                <StaggerContainer>
                    <StaggerItem>
                        <section className="mt-2 mb-10">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary-50 text-primary-700 text-[10px] font-black uppercase tracking-wider rounded-lg mb-4 border border-primary-100">
                                OUR PROCESS
                            </div>
                            <h1 className="text-3xl font-black text-surface-900 tracking-tight mb-4 leading-tight">
                                Professional documents, <span className="text-primary-500">effortlessly.</span>
                            </h1>
                            <p className="text-surface-500 text-sm leading-relaxed font-medium">
                                Create and share professional documents <strong>in seconds</strong> with our streamlined 3-step process. Efficiency redefined for modern workflows.
                            </p>

                            <div className="flex flex-col gap-3 mt-8">
                                <Link
                                    href="/"
                                    className="w-full bg-primary-500 text-white font-black py-5 rounded-[2rem] flex items-center justify-center gap-2 shadow-xl shadow-primary-500/20 active:scale-[0.98] transition-all uppercase text-xs tracking-widest"
                                >
                                    Get Started
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="5" y1="12" x2="19" y2="12" />
                                        <polyline points="12 5 19 12 12 19" />
                                    </svg>
                                </Link>
                                <Link
                                    href="/templates"
                                    className="w-full bg-white border border-surface-200 text-surface-900 font-black py-5 rounded-[2rem] flex items-center justify-center active:scale-[0.98] transition-all uppercase text-xs tracking-widest"
                                >
                                    View Templates
                                </Link>
                            </div>
                        </section>
                    </StaggerItem>

                    {/* Featured Image Placeholder */}
                    <StaggerItem>
                        <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-surface-100 mb-16 shadow-2xl border border-surface-200/50 group">
                            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/20 via-transparent to-surface-900/10" />
                            <div className="absolute inset-0 flex items-center justify-center text-primary-500/20 group-hover:scale-110 transition-transform duration-700">
                                <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
                                    <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                                    <line x1="8" y1="21" x2="16" y2="21" />
                                    <line x1="12" y1="17" x2="12" y2="21" />
                                </svg>
                            </div>
                            <div className="absolute bottom-6 left-6 right-6 p-4 glass-effect rounded-2xl border border-white/20">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-primary-500 flex items-center justify-center text-white font-black text-[10px]">P</div>
                                    <div className="flex-1">
                                        <div className="h-2 w-24 bg-surface-900/10 rounded-full mb-1" />
                                        <div className="h-1.5 w-16 bg-surface-900/5 rounded-full" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </StaggerItem>

                    {/* Path Section */}
                    <StaggerItem>
                        <section className="text-center mb-12">
                            <h2 className="text-2xl font-black text-surface-900 tracking-tight uppercase">
                                Your path to efficiency
                            </h2>
                            <div className="w-16 h-1.5 bg-primary-500 mx-auto mt-4 rounded-full" />
                        </section>
                    </StaggerItem>

                    {/* Steps List */}
                    <StaggerItem>
                        <section className="flex flex-col gap-10 relative">
                            {/* Step 1 */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-primary-500 text-white font-black flex items-center justify-center shadow-xl mb-6 ring-8 ring-primary-50">
                                    1
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-surface-100 text-center w-full">
                                    <h3 className="text-xl font-black text-surface-900 mb-3 tracking-tight">Choose Document Type</h3>
                                    <p className="text-sm text-surface-400 font-medium leading-relaxed">
                                        Select from our library of proven templates tailored for your specific project needs.
                                    </p>
                                </div>
                            </div>

                            {/* Step 2 */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-primary-500 text-white font-black flex items-center justify-center shadow-xl mb-6 ring-8 ring-primary-50">
                                    2
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-surface-100 text-center w-full">
                                    <h3 className="text-xl font-black text-surface-900 mb-3 tracking-tight">Fill in Details</h3>
                                    <p className="text-sm text-surface-400 font-medium leading-relaxed">
                                        Input your specifics. Our smart editor formats everything automatically to professional standards.
                                    </p>
                                </div>
                            </div>

                            {/* Step 3 */}
                            <div className="flex flex-col items-center">
                                <div className="w-12 h-12 rounded-full bg-primary-500 text-white font-black flex items-center justify-center shadow-xl mb-6 ring-8 ring-primary-50">
                                    3
                                </div>
                                <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-surface-100 text-center w-full">
                                    <h3 className="text-xl font-black text-surface-900 mb-3 tracking-tight">Share to WhatsApp</h3>
                                    <p className="text-sm text-surface-400 font-medium leading-relaxed">
                                        One tap to send your finalized document directly to stakeholders via WhatsApp.
                                    </p>
                                </div>
                            </div>
                        </section>
                    </StaggerItem>

                    {/* Pricing Section */}
                    <StaggerItem>
                        <section className="mt-20 mb-12">
                            <div className="text-center mb-10">
                                <h2 className="text-2xl font-black text-surface-900 tracking-tight uppercase">
                                    Simple, Transparent Plans
                                </h2>
                                <p className="text-sm text-surface-400 font-medium mt-2">
                                    Powering your business growth, one document at a time.
                                </p>
                            </div>

                            <div className="flex flex-col gap-6">
                                {/* Free Plan */}
                                <div className="bg-white border border-surface-100 p-8 rounded-[2.5rem] shadow-sm relative overflow-hidden">
                                    <div className="flex justify-between items-start mb-6">
                                        <div>
                                            <h3 className="text-xl font-black text-surface-900 tracking-tight">Proofa Lite</h3>
                                            <p className="text-[10px] font-black text-surface-300 uppercase tracking-widest mt-1">Free Forever</p>
                                        </div>
                                        <div className="text-2xl font-black text-surface-900">₦0</div>
                                    </div>
                                    <ul className="flex flex-col gap-4 mb-2">
                                        {[
                                            "3 Professional Templates",
                                            "Export to WhatsApp",
                                            "10 Document History Limit",
                                            "Free-tier Watermark"
                                        ].map((feature) => (
                                            <li key={feature} className="flex items-center gap-3 text-sm text-surface-500 font-medium">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {/* Pro Plan */}
                                <div className="bg-gradient-to-br from-primary-500 to-primary-600 p-8 rounded-[2.5rem] shadow-xl shadow-primary-500/20 relative overflow-hidden group">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2" />
                                    <div className="flex justify-between items-start mb-6 relative z-10">
                                        <div>
                                            <h3 className="text-xl font-black text-white tracking-tight">Proofa Pro</h3>
                                            <div className="inline-flex px-2 py-0.5 bg-white/20 text-white text-[8px] font-black uppercase tracking-widest rounded mt-1">
                                                COMING SOON
                                            </div>
                                        </div>
                                        <div className="text-2xl font-black text-white">₦2,500<span className="text-[10px] opacity-60">/mo</span></div>
                                    </div>
                                    <ul className="flex flex-col gap-4 relative z-10">
                                        {[
                                            "Unlimited Document History",
                                            "Zero Watermarks",
                                            "Multi-item Invoice Logic",
                                            "Advanced Business Analytics",
                                            "Priority Tech Support"
                                        ].map((feature) => (
                                            <li key={feature} className="flex items-center gap-3 text-sm text-white/90 font-medium">
                                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                    <div className="mt-8 pt-6 border-t border-white/10 relative z-10">
                                        <div className="text-[10px] text-white/60 font-black uppercase tracking-[0.2em] text-center">
                                            Scale your business to the next level
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>
                    </StaggerItem>

                    {/* CTA Section */}
                    <StaggerItem>
                        <section className="mt-24">
                            <div className="bg-gradient-to-br from-secondary-900 to-secondary-950 p-10 rounded-[3rem] text-center shadow-2xl relative overflow-hidden group">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary-500/20 rounded-full blur-[80px] group-hover:scale-110 transition-transform duration-[2s]" />
                                <div className="absolute bottom-0 left-0 w-48 h-48 bg-blue-500/10 rounded-full blur-[80px]" />

                                <h2 className="text-2xl font-black text-white mb-4 leading-tight tracking-tight px-4">
                                    READY TO BOOST YOUR PRODUCTIVITY?
                                </h2>
                                <p className="text-white/40 text-sm mb-10 font-medium px-4">
                                    Join thousands of professionals using Proofa to streamline their documentation.
                                </p>
                                <Link
                                    href="/"
                                    className="inline-flex w-full bg-primary-500 text-white font-black py-5 rounded-2xl items-center justify-center active:scale-[0.98] transition-all uppercase text-xs tracking-[0.2em] shadow-lg shadow-black/20"
                                >
                                    Get Started Now
                                </Link>
                            </div>
                        </section>
                    </StaggerItem>
                </StaggerContainer>

                {/* Footer Branding */}
                <footer className="mt-20 pb-10 text-center">
                    <div className="flex flex-col items-center justify-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-white border border-surface-100 flex items-center justify-center shadow-sm">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#e8590c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                <polyline points="14 2 14 8 20 8" />
                            </svg>
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-surface-300">Proofa v1.0</span>
                    </div>
                </footer>
            </main>
        </PageTransition>
    );
}
