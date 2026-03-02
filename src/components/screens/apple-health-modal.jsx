"use client";

import React, { useState } from "react";
import { PiHeartFill } from "react-icons/pi";
import { BottomSheet } from "../ui";

/**
 * AppleHealthModal
 * 
 * 100% realistic mockup of the native iOS HealthKit permission sheet
 * as triggered by the Flutter `health` package.
 */
export default function AppleHealthModal({ open, onClose, onAllow }) {
    const [turnOnAll, setTurnOnAll] = useState(false);
    const [toggles, setToggles] = useState({
        sleepAnalysis: false,
        timeInBed: false,
    });

    // Handle "Turn On All"
    const handleTurnOnAll = () => {
        const newVal = !turnOnAll;
        setTurnOnAll(newVal);
        setToggles({
            sleepAnalysis: newVal,
            timeInBed: newVal,
        });
    };

    // Handle individual toggle
    const handleToggle = (key) => {
        const newToggles = { ...toggles, [key]: !toggles[key] };
        setToggles(newToggles);

        // Update "Turn On All" based on children
        const allOn = Object.values(newToggles).every(v => v);
        setTurnOnAll(allOn);
    };

    // Close and reset
    const handleClose = () => {
        setTurnOnAll(false);
        setToggles({ sleepAnalysis: false, timeInBed: false });
        onClose();
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-0 sm:p-4 bg-black/40 font-sans antialiased">
            {/* Modal Container */}
            <div
                className="w-full max-w-sm bg-white rounded-t-2xl sm:rounded-2xl overflow-hidden flex flex-col pt-3"
                style={{
                    maxHeight: "850px",
                    animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)",
                }}
            >
                {/* Drag handle */}
                <div className="w-full flex justify-center pb-2">
                    <div className="w-9 h-1 bg-neutral-300 rounded-full" />
                </div>

                {/* Header Section */}
                <div className="flex flex-col items-center px-6 pt-2 pb-6">
                    <div className="w-14 h-14 bg-white rounded-xl shadow-sm border border-neutral-100 flex items-center justify-center mb-4">
                        <PiHeartFill size={32} className="text-[#ff3b30]" />
                    </div>
                    <h2 className="text-[22px] font-bold text-black tracking-tight mb-2">Health Access</h2>
                    <p className="text-[15px] text-center text-black leading-snug px-4">
                        "RenewRx" would like to access and update your Health data.
                    </p>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto bg-[#f2f2f7]">
                    <div className="px-4 py-8">
                        {/* Turn On All Section */}
                        <div className="bg-white rounded-[10px] overflow-hidden mb-8">
                            <div className="flex items-center justify-between px-4 py-3 min-h-[44px]">
                                <span className="text-[17px] text-black tracking-tight">Turn On All</span>
                                <Toggle isOn={turnOnAll} onToggle={handleTurnOnAll} />
                            </div>
                        </div>

                        {/* Read Data Section */}
                        <h3 className="text-[13px] uppercase text-[#6d6d72] font-medium tracking-normal px-4 mb-2">
                            Allow "RenewRx" to read data:
                        </h3>
                        <div className="bg-white rounded-[10px] overflow-hidden">
                            {/* Option 1 */}
                            <div className="flex items-center justify-between pl-4 pr-4 py-3 min-h-[44px] border-b border-[#c6c6c8]">
                                <div className="flex items-center gap-3">
                                    <div className="w-[30px] h-[30px] rounded-md bg-[#5ac8fa] flex items-center justify-center shrink-0">
                                        <PiHeartFill size={16} className="text-white" />
                                    </div>
                                    <span className="text-[17px] text-black tracking-tight">Sleep Analysis</span>
                                </div>
                                <Toggle isOn={toggles.sleepAnalysis} onToggle={() => handleToggle('sleepAnalysis')} />
                            </div>

                            {/* Option 2 */}
                            <div className="flex items-center justify-between pl-4 pr-4 py-3 min-h-[44px]">
                                <div className="flex items-center gap-3">
                                    <div className="w-[30px] h-[30px] rounded-md bg-[#5ac8fa] flex items-center justify-center shrink-0">
                                        <PiHeartFill size={16} className="text-white" />
                                    </div>
                                    <span className="text-[17px] text-black tracking-tight">Time in Bed</span>
                                </div>
                                <Toggle isOn={toggles.timeInBed} onToggle={() => handleToggle('timeInBed')} />
                            </div>
                        </div>

                        {/* Footer Text */}
                        <p className="text-[13px] text-[#6d6d72] text-center mt-6 px-4 leading-normal">
                            Data is stored on your device securely and sent to Health when connected.
                        </p>
                    </div>
                </div>

                {/* Fixed Bottom Bar */}
                <div className="flex-none bg-[#f2f2f7] border-t border-[#c6c6c8] p-4 pb-8 sm:pb-4 flex justify-between">
                    <button
                        onClick={handleClose}
                        className="text-[17px] text-[#007aff] px-4 py-2 bg-transparent rounded-lg active:bg-black/5 transition-colors"
                    >
                        Don't Allow
                    </button>
                    <button
                        onClick={() => {
                            if (turnOnAll || Object.values(toggles).some(v => v)) {
                                onAllow();
                                handleClose();
                            } else {
                                handleClose();
                            }
                        }}
                        className="text-[17px] font-semibold text-[#007aff] px-4 py-2 bg-transparent rounded-lg active:bg-black/5 transition-colors"
                    >
                        Allow
                    </button>
                </div>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                @keyframes slideUp {
                    from { transform: translateY(100%); }
                    to { transform: translateY(0); }
                }
            `}} />
        </div>
    );
}

// ─── Native iOS Style Toggle ──────────────────────────────────────────

function Toggle({ isOn, onToggle }) {
    return (
        <button
            onClick={onToggle}
            className={`relative w-[51px] h-[31px] rounded-full transition-colors duration-200 ease-in-out focus:outline-none ${isOn ? "bg-[#34c759]" : "bg-[#e5e5ea]"
                }`}
        >
            <div
                className={`absolute top-[2px] left-[2px] w-[27px] h-[27px] bg-white rounded-full shadow-[0_3px_8px_rgba(0,0,0,0.15)] transition-transform duration-200 ease-in-out ${isOn ? "translate-x-[20px]" : "translate-x-0"
                    }`}
            />
        </button>
    );
}
