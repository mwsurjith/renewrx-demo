"use client";

import React from "react";
import { PiPencilSimple } from "react-icons/pi";
import { getBGIcon } from "./bg-log-sheet";

export default function BGReadingCard({ reading, onEdit }) {
    // Determine the text below the value
    // E.g., "1h Post-Breakfast • 09:35 AM" or "Fasting • 09:35 AM"
    const typeLabel = reading.typeLabel || "Unknown";
    const phaseLabel = reading.ppPhase ? `${reading.ppPhase.replace(" PP", " Post")}-${typeLabel}` : typeLabel;

    return (
        <div className="bg-white rounded-2xl border border-neutral-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-4 cursor-pointer hover:border-neutral-200 transition-colors">
            <div className="flex items-start justify-between">
                <div className="flex flex-col">
                    <div className="flex items-baseline gap-1.5 mb-2">
                        <span className={`text-[22px] font-bold tracking-tight ${reading.value > 150 ? 'text-orange-500' : reading.value < 70 ? 'text-red-500' : 'text-emerald-600'}`}>
                            {reading.value}
                        </span>
                        <span className="text-sm font-medium text-neutral-500 tracking-tight">mg/dL</span>
                        {reading.source === 'cgm' ? (
                            <div className="ml-1 px-2 py-0.5 bg-purple-100/50 rounded-full flex items-center justify-center">
                                <span className="text-[11px] font-bold text-[#2D264B] tracking-tight leading-none uppercase">CGM</span>
                            </div>
                        ) : (
                            <div className="ml-1 px-2 py-0.5 bg-teal-50 rounded-full flex items-center justify-center">
                                <span className="text-[11px] font-semibold text-teal-800 tracking-tight leading-none">Finger-stick</span>
                            </div>
                        )}
                    </div>

                    <div className="flex items-center gap-1.5 opacity-80">
                        {getBGIcon(reading.typeId)}
                        <span className="text-sm font-medium text-neutral-700 tracking-tight">
                            {phaseLabel} • {reading.time}
                        </span>
                    </div>
                </div>

                <div className="flex items-center">
                    {reading.source === "cgm" ? (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEdit) onEdit(reading);
                            }}
                            className="flex items-center gap-1 px-2 py-1 hover:bg-neutral-50 rounded-lg transition-colors"
                        >
                            <span className="text-[13px] font-bold text-purple-500">+ Add finger-stick</span>
                        </button>
                    ) : (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                if (onEdit) onEdit();
                            }}
                            className="flex items-center gap-1 px-2 py-1 hover:bg-neutral-50 rounded-lg transition-colors"
                        >
                            <PiPencilSimple size={14} className="text-purple-400" />
                            <span className="text-sm font-bold text-purple-400">Edit</span>
                        </button>
                    )}
                </div>
            </div>

            {/* Note separator block, optional if reading.note exists */}
            {reading.note && (
                <div className="mt-3 pt-3 border-t border-neutral-100">
                    <p className="text-sm text-neutral-600 tracking-tight">{reading.note}</p>
                </div>
            )}
        </div>
    );
}
