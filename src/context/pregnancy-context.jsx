"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';

const PregnancyContext = createContext();

export const PregnancyProvider = ({ children }) => {
    // Default: Week 18 today (March 1, 2026)
    // 22 weeks remaining = Aug 2, 2026
    const [dueDate, setDueDate] = useState(new Date("2026-08-02"));

    // Account created at week 13 (5 weeks ago from today)
    // Today is March 1, 2026 -> 5 weeks ago is Jan 25, 2026
    const [accountCreatedDate] = useState(new Date("2026-01-25"));

    const pregnancyInfo = useMemo(() => {
        const today = new Date(); // March 1, 2026 in demo time

        // Calculate diff in ms
        const diffMs = dueDate - today;
        const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
        const diffWeeksRemaining = Math.max(0, Math.floor(diffDays / 7));

        // Total duration is 40 weeks (280 days)
        const currentWeek = 40 - diffWeeksRemaining;

        return {
            currentWeek,
            weeksRemaining: diffWeeksRemaining,
            dueDate,
            accountCreatedDate
        };
    }, [dueDate, accountCreatedDate]);

    return (
        <PregnancyContext.Provider value={{ ...pregnancyInfo, setDueDate }}>
            {children}
        </PregnancyContext.Provider>
    );
};

export const usePregnancy = () => {
    const context = useContext(PregnancyContext);
    if (!context) {
        throw new Error("usePregnancy must be used within a PregnancyProvider");
    }
    return context;
};
