"use client";

import React, { useState, useEffect } from 'react';
import { PiX, PiPlus, PiInfo, PiTrashSimple } from "react-icons/pi";
import { Button, DateField, TimeField } from "../ui";
import BottomSheet from "../ui/bottom-sheet";
import ScrollWheel from "../ui/scroll-wheel";
import BPClassificationsSheet from "./bp-classifications";
import { saveNotification } from "@/lib/notifications-utils";
import {
    getSystolicStatus,
    getDiastolicStatus,
    getPulseStatus,
    getOverallStatus,
    saveBPReading,
    getBPReadings,
    updateBPReading,
    deleteBPReading,
} from "@/lib/bp-utils";

// ─── Constants ──────────────────────────────────────────────────────

const CONTEXT_TAGS = [
    "Morning",
    "Evening",
    "Before Meds",
    "After Meds",
    "After Exercise",
];

// ─── Status Bar Sub-component ───────────────────────────────────────

function BPStatusBar({ systolic, diastolic, onInfoClick }) {
    const status = getOverallStatus(systolic, diastolic);
    const pos = status.snap ?? 50;

    return (
        <div className="flex flex-col items-center gap-2 mt-3">
            <div className="flex items-center gap-1.5">
                <div
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: status.color }}
                />
                <span className="text-[15px] text-neutral-800 font-semibold">
                    {status.label}
                </span>
                <button
                    onClick={onInfoClick}
                    className="ml-1 flex items-center justify-center"
                >
                    <PiInfo size={14} className="text-neutral-400" />
                </button>
            </div>

            {/* Gradient bar with indicator */}
            <div className="w-full relative">
                <div
                    className="absolute -top-[10px] transition-all duration-300 z-10"
                    style={{ left: `${pos}%`, transform: "translateX(-50%)" }}
                >
                    <div
                        className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-neutral-800"
                    />
                </div>

                <div className="w-full h-2 rounded-full overflow-hidden flex">
                    <div style={{ width: "15%" }} className="bg-blue-500" />
                    <div style={{ width: "20%" }} className="bg-green-500" />
                    <div style={{ width: "20%" }} className="bg-yellow-500" />
                    <div style={{ width: "17%" }} className="bg-orange-500" />
                    <div style={{ width: "16%" }} className="bg-red-500" />
                    <div style={{ width: "12%" }} className="bg-red-900" />
                </div>
            </div>
        </div>
    );
}

// ─── Context Tags Sub-component ─────────────────────────────────────

function ContextTags({ selected, onToggle }) {
    return (
        <div>
            <p className="text-sm text-neutral-800 font-medium tracking-[0.2px] mb-3">
                Context Tags
            </p>
            <div className="flex flex-wrap gap-2">
                {CONTEXT_TAGS.map((tag) => {
                    const isSelected = selected.includes(tag);
                    return (
                        <button
                            key={tag}
                            onClick={() => onToggle(tag)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium tracking-[0.2px] transition-all active:scale-95 ${isSelected
                                ? "bg-neutral-800 border-neutral-800 text-white"
                                : "bg-white border-neutral-200 text-neutral-800"
                                }`}
                        >
                            {isSelected ? (
                                <PiX size={12} weight="bold" />
                            ) : (
                                <PiPlus size={12} weight="bold" />
                            )}
                            {tag}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

// ─── Main BP Log Sheet ──────────────────────────────────────────────

/**
 * BPLogSheet Component
 * 
 * Bottom sheet for manually logging or editing a blood pressure reading.
 * Includes scroll wheels for systolic/diastolic/pulse, context tags,
 * and a classification reference sub-sheet.
 * 
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {Function} props.onLog - Called after a reading is saved or updated
 * @param {Object} [props.initialReading=null] - Initial reading data for editing
 */
export default function BPLogSheet({ open, onClose, onLog, initialReading = null }) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [systolic, setSystolic] = useState(102);
    const [diastolic, setDiastolic] = useState(77);
    const [pulse, setPulse] = useState(70);
    const [selectedTags, setSelectedTags] = useState([]);
    const [classificationsOpen, setClassificationsOpen] = useState(false);

    // Sync state with initialReading when opening
    useEffect(() => {
        if (open) {
            const now = new Date();
            if (initialReading) {
                setDate(initialReading.date || now.toISOString().split('T')[0]);
                // Convert stored format (H:MM AM/PM) to HH:mm for input
                let storedTime = initialReading.time || "";
                if (storedTime.includes("M")) {
                    const [t, m] = storedTime.split(" ");
                    let [h, min] = t.split(":");
                    h = parseInt(h);
                    if (m === "PM" && h < 12) h += 12;
                    if (m === "AM" && h === 12) h = 0;
                    storedTime = `${h.toString().padStart(2, '0')}:${min}`;
                }
                setTime(storedTime);
                setSystolic(initialReading.systolic || 102);
                setDiastolic(initialReading.diastolic || 77);
                setPulse(initialReading.pulse || 70);
                setSelectedTags(initialReading.tags || []);
            } else {
                // Default value for new entries
                setDate(now.toISOString().split('T')[0]);
                const hrs = now.getHours().toString().padStart(2, '0');
                const mins = now.getMinutes().toString().padStart(2, '0');
                setTime(`${hrs}:${mins}`);

                setSystolic(102);
                setDiastolic(77);
                setPulse(70);
                setSelectedTags([]);
            }
        }
    }, [open, initialReading]);

    const sysStatus = getSystolicStatus(systolic);
    const diaStatus = getDiastolicStatus(diastolic);
    const pulStatus = getPulseStatus(pulse);

    const toggleTag = (tag) => {
        setSelectedTags((prev) =>
            prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
        );
    };

    const handleLog = () => {
        // Format time back to AM/PM for display
        let displayTime = time;
        if (time) {
            const [h, m] = time.split(":");
            let hrs = parseInt(h);
            const ampm = hrs >= 12 ? "PM" : "AM";
            hrs = hrs % 12 || 12;
            displayTime = `${hrs}:${m} ${ampm}`;
        }

        const data = {
            systolic,
            diastolic,
            pulse,
            date,
            time: displayTime,
            tags: selectedTags,
            type: initialReading?.type || "Manual",
            status: getOverallStatus(systolic, diastolic).label,
        };

        if (initialReading) {
            updateBPReading(initialReading.id, data);
        } else {
            const entry = saveBPReading(data);

            // Notification logic with baseline ACOG/Maryanne feedback
            const isSevere = systolic >= 160 || diastolic >= 110;
            const isElevated = systolic >= 140 || diastolic >= 90;

            if (isSevere) {
                saveNotification({
                    type: "severe",
                    title: "Action Required: Severe Reading",
                    message: "Contact your provider or seek medical care immediately. Do not wait."
                });
            } else if (isElevated) {
                // Check for repeat elevated readings within 4 hours
                const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
                const nowMs = new Date(entry.createdAt).getTime();

                const allReadings = [...getBPReadings()];
                // The current one is at index 0, so we check the one before it (index 1)
                const lastReading = allReadings[1];

                let isRepeatElevated = false;
                if (lastReading) {
                    const lastTime = new Date(lastReading.createdAt).getTime();
                    const diff = nowMs - lastTime;
                    const prevElevated = lastReading.systolic >= 140 || lastReading.diastolic >= 90;

                    if (diff < FOUR_HOURS_MS && prevElevated) {
                        isRepeatElevated = true;
                    }
                }

                if (isRepeatElevated) {
                    saveNotification({
                        type: "severe",
                        title: "Action Required: Persistent High BP",
                        message: "Your blood pressure remains elevated on repeat check. Please contact your provider immediately."
                    });
                } else {
                    saveNotification({
                        type: "mild",
                        title: "Elevated Reading Logged",
                        message: "Rest properly and check again in 4 hours. No need for middle-of-the-night alarms."
                    });
                }
            }
        }

        if (onLog) onLog();
        onClose();
    };

    const handleDelete = () => {
        if (!initialReading) return;
        deleteBPReading(initialReading.id);
        if (onLog) onLog();
        onClose();
    };

    const isEdit = !!initialReading;

    return (
        <>
            <BottomSheet
                open={open}
                onClose={onClose}
                title={isEdit ? "Edit Blood Pressure" : "Log Blood Pressure"}
            >
                {/* Date & Time Row */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <DateField
                        value={date}
                        onChange={setDate}
                    />
                    <TimeField
                        value={time}
                        onChange={setTime}
                        showIcon={false}
                    />
                </div>

                {/* Scroll Wheels */}
                <div className="bg-neutral-50 rounded-xl p-4 mb-5">
                    <div className="flex justify-around mb-1">
                        <span className="text-[13px] text-neutral-800 font-semibold w-[90px] text-center">
                            Systolic
                        </span>
                        <span className="text-[13px] text-neutral-800 font-semibold w-[90px] text-center">
                            Diastolic
                        </span>
                        <span className="text-[13px] text-neutral-800 font-semibold w-[90px] text-center">
                            Pulse
                        </span>
                    </div>

                    <div className="flex justify-around">
                        <ScrollWheel
                            value={systolic}
                            onChange={setSystolic}
                            min={60}
                            max={250}
                            color={sysStatus.color}
                        />
                        <ScrollWheel
                            value={diastolic}
                            onChange={setDiastolic}
                            min={40}
                            max={180}
                            color={diaStatus.color}
                        />
                        <ScrollWheel
                            value={pulse}
                            onChange={setPulse}
                            min={30}
                            max={220}
                            color={pulStatus.color}
                        />
                    </div>

                    <BPStatusBar
                        systolic={systolic}
                        diastolic={diastolic}
                        onInfoClick={() => setClassificationsOpen(true)}
                    />
                </div>

                {/* Context Tags */}
                <div className="mb-6">
                    <ContextTags
                        selected={selectedTags}
                        onToggle={toggleTag}
                    />
                </div>

                {/* Submit */}
                <div className="flex flex-col gap-3">
                    <Button variant="primary" size="xl" onClick={handleLog}>
                        {isEdit ? "UPDATE BLOOD PRESSURE" : "LOG BLOOD PRESSURE"}
                    </Button>

                    {isEdit && (
                        <button
                            onClick={handleDelete}
                            className="flex items-center justify-center gap-2 py-3 text-red-500 font-medium active:bg-red-50 rounded-xl transition-colors"
                        >
                            <PiTrashSimple size={18} />
                            <span>Delete Entry</span>
                        </button>
                    )}
                </div>
            </BottomSheet>

            {/* Nested Classifications Sheet */}
            <BPClassificationsSheet
                open={classificationsOpen}
                onClose={() => setClassificationsOpen(false)}
                systolic={systolic}
                diastolic={diastolic}
                pulse={pulse}
            />
        </>
    );
}
