"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from "next/navigation";
import { PiArrowRight, PiPlusBold, PiX } from "react-icons/pi";
import { AppHeader } from "../layout";
import DatePicker from "../layout/date-picker";
import { Button } from "../ui";
import { BGLogSheet, BGReadingCard } from "../widget";
import { getBGLogs } from "@/lib/bg-utils";

function CGMBanner() {
    return (
        <div className="bg-[#EEDFE5] px-5 py-4 flex items-center gap-3 border-b border-neutral-100 cursor-pointer active:bg-[#e4d3da] transition-colors">
            {/* Device icon */}
            <div className="w-[42px] h-[42px] bg-white/50 rounded-lg flex items-center justify-center shrink-0 border border-white">
                <div className="w-6 h-6 rounded-full bg-white relative flex items-center justify-center overflow-hidden">
                    <div className="w-1.5 h-1.5 rounded-full bg-neutral-400/20 absolute"></div>
                    <div className="w-1 h-1 rounded-full bg-neutral-600 absolute ml-[6px]"></div>
                </div>
            </div>

            <div className="flex-1 min-w-0 pr-2">
                <span className="text-[11px] font-medium text-neutral-500 mb-0.5 block">Get your CGM now!</span>
                <p className="text-sm text-[#2D264B] font-bold tracking-tight leading-snug">
                    Onboard your CGM for real-time insights and control of your health.
                </p>
            </div>

            <PiArrowRight size={20} className="text-[#2D264B] shrink-0" />
        </div>
    );
}

export default function BGDetailScreen() {
    const router = useRouter();

    const [readings, setReadings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingReading, setEditingReading] = useState(null);
    const [showDisclaimer, setShowDisclaimer] = useState(true);

    const refreshLogs = () => {
        setReadings(getBGLogs());
    };

    useEffect(() => {
        refreshLogs();
    }, []);

    // Filter by selected date
    const dateStr = useMemo(() => {
        return selectedDate.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        });
    }, [selectedDate]);

    const filteredLogs = useMemo(() => {
        return readings.filter((m) => {
            const mDate = new Date(m.date || m.createdAt).toLocaleDateString('en-US', {
                weekday: 'short', month: 'short', day: 'numeric'
            });
            return mDate === dateStr;
        });
    }, [readings, dateStr]);

    const isEmpty = filteredLogs.length === 0;

    return (
        <div className="flex flex-col h-full font-sans relative">
            {/* Sticky header area */}
            <div className="flex-none">
                <AppHeader
                    pageTitle="Blood Glucose"
                    onBack={() => router.push("/")}
                />
                <DatePicker
                    mode="single"
                    value={selectedDate}
                    onChange={setSelectedDate}
                />
                <CGMBanner />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto bg-neutral-50/30">
                {isEmpty ? (
                    /* Empty state */
                    <div className="flex flex-col items-center justify-center py-20 text-center px-8 h-[60vh]">
                        <h3 className="text-[#2D264B] text-lg mb-1 tracking-tight font-bold items-center flex">
                            Good day! <span className="text-xl ml-1 block mt-px">☀️</span>
                        </h3>
                        <p className="text-neutral-500 text-[15px] mb-8 leading-relaxed tracking-tight font-medium">
                            Log your first reading for the day!
                        </p>

                        <div className="p-[2px] rounded-full bg-gradient-to-r from-[#FFE5E5] via-[#E5E5FF] to-[#E5FFFF] mb-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all w-60" onClick={() => { setEditingReading(null); setSheetOpen(true); }}>
                            <div className="bg-white rounded-full w-full h-[52px] flex items-center justify-center border border-white/50">
                                <span className="text-sm font-bold text-[#2D264B] tracking-wide">+ LOG FINGER-STICK</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="px-6 py-6 pb-24">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[#2D264B] text-lg font-bold tracking-tight">
                                Overview
                            </h2>
                            <div className="p-[1.5px] rounded-full bg-gradient-to-r from-[#FFE5E5] via-[#E5E5FF] to-[#E5FFFF] shadow-[0_2px_8px_rgba(0,0,0,0.03)] cursor-pointer hover:opacity-90 active:scale-[0.98] transition-all" onClick={() => { setEditingReading(null); setSheetOpen(true); }}>
                                <div className="bg-white rounded-full px-4 h-9 flex items-center justify-center border border-white/50">
                                    <span className="text-[13px] font-bold text-[#2D264B]">+ LOG FINGER-STICK</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex flex-col gap-3">
                            {filteredLogs.map((reading) => (
                                <BGReadingCard
                                    key={reading.id}
                                    reading={reading}
                                    onEdit={() => {
                                        setEditingReading(reading);
                                        setSheetOpen(true);
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Floating Disclaimer Toast */}
            {showDisclaimer && (
                <div className="absolute bottom-6 left-6 right-6 z-10 transition-all duration-300 transform translate-y-0 opacity-100">
                    <div className="bg-[#2D264B] text-white rounded-xl p-4 shadow-xl flex items-start justify-between gap-4">
                        <div className="flex flex-col flex-1">
                            <div className="flex items-center gap-2 mb-1">
                                <span className="text-[#FBBF24] text-lg">⚠️</span>
                                <span className="font-bold text-sm tracking-tight">Not for treatment decisions</span>
                            </div>
                            <p className="text-[#cbd5e1] text-xs leading-relaxed tracking-tight break-words">
                                The information presented in this app should not be used for treatment or dosing decisions.
                            </p>
                        </div>
                        <button
                            onClick={() => setShowDisclaimer(false)}
                            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center shrink-0 hover:bg-white/20 transition-colors"
                        >
                            <PiX size={16} className="text-white" />
                        </button>
                    </div>
                </div>
            )}

            {/* Log sheet */}
            <BGLogSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onLog={refreshLogs}
            />
        </div>
    );
}
