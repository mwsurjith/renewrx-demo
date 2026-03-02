"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PiArrowRight, PiHeartbeat, PiDeviceMobileSlash, PiLink } from "react-icons/pi";
import { Button } from "../ui";
import StressLogSheet from "./stress-log-sheet";
import { useDeveloper } from "@/context/developer-context";
import {
    getLatestStress,
    getStressLogs,
    saveStressLog,
    getStressLevel,
} from "@/lib/stress-utils";
import { getAppleHealthConnected } from "@/lib/sleep-utils";
import { PiHeartFill } from "react-icons/pi";

/**
 * StressTrackerWidget
 *
 * Home screen widget for stress/HRV tracking, matching BloodPressureWidget pattern.
 */
export default function StressTrackerWidget() {
    const router = useRouter();
    const { toggles } = useDeveloper();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [ahConnected, setAhConnected] = useState(false);
    const [latest, setLatest] = useState(null);

    const refreshData = () => {
        const logs = getStressLogs();
        setLatest(logs.length > 0 ? logs[0] : null);
        setAhConnected(getAppleHealthConnected());
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 2000);
        return () => clearInterval(interval);
    }, [sheetOpen, toggles.deviceData]);

    const handleLog = (data) => {
        saveStressLog(data);
        refreshData();
    };

    const levelInfo = latest ? getStressLevel(latest) : null;

    return (
        <div className="w-full font-sans antialiased">
            {/* Title Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg text-neutral-800 font-semibold tracking-[0.2px]">
                        Stress Tracker
                    </h3>
                </div>
                <button
                    onClick={() => router.push("/stress-tracker")}
                    className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 active:scale-95 transition-all shadow-sm"
                >
                    <PiArrowRight size={18} className="text-white" />
                </button>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl border overflow-hidden">
                <div className="p-4 pb-0">
                    {toggles.deviceData ? (
                        latest ? (
                            /* Has data */
                            <div className="flex flex-col gap-3">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 px-0.5">
                                            {latest.source === "phone" ? "Latest Check" : "Perceived Stress"}
                                        </span>
                                        <div className="flex items-baseline gap-1.5">
                                            {latest.source === "phone" ? (
                                                <>
                                                    <span className="text-4xl font-bold tracking-tight text-neutral-800">{latest.hrv}</span>
                                                    <span className="text-sm text-neutral-400 font-bold tracking-wider uppercase relative -top-1">ms HRV</span>
                                                </>
                                            ) : (
                                                <span className="text-2xl font-bold tracking-tight text-neutral-800 leading-none pb-1">{levelInfo.label}</span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2 mt-1 opacity-60">
                                            <PiHeartbeat size={14} className="text-neutral-400" />
                                            <span className="text-xs font-medium text-neutral-500 tracking-tight">
                                                {latest.source === "phone" ? "Apple Health" : "Check-in"} • {latest.time}
                                            </span>
                                        </div>
                                    </div>
                                    {latest.source === "phone" && (
                                        <div className={`p-2 ${levelInfo.bg} rounded-2xl flex items-center justify-center min-w-[70px]`}>
                                            <span className={`text-[10px] font-bold ${levelInfo.color} uppercase tracking-widest leading-none text-center`}>
                                                {levelInfo.label}
                                            </span>
                                        </div>
                                    )}
                                </div>

                            </div>
                        ) : !ahConnected ? (
                            /* Empty state - prompt Apple Health */
                            <div className="flex flex-col items-center text-center py-6 px-4">
                                <div className="w-14 h-14 bg-red-50 rounded-2xl flex items-center justify-center mb-4 border border-red-100/50">
                                    <PiHeartFill size={28} className="text-[#ff3b30]" />
                                </div>
                                <h4 className="text-lg text-neutral-800 font-bold tracking-tight mb-1">Apple Health</h4>
                                <p className="text-neutral-500 text-sm font-medium leading-relaxed max-w-[220px] mb-5">
                                    Connect to automatically sync your stress pattern data.
                                </p>
                                <Button
                                    variant="primary"
                                    size="md"
                                    className="w-full max-w-[200px]"
                                    onClick={() => router.push("/stress-tracker")}
                                >
                                    CONNECT NOW
                                </Button>
                            </div>
                        ) : (
                            /* Empty state */
                            <div className="flex flex-col items-center text-center py-6 px-4">
                                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-4">
                                    <PiHeartbeat size={28} className="text-amber-300" />
                                </div>
                                <h4 className="text-lg text-neutral-800 font-bold tracking-tight mb-1">Track Your Stress</h4>
                                <p className="text-neutral-500 text-sm font-medium leading-relaxed max-w-[220px]">
                                    Monitor your HRV to understand your stress levels.
                                </p>
                            </div>
                        )
                    ) : (
                        /* Device data disabled */
                        <div className="flex flex-col items-center text-center py-6 px-4">
                            <div className="w-14 h-14 bg-neutral-100 rounded-2xl flex items-center justify-center mb-4">
                                <PiDeviceMobileSlash size={28} className="text-neutral-300" />
                            </div>
                            <h4 className="text-base text-neutral-700 font-bold tracking-tight mb-1">Device Data Not Supported</h4>
                            <p className="text-neutral-400 text-sm font-medium leading-relaxed max-w-[240px]">
                                Phone health data is turned off or not available on this device.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer buttons */}
                <div className="flex gap-3 p-4">
                    {latest && (
                        <Button
                            variant="tertiary"
                            className="flex-1"
                            size="lg"
                            onClick={() => router.push("/stress-tracker")}
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
                        {latest ? "CHECK-IN" : "LOG FIRST"}
                    </Button>
                </div>
            </div>

            {/* Log sheet */}
            <StressLogSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onLog={handleLog}
            />
        </div>
    );
}
