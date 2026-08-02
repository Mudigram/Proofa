"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";
import { useNetworkStatus } from "@/hooks/useNetworkStatus";

/**
 * NetworkToast — persistent amber toast when offline, brief green toast on reconnect.
 * Rendered once inside the root layout.
 */
export default function NetworkToast() {
    const { isOnline } = useNetworkStatus();
    const wasOffline = useRef(false);
    const [showReconnected, setShowReconnected] = useState(false);

    useEffect(() => {
        if (!isOnline) {
            wasOffline.current = true;
            setShowReconnected(false);
        }
        if (isOnline && wasOffline.current) {
            wasOffline.current = false;
            setShowReconnected(true);
            const timeout = setTimeout(() => {
                setShowReconnected(false);
            }, 4000);
            return () => clearTimeout(timeout);
        }
    }, [isOnline]);

    return (
        <>
            <AnimatePresence>
                {!isOnline && (
                    <motion.div
                        key="offline-toast"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-0 left-0 right-0 z-[9998] px-4 pt-[env(safe-area-inset-top,12px)]"
                    >
                        <div className="max-w-md mx-auto mt-2 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-amber-50 border border-amber-200 shadow-lg">
                            <WifiOff className="w-5 h-5 text-amber-600 shrink-0" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-amber-900 tracking-tight">
                                    You&apos;re offline
                                </p>
                                <p className="text-xs text-amber-700 font-medium mt-0.5 leading-relaxed">
                                    You can still view saved documents. Creating and sharing require a connection.
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showReconnected && (
                    <motion.div
                        key="reconnected-toast"
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed top-0 left-0 right-0 z-[9998] px-4 pt-[env(safe-area-inset-top,12px)]"
                    >
                        <div className="max-w-md mx-auto mt-2 flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-green-50 border border-green-200 shadow-lg">
                            <Wifi className="w-5 h-5 text-green-600 shrink-0" />
                            <p className="text-sm font-bold text-green-900 tracking-tight">
                                You&apos;re back online
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
}
