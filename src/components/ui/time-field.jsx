"use client";

import React from 'react';
import { PiClock } from "react-icons/pi";

/**
 * TimeField Component
 * 
 * Styled time input with the floating label style and optional clock icon.
 * Matches the styling used in Blood Pressure logs while maintaining icon support.
 */
export default function TimeField({ value, onChange, label = "Time", showIcon = true, className = "" }) {
    return (
        <div className={`relative flex-1 ${className}`}>
            {label && (
                <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-neutral-400 font-bold uppercase tracking-wider z-10 leading-none">
                    {label}
                </label>
            )}
            <div className="flex items-center justify-between border border-neutral-200 rounded-xl px-4 py-3 bg-white min-h-[48px]">
                <input
                    type="time"
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="text-[14px] text-neutral-800 bg-transparent outline-none w-full font-sans appearance-none min-w-0"
                />
                {showIcon && <PiClock size={18} className="text-neutral-400 shrink-0 ml-2" />}
            </div>
        </div>
    );
}
