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
    PiSpinnerGap,
    PiCheckCircleFill,
    PiArrowRight,
} from "react-icons/pi";
import { PiHeartFill } from "react-icons/pi";
import AppHeader from "../layout/app-header";
import DatePicker from "../layout/date-picker";
import { Button, BottomSheet } from "../ui";
import StressLogSheet from "../widget/stress-log-sheet";
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
            className={`bg-white px-5 py-3 flex items-center gap-3 border-b border-neutral-100 ${!connected ? "cursor-pointer active:bg-neutral-50" : ""} transition-colors`}
        >
            <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-neutral-100">
                <PiHeartFill size={22} className="text-[#ff3b30]" />
            </div>

            <div className="flex-1 min-w-0">
                {!connected ? (
                    <>
                        <span className="text-[10px] font-bold text-[#ff3b30] uppercase tracking-wider">Apple Health</span>
                        <p className="text-base text-neutral-800 font-medium tracking-[0.2px] leading-tight mt-0.5">
                            Connect to Apple Health
                        </p>
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
                />
                <DatePicker
                    mode="week"
                    value={selectedDate}
                    onChange={setSelectedDate}
                />

                {/* Apple Health Banner */}
                {toggles.deviceData && (
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
                        <h2 className="text-neutral-800 text-xl font-medium tracking-[0.2px]">
                            Stress & HRV Logs
                        </h2>
                        <Button
                            variant="secondary"
                            size="md"
                            className="max-w-44"
                            onClick={() => {
                                setEditingLog(null);
                                setSheetOpen(true);
                            }}
                        >
                            <div className="flex items-center gap-1.5">
                                <PiPlusBold size={12} />
                                <span>LOG CHECK-IN</span>
                            </div>
                        </Button>
                    </div>
                )}

                <div className="px-6 pb-10">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-8 h-160">
                            <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center mb-6">
                                <PiHeartbeat size={28} className="text-amber-300" />
                            </div>
                            <h3 className="text-neutral-800 text-xl mb-2 tracking-[0.2px] font-semibold">
                                No stress data yet
                            </h3>
                            <p className="text-neutral-500 text-base mb-7 leading-relaxed tracking-[0.2px]">
                                {toggles.deviceData && !ahConnected
                                    ? "Connect Apple Health or track your perceived stress to improve wellbeing."
                                    : "Complete a stress check-in to track your patterns and improve wellbeing."}
                            </p>
                            <div className="flex flex-col gap-3 w-full max-w-[240px]">
                                {toggles.deviceData && !ahConnected && (
                                    <Button
                                        variant="primary"
                                        size="lg"
                                        onClick={() => setModalOpen(true)}
                                    >
                                        <PiHeartFill size={18} className="mr-2" />
                                        Connect Apple Health
                                    </Button>
                                )}
                                <Button
                                    variant={toggles.deviceData && !ahConnected ? "secondary" : "primary"}
                                    size="lg"
                                    className="w-full"
                                    onClick={() => {
                                        setEditingLog(null);
                                        setSheetOpen(true);
                                    }}
                                >
                                    Log check-in directly
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
                                            <StressCard
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

            <StressLogSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onLog={handleLog}
                initialData={editingLog}
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

// ─── Stress Card ─────────────────────────────────────────────────────

function StressCard({ entry, onEdit, onDelete }) {
    const levelInfo = getStressLevel(entry);

    return (
        <div className="bg-white rounded-2xl border p-4">
            {/* Top row */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                    <div className={`w-10 h-10 rounded-full ${levelInfo.bg} flex items-center justify-center shrink-0`}>
                        <PiHeartbeat size={18} className={levelInfo.color} />
                    </div>
                    <div className="flex flex-col">
                        <div className="flex items-baseline gap-2">
                            {entry.source === "phone" ? (
                                <>
                                    <span className="text-lg text-neutral-800 font-bold">{entry.hrv} <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider relative -top-0.5">MS HRV</span></span>
                                    <span className="text-lg text-neutral-400 font-bold px-1">•</span>
                                    <span className="text-lg text-neutral-800 font-bold">{entry.rhr} <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider relative -top-0.5">BPM RHR</span></span>
                                </>
                            ) : (
                                <span className="text-base text-neutral-800 font-bold tracking-tight">Perceived Stress</span>
                            )}
                        </div>
                        <span className="text-[11px] text-neutral-400 font-medium flex items-center mt-0.5 gap-1.5">
                            {entry.time || ""}
                            <span className="inline-block px-1.5 py-0.5 bg-neutral-100 text-neutral-500 text-[9px] font-medium rounded-md uppercase tracking-wide">
                                {entry.source === "phone" ? "Apple Health" : "Check-in"}
                            </span>
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1">
                    <div className={`px-2 py-1 ${levelInfo.bg} rounded-lg mr-1`}>
                        <span className={`text-[10px] font-bold ${levelInfo.color} uppercase tracking-wider`}>
                            {levelInfo.label}
                        </span>
                    </div>
                    <button
                        onClick={onEdit}
                        className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-neutral-50 transition-colors"
                    >
                        <PiPencilSimple size={14} className="text-neutral-500" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-red-50 transition-colors"
                    >
                        <PiTrash size={14} className="text-red-400" />
                    </button>
                </div>
            </div>
        </div>
    );
}
