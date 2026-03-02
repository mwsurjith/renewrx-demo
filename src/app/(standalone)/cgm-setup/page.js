"use client";

import React, { useState } from 'react';
import { useRouter } from "next/navigation";
import { PiArrowLeft, PiCheckCircleFill, PiCircle } from "react-icons/pi";
import { Button } from "@/components/ui";

export default function CGMSetupPage() {
    const router = useRouter();
    const [selected, setSelected] = useState("dexcom"); // "dexcom" or "freestyle"

    const handleNext = () => {
        if (selected === "dexcom") {
            router.push("/dexcom-login");
        }
    };

    return (
        <div className="flex flex-col min-h-screen bg-white font-sans">
            {/* Header */}
            <div className="px-6 py-4 flex items-center gap-3">
                <button
                    onClick={() => router.back()}
                    className="w-10 h-10 flex items-center justify-center -ml-2 text-neutral-800"
                >
                    <PiArrowLeft size={24} />
                </button>
                <h1 className="text-[#2D3F58] text-lg font-bold tracking-tight">Blood Glucose</h1>
            </div>

            <div className="flex-1 flex flex-col px-6 pb-8">
                <div className="mt-4 mb-8">
                    <p className="text-[#334155] text-sm mb-1">Getting Started</p>
                    <h2 className="text-[#2D3F58] text-xl font-bold tracking-tight leading-snug">
                        Pick your CGM sidekick and let's get Glucose-Savvy!
                    </h2>
                </div>

                <div className="flex flex-col gap-4">
                    {/* Dexcom Option */}
                    <div
                        onClick={() => setSelected("dexcom")}
                        className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all ${selected === "dexcom"
                                ? "border-transparent ring-1 ring-[#57EFC3] shadow-[0_0_12px_rgba(87,239,195,0.2)]"
                                : "border-neutral-200"
                            }`}
                        style={selected === "dexcom" ? { background: 'linear-gradient(white, white) padding-box, linear-gradient(to right, #57EFC3, #C17FF2) border-box', border: '1px solid transparent' } : {}}
                    >
                        {selected === "dexcom" ? (
                            <PiCheckCircleFill size={24} className="text-[#2D264B]" />
                        ) : (
                            <PiCircle size={24} className="text-neutral-400" />
                        )}
                        <span className="text-[#2EBD25] text-xl font-extrabold tracking-tight">dexcom</span>
                    </div>

                    {/* Freestyle Option */}
                    <div
                        onClick={() => setSelected("freestyle")}
                        className={`p-4 rounded-xl border flex items-center gap-3 cursor-pointer transition-all opacity-60 ${selected === "freestyle"
                                ? "border-transparent ring-1 ring-neutral-300"
                                : "border-neutral-200"
                            }`}
                    >
                        {selected === "freestyle" ? (
                            <PiCheckCircleFill size={24} className="text-[#2D264B]" />
                        ) : (
                            <PiCircle size={24} className="text-neutral-400" />
                        )}
                        <span className="text-[#334155] text-base font-bold tracking-tight">Freestyle Libre</span>
                    </div>
                </div>

                <div className="mt-auto pt-10 flex flex-col items-center">
                    {selected === "dexcom" && (
                        <div className="flex flex-col items-center mb-8">
                            <div className="flex items-center gap-2 mb-3">
                                {/* Simplified RenewRx & Dexcom icons overlapping */}
                                <div className="w-12 h-12 rounded-full border border-neutral-200 bg-white flex items-center justify-center p-2 relative z-10 shadow-sm">
                                    <div className="w-full h-full rounded-full border border-purple-200" style={{ background: 'linear-gradient(135deg, rgba(193,127,242,0.1), rgba(87,239,195,0.1))' }}></div>
                                </div>
                                <div className="w-12 h-12 rounded-full bg-[#189B37] flex items-center justify-center -ml-4 relative z-0">
                                    <span className="text-white text-[10px] font-bold">dexcom</span>
                                </div>
                            </div>
                            <p className="text-sm font-medium text-center text-[#2D3F58] max-w-[240px]">
                                We've partnered with Dexcom to link you with your wearable tech.
                            </p>
                        </div>
                    )}

                    <Button
                        variant="primary"
                        size="xl"
                        className="w-full"
                        onClick={handleNext}
                    >
                        NEXT
                    </Button>
                </div>
            </div>
        </div>
    );
}
