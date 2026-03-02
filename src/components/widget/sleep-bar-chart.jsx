"use client";

import React from "react";
import { formatDuration } from "@/lib/sleep-utils";

/**
 * SleepBarChart
 * 
 * 7-day sleep duration bar chart matching the dashboard aesthetic.
 * Highlights days with less than 7 hours of sleep.
 */
export default function SleepBarChart({ groupedLogs, dateRangeStart, dateRangeEnd }) {
    // Generate dates for the selected week
    const days = [];
    const currentDate = new Date(dateRangeStart);
    while (currentDate <= dateRangeEnd) {
        days.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Map data to the 7 days
    const chartData = days.map((day) => {
        const year = day.getFullYear();
        const month = String(day.getMonth() + 1).padStart(2, '0');
        const dateStr = String(day.getDate()).padStart(2, '0');
        const dayStr = `${year}-${month}-${dateStr}`;

        const dayLabel = day.toLocaleDateString("en-US", { weekday: "narrow" }); // S, M, T...

        // Find log for this day
        let totalMins = 0;
        const group = groupedLogs.find(g => g.dateRaw === dayStr);
        if (group && group.entries) {
            // Sum all sleep entries for the day (usually just 1)
            totalMins = group.entries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
        }

        const isToday = day.getTime() === today.getTime();
        const hrs = totalMins / 60;

        // 7+ hours is good, <7 is low 
        const isLow = totalMins > 0 && totalMins < 420; // less than 7 hours

        return {
            date: dayStr,
            label: dayLabel,
            minutes: totalMins,
            hours: hrs,
            isToday,
            isLow,
        };
    });

    const maxHours = Math.max(10, Math.ceil(Math.max(...chartData.map(d => d.hours))));

    // Calculate averages
    const daysWithData = chartData.filter(d => d.minutes > 0);
    const avgMins = daysWithData.length > 0
        ? Math.round(daysWithData.reduce((sum, d) => sum + d.minutes, 0) / daysWithData.length)
        : 0;

    return (
        <div className="bg-white px-6 py-5 border-b border-neutral-100 font-sans">
            <div className="flex items-end justify-between mb-8">
                <div>
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-widest mb-1.5 block px-0.5">
                        Avg Sleep
                    </span>
                    <div className="text-[28px] leading-none font-bold text-neutral-800 tracking-tight flex items-baseline gap-1.5">
                        {avgMins > 0 ? (
                            <>
                                <span>{Math.floor(avgMins / 60)}</span>
                                <span className="text-sm font-medium text-neutral-500 mr-1">hr</span>
                                <span>{avgMins % 60}</span>
                                <span className="text-sm font-medium text-neutral-500">min</span>
                            </>
                        ) : (
                            <span className="text-neutral-400">-- hr -- min</span>
                        )}
                    </div>
                </div>
            </div>

            <div className="h-[140px] flex items-end justify-between gap-1.5 relative mb-2">
                {/* 7h Target Line */}
                <div
                    className="absolute w-full border-t border-dashed border-indigo-200 z-0 pointer-events-none"
                    style={{ bottom: `${(7 / maxHours) * 100}%` }}
                >
                    <span className="absolute -top-[14px] right-0 text-[10px] font-bold tracking-tight text-indigo-400 bg-white px-1">7h goal</span>
                </div>

                {chartData.map((data, i) => {
                    const heightPercent = Math.max(0, (data.hours / maxHours) * 100);

                    // Colors
                    // Default: Indigo
                    // Low (<7h, >0): Amber
                    // Empty: Neutral
                    let barColor = "bg-indigo-300"; // Lighter indigo for history
                    if (data.minutes === 0) barColor = "bg-neutral-100";
                    else if (data.isLow) barColor = "bg-amber-300"; // Lighter amber for history

                    if (data.isToday && data.minutes > 0) barColor = data.isLow ? "bg-amber-500" : "bg-indigo-500"; // Bolder for today

                    const minHeight = data.minutes > 0 ? "4px" : "4px";

                    return (
                        <div key={i} className="flex-1 h-full flex flex-col items-center justify-end gap-2 z-10">
                            <div className="w-full flex-1 flex items-end justify-center rounded-[4px] relative group">
                                {/* Tooltip */}
                                {data.minutes > 0 && (
                                    <div className="absolute -top-8 bg-neutral-800 text-white text-[10px] items-center px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20 pointer-events-none shadow-sm font-medium">
                                        {formatDuration(data.minutes)}
                                    </div>
                                )}

                                <div
                                    className={`w-full max-w-[32px] rounded-[4px] transition-all duration-500 ${barColor}`}
                                    style={{ height: heightPercent > 0 ? `${heightPercent}%` : minHeight }}
                                />
                            </div>
                            <span className={`text-[12px] font-semibold leading-none ${data.isToday ? "text-indigo-600" : "text-neutral-400"}`}>
                                {data.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
