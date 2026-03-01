"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

export default function Header() {
    const pathname = usePathname();
    const router = useRouter();
    const isHome = pathname === "/";

    // Map paths to human-readable titles
    const getPageTitle = () => {
        if (pathname.includes("/receipt")) return "New Receipt";
        if (pathname.includes("/invoice")) return "Invoice Generator";
        if (pathname.includes("/order")) return "Create New Summary";
        if (pathname.includes("/how-it-works")) return "How it Works";
        if (pathname.includes("/history")) return "History";
        if (pathname.includes("/templates")) return "Templates";
        if (pathname.includes("/profile")) return "Profile";
        return "";
    };

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-surface-100">
            <div className="app-container flex items-center justify-between h-16">
                <div className="flex items-center">
                    {!isHome ? (
                        <button
                            onClick={() => router.back()}
                            className="w-10 h-10 -ml-2 rounded-full flex items-center justify-center text-surface-900 active:bg-surface-100 transition-colors"
                        >
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="19" y1="12" x2="5" y2="12" />
                                <polyline points="12 19 5 12 12 5" />
                            </svg>
                        </button>
                    ) : (
                        <Link href="/" className="flex items-center">
                            <div className="w-18 h-18 flex items-center justify-center">
                                <Image
                                    src="/Logo/Proofa orange icon.png"
                                    alt="Proofa Icon"
                                    width={100}
                                    height={100}
                                    className=" object-contain"
                                    priority
                                />
                            </div>
                        </Link>
                    )}

                    <h2 className={`font-black tracking-tight font-heading ${!isHome ? 'text-lg text-surface-900' : 'text-xl bg-gradient-to-r from-surface-900 to-surface-700 bg-clip-text text-transparent'}`}>
                        {isHome ? "PROOFA" : getPageTitle().toUpperCase()}
                    </h2>
                </div>

                {/* Right side - Profile/Settings Placeholder */}
                {/* <div className="flex items-center gap-3">
                    {isHome && (
                        <button className="w-9 h-9 flex items-center justify-center text-surface-400 hover:text-surface-900 transition-colors">
                            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
                                <circle cx="12" cy="12" r="3" />
                            </svg>
                        </button>
                    )}
                    <div className="w-9 h-9 rounded-full bg-primary-100 border border-primary-200 flex items-center justify-center overflow-hidden">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="text-primary-500 translate-y-1">
                            <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                        </svg>
                    </div>
                </div> */}
            </div>
        </header>
    );
}
