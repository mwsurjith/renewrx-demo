"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from "next/navigation";
import {
    PiPencilSimple,
    PiSpinnerGap,
    PiCheckCircleFill,
    PiArrowRight,
    PiPlusBold,
    PiGear,
} from "react-icons/pi";
import { AppHeader } from "../layout";
import DatePicker from "../layout/date-picker";
import { Button } from "../ui";
import BPLogSheet from "../widget/bp-log-sheet";
import BPReadingCard from "../widget/bp-reading-card";
import {
    getOverallStatus,
    getValueColor,
    getStatusBadgeStyle,
    shortStatusLabel,
    getBPReadings,
    saveBPReadings,
    groupReadingsByDate,
    getIHealthConnected,
    setIHealthConnected as persistIHealthConnected,
    generateIHealthSyncedReadings,
} from "@/lib/bp-utils";
import { useDeveloper } from "@/context/developer-context";


// ─── IHealthBanner ──────────────────────────────────────────────────

function IHealthBanner({ connected, syncing, syncComplete, onConnect }) {
    const [dots, setDots] = useState(".");

    useEffect(() => {
        if (!syncing) return;
        const interval = setInterval(() => {
            setDots((d) => (d.length >= 3 ? "." : d + "."));
        }, 500);
        return () => clearInterval(interval);
    }, [syncing]);

    // Placeholder device image
    const imgDevice = "https://ihealthlabs.com/cdn/shop/files/Neo_60ad73cc-ee77-4bdf-bf89-f5df4b93378f.png?v=1719337375";

    return (
        <div
            onClick={!connected ? onConnect : undefined}
            className={`bg-violet-50 px-5 py-3 flex items-center gap-3 border-b border-neutral-100 ${!connected ? "cursor-pointer active:bg-neutral-50" : ""} transition-colors`}
        >
            {/* Device icon */}
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-neutral-100">
                <img src={imgDevice} alt="iHealth Device" className="w-8 h-8 object-cover rounded p-0.5 opacity-80" />
            </div>

            <div className="flex-1 min-w-0">
                {!connected ? (
                    <>
                        <span className="text-[10px] font-bold text-violet-500 uppercase tracking-wider">iHealth Neo</span>
                        <p className="text-base text-neutral-800 font-medium tracking-[0.2px] leading-tight">
                            Connect your iHealth Neo Wireless
                        </p>
                    </>
                ) : syncing ? (
                    <>
                        <div className="flex items-center gap-2">
                            <PiSpinnerGap size={14} className="text-neutral-800 animate-spin shrink-0" />
                            <p className="text-base text-neutral-800 font-medium tracking-[0.2px]">
                                Syncing your readings{dots}
                            </p>
                        </div>
                        <p className="text-sm text-neutral-400 tracking-[0.2px] mt-0.5">
                            iHealth Neo · This may take a moment
                        </p>
                    </>
                ) : (
                    <>
                        <div className="flex items-center gap-1.5">
                            <PiCheckCircleFill size={14} className="text-green-600 shrink-0" />
                            <p className="text-base text-neutral-800 font-medium tracking-[0.2px]">
                                iHealth Neo · Data up to date
                            </p>
                        </div>
                        <p className="text-sm text-neutral-400 tracking-[0.2px] mt-0.5">
                            Last synced just now
                        </p>
                    </>
                )}
            </div>

            {!connected && <PiArrowRight size={20} className="text-neutral-400 shrink-0" />}
        </div>
    );
}

// ─── BPDetailScreen ─────────────────────────────────────────────────

export default function BPDetailScreen() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toggles } = useDeveloper();

    const [readings, setReadings] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [groupedReadings, setGroupedReadings] = useState([]);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingReading, setEditingReading] = useState(null);
    const [iHealthConnected, setIHealthConnected] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [syncComplete, setSyncComplete] = useState(false);

    // Get Sunday of the week
    const getSunday = (d) => {
        const date = new Date(d);
        const day = date.getDay(); // 0 is Sunday
        const diff = date.getDate() - day;
        const sun = new Date(date.setDate(diff));
        sun.setHours(0, 0, 0, 0);
        return sun;
    };

    // Load existing readings + iHealth state on mount
    useEffect(() => {
        const stored = getBPReadings();
        setReadings(stored);
        setIHealthConnected(getIHealthConnected());
    }, []);

    // Effect to filter and group readings based on selectedDate (Week Range)
    useEffect(() => {
        const sun = getSunday(selectedDate);
        const sat = new Date(sun);
        sat.setDate(sun.getDate() + 6);
        sat.setHours(23, 59, 59, 999);

        const filtered = readings.filter(r => {
            // Priority: r.date (YYYY-MM-DD from log sheet) then r.createdAt (iHealth/System)
            let rDate;
            if (r.date) {
                // Parse YYYY-MM-DD at noon to avoid TZ issues
                rDate = new Date(r.date + 'T12:00:00');
            } else {
                rDate = new Date(r.createdAt);
            }
            return rDate >= sun && rDate <= sat;
        });

        setGroupedReadings(groupReadingsByDate(filtered));
    }, [readings, selectedDate]);

    // 1. Detect syncing=true from iHealth success redirect and CLEAR URL
    useEffect(() => {
        if (searchParams.get("syncing") === "true") {
            // Persist the connection state
            persistIHealthConnected(true);
            setIHealthConnected(true);

            // Set flag to trigger the sync effects
            setSyncing(true);

            // Replace URL to remove query param immediately
            // This re-triggers THIS effect, but the 'if' will fail next time
            router.replace("/blood-pressure");
        }
    }, [searchParams, router]);

    // 2. Separate effects to handle the actual sync countdown
    // This effect is STABLE across URL cleanups because it depends on syncing=true
    useEffect(() => {
        if (syncing && !syncComplete) {
            // After 5 seconds (shortened for demo), mark sync complete and load data
            const timer = setTimeout(() => {
                setSyncing(false);
                setSyncComplete(true);

                const syncedReadings = generateIHealthSyncedReadings();
                const all = saveBPReadings(syncedReadings);
                setReadings(all);

                // Also ensures the home screen widget will see the new data
                persistIHealthConnected(true);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [syncing, syncComplete]);

    const handleConnect = useCallback(() => {
        router.push("/ihealth-login");
    }, [router]);

    const handleLogData = (reading) => {
        const updated = getBPReadings();
        setReadings(updated);
    };

    const isEmpty = groupedReadings.length === 0;

    return (
        <div className="flex flex-col h-full font-sans">
            {/* Sticky header area */}
            <div className="flex-none">
                <AppHeader
                    pageTitle="Blood Pressure"
                    onBack={() => router.push("/")}
                    rightContent={
                        <button onClick={() => router.push("/device-management")} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-neutral-50 transition-colors">
                            <PiGear size={24} className="text-[#2f4358]" />
                        </button>
                    }
                />
                <DatePicker
                    mode="week"
                    value={selectedDate}
                    onChange={setSelectedDate}
                />
                {toggles.iHealthIntegration && (
                    <IHealthBanner
                        connected={iHealthConnected}
                        syncing={syncing}
                        syncComplete={syncComplete}
                        onConnect={handleConnect}
                    />
                )}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                {/* Overview header */}
                {!isEmpty && (
                    <div className="px-6 py-5 flex items-center justify-between">
                        <h2 className="text-neutral-800 text-xl font-medium tracking-[0.2px]">
                            Overview
                        </h2>
                        <Button
                            variant="secondary"
                            size="md"
                            className="max-w-40"
                            onClick={() => {
                                setEditingReading(null);
                                setSheetOpen(true);
                            }}
                        >
                            <div className="flex items-center gap-1.5">
                                <PiPlusBold size={12} />
                                <span>ADD MANUALLY</span>
                            </div>
                        </Button>
                    </div>
                )}

                <div className="px-6 pb-10">
                    {isEmpty ? (
                        /* Empty state */
                        <div className="flex flex-col items-center justify-center py-20 text-center px-8 h-160">
                            <div className="w-32 h-32 mb-6">
                                <img
                                    src="/image 186.png"
                                    alt="Empty State"
                                    className="w-full h-full object-contain"
                                />
                            </div>
                            <h3 className="text-neutral-800 text-xl mb-2 tracking-[0.2px] font-semibold">
                                No readings yet
                            </h3>
                            <p className="text-neutral-500 text-base mb-7 leading-relaxed tracking-[0.2px]">
                                {toggles.iHealthIntegration ?
                                    "Log your blood pressure manually or connect your iHealth device to get started." :
                                    "Log your blood pressure manually to get started."
                                }
                            </p>
                            <Button
                                variant="primary"
                                size="lg"
                                className="w-auto px-8"
                                onClick={() => {
                                    setEditingReading(null);
                                    setSheetOpen(true);
                                }}
                            >
                                Log first reading
                            </Button>
                        </div>
                    ) : (
                        groupedReadings.map((section, idx) => (
                            <div key={idx} className="mb-6">
                                <p className="text-neutral-500 text-base tracking-[0.2px] mb-3">
                                    {section.date}
                                </p>
                                <div className="flex flex-col gap-3">
                                    {section.readings.map((reading) => (
                                        <BPReadingCard
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
                        ))
                    )}
                </div>
            </div>

            {/* Log sheet */}
            <BPLogSheet
                open={sheetOpen}
                initialReading={editingReading}
                onClose={() => setSheetOpen(false)}
                onLog={handleLogData}
            />
        </div>
    );
}
