"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { PiArrowRight, PiMoon, PiDeviceMobileSlash, PiLink } from "react-icons/pi";
import { PiHeartFill } from "react-icons/pi";
import { Button } from "../ui";
import SleepLogSheet from "./sleep-log-sheet";
import { useDeveloper } from "@/context/developer-context";
import {
    getSleepLogs,
    saveSleepLog,
    getSleepScoreLabel,
    formatDuration,
    getAppleHealthConnected,
} from "@/lib/sleep-utils";

/**
 * SleepTrackerWidget
 *
 * Home screen widget for sleep tracking. Now integrated with Apple Health connection status.
 */
export default function SleepTrackerWidget() {
    const router = useRouter();
    const { toggles } = useDeveloper();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [latest, setLatest] = useState(null);
    const [ahConnected, setAhConnected] = useState(false);

    const refreshData = () => {
        const logs = getSleepLogs();
        setLatest(logs.length > 0 ? logs[0] : null);
        setAhConnected(getAppleHealthConnected());
    };

    // Refresh when sheet closes, toggles change, or on mount
    useEffect(() => {
        refreshData();
        // Set up an interval to check for connection updates from the detail screen
        const interval = setInterval(refreshData, 2000);
        return () => clearInterval(interval);
    }, [sheetOpen, toggles.deviceData]);

    const handleLog = (data) => {
        saveSleepLog(data);
        refreshData();
    };

    const scoreInfo = latest ? getSleepScoreLabel(latest.score) : null;

    return (
        <div className="w-full font-sans antialiased">
            {/* Title Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg text-neutral-800 font-semibold tracking-[0.2px]">
                        Sleep Tracker
                    </h3>
                </div>
                <button
                    onClick={() => router.push("/sleep-tracker")}
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
                            <div className="flex flex-col gap-3 py-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 px-0.5">
                                            Last Night
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold tracking-tight text-neutral-800">
                                                {formatDuration(latest.duration)}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5 opacity-60">
                                            <PiMoon size={12} className="text-neutral-400" />
                                            <span className="text-xs font-medium text-neutral-500 tracking-tight">
                                                {latest.bedtime} – {latest.wakeTime}
                                            </span>
                                        </div>
                                    </div>
                                    <div className={`p-2 ${scoreInfo.bg} rounded-2xl flex items-center justify-center min-w-[70px]`}>
                                        <span className={`text-[10px] font-bold ${scoreInfo.color} uppercase tracking-widest leading-none text-center`}>
                                            {latest.source === "manual" && latest.quality !== undefined ? `Quality ${latest.quality}` : scoreInfo.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Sleep stages mini-bar */}
                                {latest.stages && latest.source === "phone" && (
                                    <div className="mt-1">
                                        <div className="flex rounded-full overflow-hidden h-2">
                                            <div className="bg-indigo-700" style={{ width: `${latest.stages.deep}%` }} />
                                            <div className="bg-indigo-400" style={{ width: `${latest.stages.light}%` }} />
                                            <div className="bg-purple-400" style={{ width: `${latest.stages.rem}%` }} />
                                            <div className="bg-neutral-200" style={{ width: `${latest.stages.awake}%` }} />
                                        </div>
                                        <div className="flex justify-between mt-1.5">
                                            <span className="text-[9px] text-neutral-400 font-medium">Deep</span>
                                            <span className="text-[9px] text-neutral-400 font-medium">Light</span>
                                            <span className="text-[9px] text-neutral-400 font-medium">REM</span>
                                            <span className="text-[9px] text-neutral-400 font-medium">Awake</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            /* Empty State: Shows -- values */
                            <div className="flex flex-col gap-3 py-2">
                                <div className="flex items-center justify-between">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 px-0.5">
                                            Last Night
                                        </span>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-4xl font-bold tracking-tight text-neutral-300">
                                                --h --m
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5 opacity-60">
                                            <PiMoon size={12} className="text-neutral-400" />
                                            <span className="text-xs font-medium text-neutral-400 tracking-tight">
                                                No sleep logged
                                            </span>
                                        </div>
                                    </div>
                                </div>
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
                <div className="flex gap-3 px-4 pt-3 pb-4">
                    {latest && (
                        <Button
                            variant="tertiary"
                            className="flex-1"
                            size="lg"
                            onClick={() => router.push("/sleep-tracker")}
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
                        {latest ? "LOG SLEEP" : "LOG SLEEP"}
                    </Button>
                </div>

                {/* Connection Banner inside Widget */}
                {toggles.deviceData && !ahConnected && (
                    <div className="px-4 pb-4">
                        <div
                            onClick={() => router.push("/sleep-tracker")}
                            className="flex items-center justify-between p-3 rounded-2xl bg-[#FFF5F5] border border-[#FFE5E5] cursor-pointer hover:bg-[#FFF0F0] transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 bg-white rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center justify-center shrink-0 border border-neutral-100">
                                    <PiHeartFill size={20} className="text-[#ff3b30]" />
                                </div>
                                <div className="flex flex-col items-start min-w-0">
                                    <span className="text-[10px] font-bold text-[#ff3b30] uppercase tracking-wider mb-0.5">Apple Health</span>
                                    <span className="text-sm text-[#2D3F58] font-bold tracking-tight truncate w-full">Connect to Apple Health</span>
                                </div>
                            </div>
                            <PiArrowRight size={18} className="text-[#ff3b30] shrink-0 ml-2" />
                        </div>
                    </div>
                )}
            </div>

            {/* Log sheet */}
            <SleepLogSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onLog={handleLog}
            />
        </div >
    );
}
