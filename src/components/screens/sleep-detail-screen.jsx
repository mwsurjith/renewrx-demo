"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    PiMoon,
    PiPencilSimple,
    PiTrash,
    PiPlusBold,
    PiLink,
    PiDeviceMobileSlash,
    PiWarning,
    PiSpinnerGap,
    PiCheckCircleFill,
    PiArrowRight,
    PiGear,
} from "react-icons/pi";
import { PiHeartFill } from "react-icons/pi";
import AppHeader from "../layout/app-header";
import DatePicker from "../layout/date-picker";
import { Button, BottomSheet } from "../ui";
import SleepLogSheet from "../widget/sleep-log-sheet";
import SleepBarChart from "../widget/sleep-bar-chart";
import AppleHealthModal from "./apple-health-modal";
import { useDeveloper } from "@/context/developer-context";
import {
    getSleepLogs,
    saveSleepLog,
    deleteSleepLog,
    saveSleepLogs,
    groupSleepByDate,
    getSleepScoreLabel,
    formatDuration,
    getAppleHealthConnected,
    setAppleHealthConnected,
    generateAppleHealthSyncedReadings,
} from "@/lib/sleep-utils";

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

// ─── SleepDetailScreen ──────────────────────────────────────────────

export default function SleepDetailScreen() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { toggles } = useDeveloper();

    const [logs, setLogs] = useState([]);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [groupedLogs, setGroupedLogs] = useState([]);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [editingLog, setEditingLog] = useState(null);
    const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
    const [logToDelete, setLogToDelete] = useState(null);

    // Apple Health State
    const [ahConnected, setAhConnected] = useState(false);
    const [syncing, setSyncing] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    // Date range for bar chart
    const [weekStart, setWeekStart] = useState(new Date());
    const [weekEnd, setWeekEnd] = useState(new Date());

    // Load logs + connection state
    useEffect(() => {
        setLogs(getSleepLogs());
        setAhConnected(getAppleHealthConnected());
    }, []);

    // Filter by week & aggregate for bar chart
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

        setWeekStart(sun);
        setWeekEnd(sat);

        const filtered = logs.filter(l => {
            const d = new Date((l.date || l.createdAt.split("T")[0]) + "T12:00:00");
            return d >= sun && d <= sat;
        });

        setGroupedLogs(groupSleepByDate(filtered));
    }, [logs, selectedDate]);

    // Simulated Sync Process
    useEffect(() => {
        if (!syncing) return;
        const timer = setTimeout(() => {
            const newLogs = generateAppleHealthSyncedReadings();
            const merged = saveSleepLogs(newLogs);
            setLogs(merged);
            setSyncing(false);
        }, 2000);
        return () => clearTimeout(timer);
    }, [syncing]);

    const handleLog = (data) => {
        const updated = saveSleepLog(data);
        setLogs(updated);
        setSheetOpen(false);
    };

    const handleDeleteClick = (log) => {
        setLogToDelete(log);
        setDeleteSheetOpen(true);
    };

    const confirmDelete = () => {
        if (logToDelete) {
            const updated = deleteSleepLog(logToDelete.id);
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
                    pageTitle="Sleep Tracker"
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

                {/* Device banner logic */}
                {!toggles.deviceData ? (
                    <div className="bg-amber-50 px-5 py-3 flex items-center gap-3 border-b border-neutral-100">
                        <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 shadow-sm border border-neutral-100">
                            <PiDeviceMobileSlash size={18} className="text-neutral-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <span className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">Phone Data</span>
                            <p className="text-sm text-neutral-800 font-medium tracking-[0.2px] leading-tight">
                                Device data not supported or turned off
                            </p>
                        </div>
                    </div>
                ) : (
                    <AppleHealthBanner
                        connected={ahConnected}
                        syncing={syncing}
                        onConnect={() => setModalOpen(true)}
                    />
                )}
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto w-full max-w-full overflow-x-hidden">
                {/* 7-Day Bar Chart */}
                {!isEmpty && (
                    <SleepBarChart
                        groupedLogs={groupedLogs}
                        dateRangeStart={weekStart}
                        dateRangeEnd={weekEnd}
                    />
                )}

                {/* Section header */}
                {!isEmpty && (
                    <div className="px-6 py-5 flex items-center justify-between">
                        <h2 className="text-neutral-800 text-xl font-medium tracking-[0.2px]">
                            Sleep Logs
                        </h2>
                        <Button
                            variant="secondary"
                            size="md"
                            className="max-w-40"
                            onClick={() => {
                                setEditingLog(null);
                                setSheetOpen(true);
                            }}
                        >
                            <div className="flex items-center gap-1.5">
                                <PiPlusBold size={12} />
                                <span>LOG SLEEP</span>
                            </div>
                        </Button>
                    </div>
                )}

                <div className="px-6 pb-10 w-full overflow-hidden">
                    {isEmpty ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center px-8 h-[60vh]">
                            <div className="w-14 h-14 bg-[#EEECFF] rounded-2xl flex items-center justify-center mb-6 border border-[#E0DCFF]">
                                <PiMoon size={28} className="text-[#818CF8]" />
                            </div>
                            <h3 className="text-[#2D3F58] text-lg mb-2 tracking-tight font-bold">
                                No sleep data yet
                            </h3>
                            <p className="text-neutral-500 text-[15px] mb-8 leading-relaxed tracking-tight font-medium max-w-[280px]">
                                {toggles.deviceData && !ahConnected
                                    ? "Connect Apple Health or log your sleep to track patterns and improve your rest."
                                    : "Log your sleep to track patterns and improve your rest."
                                }
                            </p>
                            <div className="flex flex-col gap-3 w-full max-w-[260px]">
                                <Button
                                    variant="secondary"
                                    size="xl"
                                    className="w-full"
                                    onClick={() => { setEditingLog(null); setSheetOpen(true); }}
                                >
                                    Log check-in directly
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            {groupedLogs.map((section, idx) => (
                                <div key={idx} className="mb-6 w-full">
                                    <p className="text-neutral-500 text-base tracking-[0.2px] mb-3">
                                        {section.date}
                                    </p>
                                    <div className="flex flex-col gap-3 w-full">
                                        {section.entries.map((entry) => (
                                            <SleepCard
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
                            <div className="mt-4 flex items-center gap-3 p-4 rounded-2xl border border-neutral-100 bg-neutral-50/50 w-full max-w-full">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center border border-neutral-100 shrink-0">
                                    <PiLink size={18} className="text-neutral-400" />
                                </div>
                                <div className="flex-1 min-w-0 pr-2">
                                    <p className="text-sm text-neutral-800 font-bold tracking-tight truncate">Connect 3rd Party Devices</p>
                                    <p className="text-xs text-neutral-400 font-medium truncate">Oura, Whoop, Fitbit — Coming Soon</p>
                                </div>
                            </div>

                            {/* Disclaimer */}
                            <div className="mt-6 flex items-start gap-2 px-2 w-full max-w-full">
                                <PiWarning size={14} className="text-neutral-300 mt-0.5 shrink-0" />
                                <p className="text-[11px] text-neutral-400 leading-relaxed pr-2">
                                    Sleep data is for informational purposes only and should not be used
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

            <SleepLogSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onLog={handleLog}
                initialData={editingLog}
            />

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

// ─── Sleep Card ──────────────────────────────────────────────────────

function SleepCard({ entry, onEdit, onDelete }) {
    const scoreInfo = getSleepScoreLabel(entry.score || 0);

    return (
        <div className="bg-white rounded-2xl border p-4 w-full">
            {/* Top row */}
            <div className="flex items-center justify-between mb-3 w-full">
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center shrink-0">
                        <PiMoon size={18} className="text-indigo-400" />
                    </div>
                    <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-2">
                            <span className="text-sm text-neutral-800 font-semibold truncate">
                                {formatDuration(entry.duration || 0)}
                            </span>
                            <span className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-500 text-[10px] font-medium rounded-full">
                                {entry.source === "phone" ? "Apple Health" : "Manual"}
                            </span>
                        </div>
                        <span className="text-[11px] text-neutral-400 font-medium truncate">
                            {entry.bedtime || ""} – {entry.wakeTime || ""}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                    <div className={`px-2 py-1 ${scoreInfo.bg} rounded-lg mr-1 hidden sm:block`}>
                        <span className={`text-[10px] font-bold ${scoreInfo.color} uppercase tracking-wider`}>
                            {entry.source === "manual" && entry.quality !== undefined ? `Quality ${entry.quality}` : scoreInfo.label}
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

            {/* Sleep stages bar */}
            {entry.stages && entry.source === "phone" && (
                <div className="w-full">
                    <div className="flex rounded-full overflow-hidden h-2 w-full">
                        <div className="bg-indigo-700" style={{ width: `${entry.stages.deep}%` }} />
                        <div className="bg-indigo-400" style={{ width: `${entry.stages.light}%` }} />
                        <div className="bg-purple-400" style={{ width: `${entry.stages.rem}%` }} />
                        <div className="bg-neutral-200" style={{ width: `${entry.stages.awake}%` }} />
                    </div>
                    <div className="flex justify-between mt-1.5 px-0.5 w-full">
                        <span className="text-[9px] text-neutral-400 font-medium">Deep {entry.stages.deep}%</span>
                        <span className="text-[9px] text-neutral-400 font-medium">Light {entry.stages.light}%</span>
                        <span className="text-[9px] text-neutral-400 font-medium">REM {entry.stages.rem}%</span>
                        <span className="text-[9px] text-neutral-400 font-medium">Awake {entry.stages.awake}%</span>
                    </div>
                </div>
            )}
        </div>
    );
}
