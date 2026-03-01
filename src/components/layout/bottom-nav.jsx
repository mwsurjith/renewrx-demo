"use client";

import React from 'react';
import {
    PiHouseSimple,
    PiHouseSimpleFill,
    PiHeart,
    PiHeartFill,
    PiGraduationCap,
    PiGraduationCapFill,
    PiUserCircle,
    PiUserCircleFill
} from "react-icons/pi";

const navItems = [
    {
        icon: PiHouseSimple,
        activeIcon: PiHouseSimpleFill,
        label: "Home",
    },
    {
        icon: PiHeart,
        activeIcon: PiHeartFill,
        label: "Support",
    },
    {
        icon: PiGraduationCap,
        activeIcon: PiGraduationCapFill,
        label: "Learn",
    },
    {
        icon: PiUserCircle,
        activeIcon: PiUserCircleFill,
        label: "Profile",
    },
];

/**
 * BottomNav Component
 * 
 * Standard navigation bar for mobile layout.
 * 
 * @returns {JSX.Element}
 */
export default function BottomNav({ activeTab, setActiveTab }) {
    return (
        <nav className="w-full max-w-md bg-white/98 backdrop-blur-md rounded-t-2xl z-50 pb-[env(safe-area-inset-bottom,12px)] border-t border-[#f0f0f0] shadow-[0_-4px_12px_rgba(0,0,0,0.03)]">
            <div className="flex items-center justify-around px-6 pt-4 pb-2">
                {navItems.map((item) => {
                    const isActive = activeTab === item.label;
                    const Icon = isActive ? item.activeIcon : item.icon;
                    return (
                        <button
                            key={item.label}
                            onClick={() => setActiveTab?.(item.label)}
                            className="flex flex-col items-center gap-1 min-w-[54px] transition-all duration-200 active:scale-90"
                        >
                            <Icon
                                size={24}
                                className={isActive ? "text-[#2D264B]" : "text-[#5a6c7d]"}
                            />
                            <span
                                className={`text-[12px] tracking-[0.2px] font-sans ${isActive
                                    ? "text-[#2D264B] font-bold"
                                    : "text-[#5a6c7d] font-medium"
                                    }`}
                            >
                                {item.label}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
