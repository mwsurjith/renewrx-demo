"use client";

import React, { useState } from "react";
import {
    PiCaretLeft,
    PiPencilSimple,
    PiCalendar,
    PiCaretDown
} from "react-icons/pi";
import { Button } from "../ui";

import { usePregnancy } from "@/context/pregnancy-context";

/**
 * EditProfileScreen Component
 * 
 * Matches the reference design for the Account Information / Edit Profile page.
 */
export default function EditProfileScreen({ onBack }) {
    const { dueDate, setDueDate } = usePregnancy();
    const [firstName, setFirstName] = useState("Jane");
    const [lastName, setLastName] = useState("Cooper");
    const [timezone, setTimezone] = useState("Denver");
    const [eddBasedOn, setEddBasedOn] = useState("Ultrasound");

    // Format date for state
    const [dueDateInput, setDueDateInput] = useState(dueDate.toISOString().split('T')[0]);

    const handleSave = () => {
        const newDate = new Date(dueDateInput);
        if (!isNaN(newDate.getTime())) {
            setDueDate(newDate);
            onBack?.();
        }
    };

    return (
        <div className="flex flex-col h-full bg-white font-sans">
            {/* Header */}
            <div className="flex items-center px-4 h-16 border-b shrink-0 bg-white sticky top-0 z-20">
                <button
                    onClick={onBack}
                    className="w-10 h-10 flex items-center justify-center -ml-2 text-neutral-800"
                >
                    <PiCaretLeft size={24} weight="bold" />
                </button>
                <h1 className="text-[17px] font-bold text-[#1E293B] ml-2 tracking-tight">
                    Edit Profile
                </h1>
            </div>

            {/* Scrollable Content */}
            <div className="flex-1 overflow-y-auto px-6 py-8 pb-10">
                {/* Profile Picture Section */}
                <div className="flex flex-col items-center mb-10">
                    <div className="relative">
                        <div className="w-32 h-32 rounded-full bg-neutral-100 overflow-hidden border-4 border-white shadow-sm">
                            <img
                                src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"
                                alt="Profile"
                                className="w-full h-full object-cover opacity-80"
                            />
                            {/* Placeholder silhouette if no image */}
                            <div className="absolute inset-0 flex items-center justify-center bg-black/5 pointer-events-none">
                                <div className="w-full h-full bg-[#E2E8F0] flex items-end justify-center">
                                    <div className="w-[60%] h-[40%] bg-[#CBD5E1] rounded-t-full mb-[10%]" />
                                    <div className="absolute top-[25%] w-[35%] h-[35%] bg-[#CBD5E1] rounded-full" />
                                </div>
                            </div>
                        </div>
                        <button className="absolute bottom-1 right-1 w-9 h-9 bg-white rounded-full shadow-md border flex items-center justify-center text-neutral-600 hover:bg-neutral-50 transition-colors">
                            <PiPencilSimple size={20} />
                        </button>
                    </div>
                </div>

                {/* Form Fields */}
                <div className="flex flex-col gap-6">
                    {/* First Name */}
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 px-1 bg-white text-[11px] font-bold text-[#475569] tracking-wider uppercase z-10">
                            First Name
                        </label>
                        <input
                            type="text"
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="w-full h-14 px-5 rounded-xl border border-neutral-200 text-[#1E293B] font-medium focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
                        />
                    </div>

                    {/* Last Name */}
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 px-1 bg-white text-[11px] font-bold text-[#475569] tracking-wider uppercase z-10">
                            Last Name
                        </label>
                        <input
                            type="text"
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="w-full h-14 px-5 rounded-xl border border-neutral-200 text-[#1E293B] font-medium focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
                        />
                    </div>

                    {/* Timezone Dropdown */}
                    <div className="relative">
                        <label className="absolute -top-2.5 left-4 px-1 bg-white text-[11px] font-bold text-[#475569] tracking-wider uppercase z-10">
                            Timezone
                        </label>
                        <div className="relative">
                            <select
                                value={timezone}
                                onChange={(e) => setTimezone(e.target.value)}
                                className="w-full h-14 px-5 pr-12 rounded-xl border border-neutral-200 text-[#1E293B] font-medium appearance-none bg-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
                            >
                                <option value="Denver">Denver</option>
                                <option value="UTC">UTC</option>
                                <option value="EST">EST</option>
                                <option value="PST">PST</option>
                            </select>
                            <PiCaretDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                        </div>
                    </div>

                    {/* Pregnancy Information Section */}
                    <div className="mt-4">
                        <h2 className="text-[17px] font-bold text-[#1E293B] mb-6">
                            Pregnancy Information
                        </h2>

                        <div className="flex flex-col gap-6">
                            {/* Estimated Due Date */}
                            <div className="relative">
                                <label className="absolute -top-2.5 left-4 px-1 bg-white text-[11px] font-bold text-[#475569] tracking-wider uppercase z-10">
                                    Estimated Due Date
                                </label>
                                <div className="relative">
                                    <input
                                        type="date"
                                        value={dueDateInput}
                                        onChange={(e) => setDueDateInput(e.target.value)}
                                        className="w-full h-14 px-5 pr-5 rounded-xl border border-neutral-200 text-[#1E293B] font-medium focus:outline-none focus:border-purple-400 transition-all"
                                    />
                                </div>
                            </div>

                            {/* EDD based on Dropdown */}
                            <div className="relative">
                                <label className="absolute -top-2.5 left-4 px-1 bg-white text-[11px] font-bold text-[#475569] tracking-wider uppercase z-10">
                                    EDD is based on
                                </label>
                                <div className="relative">
                                    <select
                                        value={eddBasedOn}
                                        onChange={(e) => setEddBasedOn(e.target.value)}
                                        className="w-full h-14 px-5 pr-12 rounded-xl border border-neutral-200 text-[#1E293B] font-medium appearance-none bg-white focus:outline-none focus:border-purple-400 focus:ring-1 focus:ring-purple-100 transition-all"
                                    >
                                        <option value="Ultrasound">Ultrasound</option>
                                        <option value="Last Period">Last Period</option>
                                        <option value="Conception Date">Conception Date</option>
                                    </select>
                                    <PiCaretDown size={18} className="absolute right-5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Save Changes Button */}
                <div className="mt-10">
                    <Button variant="secondary" size="xl" onClick={handleSave} className="w-full !h-14">
                        SAVE CHANGES
                    </Button>
                </div>
            </div>
        </div>
    );
}
