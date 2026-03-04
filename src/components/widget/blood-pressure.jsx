"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { PiArrowRight, PiPlusBold, PiCheckCircleFill, PiArrowUpRightBold, PiHeartFill, PiClock } from "react-icons/pi";
import { Button } from "../ui";
import { BPLogSheet, BPReadingCard } from "@/components/widget";
import { getBPReadings, getIHealthConnected } from "@/lib/bp-utils";
import { useDeveloper } from "@/context/developer-context";

/**
 * BloodPressureWidget Component
 * 
 * Re-architected to a single-card block layout similar to Nourished Notebook.
 * Combines Reading, iHealth Connection, and Actions in one cohesive container.
 */
export default function BloodPressureWidget() {
    const router = useRouter();
    const { toggles } = useDeveloper();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [iHealthConnected, setIHealthConnected] = useState(false);
    const [latestReading, setLatestReading] = useState(null);

    const refreshData = () => {
        const readings = getBPReadings();
        if (readings.length > 0) setLatestReading(readings[0]);
        else setLatestReading(null);
        setIHealthConnected(getIHealthConnected());
    };

    useEffect(() => {
        refreshData();
    }, [sheetOpen]);

    const handleIHealthClick = () => {
        if (!iHealthConnected) {
            router.push("/ihealth-login");
        } else {
            router.push("/blood-pressure");
        }
    };

    const handleLog = () => {
        refreshData();
    };

    const imgDevice = "https://ihealthlabs.com/cdn/shop/files/Neo_60ad73cc-ee77-4bdf-bf89-f5df4b93378f.png?v=1719337375";

    return (
        <div className="w-full font-sans antialiased">
            {/* Title Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg text-neutral-800 font-semibold tracking-[0.2px]">
                        Blood Pressure
                    </h3>
                </div>
                <button
                    onClick={() => router.push("/blood-pressure")}
                    className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 active:scale-95 transition-all shadow-sm"
                >
                    <PiArrowRight size={18} className="text-white" />
                </button>
            </div>

            {/* Combined Card Block */}
            <div className="bg-white rounded-3xl border overflow-hidden">

                {/* Content Section */}
                <div className="p-4 pb-0">
                    {latestReading ? (
                        /* Case 1: Logs exist (Any source) */
                        <div className="flex flex-col gap-4">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 px-0.5">Latest Reading</span>
                                    <div className="flex items-baseline gap-2">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold tracking-tight text-neutral-800">{latestReading.systolic}</span>
                                            <span className="text-neutral-300 text-2xl font-light">/</span>
                                            <span className="text-4xl font-bold tracking-tight text-neutral-800">{latestReading.diastolic}</span>
                                        </div>
                                        <div className="flex items-center gap-1 ml-2 text-red-500">
                                            <PiHeartFill size={14} className="animate-pulse" />
                                            <span className="text-lg font-bold text-neutral-800">{latestReading.pulse}</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5 opacity-60">
                                        <PiClock size={12} className="text-neutral-400" />
                                        <span className="text-xs font-medium text-neutral-500 tracking-tight">{latestReading.time} • {latestReading.type || "Manual"}</span>
                                    </div>
                                </div>
                                <div className="p-2 bg-neutral-50 rounded-2xl flex items-center justify-center min-w-[70px]">
                                    <span className="text-[10px] font-bold text-neutral-500 uppercase tracking-widest leading-none text-center">NORMAL</span>
                                </div>
                            </div>


                        </div>
                    ) : (
                        /* Empty State: Shows -- values */
                        <div className="flex flex-col gap-4 py-2">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 px-0.5">Latest Reading</span>
                                    <div className="flex items-baseline gap-2">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-4xl font-bold tracking-tight text-neutral-300">--</span>
                                            <span className="text-neutral-300 text-2xl font-light">/</span>
                                            <span className="text-4xl font-bold tracking-tight text-neutral-300">--</span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-1.5 opacity-60">
                                        <PiClock size={12} className="text-neutral-400" />
                                        <span className="text-xs font-medium text-neutral-400 tracking-tight">No reading logged</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer Buttons Section */}
                <div className="flex gap-3 px-4 pt-3 pb-4">
                    {latestReading && (
                        <Button
                            variant="tertiary"
                            className="flex-1"
                            size="lg"
                            onClick={() => router.push("/blood-pressure")}
                        >
                            VIEW HISTORY
                        </Button>
                    )}
                    <Button
                        variant="secondary"
                        className="flex-1"
                        size="lg"
                        onClick={() => setSheetOpen(true)}
                    >
                        <PiPlusBold size={14} className="mr-2" />
                        {latestReading ? "LOG NEW" : "LOG READING"}
                    </Button>
                </div>

                {/* Connection Banner inside Widget */}
                {(!iHealthConnected && toggles.iHealthIntegration) && (
                    <div className="px-4 pb-4">
                        <div
                            onClick={handleIHealthClick}
                            className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF5F0] border border-[#FFE5D6] cursor-pointer hover:bg-[#FFF0E5] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center p-1.5 shrink-0 border border-neutral-100">
                                    <img src={imgDevice} alt="iHealth Device" className="w-full h-full object-contain opacity-80 mix-blend-multiply" />
                                </div>
                                <div className="flex flex-col items-start min-w-0">
                                    <span className="text-[10px] font-bold text-[#FF6B00] uppercase tracking-wider mb-0.5">iHealth Tracker</span>
                                    <span className="text-sm text-[#2D3F58] font-bold tracking-tight truncate w-full">Connect your iHealth Neo</span>
                                </div>
                            </div>
                            <PiArrowRight size={18} className="text-[#FF6B00] shrink-0" />
                        </div>
                    </div>
                )}
            </div>

            {/* Log Sheet */}
            <BPLogSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onLog={handleLog}
            />
        </div>
    );
}
