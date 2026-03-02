"use client";

import React, { useState, useEffect } from "react";
import { BottomSheet, Button, DateField, TimeField } from "../ui";

/**
 * SleepLogSheet
 * 
 * Bottom sheet for manually logging sleep data.
 */
export default function SleepLogSheet({ open, onClose, onLog, initialData = null }) {
    const [date, setDate] = useState("");
    const [bedtime, setBedtime] = useState("");
    const [wakeTime, setWakeTime] = useState("");
    const [quality, setQuality] = useState(null);

    const qualities = [
        { value: 1, emoji: "😫", label: "Poor" },
        { value: 2, emoji: "😐", label: "Fair" },
        { value: 3, emoji: "😊", label: "Good" },
        { value: 4, emoji: "😴", label: "Great" },
    ];

    useEffect(() => {
        if (open) {
            if (initialData) {
                setDate(initialData.date || "");
                setBedtime(initialData.bedtime || "");
                setWakeTime(initialData.wakeTime || "");
                setQuality(initialData.quality || null);
            } else {
                const today = new Date().toISOString().split("T")[0];
                setDate(today);
                setBedtime("22:30");
                setWakeTime("06:30");
                setQuality(null);
            }
        }
    }, [open, initialData]);

    const calculateDuration = () => {
        if (!bedtime || !wakeTime) return 0;
        const [bh, bm] = bedtime.split(":").map(Number);
        const [wh, wm] = wakeTime.split(":").map(Number);
        let bedMins = bh * 60 + bm;
        let wakeMins = wh * 60 + wm;
        if (wakeMins <= bedMins) wakeMins += 1440; // next day
        return wakeMins - bedMins;
    };

    const calculateScore = () => {
        const dur = calculateDuration();
        let score = 50;
        if (dur >= 420 && dur <= 540) score += 30; // 7-9h ideal
        else if (dur >= 360) score += 20;
        else if (dur >= 300) score += 10;
        if (quality) score += quality * 5;
        return Math.min(100, Math.max(0, score));
    };

    const canLog = date && bedtime && wakeTime;

    const handleLog = () => {
        if (!canLog) return;
        const duration = calculateDuration();
        const score = calculateScore();
        onLog({
            date,
            bedtime,
            wakeTime,
            duration,
            score,
            quality: quality || 2,
            source: "manual",
        });
        onClose();
    };

    return (
        <BottomSheet open={open} onClose={onClose} title="Log Sleep">
            <div className="flex flex-col gap-4 pt-2 mb-6">
                {/* Date */}
                <DateField value={date} onChange={setDate} />

                {/* Bedtime & Wake Time */}
                <div className="grid grid-cols-2 gap-3">
                    <TimeField
                        value={bedtime}
                        onChange={setBedtime}
                        label="Bedtime"
                        showIcon={false}
                    />
                    <TimeField
                        value={wakeTime}
                        onChange={setWakeTime}
                        label="Wake up"
                        showIcon={false}
                    />
                </div>

                {/* Quality selector */}
                <div>
                    <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-2 block">
                        Sleep Quality
                    </label>
                    <div className="flex gap-2">
                        {qualities.map((q) => (
                            <button
                                key={q.value}
                                onClick={() => setQuality(q.value)}
                                className={`flex-1 flex flex-col items-center gap-1 py-3 rounded-xl border transition-all ${quality === q.value
                                    ? "border-purple-300 bg-purple-50"
                                    : "border-neutral-200 bg-white hover:bg-neutral-50"
                                    }`}
                            >
                                <span className="text-xl">{q.emoji}</span>
                                <span className="text-[10px] font-semibold text-neutral-500">{q.label}</span>
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <Button
                variant="primary"
                size="xl"
                onClick={handleLog}
                disabled={!canLog}
            >
                LOG SLEEP
            </Button>
        </BottomSheet>
    );
}
