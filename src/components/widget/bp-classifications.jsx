"use client";

import React from 'react';
import {
    PiCheckCircleFill,
    PiWarningFill,
    PiWarningCircleFill,
} from "react-icons/pi";
import BottomSheet from "../ui/bottom-sheet";
import { getSystolicStatus, getDiastolicStatus, getPulseStatus } from "@/lib/bp-utils";

/**
 * BPClassificationsSheet Component
 * 
 * Displays AHA 2017 blood pressure classification reference,
 * along with the user's current reading status.
 */
export default function BPClassificationsSheet({ open, onClose, systolic, diastolic, pulse }) {
    const sysStatus = getSystolicStatus(systolic);
    const diaStatus = getDiastolicStatus(diastolic);
    const pulStatus = getPulseStatus(pulse);

    const classifications = [
        {
            icon: <PiCheckCircleFill size={20} className="text-green-500" />,
            label: "Normal",
            sysRange: "SYS\n<120",
            diaRange: "DIA\n<80",
            connector: "and",
        },
        {
            icon: <PiWarningFill size={20} className="text-yellow-500" />,
            label: "Elevated",
            sysRange: "SYS\n120–129",
            diaRange: "DIA\n<80",
            connector: "and",
        },
        {
            icon: <PiWarningFill size={20} className="text-orange-500" />,
            label: "HTN\nStage 1",
            sysRange: "SYS\n130–139",
            diaRange: "DIA\n80–89",
            connector: "or",
        },
        {
            icon: <PiWarningCircleFill size={20} className="text-red-500" />,
            label: "HTN\nStage 2",
            sysRange: "SYS\n≥140",
            diaRange: "DIA\n≥90",
            connector: "or",
        },
        {
            icon: <PiWarningCircleFill size={20} className="text-red-900" />,
            label: "HTN\nCrisis",
            sysRange: "SYS\n≥180",
            diaRange: "DIA\n≥120",
            connector: "or",
        },
    ];

    return (
        <BottomSheet open={open} onClose={onClose} title="US Classifications" zIndex={200}>
            {/* Current Reading Summary */}
            <div className="bg-neutral-50 rounded-xl p-4 mb-6">
                <p className="text-xs text-neutral-400 mb-3 font-medium">
                    Your Current Reading:
                </p>
                <div className="flex gap-6">
                    {[
                        { label: "SYS", value: systolic, status: sysStatus },
                        { label: "DIA", value: diastolic, status: diaStatus },
                        { label: "PULSE", value: pulse, status: pulStatus },
                    ].map(({ label, value, status }) => (
                        <div key={label}>
                            <span className="text-[11px] text-neutral-400">{label}</span>
                            <div className="flex items-baseline gap-2">
                                <span className="text-2xl font-semibold text-neutral-800 tabular-nums">
                                    {value}
                                </span>
                                <span
                                    className="text-[10px] px-2 py-0.5 rounded font-medium"
                                    style={{ backgroundColor: status.color, color: status.textColor }}
                                >
                                    {status.label}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Classification Grid */}
            <div className="border border-neutral-200 rounded-xl overflow-hidden">
                <div className="grid grid-cols-5">
                    {classifications.map((item, idx) => (
                        <div
                            key={idx}
                            className="border-r last:border-r-0 border-neutral-200 bg-neutral-50 p-2 flex flex-col items-center"
                        >
                            <div className="mb-1.5 h-5 flex items-center justify-center">
                                {item.icon}
                            </div>
                            <p className="text-[9px] text-neutral-800 font-semibold text-center mb-2 whitespace-pre-line leading-tight h-8 flex items-center justify-center">
                                {item.label}
                            </p>
                            <div className="flex flex-col items-center mb-2">
                                <div className="w-0.5 h-2 bg-neutral-400" />
                                <div className="w-1.5 h-1.5 rounded-full bg-neutral-400 my-0.5" />
                                <div className="w-0.5 h-2 bg-neutral-400" />
                            </div>
                            <p className="text-[9px] text-neutral-400 text-center whitespace-pre-line mb-1.5 leading-tight">
                                {item.sysRange}
                            </p>
                            <p className="text-[9px] text-neutral-400 mb-1.5 font-medium">
                                {item.connector}
                            </p>
                            <p className="text-[9px] text-neutral-400 text-center whitespace-pre-line leading-tight">
                                {item.diaRange}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-[10px] text-neutral-400 mt-4 text-center">
                Based on AHA 2017 guidelines
            </p>
        </BottomSheet>
    );
}
