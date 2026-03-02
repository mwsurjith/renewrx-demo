"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { PiArrowRight, PiPlusBold } from "react-icons/pi";
import BGLogSheet, { getBGIcon } from "@/components/widget/bg-log-sheet";
import { getBGLogs, BG_TYPES } from "@/lib/bg-utils";

export default function GlucoseTrackerWidget() {
    const router = useRouter();
    const [sheetOpen, setSheetOpen] = useState(false);
    const [logs, setLogs] = useState([]);

    const refreshData = () => {
        setLogs(getBGLogs());
    };

    useEffect(() => {
        refreshData();
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
                    <div className="p-[2px] rounded-full bg-gradient-to-r from-[#FFE5E5] via-[#E5E5FF] to-[#E5FFFF] mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all" onClick={() => setSheetOpen(true)}>
                        <div className="bg-white rounded-full w-full h-11 flex items-center justify-center border border-white/50">
                            <span className="text-sm font-bold text-[#2D264B]">+ LOG BGM</span>
                        </div>
                    </div>

                    {/* CGM Banner inside widget */}
                    <div className="flex items-center justify-between p-4 rounded-2xl bg-[#524B6B] shadow-[0_2px_8px_rgba(0,0,0,0.05)] cursor-pointer hover:bg-[#4a4361] transition-colors" onClick={() => router.push("/blood-glucose")}>
                        <div className="flex items-center gap-3.5">
                            <div className="w-[42px] h-[42px] bg-white/10 rounded-[10px] flex items-center justify-center shrink-0 border border-white/5">
                                <div className="w-6 h-6 rounded-full bg-white relative flex items-center justify-center overflow-hidden">
                                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400/20 absolute"></div>
                                    <div className="w-1 h-1 rounded-full bg-neutral-600 absolute ml-[6px]"></div>
                                </div>
                            </div>
                            <div className="flex flex-col flex-1 min-w-0 max-w-[190px]">
                                <span className="text-xs text-neutral-300 mb-0.5">Get your CGM now!</span>
                                <p className="text-xs font-bold text-white leading-tight">Onboard your CGM for real-time insights and control of your health.</p>
                            </div>
                        </div>
                        <PiArrowRight size={20} className="text-white shrink-0 ml-2" />
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
