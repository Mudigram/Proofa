"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Home, History, Plus, Info, User } from "lucide-react";

const navItems = [
    {
        label: "Home",
        href: "/",
        icon: Home
    },
    {
        label: "History",
        href: "/history",
        icon: History
    },
    {
        label: "Create",
        href: "/#create",
        isFAB: true,
        icon: Plus
    },
    {
        label: "How-To",
        href: "/how-it-works",
        icon: Info
    },
    {
        label: "Profile",
        href: "/profile",
        icon: User
    },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 px-4 pb-6 pt-2 pointer-events-none">
            <div className="max-w-md mx-auto relative h-16 pointer-events-auto">
                {/* Glass Background */}
                <div className="absolute inset-0 bg-white/80 backdrop-blur-xl border border-surface-200/50 rounded-[2rem] shadow-2xl shadow-surface-900/5" />

                <div className="relative flex items-center justify-around h-full px-2">
                    {navItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = item.icon;

                        if (item.isFAB) {
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    className="relative -top-6 active:scale-95 transition-transform"
                                >
                                    <div className="w-14 h-14 bg-primary-500 rounded-2xl flex items-center justify-center text-white shadow-xl shadow-primary-500/40 ring-4 ring-white">
                                        <Icon size={28} strokeWidth={3} />
                                    </div>
                                </Link>
                            );
                        }

                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`relative flex flex-col items-center justify-center p-3 transition-colors ${isActive ? "text-primary-500" : "text-surface-400"
                                    }`}
                            >
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                {isActive && (
                                    <motion.div
                                        layoutId="active-nav"
                                        className="absolute -bottom-1 w-1 h-1 bg-primary-500 rounded-full"
                                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                    />
                                )}
                            </Link>
                        );
                    })}
                </div>
            </div>
        </nav>
    );
}
