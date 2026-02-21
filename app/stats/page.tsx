import { PageTransition, StaggerContainer, StaggerItem } from "@/components/ui/Animations";

export default function StatsPage() {
    return (
        <PageTransition>
            <main className="app-container py-8 pb-24">
                <StaggerContainer>
                    <StaggerItem>
                        <h1 className="text-3xl font-black text-surface-900 tracking-tight mb-2 uppercase">
                            Statistics
                        </h1>
                        <p className="text-surface-500 font-medium mb-8">
                            Insights into your business document flow.
                        </p>
                    </StaggerItem>

                    <StaggerItem>
                        <div className="bg-gradient-to-br from-primary-50 to-white border border-primary-100 rounded-[2.5rem] p-12 text-center shadow-xl shadow-primary-500/5 relative overflow-hidden group">
                            <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary-200/20 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-1000" />

                            <div className="w-20 h-20 bg-white border border-primary-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#e8590c" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="20" x2="18" y2="10" />
                                    <line x1="12" y1="20" x2="12" y2="4" />
                                    <line x1="6" y1="20" x2="6" y2="14" />
                                </svg>
                            </div>

                            <p className="font-black uppercase tracking-[0.2em] text-[10px] text-primary-600 mb-2">Build in Progress</p>
                            <h2 className="text-xl font-black text-surface-900 mb-3 tracking-tight">Advanced Analytics</h2>
                            <p className="text-sm text-surface-400 font-medium max-w-[240px] mx-auto leading-relaxed">
                                We're building a powerful dashboard to help you track your business growth. Check back soon!
                            </p>
                        </div>
                    </StaggerItem>
                </StaggerContainer>
            </main>
        </PageTransition>
    );
}
