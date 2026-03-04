"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    PiHeartbeat,
    PiPencilSimple,
    PiTrash,
    PiPlusBold,
    PiLink,
    PiWarning,
    PiCheckCircleFill,
    PiArrowRight,
    PiGear,
} from "react-icons/pi";
import { PiHeartFill } from "react-icons/pi";
import AppHeader from "../layout/app-header";
import DatePicker from "../layout/date-picker";
import { Button, BottomSheet } from "../ui";
import StressLogSheet from "../widget/stress-log-sheet";
import { StressReadingCard, SelectStressModeSheet } from "../widget";
import PPGStressMeasure from "./ppg-stress-measure";
import AppleHealthModal from "./apple-health-modal";
import { useDeveloper } from "@/context/developer-context";
import {
    getStressLogs,
    saveStressLog,
    deleteStressLog,
    generateAppleHealthSyncedStressReadings,
    groupStressByDate,
    getStressLevel,
} from "@/lib/stress-utils";
import { getAppleHealthConnected, setAppleHealthConnected } from "@/lib/sleep-utils";

// ─── AppleHealthBanner ──────────────────────────────────────────────

function AppleHealthBanner({ connected, syncing, onConnect }) {
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
            className={`bg-white px-5 py-3 flex items-center justify-between border-b border-neutral-100 ${!connected ? "cursor-pointer active:bg-neutral-50" : ""} transition-colors`}
        >
            <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shrink-0 border border-neutral-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                    <PiHeartFill size={20} className="text-[#ff3b30]" />
                </div>
                <div className="flex flex-col">
                    {!connected ? (
                        <>
                            <span className="text-[10px] font-bold text-[#ff3b30] uppercase tracking-wider mb-0.5">Apple Health</span>
                            <span className="text-sm text-[#2D3F58] font-bold tracking-tight">Connect to Apple Health</span>
                        </>
                    ) : syncing ? (
                        <>
                            <div className="flex items-center gap-2">
                                <PiSpinnerGap size={14} className="text-neutral-800 animate-spin shrink-0" />
                                <p className="text-base text-neutral-800 font-medium tracking-[0.2px]">
                                    Syncing your data{dots}
                                </p>
                            </div>
                            <p className="text-sm text-neutral-400 tracking-[0.2px] mt-0.5">
                                Apple Health · This may take a moment
                            </p>
                        </>
                    ) : (
                        <>
                            <div className="flex items-center gap-1.5">
                                <PiCheckCircleFill size={14} className="text-green-600 shrink-0" />
                                <p className="text-base text-neutral-800 font-medium tracking-[0.2px]">
                                    Apple Health · Data up to date
                                </p>
                            </div>
                            <p className="text-[11px] font-medium text-neutral-400 mt-0.5">Last synced just now</p>
                        </>
                    )}
                </div>
            </div>
            {!connected && <PiArrowRight size={20} className="text-neutral-400 shrink-0 ml-2" />}
        </div>
    );
}

/**
 * StressDetailScreen
 *
 * Full detail page for stress/HRV tracking, following BPDetailScreen pattern.
 */
export default function StressDetailScreen() {
    const router = useRouter();
    const { toggles } = useDeveloper();

    const [logs, setLogs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [groupedLogs, setGroupedLogs] = useState([]);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null);

    const [ahConnected, setAhConnected] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [ppgOpen, setPpgOpen] = useState(false);
    const [modeSheetOpen, setModeSheetOpen] = useState(false);

    // Load logs
    useEffect(() => {
        setLogs(getStressLogs());
        setAhConnected(getAppleHealthConnected());
    }, []);

    // Simulated Sync Process
    useEffect(() => {
        if (!syncing) return;
        const timer = setTimeout(() => {
            const newLogs = generateAppleHealthSyncedStressReadings();
            const merged = [...newLogs, ...getStressLogs()];
            // sort by ID/date ideally, but for demo just unshift
            localStorage.setItem("renewrx_stress_logs", JSON.stringify(merged));
            setLogs(merged);
            setSyncing(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [syncing]);

    // Filter by week
    useEffect(() => {
        const getSunday = (d) => {
            const date = new Date(d);
            const day = date.getDay();
            date.setDate(date.getDate() - day);
            date.setHours(0, 0, 0, 0);
            return date;
        };

        const sun = getSunday(selectedDate);
        const sat = new Date(sun);
        sat.setDate(sun.getDate() + 6);
        sat.setHours(23, 59, 59, 999);

        const filtered = logs.filter(l => {
            const d = new Date((l.date || l.createdAt.split("T")[0]) + "T12:00:00");
            return d >= sun && d <= sat;
        });

        setGroupedLogs(groupStressByDate(filtered));
    }, [logs, selectedDate]);

    const handleLog = (data) => {
        const updated = saveStressLog(data);
        setLogs(updated);
        setSheetOpen(false);
    };

    // Handle PPG result — save as a camera-sourced HRV log
    const handlePpgResult = (result) => {
        const now = new Date();
        const updated = saveStressLog({
            date: now.toISOString().split("T")[0],
            time: `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`,
            hrv: result.hrv,
            rhr: result.bpm,
            stressScore: result.stressScore,
            rmssd: result.rmssd,
            source: "camera",
        });
        setLogs(updated);
    };

    const handleDeleteClick = (log) => {
        setLogToDelete(log);
        setDeleteSheetOpen(true);
    };

    const confirmDelete = () => {
        if (logToDelete) {
            const updated = deleteStressLog(logToDelete.id);
            setLogs(updated);
        }
        setDeleteSheetOpen(false);
        setLogToDelete(null);
    };

    const handleAllowAppleHealth = () => {
        setAppleHealthConnected(true);
        setAhConnected(true);
        setSyncing(true);
    };

    const isEmpty = groupedLogs.length === 0;

    return (
        <div className="flex flex-col h-full font-sans">
            {/* Sticky header */}
            <div className="flex-none">
                <AppHeader
                    pageTitle="Stress Tracker"
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

                {/* Apple Health Banner */}
                {toggles.deviceData && toggles.appleHealthIntegration && (
                    <AppleHealthBanner
                        connected={ahConnected}
                        syncing={syncing}
                        onConnect={() => setModalOpen(true)}
                    />
                )}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                {/* Section header */}
                {!isEmpty && (
                    <div className="px-6 py-5 flex items-center justify-between">
                        <h2 className="text-neutral-800 text-xl font-bold tracking-tight">
                            History
                        </h2>
                        <Button
                            variant="secondary"
                            size="md"
                            className="w-auto px-4 !h-10 text-[13px] font-bold"
                            onClick={() => {
                                if (toggles.appleHealthIntegration) {
                                    setModeSheetOpen(true);
                                } else {
                                    setEditingLog(null);
                                    setSheetOpen(true);
                                }
                            }}
                        >
                            <PiPlusBold size={14} className="mr-2" />
                            ADD LOG
                        </Button>
                    </div>
                )}

                <div className="px-6 pb-10">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-8 h-[60vh]">
                            <div className="w-14 h-14 bg-[#FFF9ED] rounded-2xl flex items-center justify-center mb-6 border border-[#FDE5CA]">
                                <PiHeartbeat size={28} className="text-[#FBBF24]" />
                            </div>
                            <h3 className="text-[#2D3F58] text-lg mb-2 tracking-tight font-bold">
                                No stress data yet
                            </h3>
                            <p className="text-neutral-500 text-[15px] mb-8 leading-relaxed tracking-tight font-medium max-w-[280px]">
                                {toggles.deviceData && !ahConnected
                                    ? "Connect Apple Health or track your perceived stress to improve wellbeing."
                                    : "Complete a stress check-in to track your patterns and improve wellbeing."}
                            </p>
                            <div className="flex flex-col gap-3 w-full max-w-[260px]">
                                <Button
                                    variant="primary"
                                    size="xl"
                                    className="w-full !h-14 font-bold tracking-tight text-base"
                                    onClick={() => {
                                        if (toggles.appleHealthIntegration) {
                                            setModeSheetOpen(true);
                                        } else {
                                            setEditingLog(null);
                                            setSheetOpen(true);
                                        }
                                    }}
                                >
                                    <PiPlusBold size={20} className="mr-2" /> Start Tracking
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {groupedLogs.map((section, idx) => (
                                <div key={idx} className="mb-6">
                                    <p className="text-neutral-500 text-base tracking-[0.2px] mb-3">
                                        {section.date}
                                    </p>
                                    <div className="flex flex-col gap-3">
                                        {section.entries.map((entry) => (
                                            <StressReadingCard
                                                key={entry.id}
                                                entry={entry}
                                                onEdit={() => {
                                                    setEditingLog(entry);
                                                    setSheetOpen(true);
                                                }}
                                                onDelete={() => handleDeleteClick(entry)}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}

                            {/* Coming soon */}
                            <div className="mt-4 flex items-center gap-3 p-4 rounded-2xl border border-neutral-100 bg-neutral-50/50">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-neutral-100 shrink-0">
                                    <PiLink size={18} className="text-neutral-400" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm text-neutral-800 font-bold tracking-tight">Connect 3rd Party Devices</p>
                                    <p className="text-xs text-neutral-400 font-medium">Oura, Whoop, Apple Watch — Coming Soon</p>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="mt-6 flex items-start gap-2 px-2">
                                <PiWarning size={14} className="text-neutral-300 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-neutral-400 leading-relaxed">
                                    Stress and HRV data is for informational purposes only and should not be used
                                    for medical decisions. Always consult your healthcare provider.
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </div>

            {/* Modals & Bottom Sheets */}

            <AppleHealthModal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                onAllow={handleAllowAppleHealth}
            />

            <PPGStressMeasure
                open={ppgOpen}
                onClose={() => setPpgOpen(false)}
                onResult={handlePpgResult}
            />

            <StressLogSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onLog={handleLog}
                initialData={editingLog}
            />

            <SelectStressModeSheet
                open={modeSheetOpen}
                onClose={() => setModeSheetOpen(false)}
                onSelectMode={(mode) => {
                    if (mode === "camera") setPpgOpen(true);
                    else {
                        setEditingLog(null);
                        setSheetOpen(true);
                    }
                }}
            />

            {/* Delete confirmation */}
            <BottomSheet
                open={deleteSheetOpen}
                onClose={() => setDeleteSheetOpen(false)}
                title="Remove log"
            >
                <div className="flex flex-col gap-3">
                    <Button
                        variant="destructive"
                        size="xl"
                        onClick={confirmDelete}
                        className="!h-[60px]"
                    >
                        <PiTrash size={20} className="mr-2" />
                        REMOVE LOG
                    </Button>
                    <Button
                        variant="tertiary"
                        size="xl"
                        onClick={() => setDeleteSheetOpen(false)}
                        className="!h-[60px]"
                    >
                        CANCEL
                    </Button>
                </div>
            </BottomSheet>
        </div>
    );
}


