"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from "next/navigation";
import { PiArrowRight, PiPlusBold, PiCheckCircleFill, PiArrowUpRightBold, PiHeartFill, PiClock } from "react-icons/pi";
import { Button } from "../ui";
import { BPLogSheet, BPReadingCard } from "@/components/widget";
import { getBPReadings, getIHealthConnected } from "@/lib/bp-utils";

/**
 * BloodPressureWidget Component
 * 
 * Re-architected to a single-card block layout similar to Nourished Notebook.
 * Combines Reading, iHealth Connection, and Actions in one cohesive container.
 */
export default function BloodPressureWidget() {
    const router = useRouter();
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

                            {/* Integrated Connection View */}
                            <div
                                onClick={handleIHealthClick}
                                className={`flex items-center gap-3 p-3 rounded-2xl border transition-all cursor-pointer ${iHealthConnected
                                    ? "bg-neutral-50/50 border-neutral-100"
                                    : "bg-purple-50/30 border-purple-100/50"
                                    }`}
                            >
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shrink-0 border border-neutral-100 shadow-sm">
                                    <img
                                        src={imgDevice}
                                        alt="iHealth Device"
                                        className={`w-full h-full object-contain p-1.5 ${iHealthConnected ? "grayscale-0 opacity-100" : "grayscale opacity-50"}`}
                                    />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1.5">
                                        <p className="text-sm text-neutral-800 font-bold tracking-tight">
                                            {iHealthConnected ? "iHealth Neo LIVE" : "Connect iHealth Neo"}
                                        </p>
                                        {iHealthConnected && <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />}
                                    </div>
                                    <p className="text-[11px] text-neutral-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis">
                                        {iHealthConnected ? "Device is active and ready to sync" : "Sync readings automatically"}
                                    </p>
                                </div>
                                <PiArrowUpRightBold size={14} className="text-neutral-300" />
                            </div>
                        </div>
                    ) : iHealthConnected ? (
                        /* Case 2: No logs, but iHealth connected */
                        <div className="flex flex-col items-center text-center py-6 px-4">
                            <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center mb-4 relative border border-green-100">
                                <img
                                    src={imgDevice}
                                    alt="iHealth Device"
                                    className="w-full h-full object-contain p-2"
                                />
                                <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full" />
                            </div>
                            <h4 className="text-lg text-neutral-800 font-bold tracking-tight mb-1">iHealth Connected</h4>
                            <p className="text-neutral-500 text-sm font-medium leading-relaxed max-w-[220px]">
                                Your iHealth Neo is active but no readings have been synced yet.
                            </p>
                        </div>
                    ) : (
                        /* Case 3: Empty State (No logs, no connection) */
                        <div className="flex flex-col items-center text-center py-6 px-4">
                            <div className="w-14 h-14 bg-neutral-50 rounded-2xl flex items-center justify-center mb-4 relative">
                                <PiHeartFill size={28} className="text-neutral-200" />
                                <div className="absolute top-0 right-0 w-3.5 h-3.5 bg-purple-500 border-2 border-white rounded-full animate-ping" />
                            </div>
                            <h4 className="text-lg text-neutral-800 font-bold tracking-tight mb-1">Track Blood Pressure</h4>
                            <p className="text-neutral-500 text-sm font-medium leading-relaxed max-w-[220px]">
                                Regular tracking helps you keep your heart healthy.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer Buttons Section */}
                <div className="flex gap-3 p-4">
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
                        {latestReading ? "LOG NEW" : "LOG FIRST"}
                    </Button>
                </div>
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
