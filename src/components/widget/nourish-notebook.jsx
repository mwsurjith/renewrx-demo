"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { PiInfo, PiArrowRight } from "react-icons/pi";
import { Button } from "../ui";
import LogFoodSheet from './log-food-sheet';
import { getMealLogs, getMealsForDate } from '@/lib/meal-utils';

/**
 * NourishedNotebook Component
 * 
 * A widget to display and log daily meals with a premium mobile aesthetic.
 * Wired to navigate to detail page and open log food sheet.
 */
export default function NourishedNotebook() {
    const router = useRouter();
    const [sheetOpen, setSheetOpen] = useState(false);

    // Today's date string
    const todayStr = useMemo(() => new Date().toISOString().split("T")[0], []);

    // Get today's meals
    const [todayMeals, setTodayMeals] = useState({ breakfast: [], lunch: [], dinner: [], snack: [] });

    useEffect(() => {
        setTodayMeals(getMealsForDate(todayStr));
    }, [todayStr]);

    // Refresh when returning to page
    useEffect(() => {
        const handleFocus = () => {
            setTodayMeals(getMealsForDate(todayStr));
        };
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, [todayStr]);

    const mealSlots = [
        {
            name: "Breakfast",
            images: todayMeals.breakfast.map(m => m.image).filter(Boolean),
            count: todayMeals.breakfast.length,
        },
        {
            name: "Lunch",
            images: todayMeals.lunch.map(m => m.image).filter(Boolean),
            count: todayMeals.lunch.length,
        },
        {
            name: "Dinner",
            images: todayMeals.dinner.map(m => m.image).filter(Boolean),
            count: todayMeals.dinner.length,
        },
    ];

    const handleSelectMeal = (mealType) => {
        setSheetOpen(false);
        router.push(`/log-meal?type=${mealType}&date=${todayStr}`);
    };

    return (
        <div className="w-full font-sans">
            {/* Title */}
            <div className="flex items-center justify-between mb-4">
                <div className='flex gap-1 items-center'>
                    <h3 className="text-lg text-neutral-800 font-semibold tracking-[0.2px]">
                        Nourished Notebook
                    </h3>
                    <PiInfo size={20} className="text-neutral-500" />
                </div>
                <button
                    onClick={() => router.push("/nourish-notebook")}
                    className="w-8 h-8 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 active:scale-95 transition-all"
                >
                    <PiArrowRight size={18} className="text-white" />
                </button>
            </div>

            {/* Card */}
            <div className="bg-white rounded-3xl border overflow-hidden">
                {/* Content Area */}
                <div className="px-4 py-5 flex items-center justify-center min-h-[140px]">
                    {(todayMeals.breakfast.length + todayMeals.lunch.length + todayMeals.dinner.length + todayMeals.snack.length) === 0 ? (
                        <div className="flex flex-col items-center justify-center text-center">
                            <span className="text-4xl mb-3 grayscale opacity-40">🍽️</span>
                            <p className="text-sm text-neutral-500 font-medium tracking-[0.2px] leading-snug max-w-[200px]">
                                Your meals are eager for today&apos;s log spotlight!
                            </p>
                        </div>
                    ) : (
                        <div className="flex gap-3 w-full">
                            {mealSlots.map((meal) => (
                                <div key={meal.name} className="flex-1">
                                    <div className='flex items-center justify-center mb-1'>
                                        <span className="text-[10px] text-neutral-400 tracking-[0.4px] uppercase text-center">
                                            {meal.name}
                                        </span>
                                    </div>
                                    <div className="h-20 bg-white rounded-xl border border-dashed border-[#d5d9de] flex items-center justify-center relative overflow-hidden group">
                                        {meal.images.length > 0 ? (
                                            <div className="w-full h-full p-1">
                                                <img
                                                    src={meal.images[0]}
                                                    alt={meal.name}
                                                    className="w-full h-full rounded-lg object-cover"
                                                />
                                            </div>
                                        ) : meal.count > 0 ? (
                                            <div className="flex flex-col items-center gap-1 text-purple-500">
                                                <span className="text-2xl">🍽️</span>
                                            </div>
                                        ) : (
                                            <div className="flex flex-col items-center gap-1 opacity-40">
                                                <div className="w-6 h-6 rounded-full border-2 border-current" />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Buttons */}
                <div className="flex gap-3 px-4 pb-4">
                    <Button
                        variant="tertiary"
                        className="w-1/2"
                        size="lg"
                        onClick={() => router.push("/nourish-notebook")}
                    >
                        VIEW LOGS
                    </Button>
                    <Button
                        variant="secondary"
                        className="w-1/2"
                        size="lg"
                        onClick={() => setSheetOpen(true)}
                    >
                        LOG MEAL
                    </Button>
                </div>
            </div>

            {/* Log Food Sheet */}
            <LogFoodSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onSelectMeal={handleSelectMeal}
                onOpenSettings={() => {
                    router.push("/?tab=Profile&sub=customize-experience&tip=ai");
                }}
            />
        </div>
    );
}
