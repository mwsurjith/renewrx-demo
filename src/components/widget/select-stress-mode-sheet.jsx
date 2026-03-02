"use client";

import React from "react";
import { PiHeartbeatBold, PiNotePencilBold, PiInfo } from "react-icons/pi";
import BottomSheet from "../ui/bottom-sheet";

/**
 * SelectStressModeSheet Component
 * 
 * Modernt UI for choosing between camera measurement or manual logging.
 * Replaces separate buttons for a more unified flow.
 */
export default function SelectStressModeSheet({ open, onClose, onSelectMode }) {
    const modes = [
        {
            id: "camera",
            title: "Measure with Camera",
            desc: "Use your finger and phone's camera for a quick HRV check.",
            icon: <PiHeartbeatBold size={24} className="text-rose-500" />,
            bg: "bg-rose-50",
            border: "border-rose-100",
        },
        {
            id: "manual",
            title: "Enter Manually",
            desc: "Log your perceived stress and symptoms today.",
            icon: <PiNotePencilBold size={24} className="text-amber-500" />,
            bg: "bg-amber-50",
            border: "border-amber-100",
        },
    ];

    return (
        <BottomSheet open={open} onClose={onClose} title="Track Stress Level">
            <div className="flex flex-col gap-4 py-2">
                {modes.map((mode) => (
                    <button
                        key={mode.id}
                        onClick={() => {
                            onSelectMode(mode.id);
                            onClose();
                        }}
                        className={`flex items-start gap-4 p-4 rounded-[24px] border ${mode.border} ${mode.bg} transition-all active:scale-[0.98] text-left`}
                    >
                        <div className="w-12 h-12 bg-white rounded-2xl shadow-sm border border-neutral-100 flex items-center justify-center shrink-0">
                            {mode.icon}
                        </div>
                        <div className="flex flex-col gap-0.5 mt-0.5 pr-2">
                            <span className="text-[17px] font-bold text-neutral-800 tracking-tight leading-none mb-1">
                                {mode.title}
                            </span>
                            <span className="text-sm font-medium text-neutral-600 leading-snug">
                                {mode.desc}
                            </span>
                        </div>
                    </button>
                ))}

                <div className="mt-2 p-5 rounded-[24px] bg-violet-50 flex gap-3 border border-violet-100/50">
                    <PiInfo size={20} className="text-violet-500 shrink-0 mt-0.5" />
                    <p className="text-[12px] text-violet-800 font-medium leading-relaxed tracking-tight">
                        <span className="font-bold">Recommendation:</span> Consistent morning measurements using the PPG camera provide the most accurate HRV trends for tracking recovery and mental wellness.
                    </p>
                </div>
            </div>
        </BottomSheet>
    );
}
