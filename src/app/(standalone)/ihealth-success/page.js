"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { PiCheckCircleFill } from "react-icons/pi";

/**
 * iHealth Success Page
 * 
 * Shown after successful iHealth authentication.
 * Displays a success message and auto-redirects to the BP detail page
 * with ?syncing=true after a 3-second countdown.
 */
export default function IHealthSuccessPage() {
    const router = useRouter();
    const [countdown, setCountdown] = useState(3);

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    clearInterval(interval);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(interval);
    }, [router]);

    // Independent effect to handle redirection when countdown hits 0
    useEffect(() => {
        if (countdown === 0) {
            router.push("/blood-pressure?syncing=true");
        }
    }, [countdown, router]);

    return (
        <div className="flex flex-col min-h-full bg-white font-sans">
            {/* Main content */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8">
                {/* Green checkmark */}
                <div className="w-20 h-20 flex items-center justify-center">
                    <PiCheckCircleFill size={80} className="text-emerald-500" />
                </div>

                {/* Text */}
                <div className="flex flex-col items-center gap-2 w-full text-center">
                    <p className="text-neutral-800 text-lg font-medium tracking-[0.2px]">
                        Connected to iHealth Successfully
                    </p>
                    <p className="text-neutral-500 text-[13px] leading-relaxed tracking-[0.2px] max-w-xs">
                        The data sync might take a moment in the background. You can
                        continue using the app. We&apos;ll notify you once your readings are
                        ready.
                    </p>
                </div>

                {/* Countdown box */}
                <div className="rounded-xl w-full border border-dashed border-purple-200">
                    <div className="flex items-center justify-center gap-1 px-4 py-3">
                        <p className="text-neutral-800 text-sm tracking-[0.2px] font-medium">
                            Redirecting you back in
                        </p>
                        <p className="text-neutral-500 text-sm tracking-[0.2px] tabular-nums min-w-[16px] text-center transition-all duration-300">
                            {countdown}
                        </p>
                        <p className="text-neutral-400 text-xs tracking-[0.2px]">sec</p>
                    </div>
                </div>
            </div>

            {/* Bottom banner */}
            <div className="px-6 pb-10 pt-2">
                <div className="bg-purple-50 rounded-xl px-4 py-3">
                    <p className="text-neutral-800 text-[15px] leading-relaxed tracking-[0.2px] font-medium">
                        Your iHealth device will automatically sync new readings going
                        forward.
                    </p>
                </div>
            </div>
        </div>
    );
}
