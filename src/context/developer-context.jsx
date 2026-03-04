"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

const DeveloperContext = createContext(null);

export const DeveloperProvider = ({ children }) => {
    const [toggles, setToggles] = useState({
        wakeUpTime: false,
        nourishNotebook: true,
        insulin: false,
        bloodPressure: true,
        iHealthIntegration: false,
        bloodGlucose: false,
        sleepTracking: true,
        deviceData: false,
        stressTracking: true,
        appleHealthIntegration: false,
        bumfie: false,
        onboardingChecklist: false,
    });

    useEffect(() => {
        const stored = localStorage.getItem("developerToggles");
        if (stored) {
            try {
                setToggles(JSON.parse(stored));
            } catch (e) { }
        }
    }, []);

    const toggleFeature = (key) => {
        setToggles(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem("developerToggles", JSON.stringify(next));
            return next;
        });
    };

    return (
        <DeveloperContext.Provider value={{ toggles, toggleFeature }}>
            {children}
        </DeveloperContext.Provider>
    );
};

export const useDeveloper = () => {
    const context = useContext(DeveloperContext);
    if (!context) {
        throw new Error("useDeveloper must be used within a DeveloperProvider");
    }
    return context;
};
