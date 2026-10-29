"use client";

import React, { useState } from "react";
import { MessageCircle, Phone, Mail, Copy, Check, Sparkles, ExternalLink, ShieldCheck } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

interface CustomerCareModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PROOFA_SUPPORT_WHATSAPP = "08050826536";
export const PROOFA_SUPPORT_WHATSAPP_INTL = "2348050826536";
export const PROOFA_SUPPORT_EMAIL = "hello@proofa.ng";

export default function CustomerCareModal({ isOpen, onClose }: CustomerCareModalProps) {
  const { showToast } = useToast();
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [copiedPhone, setCopiedPhone] = useState(false);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(PROOFA_SUPPORT_EMAIL);
    setCopiedEmail(true);
    showToast("Support email copied: hello@proofa.ng 📋", "success");
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  const handleCopyPhone = () => {
    navigator.clipboard.writeText(PROOFA_SUPPORT_WHATSAPP);
    setCopiedPhone(true);
    showToast("Support phone copied: 08050826536 📋", "success");
    setTimeout(() => setCopiedPhone(false), 2000);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Customer Care">
      <div className="flex flex-col gap-5 pb-2">
        <p className="text-xs text-surface-500 dark:text-surface-400 leading-relaxed font-medium">
          Have questions about your receipts, bank details, or upgrading your brand? Talk directly with our founder &amp; customer care team.
        </p>

        {/* ── WhatsApp Instant Channel ────────────────────────────────────── */}
        <div className="bg-emerald-50/60 dark:bg-emerald-950/40 border border-emerald-200/80 dark:border-emerald-800/80 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#25D366] text-white flex items-center justify-center shadow-sm">
                <MessageCircle size={18} strokeWidth={2.5} />
              </div>
              <div>
                <h4 className="text-xs font-black text-surface-900 dark:text-surface-100 uppercase tracking-wider">
                  WhatsApp Support
                </h4>
                <p className="text-[10px] text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Fast response · Founder line
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono font-bold text-surface-800 dark:text-surface-200">
              {PROOFA_SUPPORT_WHATSAPP}
            </span>
          </div>

          <a
            href={`https://wa.me/${PROOFA_SUPPORT_WHATSAPP_INTL}?text=${encodeURIComponent(
              "Hello Proofa Customer Care! 👋 I need assistance with my Proofa merchant account."
            )}`}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold py-3 px-4 rounded-xl active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-xs shadow-md shadow-emerald-500/20"
          >
            <span>Open WhatsApp Chat</span>
            <ExternalLink size={14} />
          </a>
        </div>

        {/* ── Secondary Channels: Direct Call & Official Email ────────────── */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Direct Phone Call */}
          <a
            href={`tel:${PROOFA_SUPPORT_WHATSAPP}`}
            className="flex flex-col items-center justify-center p-3.5 bg-surface-50 dark:bg-surface-800 border border-surface-200/70 dark:border-surface-700 rounded-2xl hover:border-surface-300 dark:hover:border-surface-600 transition-all text-center group active:scale-[0.97]"
          >
            <div className="w-8 h-8 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-700 dark:text-surface-300 mb-1.5 group-hover:text-primary-500 transition-colors">
              <Phone size={16} />
            </div>
            <span className="text-[11px] font-black text-surface-900 dark:text-surface-100">
              Direct Call
            </span>
            <span className="text-[10px] text-surface-500 font-mono mt-0.5">
              08050826536
            </span>
          </a>

          {/* Email Support */}
          <button
            type="button"
            onClick={handleCopyEmail}
            className="flex flex-col items-center justify-center p-3.5 bg-surface-50 dark:bg-surface-800 border border-surface-200/70 dark:border-surface-700 rounded-2xl hover:border-surface-300 dark:hover:border-surface-600 transition-all text-center group active:scale-[0.97]"
          >
            <div className="w-8 h-8 rounded-xl bg-surface-100 dark:bg-surface-700 flex items-center justify-center text-surface-700 dark:text-surface-300 mb-1.5 group-hover:text-primary-500 transition-colors">
              {copiedEmail ? <Check size={16} className="text-emerald-500" /> : <Mail size={16} />}
            </div>
            <span className="text-[11px] font-black text-surface-900 dark:text-surface-100">
              {copiedEmail ? "Copied!" : "Email Us"}
            </span>
            <span className="text-[10px] text-surface-500 font-mono mt-0.5 truncate max-w-full">
              hello@proofa.ng
            </span>
          </button>
        </div>

        {/* ── Quick FAQ ───────────────────────────────────────────────────── */}
        <div className="border-t border-surface-100 dark:border-surface-800 pt-3 space-y-2">
          <span className="text-[10px] font-black uppercase tracking-widest text-surface-400 dark:text-surface-500 block">
            Common Quick Answers
          </span>

          <div className="bg-surface-50 dark:bg-surface-800/60 rounded-xl p-3 border border-surface-100 dark:border-surface-800">
            <h5 className="text-[11px] font-bold text-surface-900 dark:text-surface-100 mb-0.5">
              How do I remove the watermark &amp; add my logo?
            </h5>
            <p className="text-[10px] text-surface-500 dark:text-surface-400 leading-relaxed">
              Upgrade to Proofa Pro (₦2,500/mo) in the Pricing tab. It removes all watermarks and lets you upload your custom logo.
            </p>
          </div>

          <div className="bg-surface-50 dark:bg-surface-800/60 rounded-xl p-3 border border-surface-100 dark:border-surface-800">
            <h5 className="text-[11px] font-bold text-surface-900 dark:text-surface-100 mb-0.5">
              How does the Bank Vault work?
            </h5>
            <p className="text-[10px] text-surface-500 dark:text-surface-400 leading-relaxed">
              Go to Profile → Bank Vault. Save your account number once, and it will automatically populate on every invoice and receipt!
            </p>
          </div>
        </div>

        {/* ── Operating Hours Note ─────────────────────────────────────────── */}
        <div className="text-center pt-2 pb-3 text-[10px] text-surface-400 dark:text-surface-500 font-medium tracking-tight">
          Mon – Sat: 8:00 AM – 8:00 PM WAT · Lagos, Nigeria
        </div>
      </div>
    </Modal>
  );
}
