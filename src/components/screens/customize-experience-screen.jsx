"use client";

import React, { useState } from "react";
import { PiQuestion, PiCaretLeft } from "react-icons/pi";
import { Switch } from "../ui";

/**
 * CustomizeExperienceScreen Component
 */
export default function CustomizeExperienceScreen({ onBack, defaultShowTooltip = false }) {
    const [aiLogging, setAiLogging] = useState(false);
    const [generalNotifications, setGeneralNotifications] = useState(true);
    const [glucoseReminders, setGlucoseReminders] = useState(false);
    const [showTooltip, setShowTooltip] = useState(defaultShowTooltip);

    return (
        <div className="flex flex-col h-full bg-white font-sans relative">
            {/* Header */}
            <div className="flex items-center px-4 h-16 border-b shrink-0 bg-white sticky top-0 z-20">
                <button
                    onClick={onBack}
                    className="w-10 h-10 flex items-center justify-center -ml-2 text-neutral-800"
                >
                    <PiCaretLeft size={24} weight="bold" />
                </button>
                <h1 className="text-[17px] font-bold text-[#1E293B] ml-2 tracking-tight">
                    Customize Experience
                </h1>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-6" onClick={() => setShowTooltip(false)}>
                {/* Smart Tracking Section */}
                <div className="mb-8">
                    <h2 className="text-[17px] font-bold text-[#1E293B] mb-1">
                        Smart Tracking
                    </h2>
                    <p className="text-sm text-neutral-500 mb-6 leading-snug">
                        AI-powered features to help you manage your health
                    </p>

                    <div className="bg-white rounded-2xl border p-5 shadow-sm relative">
                        <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-[15px] font-bold text-[#1E293B]">
                                        Log meals with AI
                                    </span>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setShowTooltip(!showTooltip);
                                        }}
                                        className="text-neutral-400 hover:text-neutral-600 transition-colors"
                                    >
                                        <PiQuestion size={18} />
                                    </button>
                                </div>
                                <p className="text-xs text-neutral-500 leading-relaxed">
                                    This is a test version. Some nutrition counts
                                    might not be correct yet.
                                </p>
                            </div>
                            <Switch checked={aiLogging} onChange={setAiLogging} />
                        </div>

                        {/* Tooltip */}
                        {showTooltip && (
                            <div
                                className="absolute top-[80%] right-[10%] z-30 w-[240px] bg-[#2D264B] text-white p-4 rounded-xl shadow-xl animate-in fade-in zoom-in duration-200"
                                onClick={(e) => e.stopPropagation()}
                            >
                                <div className="absolute -top-2 right-[36px] w-4 h-4 bg-[#2D264B] rotate-45" />
                                <h4 className="text-[13px] font-bold mb-1">Toggle this on to log meal with AI</h4>
                                <p className="text-[11px] text-white/80 leading-normal">
                                    Turn this on to use AI for your meals. If it's off, your AI favorites and past AI meals won't show up.
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Notifications Section */}
                <div>
                    <h2 className="text-[17px] font-bold text-[#1E293B] mb-1">
                        Notifications and Reminders
                    </h2>
                    <p className="text-sm text-neutral-500 mb-6 leading-snug">
                        Enable notifications to get reminders for logging and
                        important updates from your coach.
                    </p>

                    <div className="flex flex-col gap-3">
                        {/* General Notifications */}
                        <div className="bg-white rounded-2xl border p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-[15px] font-bold text-[#1E293B] mb-1">
                                        General Notifications
                                    </h3>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        Keeping you updated on your well-being
                                        and new developments in the app.
                                    </p>
                                </div>
                                <div className="flex-none">
                                    <Switch
                                        checked={generalNotifications}
                                        onChange={setGeneralNotifications}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Blood Glucose Reminders */}
                        <div className="bg-white rounded-2xl border p-5 shadow-sm">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <h3 className="text-[15px] font-bold text-[#1E293B] mb-1">
                                        Blood Glucose Reminders
                                    </h3>
                                    <p className="text-xs text-neutral-500 leading-relaxed">
                                        Receive reminders to check your blood
                                        glucose levels.
                                    </p>
                                </div>
                                <div className="flex-none">
                                    <Switch
                                        checked={glucoseReminders}
                                        onChange={setGlucoseReminders}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
