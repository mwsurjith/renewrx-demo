"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { PiEyeClosed, PiArrowLeft } from "react-icons/pi";

export default function DexcomLoginPage() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [phone, setPhone] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const handleNext = (e) => {
        e.preventDefault();
        if (phone) setStep(2);
    };

    const handleLogin = (e) => {
        e.preventDefault();
        if (!password) return;
        setLoading(true);
        setTimeout(() => {
            router.push("/dexcom-success");
        }, 800);
    };

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans px-5 pb-8">
            {/* Header */}
            <div className="pt-8 pb-4 flex flex-col items-center relative">
                {step === 2 && (
                    <button onClick={() => setStep(1)} className="absolute left-0 top-10 w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center">
                        <PiArrowLeft size={20} className="text-neutral-800" />
                    </button>
                )}
                <div className="text-[#2EBD25] text-3xl font-extrabold tracking-tight mt-2">dexcom</div>
                <div className="text-[13px] text-neutral-800 font-medium mt-1">English (United States) ∨</div>
            </div>

            <div className="mt-6 border-t border-neutral-100 pt-6 flex-1 flex flex-col">
                <h1 className="text-2xl font-bold text-neutral-900 mb-4">Log in</h1>

                {step === 1 ? (
                    <div className="flex flex-col">
                        <p className="text-[15px] text-neutral-800 mb-6">
                            Use the mobile number, email, or username saved in your Dexcom account.
                        </p>

                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-5 h-5 rounded-full border-2 border-[#189B37] flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-[#189B37]" />
                            </div>
                            <span className="text-base font-bold text-neutral-900">Mobile phone</span>
                        </div>

                        <form onSubmit={handleNext} className="flex flex-col">
                            <div className="flex gap-3 mb-6">
                                <div className="h-12 border border-neutral-400 rounded-lg px-3 flex items-center bg-[#F9F9F9] shrink-0">
                                    <span className="text-base">🇺🇸 +1 ▾</span>
                                </div>
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    className="h-12 border border-neutral-400 rounded-lg flex-1 px-4 text-base outline-none focus:border-[#189B37]"
                                />
                            </div>

                            <div className="flex items-center gap-3 mb-10">
                                <div className="w-5 h-5 rounded-full border-2 border-neutral-400" />
                                <span className="text-base font-bold text-neutral-900">Email or username</span>
                            </div>

                            <button
                                type="submit"
                                className="w-full h-[52px] bg-[#87909A] rounded-3xl text-white font-medium text-lg mb-4"
                            >
                                Next
                            </button>
                            <button
                                type="button"
                                className="w-full h-[52px] bg-[#EFEFEF] rounded-3xl text-[#3A4550] font-medium text-lg"
                            >
                                Create account
                            </button>
                        </form>
                    </div>
                ) : (
                    <div className="flex flex-col">
                        <div className="h-14 bg-[#EFEFEF] rounded-xl flex items-center px-4 mb-6">
                            <span className="text-base text-neutral-900">{phone}</span>
                        </div>

                        <form onSubmit={handleLogin} className="flex flex-col">
                            <label className="text-sm font-bold text-neutral-900 mb-2">Enter password</label>
                            <div className="relative mb-4">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full h-14 border border-neutral-400 rounded-lg px-4 pr-12 text-base outline-none focus:border-[#189B37]"
                                />
                                <PiEyeClosed size={24} className="absolute right-4 top-4 text-neutral-600" />
                            </div>
                            <button type="button" className="text-[#189B37] font-bold text-base self-start mb-8 underline">
                                Forgot your password?
                            </button>

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-[52px] bg-[#757D84] rounded-3xl text-white font-medium text-lg mb-6 flex items-center justify-center"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                ) : "Log in"}
                            </button>

                            <div className="text-center text-neutral-900 mb-6">or</div>

                            <button
                                type="button"
                                className="w-full h-[52px] bg-[#EFEFEF] rounded-3xl text-[#3A4550] font-medium text-lg"
                            >
                                Request one-time code
                            </button>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}
