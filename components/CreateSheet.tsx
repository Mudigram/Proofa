"use client";

import React from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";

interface CreateSheetProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateSheet({ isOpen, onClose }: CreateSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-40"
          />

          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            drag="y"
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0.2}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100 || info.velocity.y > 500) {
                onClose();
              }
            }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-surface-900 rounded-t-[2rem] p-6 pb-10 shadow-2xl flex flex-col"
          >
            {/* Drag Handle */}
            <div className="flex justify-center mb-6">
              <div className="w-10 h-1 bg-surface-300 dark:bg-surface-700 rounded-full" />
            </div>

            <div className="flex flex-col gap-4">
              {/* Receipt Option */}
              <Link
                href="/receipt"
                onClick={onClose}
                className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:bg-surface-50 dark:hover:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-primary-500 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1Z" />
                    <path d="M16 14h-8" />
                    <path d="M16 10h-8" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-surface-900 dark:text-surface-50">Create Receipt</h3>
                  <p className="text-sm text-surface-600 dark:text-surface-300">
                    Instant payment proof for WhatsApp sales
                  </p>
                </div>
                <div className="text-surface-400 dark:text-surface-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </Link>

              {/* Invoice Option */}
              <Link
                href="/invoice"
                onClick={onClose}
                className="flex items-center gap-4 p-4 rounded-2xl border border-transparent hover:bg-surface-50 dark:hover:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-secondary-900 text-white">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" x2="8" y1="13" y2="13" />
                    <line x1="16" x2="8" y1="17" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-surface-900 dark:text-surface-50">Create Invoice</h3>
                  <p className="text-sm text-surface-600 dark:text-surface-300">
                    Itemized bill with bank details
                  </p>
                </div>
                <div className="text-surface-400 dark:text-surface-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </Link>

              {/* Order Summary Option */}
              <Link
                href="/order"
                onClick={onClose}
                className="flex items-center gap-4 p-4 rounded-2xl border border-surface-200 dark:border-surface-800 bg-white dark:bg-surface-900 hover:bg-surface-50 dark:hover:bg-surface-800 focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors"
              >
                <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 text-surface-900 dark:text-surface-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                    <path d="M3 6h18" />
                    <path d="M16 10a4 4 0 0 1-8 0" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-surface-900 dark:text-surface-50">Order Summary</h3>
                  <p className="text-sm text-surface-600 dark:text-surface-300">
                    Order breakdown for buyers
                  </p>
                </div>
                <div className="text-surface-400 dark:text-surface-500">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m9 18 6-6-6-6" />
                  </svg>
                </div>
              </Link>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
