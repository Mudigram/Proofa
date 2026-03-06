"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, ArrowRight, Loader2 } from "lucide-react";
import { signIn, signInWithGoogle } from "@/lib/auth";

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);

        const { error } = await signIn(email.trim(), password);
        if (error) {
            setError(error.message);
            setIsLoading(false);
            return;
        }

        // Redirect to home (or back to wherever the trigger sent them)
        const redirect = new URLSearchParams(window.location.search).get("from") || "/";
        router.push(redirect);
    };

    const handleGoogleSignIn = async () => {
        setError(null);
        setIsLoading(true);
        const { error } = await signInWithGoogle();
        if (error) {
            setError(error.message);
            setIsLoading(false);
        }
        // Redirect is handled automatically by Supabase OAuth flow to /auth/callback
    };

    return (
        <main className="app-container min-h-screen flex flex-col justify-center py-10 bg-gradient-to-br from-orange-50/80 via-white to-surface-50">
            <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="w-full max-w-sm mx-auto bg-white/60 backdrop-blur-xl p-8 rounded-[2.5rem] shadow-2xl shadow-primary-500/5 border border-white"
            >
                {/* Header */}
                <div className="text-center mb-10">
                    <div className="mx-auto mb-6 flex justify-center">
                        <Image
                            src="/Logo/Proofa orange icon.png"
                            alt="Proofa Logo"
                            width={72}
                            height={72}
                            className="drop-shadow-xl"
                            unoptimized
                        />
                    </div>
                    <h1 className="text-3xl font-extrabold text-black tracking-tight">
                        Welcome back
                    </h1>
                    <p className="text-surface-500 text-sm mt-3 font-bold">
                        Sign in to access your Pro features
                    </p>
                </div>

                {/* Google Sign In */}
                <button
                    onClick={handleGoogleSignIn}
                    disabled={isLoading}
                    type="button"
                    className="w-full bg-white border-2 border-surface-200 text-black font-extrabold py-4 rounded-2xl flex items-center justify-center gap-3 shadow-sm hover:bg-surface-50 active:scale-[0.98] transition-all disabled:opacity-60 mb-6"
                >
                    {isLoading ? (
                        <Loader2 size={20} className="animate-spin text-primary-500" />
                    ) : (
                        <>
                            <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                            </svg>
                            Continue with Google
                        </>
                    )}
                </button>

                <div className="flex items-center gap-4 mb-6">
                    <div className="flex-1 h-px bg-surface-200"></div>
                    <span className="text-surface-500 text-[10px] font-black uppercase tracking-widest">or sign in with email</span>
                    <div className="flex-1 h-px bg-surface-200"></div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {/* Email */}
                    <div className="relative">
                        <label className="text-[10px] font-black text-black uppercase tracking-widest mb-1.5 block">
                            Email
                        </label>
                        <div className="relative">
                            <Mail
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400"
                            />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@business.com"
                                required
                                className="w-full pl-11 pr-4 py-4 bg-white border-2 border-surface-200 rounded-2xl text-black font-bold placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div>
                        <label className="text-[10px] font-black text-black uppercase tracking-widest mb-1.5 block">
                            Password
                        </label>
                        <div className="relative">
                            <Lock
                                size={18}
                                className="absolute left-4 top-1/2 -translate-y-1/2 text-surface-400"
                            />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                className="w-full pl-11 pr-12 py-4 bg-white border-2 border-surface-200 rounded-2xl text-black font-bold placeholder:text-surface-400 focus:outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all shadow-sm"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((v) => !v)}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-300 hover:text-surface-600 transition-colors"
                            >
                                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                    </div>

                    {/* Error */}
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-red-50 border border-red-100 text-red-600 text-sm font-medium px-4 py-3 rounded-xl"
                        >
                            {error}
                        </motion.div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-primary-500 text-white font-bold py-4 rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-60 mt-2"
                    >
                        {isLoading ? (
                            <Loader2 size={20} className="animate-spin" />
                        ) : (
                            <>
                                Sign In <ArrowRight size={18} />
                            </>
                        )}
                    </button>
                </form>

                {/* Footer links */}
                <div className="mt-8 text-center space-y-3">
                    <p className="text-surface-500 text-sm font-bold">
                        Don&apos;t have an account?{" "}
                        <Link href="/auth/signup" className="text-primary-600 font-black hover:underline">
                            Create one free
                        </Link>
                    </p>
                    <Link href="/" className="text-surface-400 text-xs font-bold hover:text-surface-600 transition-colors block">
                        Continue without signing in →
                    </Link>
                </div>
            </motion.div>
        </main>
    );
}
