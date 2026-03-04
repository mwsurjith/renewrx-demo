"use client";

import React, { useState } from "react";
import AppHeader from "../layout/app-header";
import { Switch } from "../ui";

import { useDeveloper } from "@/context/developer-context";

export default function DeveloperOptionsScreen({ onBack }) {
    const { toggles, toggleFeature } = useDeveloper();

    const options = [
        { key: "wakeUpTime", label: "Wake up time (Not done)" },
        { key: "nourishNotebook", label: "Nourish Notebook" },
        { key: "insulin", label: "  ↳ With Insulin", indent: true },
        { key: "bloodPressure", label: "Blood Pressure" },
        { key: "iHealthIntegration", label: "  ↳ iHealth Connect", indent: true },
        { key: "bloodGlucose", label: "Blood Glucose" },
        { key: "sleepTracking", label: "Sleep Tracking" },
        { key: "deviceData", label: "  ↳ Phone Fetch Available", indent: true },
        { key: "stressTracking", label: "Stress Tracking" },
        { key: "appleHealthIntegration", label: "  ↳ Apple Health Connect", indent: true },
        { key: "bumfie", label: "Bumfie (Not done)" },
        { key: "onboardingChecklist", label: "Onboarding Checklist (Not done)" },
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
