"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { PiArrowRight, PiPlusBold } from "react-icons/pi";
import { Button } from "../ui";
import BGLogSheet, { getBGIcon } from "@/components/widget/bg-log-sheet";
import { getBGLogs, BG_TYPES, getDexcomConnected } from "@/lib/bg-utils";
import { PiCheckCircleFill } from "react-icons/pi";

export default function GlucoseTrackerWidget() {
    const router = useRouter();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [logs, setLogs] = useState([]);
    const [dexcomConnected, setDexcomConnected] = useState(false);

    const refreshData = () => {
        setLogs(getBGLogs());
    };

    useEffect(() => {
        refreshData();
        setDexcomConnected(getDexcomConnected());
    }, [sheetOpen]);

    const handleLog = () => {
        refreshData();
    };

    // Get today's latest logs per category
    const todayLogs = useMemo(() => {
        const todayStr = new Date().toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        });

        // Find logs for today
        const todays = logs.filter(log => {
            const dateStr = new Date(log.date || log.createdAt).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric'
            });
            return dateStr === todayStr;
        });

        // Group by type to get the latest value
        const grouped = {};
        for (const log of todays) {
            if (!grouped[log.typeId]) {
                grouped[log.typeId] = log;
            }
        }
        return grouped;
    }, [logs]);

    return (
        <div className="w-full font-sans antialiased">
            {/* Title Row */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg text-[#2D264B] font-bold tracking-[0.2px]">
                        Glucose Tracker
                    </h3>
                </div>
                <button
                    onClick={() => router.push("/blood-glucose")}
                    className="w-8 h-8 bg-[#2D264B] rounded-full flex items-center justify-center hover:bg-neutral-700 active:scale-95 transition-all shadow-sm"
                >
                    <PiArrowRight size={18} className="text-white" />
                </button>
            </div>

            {/* Widget Card */}
            <div className="bg-white rounded-3xl border border-neutral-100 overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="p-4">
                    <p className="text-sm font-medium text-neutral-500 mb-3 tracking-[0.2px]">Finger Stick Glucose (BGM)</p>

                    {/* Grid */}
                    <div className="grid grid-cols-2 gap-2 mb-4">
                        {BG_TYPES.map(type => {
                            const todayLog = todayLogs[type.id];
                            return (
                                <div key={type.id} className="flex items-center gap-3 p-3 rounded-xl border border-neutral-100 bg-white">
                                    <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0 border border-neutral-100/50">
                                        {getBGIcon(type.id)}
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                        <span className="text-sm font-bold text-[#1E293B] truncate">{type.label}</span>
                                        <span className={`text-[13px] font-medium tracking-tight truncate ${todayLog ? "text-neutral-600" : "text-neutral-400"}`}>
                                            {todayLog ? `${todayLog.value} mg/dL` : "--"}
                                        </span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Log BGM Button */}
                    <Button
                        variant="secondary"
                        size="md"
                        className="mb-4"
                        onClick={() => setSheetOpen(true)}
                    >
                        <PiPlusBold size={14} className="mr-2" />
                        LOG BGM
                    </Button>

                    {/* CGM Banner inside widget */}
                    <div className={`flex items-center justify-between p-4 rounded-2xl shadow-[0_2px_8px_rgba(0,0,0,0.05)] cursor-pointer transition-colors ${dexcomConnected ? "bg-[#E5FFF4] hover:bg-[#d1f5e3]" : "bg-[#524B6B] hover:bg-[#4a4361]"}`} onClick={() => !dexcomConnected ? router.push("/cgm-setup") : router.push("/blood-glucose")}>
                        <div className="flex items-center gap-3.5">
                            <div className={`w-[42px] h-[42px] rounded-[10px] flex items-center justify-center shrink-0 ${dexcomConnected ? "bg-white shadow-sm border border-neutral-100" : "bg-white/10 border border-white/5"}`}>
                                {dexcomConnected ? (
                                    <div className="w-6 h-6 rounded-full bg-[#189B37] flex items-center justify-center font-bold text-white text-[6px]">
                                        dexcom
                                    </div>
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-white relative flex items-center justify-center overflow-hidden">
                                        <div className="w-1.5 h-1.5 rounded-full bg-neutral-400/20 absolute"></div>
                                        <div className="w-1 h-1 rounded-full bg-neutral-600 absolute ml-[6px]"></div>
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col flex-1 min-w-0 max-w-[190px]">
                                {dexcomConnected ? (
                                    <>
                                        <span className="text-[10px] font-bold text-[#189B37] uppercase tracking-wider mb-0.5">Dexcom Live</span>
                                        <p className="text-sm font-bold text-neutral-800 leading-tight">Data is up to date</p>
                                    </>
                                ) : (
                                    <>
                                        <span className="text-xs text-neutral-300 mb-0.5">Get your CGM now!</span>
                                        <p className="text-xs font-bold text-white leading-tight">Onboard your CGM for real-time insights and control of your health.</p>
                                    </>
                                )}
                            </div>
                        </div>
                        {dexcomConnected ? (
                            <PiCheckCircleFill size={20} className="text-[#189B37] shrink-0 ml-2" />
                        ) : (
                            <PiArrowRight size={20} className="text-white shrink-0 ml-2" />
                        )}
                    </div>
                </div>
            </div>

            <BGLogSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onLog={handleLog}
            />
        </div>
    );
}
