"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
    PiPlusBold,
    PiPencilSimple,
    PiTrash,
    PiHeart,
    PiPencilLine,
    PiSyringe,
} from "react-icons/pi";
import AppHeader from "../layout/app-header";
import DatePicker from "../layout/date-picker";
import { Button, BottomSheet } from "../ui";
import LogFoodSheet from "../widget/log-food-sheet";
import { getNutritionChips } from "../widget/nutrition-info-sheet";
import LogInsulinSheet from "../widget/log-insulin-sheet";
import { getMealLogs, deleteMealLog, updateMealLog, MEAL_TYPES } from "@/lib/meal-utils";
import { useDeveloper } from "@/context/developer-context";

/**
 * NourishDetailScreen Component
 *
 * Full-page detail view for the Nourish Notebook.
 * Shows logged meals for the selected date with rich meal cards,
 * empty state illustration, and "+" button to open the meal selector.
 */
export default function NourishDetailScreen() {
    const router = useRouter();

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [mealLogs, setMealLogs] = useState([]);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [deleteSheetOpen, setDeleteSheetOpen] = useState(false);
    const [mealToDelete, setMealToDelete] = useState(null);
    const [insulinSheetOpen, setInsulinSheetOpen] = useState(false);
    const [mealForInsulin, setMealForInsulin] = useState(null);

    const { toggles } = useDeveloper();

    // Load meal logs
    useEffect(() => {
        setMealLogs(getMealLogs());
    }, []);

    // Refresh logs when returning from log-meal page
    useEffect(() => {
        const handleFocus = () => {
            setMealLogs(getMealLogs());
        };
        window.addEventListener("focus", handleFocus);
        return () => window.removeEventListener("focus", handleFocus);
    }, []);

    // Filter by selected date
    const dateStr = useMemo(() => {
        return selectedDate.toISOString().split("T")[0];
    }, [selectedDate]);

    const filteredLogs = useMemo(() => {
        return mealLogs.filter((m) => {
            const mDate = m.date
                ? m.date
                : new Date(m.createdAt).toISOString().split("T")[0];
            return mDate === dateStr;
        });
    }, [mealLogs, dateStr]);

    // Group filtered logs by meal type for display
    const logsByType = useMemo(() => {
        const result = {};
        for (const meal of filteredLogs) {
            const type = meal.mealType || "snack";
            if (!result[type]) result[type] = [];
            result[type].push(meal);
        }
        return result;
    }, [filteredLogs]);

    const isEmpty = filteredLogs.length === 0;

    const handleSelectMeal = (mealType) => {
        setSheetOpen(false);
        router.push(`/log-meal?type=${mealType}&date=${dateStr}`);
    };

    const handleDeleteClick = (meal) => {
        setMealToDelete(meal);
        setDeleteSheetOpen(true);
    };

    const confirmDelete = () => {
        if (mealToDelete) {
            const updated = deleteMealLog(mealToDelete.id);
            setMealLogs(updated);
            setDeleteSheetOpen(false);
            setMealToDelete(null);
        }
    };

    const handleEdit = (meal) => {
        router.push(`/log-meal?id=${meal.id}&type=${meal.mealType}&date=${meal.date || dateStr}`);
    };

    const getMealTypeLabel = (typeId) => {
        return MEAL_TYPES.find((m) => m.id === typeId)?.label || typeId;
    };

    const handleLogInsulin = (insulinData) => {
        if (mealForInsulin) {
            const updatedMeals = updateMealLog(mealForInsulin.id, {
                ...mealForInsulin,
                insulin: insulinData,
            });
            setMealLogs(updatedMeals);
        }
    };

    return (
        <div className="flex flex-col h-full font-sans">
            {/* Sticky header container */}
            <div className="flex-none sticky rounded-b-lg top-0 z-40 bg-white shadow-sm border-b border-gray-50">
                <AppHeader
                    pageTitle="Nourished Notebook"
                    onBack={() => router.push("/")}
                    rightContent={
                        <button
                            onClick={() => setSheetOpen(true)}
                            className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-neutral-700 active:scale-95 transition-all"
                        >
                            <PiPlusBold size={18} className="text-white" />
                        </button>
                    }
                />
                <DatePicker
                    mode="single"
                    value={selectedDate}
                    onChange={setSelectedDate}
                />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto">
                {isEmpty ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-full text-center px-10">
                        <div className="w-40 h-40 mb-6 flex items-center justify-center">
                            <svg
                                width="120"
                                height="120"
                                viewBox="0 0 120 120"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <ellipse cx="60" cy="62" rx="50" ry="48" fill="#FEF9C3" fillOpacity="0.6" />
                                <circle cx="60" cy="60" r="32" stroke="#CBD5E1" strokeWidth="2" fill="white" />
                                <circle cx="60" cy="60" r="24" stroke="#E2E8F0" strokeWidth="1.5" fill="none" />
                                <text x="60" y="67" textAnchor="middle" fontSize="20" fill="#F87171" fontFamily="serif" fontWeight="600">?</text>
                                <path d="M22 35 L22 85 M18 35 L18 55 M22 35 L22 55 M26 35 L26 55 M18 55 Q22 62 26 55" stroke="#94A3B8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                                <path d="M98 35 L98 85 M98 35 Q104 50 98 60" stroke="#94A3B8" strokeWidth="1.5" fill="none" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3 className="text-neutral-800 text-xl mb-2 tracking-[0.2px] font-semibold leading-snug">
                            Your meals are eager for
                            <br />
                            today&apos;s log spotlight!
                        </h3>
                        <div className="mt-5 w-48">
                            <Button
                                variant="primary"
                                size="lg"
                                onClick={() => setSheetOpen(true)}
                            >
                                LOG MEAL
                            </Button>
                        </div>
                    </div>
                ) : (
                    /* Logged Meals — Rich Cards */
                    <div className="px-6 py-5">
                        <h2 className="text-neutral-800 text-lg font-semibold tracking-[0.2px] mb-4">
                            Logged Meals
                        </h2>

                        {Object.entries(logsByType).map(([type, meals]) => (
                            <div key={type} className="mb-5">
                                <p className="text-neutral-500 text-sm font-medium tracking-[0.2px] mb-3">
                                    {getMealTypeLabel(type)}
                                </p>
                                <div className="flex flex-col gap-3">
                                    {meals.map((meal) => (
                                        <MealCard
                                            key={meal.id}
                                            meal={meal}
                                            onDelete={() => handleDeleteClick(meal)}
                                            onEdit={() => handleEdit(meal)}
                                            showInsulin={toggles.insulin}
                                            onOpenInsulin={() => {
                                                setMealForInsulin(meal);
                                                setInsulinSheetOpen(true);
                                            }}
                                        />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <LogFoodSheet
                open={sheetOpen}
                onClose={() => setSheetOpen(false)}
                onSelectMeal={handleSelectMeal}
                onOpenSettings={() => {
                    router.push("/?tab=Profile&sub=customize-experience&tip=ai");
                }}
            />

            {/* Delete Confirmation Sheet */}
            <BottomSheet
                open={deleteSheetOpen}
                onClose={() => setDeleteSheetOpen(false)}
                title="Remove log"
            >
                <div className="flex flex-col gap-3">
                    <Button
                        variant="destructive"
                        size="xl"
                        onClick={confirmDelete}
                        className="!h-[60px]"
                    >
                        <PiTrash size={20} className="mr-2" />
                        REMOVE LOG
                    </Button>
                    <Button
                        variant="tertiary"
                        size="xl"
                        onClick={() => setDeleteSheetOpen(false)}
                        className="!h-[60px]"
                    >
                        CANCEL
                    </Button>
                </div>
            </BottomSheet>

            {/* Insulin Log Bottom Sheet */}
            <LogInsulinSheet
                open={insulinSheetOpen}
                onClose={() => setInsulinSheetOpen(false)}
                onLog={handleLogInsulin}
                initialData={mealForInsulin?.insulin}
            />
        </div>
    );
}

// ─── Rich Meal Card ──────────────────────────────────────────────────

function MealCard({ meal, onDelete, onEdit, showInsulin, onOpenInsulin }) {
    const chips = useMemo(() => getNutritionChips(meal.nutrition), [meal.nutrition]);

    return (
        <div className="bg-white rounded-2xl border p-4">
            {/* Top row: thumbnail, time, edit/delete */}
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                    {meal.image ? (
                        <img
                            src={meal.image}
                            alt={meal.description}
                            className="w-10 h-10 rounded-full object-cover shrink-0"
                        />
                    ) : (
                        <div className="w-10 h-10 rounded-full bg-neutral-100 flex items-center justify-center shrink-0">
                            <span className="text-lg">🍽️</span>
                        </div>
                    )}
                    <span className="text-sm text-neutral-500 font-medium">
                        {meal.time || ""}
                    </span>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={onEdit}
                        className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-neutral-50 transition-colors"
                    >
                        <PiPencilSimple size={14} className="text-neutral-500" />
                    </button>
                    <button
                        onClick={onDelete}
                        className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-red-50 transition-colors"
                    >
                        <PiTrash size={14} className="text-red-400" />
                    </button>
                </div>
            </div>

            {/* Description */}
            <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex-1 min-w-0">
                    <p className="text-sm text-neutral-800 font-semibold leading-snug">
                        {meal.description}
                    </p>
                    {/* Nutrition chips */}
                    {chips.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {chips.map((chip, i) => (
                                <span
                                    key={i}
                                    className="inline-block px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[11px] font-medium rounded-full"
                                >
                                    {chip.label}
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Insulin info */}
            {showInsulin && (
                <div className="mb-2">
                    {meal.insulin ? (
                        <div className="flex items-center justify-between border border-[#FDE5CA] bg-[#FFF8EB] rounded-lg px-3 py-2.5">
                            <div className="flex items-center gap-2">
                                <PiSyringe size={16} className="text-[#2D3F58]" />
                                <span className="text-sm font-semibold text-[#2D3F58]">
                                    <span className="font-normal">Insulin dosage :</span> {meal.insulin.dosage} units of {meal.insulin.type}
                                </span>
                            </div>
                            <button onClick={onOpenInsulin} className="w-6 h-6 flex items-center justify-center hover:bg-white/50 rounded-full transition-colors">
                                <PiPencilSimple size={14} className="text-[#2D3F58]" />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between border rounded-lg px-3 py-2.5 bg-white">
                            <div className="flex items-center gap-2">
                                <PiSyringe size={16} className="text-[#64748B]" />
                                <span className="text-sm text-[#475569] font-medium">Insulin dosage</span>
                            </div>
                            <button
                                onClick={onOpenInsulin}
                                className="text-xs font-bold text-purple-600 hover:text-purple-700 uppercase tracking-wider transition-colors"
                            >
                                + LOG INSULIN
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Coach note input */}
            <div className="flex items-center gap-2 mt-1 border rounded-lg px-3 py-2.5 bg-neutral-50">
                <span className="text-xs text-neutral-400 flex-1">
                    Add a note to your coach
                </span>
                <PiPencilLine size={14} className="text-neutral-400" />
            </div>
        </div>
    );
}
