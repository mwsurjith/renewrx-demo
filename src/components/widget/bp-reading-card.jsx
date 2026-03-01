"use client";

import React from 'react';
import { PiPencilSimple, PiHeartFill } from "react-icons/pi";
import {
    getOverallStatus,
    getValueColor,
    getStatusBadgeStyle,
    shortStatusLabel,
} from "@/lib/bp-utils";

/**
 * BPReadingCard Component
 * 
 * Optimized visual hierarchy for blood pressure readings.
 * Used in both BP Detail Screen and the Home Dashboard Widget.
 */
export default function BPReadingCard({ reading, onEdit, showEdit = true, className = "" }) {
    if (!reading) return null;

    const status = getOverallStatus(reading.systolic, reading.diastolic);
    const valueColor = getValueColor(status.label);
    const badgeStyle = getStatusBadgeStyle(status.label);

    const notesDisplay =
        reading.type === "iHealth"
            ? (reading.tags?.join(", ") || "")
            : (reading.tags?.length > 0 ? reading.tags.join(", ") : "");

    return (
        <div className={`bg-white rounded-lg border p-4 w-full ${className}`}>
            <div className="flex flex-col gap-1">
                {/* Header: Time and Source */}
                <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                        <span className="text-neutral-400 text-xs font-medium tracking-[0.2px] uppercase">
                            {reading.time}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-neutral-200" />
                        <span className="text-neutral-400 text-xs font-medium tracking-[0.2px] uppercase">
                            {reading.type || "Manual"}
                        </span>
                    </div>

                    {showEdit && onEdit && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onEdit(reading);
                            }}
                            className="flex items-center gap-1 p-1 -mr-1 text-sm font-medium uppercase text-purple-500 rounded-lg transition-colors active:scale-95"
                        >
                            <PiPencilSimple size={16} />
                            Edit
                        </button>
                    )}
                </div>

                {/* Main Stats: BP Values */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="flex flex-col items-center">
                            <div className="flex items-baseline gap-1">
                                <span
                                    className="text-2xl tracking-[-1px] font-bold tabular-nums"
                                    style={{ color: valueColor }}
                                >
                                    {reading.systolic}
                                </span>
                                <span className="text-neutral-300 text-2xl font-light">/</span>
                                <span
                                    className="text-2xl tracking-[-1px] font-bold tabular-nums"
                                    style={{ color: valueColor }}
                                >
                                    {reading.diastolic}
                                </span>
                            </div>
                            <div className="flex justify-between w-full mt-0.5 px-0.5">
                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Sys</span>
                                <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Dia</span>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <div
                            className="px-2.5 py-1 flex rounded-full self-start mt-2"
                            style={{ backgroundColor: badgeStyle.bg }}
                        >
                            <span
                                className="text-[10px] font-bold tracking-[0.1px] whitespace-nowrap uppercase"
                                style={{ color: badgeStyle.text }}
                            >
                                {shortStatusLabel(status.label)}
                            </span>
                        </div>
                    </div>

                    {/* Pulse Side-info */}
                    <div className="flex flex-col items-end gap-0.5">
                        <div className="flex items-center gap-1 text-red-500">
                            <PiHeartFill size={14} className="animate-pulse" />
                            <span className="text-lg font-bold tabular-nums text-neutral-800">{reading.pulse}</span>
                        </div>
                        <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">BPM</span>
                    </div>
                </div>

                {/* Footer: Tags/Notes */}
                {notesDisplay && (
                    <div className="pt-3 border-t border-neutral-50">
                        <span className="text-sm text-neutral-600 font-medium tracking-[0.2px] leading-tight">
                            {notesDisplay}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
}
