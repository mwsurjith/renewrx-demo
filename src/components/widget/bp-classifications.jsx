"use client";

import React from 'react';
import {
    PiCheckCircleFill,
    PiWarningFill,
    PiWarningCircleFill,
    PiInfo
} from "react-icons/pi";
import BottomSheet from "../ui/bottom-sheet";
import { getSystolicStatus, getDiastolicStatus, getPulseStatus } from "@/lib/bp-utils";

export default function BPClassificationsSheet({ open, onClose, systolic, diastolic, pulse }) {
    const sysStatus = getSystolicStatus(systolic);
    const diaStatus = getDiastolicStatus(diastolic);
    const pulStatus = getPulseStatus(pulse);

    const guidelines = [
        {
            icon: <PiCheckCircleFill size={22} className="text-green-500 shrink-0 mt-0.5" />,
            title: "Normal",
            range: "Under 120 / 80",
            desc: "Your blood pressure is in a healthy range.",
            bg: "bg-green-50/50",
            border: "border-green-100"
        },
        {
            icon: <PiInfo size={22} className="text-yellow-500 shrink-0 mt-0.5" />,
            title: "Slightly Elevated",
            range: "120-139 / 80-89",
            desc: "This is common. Practice proper resting technique and monitor your readings at your next scheduled time.",
            bg: "bg-yellow-50/50",
            border: "border-yellow-100"
        },
        {
            icon: <PiWarningFill size={22} className="text-orange-500 shrink-0 mt-0.5" />,
            title: "Mild to Moderate High",
            range: "140-159 / 90-109",
            desc: "Rest properly and check again in 4 hours. No need for middle-of-the-night alarms. If high readings persist into the next day, contact your provider.",
            bg: "bg-orange-50/50",
            border: "border-orange-100"
        },
        {
            icon: <PiWarningCircleFill size={22} className="text-red-600 shrink-0 mt-0.5" />,
            title: "Severe",
            range: "160 / 110 or higher",
            desc: "Requires urgent evaluation. Contact your provider or seek medical care immediately. Do not wait.",
            bg: "bg-red-50/50",
            border: "border-red-100"
        }
    ];

    return (
        <BottomSheet open={open} onClose={onClose} title="Blood Pressure Guidelines" zIndex={200}>
            {/* Current Reading Summary */}
            <div className="bg-neutral-50 rounded-2xl p-4 mb-5 border border-neutral-100">
                <p className="text-[10px] text-neutral-500 mb-3 font-bold uppercase tracking-widest">
                    Your Current Reading
                </p>
                <div className="flex gap-6">
                    {[
                        { label: "SYS", value: systolic, status: sysStatus },
                        { label: "DIA", value: diastolic, status: diaStatus },
                        { label: "PULSE", value: pulse, status: pulStatus },
                    ].map(({ label, value, status }) => (
                        <div key={label}>
                            <span className="text-[11px] text-neutral-500 font-bold">{label}</span>
                            <div className="flex items-center gap-2 mt-0.5">
                                <span className="text-[26px] font-bold text-neutral-800 tracking-tight leading-none">
                                    {value}
                                </span>
                                <span
                                    className="text-[10px] px-2 py-0.5 rounded-md font-bold uppercase tracking-widest"
                                    style={{ backgroundColor: status.color, color: status.textColor }}
                                >
                                    {status.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex flex-col gap-3">
                {guidelines.map((g, i) => (
                    <div key={i} className={`flex gap-3 p-4 rounded-2xl border ${g.border} ${g.bg}`}>
                        {g.icon}
                        <div className="flex flex-col gap-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <span className="text-[15px] font-bold text-neutral-800 tracking-tight leading-none">{g.title}</span>
                                <span className="text-xs font-bold text-neutral-500 tracking-tight">{g.range}</span>
                            </div>
                            <p className="text-[13px] font-medium text-neutral-600 leading-relaxed mt-1">
                                {g.desc}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="mt-4 p-4 rounded-xl bg-violet-50">
                <p className="text-[13px] text-violet-800 font-medium leading-relaxed tracking-[0.2px]">
                    <span className="font-bold">When to act:</span> Always contact your provider immediately if you experience symptoms exactly as prescribed such as severe headache, blurry vision, or other concerning signs, regardless of your reading metric.
                </p>
            </div>
        </BottomSheet>
    );
}
