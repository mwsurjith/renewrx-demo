"use client";

import React, { useState } from "react";
import { PiInfo, PiCaretDown, PiCaretUp } from "react-icons/pi";
import BottomSheet from "../ui/bottom-sheet";
import { Button } from "../ui";
import { MEAL_TYPES } from "@/lib/meal-utils";

/**
 * LogFoodSheet Component
 *
 * Bottom sheet that lets user select a meal type to log.
 * Contains an accordion info banner about AI food logging
 * and a 2x2 grid of meal type cards.
 */
export default function LogFoodSheet({ open, onClose, onSelectMeal, onOpenSettings }) {
    const [accordionOpen, setAccordionOpen] = useState(false);

    // Meal type icon components (emoji-based for simplicity)
    const mealIcons = {
        breakfast: "☕",
        lunch: "🍲",
        dinner: "🍽️",
        snack: "🥕",
    };

    return (
        <BottomSheet open={open} onClose={onClose} title="Log food">
            {/* Accordion Info Banner */}
            <div className="mb-6">
                <button
                    onClick={() => setAccordionOpen(!accordionOpen)}
                    className="w-full flex items-start justify-between gap-3 p-4 bg-neutral-50 rounded-xl transition-colors hover:bg-neutral-100"
                >
                    <div className="flex items-start gap-2.5 text-left">
                        <PiInfo size={20} className="text-[#2D264B] mt-0.5 shrink-0" />
                        <div>
                            <p className="text-sm font-bold text-[#1E293B] leading-snug">
                                AI meal logging is turned off
                            </p>
                            <p className="text-xs text-[#64748B] mt-0.5">
                                We&apos;re improving it. Tap to see what changed.
                            </p>
                        </div>
                    </div>
                    {accordionOpen ? (
                        <PiCaretUp size={18} className="text-neutral-400 mt-0.5 shrink-0" />
                    ) : (
                        <PiCaretDown size={18} className="text-neutral-400 mt-0.5 shrink-0" />
                    )}
                </button>

                {accordionOpen && (
                    <div className="px-4 pb-5 pt-3 bg-neutral-50 rounded-b-xl -mt-2">
                        <p className="text-sm text-[#475569] leading-relaxed mb-4">
                            To make sure your food data is correct, we&apos;re switched to manual logging for now. We are working to make the AI better at recognizing meals and counting nutrition. If the AI worked well for you before, you can turn it back on anytime.
                        </p>
                        <div className="flex justify-start">
                            <Button
                                variant="link"
                                size="sm"
                                onClick={() => {
                                    onClose?.();
                                    onOpenSettings?.();
                                }}
                                className="!p-0 !h-auto text-purple-600 hover:text-purple-700"
                            >
                                Open Settings to Turn On AI
                            </Button>
                        </div>
                    </div>
                )}
            </div>

            {/* Meal Type Grid */}
            <div className="grid grid-cols-2 gap-3 pb-2">
                {MEAL_TYPES.map((meal) => (
                    <button
                        key={meal.id}
                        onClick={() => {
                            if (onSelectMeal) onSelectMeal(meal.id);
                        }}
                        className="flex flex-col items-center justify-center gap-2 py-6 rounded-2xl border transition-all hover:shadow-sm active:scale-[0.97]"
                        style={{ backgroundColor: meal.bgColor, borderColor: `${meal.color}22` }}
                    >
                        <span className="text-3xl">{meal.icon}</span>
                        <span
                            className="text-sm font-semibold tracking-[0.2px]"
                            style={{ color: meal.color }}
                        >
                            {meal.label}
                        </span>
                    </button>
                ))}
            </div>
        </BottomSheet>
    );
}
