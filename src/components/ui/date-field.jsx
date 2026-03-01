"use client";

import React from 'react';

/**
 * DateField Component
 * 
 * Styled date input with the floating label style used in Blood Pressure logs.
 */
export default function DateField({ value, onChange, label = "Date", className = "" }) {
    return (
        <div className={`relative flex-1 ${className}`}>
            {label && (
                <label className="absolute -top-2 left-3 bg-white px-1 text-[10px] text-neutral-400 font-bold uppercase tracking-wider z-10 leading-none">
                    {label}
                </label>
            )}
            <div className="flex items-center border border-neutral-200 rounded-xl px-3 py-3 bg-white min-h-[48px]">
                <input
                    type="date"
                    value={value}
                    onChange={(e) => onChange?.(e.target.value)}
                    className="text-[14px] text-neutral-800 bg-transparent outline-none w-full font-sans appearance-none min-w-0"
                />
            </div>
        </div>
    );
}
