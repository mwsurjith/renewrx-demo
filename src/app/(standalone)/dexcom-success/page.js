"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { PiCheckCircleFill } from "react-icons/pi";

export default function DexcomSuccessPage() {
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

    useEffect(() => {
        if (countdown === 0) {
            router.push("/blood-glucose?syncing=true");
        }
    }, [countdown, router]);

    return (
        <div className="flex flex-col min-h-full bg-white font-sans h-screen">
            <div className="flex-1 flex flex-col items-center justify-center px-6 py-8 gap-8">
                <div className="w-20 h-20 flex items-center justify-center">
                    <PiCheckCircleFill size={80} className="text-[#2EBD25]" />
                </div>

                <div className="flex flex-col items-center gap-2 w-full text-center">
                    <p className="text-neutral-800 text-lg font-bold tracking-[0.2px]">
                        Connected to Dexcom Successfully
                    </p>
                    <p className="text-neutral-500 text-[13px] leading-relaxed tracking-[0.2px] max-w-xs">
                        The data sync might take a moment in the background. You can
                        continue using the app. We'll notify you once your readings are
                        ready.
                    </p>
                </div>

                <div className="rounded-xl w-full border border-dashed border-[#57EFC3]">
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

            <div className="px-6 pb-10 pt-2 border-t border-neutral-100">
                <div className="bg-[#E5FFF4] rounded-xl px-4 py-4 mt-6">
                    <p className="text-[#1A8A2F] text-[15px] leading-relaxed tracking-[0.2px] font-medium text-center">
                        Your Dexcom CGM will automatically sync new readings going forward.
                    </p>
                </div>
            </div>
        </div>
    );
}
