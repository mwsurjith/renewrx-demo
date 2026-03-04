"use client";

import React, { useState, useEffect } from "react";
import { BottomSheet, Button, DateField, TimeField } from "../ui";

/**
 * StressLogSheet
 * 
 * Bottom sheet for manually logging perceived stress level.
 */
export default function StressLogSheet({ open, onClose, onLog, initialData = null }) {
    const [date, setDate] = useState("");
    const [time, setTime] = useState("");
    const [stressLevel, setStressLevel] = useState(null); // 1-5 scale
    const [note, setNote] = useState("");

    const stressLevels = [1, 2, 3, 4, 5];

    useEffect(() => {
        if (open) {
            if (initialData) {
                setDate(initialData.date || "");
                setTime(initialData.time || "");
                setStressLevel(initialData.stressLevel || null);
                setNote(initialData.note || "");
            } else {
                const now = new Date();
                setDate(now.toISOString().split("T")[0]);
                setTime(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`);
                setStressLevel(null);
                setNote("");
            }
        }
    }, [open, initialData]);

    const canLog = date && time && stressLevel !== null;

    const handleLog = () => {
        if (!canLog) return;
        onLog({
            date,
            time,
            stressLevel,
            note: note.trim() || undefined,
            source: "manual",
        });
        onClose();
    };

    return (
        <BottomSheet open={open} onClose={onClose} title="Stress Check-in">
            <div className="flex flex-col gap-4 pt-2 mb-6">
                {/* Date & Time */}
                <div className="grid grid-cols-2 gap-3">
                    <DateField value={date} onChange={setDate} />
                    <TimeField
                        value={time}
                        onChange={setTime}
                        showIcon={false}
                    />
                </div>

                {/* Subjective Scale */}
                <div>
                    <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2 block">
                        How stressed do you feel?
                    </label>
                    <div className="flex gap-2">
                        {stressLevels.map((val) => (
                            <button
                                key={val}
                                onClick={() => setStressLevel(val)}
                                className={`flex-1 flex flex-col items-center justify-center py-3 rounded-xl border transition-all ${stressLevel === val
                                    ? "border-purple-300 bg-purple-50"
                                    : "border-neutral-200 bg-white hover:bg-neutral-50"
                                    }`}
                            >
                                <div className={`flex flex-col items-center ${stressLevel === val ? "text-purple-600" : "text-neutral-700"}`}>
                                    <span className="text-[20px] font-bold leading-none">{val}</span>
                                    <span className="text-[14px] leading-none mt-1 h-[14px] flex items-center justify-center">
                                        {val === 1 ? "😌" : val === 5 ? "😫" : ""}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                    <div className="flex justify-between mt-2 px-1">
                        <span className="text-[10px] text-neutral-400 font-medium tracking-tight">1: Very relaxed</span>
                        <span className="text-[10px] text-neutral-400 font-medium tracking-tight">5: Very stressed</span>
                    </div>
                </div>

                {/* Note Input */}
                <div className="flex flex-col">
                    <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2 block">
                        Add a note (optional)
                    </label>
                    <textarea
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                        placeholder="What's causing this?"
                        maxLength={500}
                        rows={3}
                        className="w-full resize-none rounded-xl border border-neutral-200 p-4 text-[15px] font-medium tracking-[0.2px] text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-neutral-300 transition-colors bg-white shadow-sm"
                    />
                </div>
            </div>

            <Button
                variant="primary"
                size="xl"
                onClick={handleLog}
                disabled={!canLog}
            >
                LOG CHECK-IN
            </Button>
        </BottomSheet>
    );
}
