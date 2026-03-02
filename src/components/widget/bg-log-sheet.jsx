"use client";

import React, { useState, useEffect } from "react";
import { PiX, PiSun, PiCoffee, PiBowlFood, PiCallBell, PiCaretDown } from "react-icons/pi";
import { Button, BottomSheet, TimeField } from "../ui";
import { saveBGLog, BG_TYPES } from "@/lib/bg-utils";

export const getBGIcon = (type) => {
    switch (type) {
        case "fasting": return <PiSun size={20} className="text-neutral-500" />;
        case "breakfast": return <PiCoffee size={20} className="text-neutral-500" />;
        case "lunch": return <PiBowlFood size={20} className="text-neutral-500" />;
        case "dinner": return <PiCallBell size={20} className="text-neutral-500" />;
        default: return <PiSun size={20} className="text-neutral-500" />;
    }
};

export default function BGLogSheet({ open, onClose, onLog }) {
    // view can be "select_type" or "input_value"
    const [view, setView] = useState("select_type");
    const [selectedType, setSelectedType] = useState(null);

    // Form states
    const [value, setValue] = useState("");
    const [ppPhase, setPpPhase] = useState("1h PP"); // '1h PP' or '2h PP'. Only matters if not fasting.
    const [time, setTime] = useState("");

    useEffect(() => {
        if (open) {
            setView("select_type");
            setSelectedType(null);
            setValue("");
            setPpPhase("1h PP");
            const now = new Date();
            let hours = now.getHours();
            let mins = now.getMinutes().toString().padStart(2, '0');
            setTime(`${hours.toString().padStart(2, '0')}:${mins}`);
        }
    }, [open]);

    // Format time for display (HH:mm -> hh:mm A)
    const formatTimeDisplay = (timeStr) => {
        if (!timeStr) return "";
        const [h, m] = timeStr.split(":");
        let hrs = parseInt(h);
        const ampm = hrs >= 12 ? "PM" : "AM";
        hrs = hrs % 12 || 12;
        return `${hrs.toString().padStart(2, '0')}:${m} ${ampm}`;
    };

    const handleTypeSelect = (type) => {
        setSelectedType(type);
        setView("input_value");
    };

    const handleLog = () => {
        if (!value || isNaN(value)) return;

        const typeInfo = BG_TYPES.find(t => t.id === selectedType) || BG_TYPES[0];

        const logData = {
            typeId: typeInfo.id,
            typeLabel: typeInfo.label,
            value: Number(value),
            ppPhase: typeInfo.id === "fasting" ? null : ppPhase,
            time: formatTimeDisplay(time)
        };

        saveBGLog(logData);
        if (onLog) onLog(logData);
        onClose();
    };

    if (view === "select_type") {
        return (
            <BottomSheet open={open} onClose={onClose} title="Select the type of log">
                <div className="flex flex-col mb-4">
                    {BG_TYPES.map((type, idx) => (
                        <button
                            key={type.id}
                            onClick={() => handleTypeSelect(type.id)}
                            className={`flex flex-col items-center justify-center p-4 transition-colors hover:bg-neutral-50 active:bg-neutral-100 ${idx !== BG_TYPES.length - 1 ? 'border-b border-neutral-100' : ''}`}
                        >
                            <div className="flex items-center gap-3 w-full justify-center">
                                {getBGIcon(type.id)}
                                <span className="text-base font-bold text-[#1E293B]">{type.label}</span>
                            </div>
                        </button>
                    ))}
                </div>
            </BottomSheet>
        );
    }

    const typeInfo = BG_TYPES.find(t => t.id === selectedType) || BG_TYPES[0];
    const isFasting = selectedType === "fasting";

    // Input View
    return (
        <BottomSheet open={open} onClose={onClose} title="Log Finger-stick Value">
            <div className="flex flex-col pb-4">
                {/* Type selector header */}
                <div className="mb-6">
                    <label className="text-sm font-bold text-[#1E293B] block mb-2">Select the type of log:</label>
                    <button
                        onClick={() => setView("select_type")}
                        className="w-full h-12 flex items-center justify-between border border-neutral-200 rounded-xl px-4 bg-white hover:bg-neutral-50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            {getBGIcon(selectedType)}
                            <span className="text-sm font-bold text-[#1E293B]">{typeInfo.label}</span>
                        </div>
                        <PiCaretDown size={16} className="text-[#64748B]" />
                    </button>
                </div>

                {/* Log value */}
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-sm font-bold text-[#1E293B]">Log glucose:</label>
                        {!isFasting && (
                            <div className="flex bg-neutral-100 p-0.5 rounded-lg border border-neutral-200 shadow-sm">
                                <button
                                    onClick={() => setPpPhase("1h PP")}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${ppPhase === "1h PP" ? "bg-purple-100 text-[#c084fc] shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                                >
                                    1h PP
                                </button>
                                <button
                                    onClick={() => setPpPhase("2h PP")}
                                    className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${ppPhase === "2h PP" ? "bg-[#c084fc] text-white shadow-sm" : "text-neutral-500 hover:text-neutral-700"}`}
                                >
                                    2h PP
                                </button>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center border border-neutral-200 rounded-xl px-4 h-12 bg-white focus-within:border-purple-300 focus-within:ring-2 focus-within:ring-purple-100 transition-all">
                        <input
                            type="number"
                            inputMode="decimal"
                            value={value}
                            onChange={(e) => setValue(e.target.value)}
                            placeholder="Enter your finger stick glucose value"
                            className="flex-1 text-sm bg-transparent outline-none placeholder:text-neutral-400 font-medium text-neutral-800"
                        />
                        <span className="text-sm font-medium text-neutral-500 ml-2 border-l pl-3 border-neutral-200">mg/dL</span>
                    </div>
                </div>

                {/* Log time */}
                <div className="mb-8">
                    <label className="text-sm font-bold text-[#1E293B] block mb-2">Log time:</label>
                    <TimeField
                        value={time}
                        onChange={setTime}
                    />
                </div>

                <div className="px-1 text-center">
                    <button
                        onClick={handleLog}
                        disabled={!value || isNaN(value)}
                        className={`w-full h-12 rounded-full font-bold tracking-wide uppercase transition-all shadow-[0_2px_8px_rgba(0,0,0,0.06)] ${!value || isNaN(value) ? 'bg-neutral-100 text-neutral-400 border border-neutral-200 cursor-not-allowed' : 'bg-gradient-to-r from-[#FFE5E5] via-[#E5E5FF] to-[#E5FFFF] text-[#2D264B] border-2 border-transparent bg-clip-border hover:opacity-90 active:scale-[0.98]'}`}
                        style={{
                            backgroundImage: value && !isNaN(value) ? 'linear-gradient(to right, #FFE5E5, #E5E5FF, #E5FFFF), linear-gradient(to right, #FFE5E5, #E5E5FF, #E5FFFF)' : undefined,
                            backgroundOrigin: value && !isNaN(value) ? 'border-box' : undefined,
                            backgroundClip: value && !isNaN(value) ? 'content-box, border-box' : undefined,
                            boxShadow: value && !isNaN(value) ? '0px 4px 10px rgba(0,0,0,0.03)' : undefined
                        }}
                    >
                        LOG GLUCOSE
                    </button>
                    { /* Note: applying gradient border matching screenshot for + LOG BGM / FINGER-STICK */}
                </div>
            </div>
        </BottomSheet>
    );
}
