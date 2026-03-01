"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";

/**
 * iHealth Login Page
 * 
 * Simulated iHealth login page. Any email/password is accepted.
 * On success, redirects to the iHealth success page.
 */
export default function IHealthLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleSignIn = (e) => {
        e.preventDefault();
        if (!email || !password) return;
        setLoading(true);
        // Simulate auth — any email/password accepted
        setTimeout(() => {
            router.push("/ihealth-success");
        }, 800);
    };

    return (
        <div className="flex flex-col min-h-full bg-[#f2f2f2] font-sans">
            {/* iHealth logo header */}
            <div className="bg-white pt-14 pb-8 flex items-center justify-center">
                <div className="flex flex-col items-center gap-1">
                    <div className="text-4xl font-bold text-[#d46f28] tracking-tight">iHealth</div>
                    <p className="text-xs text-neutral-400">Smart Health Monitoring</p>
                </div>
            </div>

            {/* Login card */}
            <div className="mx-4 mt-4 bg-white rounded-xl overflow-hidden shadow-sm">
                <div className="py-5 border-b border-neutral-200">
                    <h2 className="text-center text-[#d46f28] text-xl font-semibold">
                        Sign In
                    </h2>
                </div>

                <form onSubmit={handleSignIn} className="px-5 pt-5 pb-6 flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <label className="text-base text-neutral-800">Email:</label>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full h-[50px] border border-[#d4a574] rounded-xl px-4 text-base text-neutral-800 bg-white outline-none focus:border-[#d46f28] transition-colors"
                            autoComplete="email"
                            placeholder="you@example.com"
                        />
                    </div>

                    <div className="flex flex-col gap-1.5">
                        <label className="text-base text-neutral-800">Password:</label>
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full h-[50px] border border-[#d4a574] rounded-xl px-4 text-base text-neutral-800 bg-white outline-none focus:border-[#d46f28] transition-colors"
                            autoComplete="current-password"
                            placeholder="••••••••"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full h-14 rounded-xl text-white text-base mt-1 transition-opacity disabled:opacity-70 flex items-center justify-center font-semibold"
                        style={{
                            background: "linear-gradient(180deg, #d4814a 0%, #b85c1e 100%)",
                        }}
                    >
                        {loading ? (
                            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        ) : (
                            "Sign In"
                        )}
                    </button>
                </form>
            </div>

            {/* Create Account */}
            <div className="mt-5 flex items-center justify-center">
                <button className="text-[#0070c9] text-base underline">
                    Create Account
                </button>
            </div>

            {/* Footer copyright */}
            <div className="mt-auto pb-10 px-8 text-center">
                <p className="text-[13px] text-neutral-400 leading-relaxed">
                    ©2012 iHealth Lab Inc. All rights reserved. iHealth is a trademark of iHealth Lab Inc.
                </p>
            </div>
        </div>
    );
}
