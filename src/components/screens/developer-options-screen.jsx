"use client";

import React, { useState } from "react";
import AppHeader from "../layout/app-header";
import { Switch } from "../ui";

import { useDeveloper } from "@/context/developer-context";

export default function DeveloperOptionsScreen({ onBack }) {
    const { toggles, toggleFeature } = useDeveloper();

    const options = [
        { key: "insulin", label: "Insulin during nourish notebook" },
        { key: "bloodPressure", label: "Blood Pressure" },
        { key: "wakeUpTime", label: "Wake up time" },
        { key: "sleepStress", label: "Sleep & Stress tracker" },
        { key: "bumfie", label: "Bumfie" },
        { key: "nourishNotebook", label: "Nourish Notebook" },
        { key: "onboardingChecklist", label: "Onboarding Checklist" },
    ];

    return (
        <div className="flex flex-col w-full h-full bg-[#F8FAFC] font-sans">
            <AppHeader
                pageTitle="Developer Options"
                onBack={onBack}
            />
            <div className="flex-1 overflow-y-auto px-6 py-6">
                <div className="bg-white rounded-[24px] shadow-[0_2px_8px_rgba(0,0,0,0.04)] overflow-hidden">
                    <div className="flex flex-col divide-y divide-neutral-50">
                        {options.map((opt) => (
                            <div key={opt.key} className="flex justify-between items-center px-6 py-4.5 group hover:bg-neutral-50 transition-colors">
                                <span className="text-[15px] font-semibold text-[#334155] tracking-tight">{opt.label}</span>
                                <Switch checked={toggles[opt.key]} onChange={() => toggleFeature(opt.key)} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
