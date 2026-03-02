"use client";

import React from 'react';
import {
    PiBell,
    PiCaretLeft,
} from "react-icons/pi";
import DatePicker from './date-picker';

import { usePregnancy } from "@/context/pregnancy-context";
import { useRouter } from "next/navigation";
import { getUnreadCount } from "@/lib/notifications-utils";

/**
 * AppHeader Component
 * 
 * A versatile header with two modes: Dashboard (default) and Page (for sub-pages).
 * 
 * @param {Object} props
 * @param {string} props.pageTitle - If provided, renders page-mode header (back + title)
 * @param {Function} props.onBack - Back button handler for page mode
 * @param {React.ReactNode} props.rightContent - Optional content for the right side of page mode
 * @returns {JSX.Element}
 */
export default function AppHeader({ pageTitle, onBack, hideBack, rightContent }) {
    const { currentWeek } = usePregnancy();
    const router = useRouter();
    const [unreadCount, setUnreadCount] = React.useState(0);

    React.useEffect(() => {
        // Initial fetch
        setUnreadCount(getUnreadCount());

        // Update when new notification arrives or all read
        const updateCount = () => setUnreadCount(getUnreadCount());
        window.addEventListener("new-notification", updateCount);
        window.addEventListener("notifications-read", updateCount);

        return () => {
            window.removeEventListener("new-notification", updateCount);
            window.removeEventListener("notifications-read", updateCount);
        };
    }, []);
    // Matches the profile picture used in the Profile screen
    const imgProfile = "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=150&auto=format&fit=crop";

    if (pageTitle) {
        return (
            <div className={`bg-white h-20 px-6 flex items-center justify-between border-b w-full ${onBack ? "" : "border-b"} sticky top-0 z-40`}>
                <div className="flex items-center gap-2">
                    {!hideBack && (
                        <button
                            onClick={onBack}
                            className="size-10 flex items-center justify-center rounded-full hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        >
                            <PiCaretLeft size={24} className="text-[#2f4358]" />
                        </button>
                    )}
                    <h1
                        className="font-semibold text-lg text-neutral-800 tracking-[0.2px] font-sans"
                    >
                        {pageTitle}
                    </h1>
                </div>
                {rightContent ?? <div className="w-10" />}
            </div>
        );
    }

    // Dashboard mode (default)
    return (
        <div className="sticky top-0 z-40 bg-white w-full rounded-b-lg shadow-sm overflow-hidden border-b border-neutral-50">
            {/* Profile row */}
            <div className="flex items-center justify-between px-6 py-4 h-20 border-b">
                <div className="flex items-center gap-3">
                    <img
                        src={imgProfile}
                        alt="Profile"
                        className="w-12 h-12 rounded-full object-cover border-2"
                    />
                    <div className="flex flex-col tracking-[0.2px] font-sans">
                        <span className="text-base text-neutral-500">
                            Hello, Jane Cooper!
                        </span>
                        <span className="text-lg text-neutral-800 font-medium">
                            Week {currentWeek}
                        </span>
                    </div>
                </div>
                <button
                    onClick={() => router.push("/notifications")}
                    className="relative w-10 h-10 rounded-full border flex items-center justify-center hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                    <PiBell size={20} className="text-neutral-800" />
                    {unreadCount > 0 && (
                        <div className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-red-500 border border-white" />
                    )}
                </button>
            </div>

            {/* Date picker */}
            <DatePicker />
        </div>
    );
}
