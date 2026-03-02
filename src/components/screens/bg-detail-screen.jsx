"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from "next/navigation";
import { PiArrowRight, PiPlusBold, PiX, PiGear, PiSpinnerGap, PiCheckCircleFill } from "react-icons/pi";
import { AppHeader } from "../layout";
import DatePicker from "../layout/date-picker";
import { Button } from "../ui";
import { BGLogSheet, BGReadingCard, CGMChart } from "../widget";
import { getBGLogs, getDexcomConnected, setDexcomConnected as persistDexcomConnected, generateCGMSyncedReadings } from "@/lib/bg-utils";

function CGMBanner({ connected, syncing, onConnect }) {
    const [dots, setDots] = useState(".");

    useEffect(() => {
        if (!syncing) return;
        const interval = setInterval(() => {
            setDots((d) => (d.length >= 3 ? "." : d + "."));
        }, 500);
        return () => clearInterval(interval);
    }, [syncing]);

    return (
        <div
            onClick={!connected ? onConnect : undefined}
            className={`px-5 py-4 flex items-center gap-3 border-b border-neutral-100 transition-colors ${!connected ? "bg-[#EEDFE5] cursor-pointer active:bg-[#e4d3da]" : "bg-green-50/50"}`}
        >
            {/* Device icon */}
            <div className={`w-[42px] h-[42px] rounded-lg flex items-center justify-center shrink-0 ${!connected ? "bg-white/50 border border-white" : "bg-white shadow-sm border border-neutral-100"}`}>
                {connected ? (
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

            <div className="flex-1 min-w-0 pr-2">
                {!connected ? (
                    <>
                        <span className="text-[11px] font-medium text-neutral-500 mb-0.5 block">Get your CGM now!</span>
                        <p className="text-sm text-[#2D264B] font-bold tracking-tight leading-snug">
                            Onboard your CGM for real-time insights and control of your health.
                        </p>
                    </>
                ) : syncing ? (
                    <>
                        <div className="flex items-center gap-2 mb-0.5">
                            <PiSpinnerGap size={14} className="text-[#189B37] animate-spin shrink-0" />
                            <p className="text-sm text-neutral-800 font-bold tracking-[0.2px]">
                                Syncing your readings{dots}
                            </p>
                        </div>
                        <p className="text-[11px] font-medium text-neutral-500 tracking-[0.2px]">
                            Dexcom · This may take a moment
                        </p>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-1.5 mb-0.5">
                            <PiCheckCircleFill size={14} className="text-[#189B37] shrink-0" />
                            <p className="text-sm text-neutral-800 font-bold tracking-[0.2px]">
                                Dexcom · Data up to date
                            </p>
                        </div>
                        <p className="text-[11px] font-medium text-neutral-500 tracking-[0.2px]">
                            Last synced just now
                        </p>
                    </>
                )}
            </div>

            {!connected && <PiArrowRight size={20} className="text-[#2D264B] shrink-0" />}
        </div>
    );
}

export default function BGDetailScreen() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [readings, setReadings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingReading, setEditingReading] = useState(null);
    const [showDisclaimer, setShowDisclaimer] = useState(true);
    const [dexcomConnected, setDexcomConnected] = useState(false);
    const [syncing, setSyncing] = useState(false);

    const refreshLogs = () => {
        setReadings(getBGLogs());
    };

    useEffect(() => {
        refreshLogs();
        setDexcomConnected(getDexcomConnected());
    }, []);

    // 1. Detect syncing=true from URL
    useEffect(() => {
        if (searchParams.get("syncing") === "true") {
            persistDexcomConnected(true);
            setDexcomConnected(true);
            setSyncing(true);

            const url = new URL(window.location.href);
            url.searchParams.delete("syncing");
            window.history.replaceState({}, '', url);
        }
    }, [searchParams]);

    // 2. Mock syncing process
    useEffect(() => {
        if (syncing) {
            const timer = setTimeout(() => {
                const generated = generateCGMSyncedReadings();
                if (generated && generated.length > 0) {
                    setReadings(generated);
                }
                setSyncing(false);
            }, 2500);

            return () => clearTimeout(timer);
        }
    }, [syncing]);

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
                    rightContent={
                        <button onClick={() => router.push("/device-management")} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-50 transition-colors">
                            <PiGear size={24} className="text-[#2f4358]" />
                        </button>
                    }
                />
                <DatePicker
                    mode="single"
                    value={selectedDate}
                    onChange={setSelectedDate}
                />
                <CGMBanner
                    connected={dexcomConnected}
                    syncing={syncing}
                    onConnect={() => router.push("/cgm-setup")}
                />
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

                        <Button
                            variant="secondary"
                            size="xl"
                            className="max-w-[260px]"
                            onClick={() => { setEditingReading(null); setSheetOpen(true); }}
                        >
                            <PiPlusBold size={14} className="mr-2" />
                            LOG FINGER-STICK
                        </Button>
                    </div>
                ) : (
                    <div className="px-6 py-6 pb-24">
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-[#2D264B] text-lg font-bold tracking-tight">
                                Overview
                            </h2>
                            <Button
                                variant="secondary"
                                size="sm"
                                className="max-w-44"
                                onClick={() => { setEditingReading(null); setSheetOpen(true); }}
                            >
                                <PiPlusBold size={12} className="mr-1.5" />
                                LOG FINGER-STICK
                            </Button>
                        </div>

                        <div className="flex flex-col gap-3">
                            {filteredLogs.map((reading) => (
                                <BGReadingCard
                                    key={reading.id}
                                    reading={reading}
                                    onEdit={() => {
                                        if (reading.source === "cgm") {
                                            setEditingReading(null);
                                        } else {
                                            setEditingReading(reading);
                                        }
                                        setSheetOpen(true);
                                    }}
                                />
                            ))}
                        </div>

                        {dexcomConnected && (
                            <CGMChart
                                currentReading={readings.find(r => r.source === 'cgm')?.value || 140}
                            />
                        )}
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
