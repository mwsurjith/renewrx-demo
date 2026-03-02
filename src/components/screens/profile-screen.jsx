"use client";

import React, { useState } from "react";
import {
    PiUser,
    PiBookOpen,
    PiUserCircle,
    PiCpu,
    PiFileText,
    PiStethoscope,
    PiClipboardText,
    PiKey,
    PiInfo,
    PiCaretRight,
    PiPencilSimple,
    PiTrash,
} from "react-icons/pi";
import { usePregnancy } from "@/context/pregnancy-context";
import { Button } from "../ui";

/**
 * ProfileScreen Component
 *
 * Displays user profile information and settings menu matches the reference design.
 */
export default function ProfileScreen({ onNavigate }) {
    const { currentWeek, weeksRemaining, dueDate, accountCreatedDate } = usePregnancy();
    const [clickCount, setClickCount] = useState(0);

    const handleAboutUsClick = () => {
        const newCount = clickCount + 1;
        setClickCount(newCount);
        if (newCount >= 5) {
            setClickCount(0); // reset
            onNavigate?.("developer-options");
        }
    };

    const formatDate = (date) => {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const handleDeleteAccount = () => {
        if (typeof window !== "undefined") {
            // Confirm with user if it's strictly required, or just clear directly for demo reset
            if (window.confirm("Are you sure you want to reset the demo state? This will clear all local storage.")) {
                localStorage.clear();
                window.location.href = "/";
            }
        }
    };

    const menuItems = [
        { label: "Account Information", icon: PiUser, action: () => onNavigate?.("edit-profile") },
        { label: "Change Language", icon: PiBookOpen },
        { label: "Customise Experience", icon: PiUserCircle, action: () => onNavigate?.("customize-experience") },
        { label: "Device Management", icon: PiCpu, action: () => onNavigate ? onNavigate("device-management") : window.location.assign("/device-management") },
        { label: "Surveys & Intake", icon: PiFileText },
        { label: "My Care Pro", icon: PiStethoscope },
        { label: "My Insurance", icon: PiClipboardText },
        { label: "Password & Security", icon: PiKey },
        { label: "About us", icon: PiInfo, action: handleAboutUsClick },
    ];

    return (
        <div className="flex flex-col w-full px-6 py-6 gap-6 pb-12 bg-[#F8FAFC] min-h-full font-sans">
            {/* User Info Card */}
            <div className="bg-white rounded-[24px] p-6 shadow-[0_2px_8px_rgba(0,0,0,0.04)] relative">
                <div className="flex items-center gap-4 mb-4">
                    <div className="relative w-16 h-16">
                        <img
                            src="https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop"
                            alt="Jane Cooper"
                            className="w-full h-full rounded-full object-cover"
                        />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold text-[#1E293B]">Jane Cooper</h2>
                        <p className="text-sm text-neutral-500 font-medium">Week {currentWeek}</p>
                    </div>
                    <button
                        onClick={() => onNavigate?.("edit-profile")}
                        className="absolute top-6 right-6 w-10 h-10 border rounded-full flex items-center justify-center text-neutral-400 hover:bg-neutral-50 transition-colors"
                    >
                        <PiPencilSimple size={20} />
                    </button>
                </div>

                <p className="text-[#334155] text-sm font-medium mb-5">
                    Baby is arriving in <span className="font-bold">{weeksRemaining} weeks!</span>
                </p>

                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-neutral-50">
                    <div>
                        <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold mb-1">
                            Account Created
                        </p>
                        <p className="text-sm font-bold text-[#1E293B]">{formatDate(accountCreatedDate)}</p>
                    </div>
                    <div className="pl-4 border-l border-neutral-100">
                        <p className="text-[11px] uppercase tracking-wider text-neutral-400 font-bold mb-1">
                            Due date
                        </p>
                        <p className="text-sm font-bold text-[#1E293B]">{formatDate(dueDate)}</p>
                    </div>
                </div>
            </div>

            {/* Menu Card */}
            <div className="bg-white rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                <div className="flex flex-col divide-y divide-neutral-50">
                    {menuItems.map((item, idx) => (
                        <button
                            key={idx}
                            onClick={item.action}
                            className="flex items-center justify-between px-6 py-4.5 hover:bg-neutral-50 active:bg-neutral-100 transition-colors group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full border border-neutral-100 flex items-center justify-center text-neutral-500 group-hover:text-purple-600 transition-colors">
                                    <item.icon size={22} />
                                </div>
                                <span className="text-[15px] font-semibold text-[#334155] tracking-tight">
                                    {item.label}
                                </span>
                            </div>
                            <PiCaretRight size={18} className="text-neutral-300" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex flex-col gap-3 mt-2">
                <Button
                    variant="secondary"
                    size="xl"
                    className="w-full !h-14"
                >
                    LOG OUT
                </Button>
                <Button
                    variant="destructive"
                    size="xl"
                    className="w-full !h-14"
                    onClick={handleDeleteAccount}
                >
                    <PiTrash size={18} className="mr-2" />
                    DELETE MY ACCOUNT
                </Button>
            </div>
        </div>
    );
}
