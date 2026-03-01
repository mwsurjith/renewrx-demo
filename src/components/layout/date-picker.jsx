"use client";

import React, { useState } from 'react';
import { PiCaretLeft, PiCaretRight, PiCalendarBlank } from "react-icons/pi";

/**
 * DatePicker Component
 * 
 * A horizontal date navigator that allows selecting previous dates but prevents 
 * going into the future.
 * 
 * @returns {JSX.Element}
 */
export default function DatePicker({ mode = "single", value, onChange, className = "" }) {
    // Fallback internal state if not controlled
    const [internalDate, setInternalDate] = useState(new Date());
    const selectedDate = value || internalDate;

    const setSelectedDate = (date) => {
        if (onChange) {
            onChange(date);
        } else {
            setInternalDate(date);
        }
    };

    const isToday = (date) => {
        const today = new Date();
        return date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear();
    };

    // Get Sunday of the week
    const getSunday = (d) => {
        const date = new Date(d);
        const day = date.getDay(); // 0 is Sunday
        const diff = date.getDate() - day;
        return new Date(date.setDate(diff));
    };

    const formatDate = (date) => {
        if (mode === "single") {
            if (isToday(date)) return "Today, " + date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const options = { weekday: 'short', month: 'short', day: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        } else {
            // Week range: Feb 1 - Feb 7, 2026
            const sun = getSunday(date);
            const sat = new Date(sun);
            sat.setDate(sun.getDate() + 6);

            const options = { month: 'short', day: 'numeric' };
            const sunStr = sun.toLocaleDateString('en-US', options);
            const satStr = sat.toLocaleDateString('en-US', options);
            const yearStr = sat.getFullYear();

            return `${sunStr} - ${satStr}, ${yearStr}`;
        }
    };

    const handlePrevious = () => {
        const newDate = new Date(selectedDate);
        if (mode === "single") {
            newDate.setDate(selectedDate.getDate() - 1);
        } else {
            newDate.setDate(selectedDate.getDate() - 7);
        }
        setSelectedDate(newDate);
    };

    const handleNext = () => {
        const today = new Date();
        if (mode === "single") {
            if (isToday(selectedDate)) return;
            const newDate = new Date(selectedDate);
            newDate.setDate(selectedDate.getDate() + 1);
            setSelectedDate(newDate);
        } else {
            // For week mode, don't go to next week if current week is the current week
            const sunOfToday = getSunday(today);
            const sunOfSelected = getSunday(selectedDate);
            if (sunOfSelected >= sunOfToday) return;

            const newDate = new Date(selectedDate);
            newDate.setDate(selectedDate.getDate() + 7);
            setSelectedDate(newDate);
        }
    };

    const isNextDisabled = () => {
        if (mode === "single") return isToday(selectedDate);
        const today = new Date();
        const sunOfToday = getSunday(today);
        const sunOfSelected = getSunday(selectedDate);
        return sunOfSelected >= sunOfToday;
    };

    return (
        <div className={`flex items-center justify-between px-6 py-2 h-10 ${className}`}>
            <button
                onClick={handlePrevious}
                className="w-6 h-6 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
            >
                <PiCaretLeft size={14} className="text-neutral-800" />
            </button>

            <div className="flex items-center gap-2">
                <PiCalendarBlank size={16} className="text-neutral-400" />
                <span className="text-md text-neutral-800 font-semibold tracking-[0.2px] font-sans">
                    {formatDate(selectedDate)}
                </span>
            </div>

            <button
                onClick={handleNext}
                disabled={isNextDisabled()}
                className={`w-6 h-6 rounded-full border flex items-center justify-center transition-colors ${isNextDisabled()
                    ? "border-gray-100 opacity-30 cursor-not-allowed"
                    : "border-gray-200 hover:bg-gray-50 active:bg-gray-100"
                    }`}
            >
                <PiCaretRight size={14} className="text-neutral-800" />
            </button>
        </div>
    );
}
