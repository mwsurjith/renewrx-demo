"use client";

import React from "react";
import { PiPencilSimple, PiHeartbeatFill, PiWindFill, PiSmileyFill, PiSmileyBlankFill, PiSmileySadFill, PiHeartFill } from "react-icons/pi";
import { getStressLevel } from "@/lib/stress-utils";

/**
 * StressReadingCard Component
 * 
 * Optimized visual hierarchy for Stress/HRV readings.
 * Hides edit button for camera-sourced data to maintain integrity.
 */
export default function StressReadingCard({ entry, onEdit, onDelete, showEdit = true, className = "" }) {
    if (!entry) return null;
    const levelInfo = getStressLevel(entry);

    const isCamera = entry.source === "camera";
    const isPhone = entry.source === "phone";
    const canEdit = !isCamera && !isPhone && showEdit;

    return (
        <div className={`bg-white rounded-2xl border border-neutral-100 shadow-[0_2px_8px_rgba(0,0,0,0.02)] p-4 hover:border-neutral-200 transition-colors ${className}`}>
            <div className="flex flex-col gap-3">
                {/* Header: Time and Source */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span className="text-neutral-400 text-[11px] font-bold tracking-wider uppercase leading-none">
                            {entry.time}
                        </span>
                        <span className="w-1 h-1 rounded-full bg-neutral-200" />
                        <div className={`px-2 py-0.5 rounded-full ${entry.source === 'camera' ? 'bg-purple-50' : entry.source === 'phone' ? 'bg-rose-50' : 'bg-amber-50'}`}>
                            <span className={`text-[10px] font-bold tracking-tight uppercase leading-none ${entry.source === 'camera' ? 'text-purple-600' : entry.source === 'phone' ? 'text-rose-600' : 'text-amber-600'}`}>
                                {entry.source === "phone" ? "Apple Health" : entry.source === "camera" ? "PPG Camera" : "Manual Check-in"}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        {canEdit && onEdit && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(entry);
                                }}
                                className="flex items-center gap-1 p-1 -mr-1 text-sm font-bold uppercase text-purple-500 rounded-lg transition-colors active:scale-95"
                            >
                                <PiPencilSimple size={14} />
                                Edit
                            </button>
                        )}
                        {onDelete && (
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(entry);
                                }}
                                className="flex items-center gap-1 p-1 -mr-1 text-sm font-bold uppercase text-red-400 rounded-lg transition-colors active:scale-95"
                            >
                                <span className="text-[11px]">Delete</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <div className="flex items-baseline gap-1.5">
                            {(entry.source === "phone" || entry.source === "camera") ? (
                                <>
                                    <span className={`text-2xl font-bold tracking-[-0.5px] tabular-nums ${levelInfo.color}`}>
                                        {entry.hrv}
                                    </span>
                                    <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-widest leading-none">ms hrv</span>
                                </>
                            ) : (
                                <>
                                    <span className={`text-2xl font-bold tracking-[-0.5px] tabular-nums ${levelInfo.color}`}>
                                        Level {entry.stressLevel}
                                    </span>
                                </>
                            )}
                        </div>

                        {(entry.source === "phone" || entry.source === "camera") && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                                <div className="flex items-center gap-1 text-rose-500/80">
                                    <PiHeartFill size={12} className="animate-pulse" />
                                    <span className="text-base font-bold text-neutral-800 tabular-nums leading-none">{entry.rhr}</span>
                                </div>
                                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider leading-none">BPM RHR</span>
                            </div>
                        )}
                    </div>

                    {/* Level Icon/Badge */}
                    <div className="flex flex-col items-end gap-1.5">
                        <div className={`w-12 h-12 rounded-2xl ${levelInfo.bg} flex items-center justify-center shrink-0 border border-neutral-100/50 shadow-sm transition-transform active:scale-95`}>
                            {entry.source === 'camera' ? (
                                <PiHeartbeatFill size={24} className={levelInfo.color} />
                            ) : entry.source === 'phone' ? (
                                <PiWindFill size={24} className={levelInfo.color} />
                            ) : (
                                levelInfo.label === "Relaxed" ? <PiSmileyFill size={24} className={levelInfo.color} /> :
                                    levelInfo.label === "Neutral" ? <PiSmileyBlankFill size={24} className={levelInfo.color} /> :
                                        <PiSmileySadFill size={24} className={levelInfo.color} />
                            )}
                        </div>
                        <span className={`text-[10px] font-bold uppercase tracking-[0.05em] px-1 ${levelInfo.color}`}>
                            {(entry.source === "phone" || entry.source === "camera") ? levelInfo.label : `Level ${entry.stressLevel}`}
                        </span>
                    </div>
                </div>

                {entry.rmssd && (
                    <div className="mt-1 pt-3 border-t border-neutral-50 flex items-center gap-4">
                        <div className="flex flex-col">
                            <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">RMSSD</span>
                            <span className="text-[13px] font-bold text-neutral-700">{entry.rmssd} <span className="text-xs font-medium text-neutral-400">ms</span></span>
                        </div>
                        {entry.stressScore && (
                            <div className="flex flex-col">
                                <span className="text-[9px] font-bold text-neutral-400 uppercase tracking-widest">Score</span>
                                <span className="text-[13px] font-bold text-neutral-700">{entry.stressScore}</span>
                            </div>
                        )}
                    </div>
                )}
                {entry.note && (
                    <div className="mt-1 pt-2 border-t border-neutral-50">
                        <p className="text-[13px] font-medium text-neutral-600 leading-relaxed italic">
                            &quot;{entry.note}&quot;
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
