"use client";

import React, { useState, useMemo, useRef, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    PiCamera,
    PiMicrophone,
    PiClock,
    PiDotsThree,
    PiTrash,
    PiArrowRight,
    PiSyringe,
    PiPencilSimple
} from "react-icons/pi";
import AppHeader from "@/components/layout/app-header";
import { Button, BottomSheet, TimeField } from "@/components/ui";
import NutritionInfoSheet, { getNutritionChips } from "@/components/widget/nutrition-info-sheet";
import LogInsulinSheet from "@/components/widget/log-insulin-sheet";
import { useDeveloper } from "@/context/developer-context";
import {
    getRecentMeals,
    saveMealLog,
    updateMealLog,
    getMealLogById,
    MEAL_TYPES,
} from "@/lib/meal-utils";

/**
 * LogMealContent Component
 *
 * Full-page for logging a meal: photo upload, text input, recent meals,
 * nutrition info, time picker, and LOG MEAL button.
 */
function LogMealContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const fileInputRef = useRef(null);

    const mealId = searchParams.get("id");
    const mealType = searchParams.get("type") || "breakfast";
    const dateParam = searchParams.get("date") || new Date().toISOString().split("T")[0];

    const mealTypeInfo = MEAL_TYPES.find((m) => m.id === mealType) || MEAL_TYPES[0];
    const recentMeals = useMemo(() => getRecentMeals(mealType), [mealType]);

    const { toggles } = useDeveloper();
    const [description, setDescription] = useState("");
    const [photo, setPhoto] = useState(null); // base64 or URL
    const [photoOptionsOpen, setPhotoOptionsOpen] = useState(false);
    const [nutrition, setNutrition] = useState(null); // { kcal, carbs, fat, ... }
    const [nutritionSheetOpen, setNutritionSheetOpen] = useState(false);
    const [insulin, setInsulin] = useState(null); // { type, dosage }
    const [insulinSheetOpen, setInsulinSheetOpen] = useState(false);
    const [time, setTime] = useState("");

    // Load existing meal if editing
    React.useEffect(() => {
        if (mealId) {
            const existing = getMealLogById(mealId);
            if (existing) {
                setDescription(existing.description || "");
                setPhoto(existing.image || null);
                setNutrition(existing.nutrition || null);
                setInsulin(existing.insulin || null);

                // Convert display time back to HH:mm for input if possible
                if (existing.time) {
                    const [t, ampm] = existing.time.split(" ");
                    let [h, m] = t.split(":");
                    let hrs = parseInt(h);
                    if (ampm === "PM" && hrs < 12) hrs += 12;
                    if (ampm === "AM" && hrs === 12) hrs = 0;
                    setTime(`${hrs.toString().padStart(2, "0")}:${m}`);
                }
            }
        } else {
            // Default time for new entry
            const now = new Date();
            setTime(`${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`);
        }
    }, [mealId]);

    const hasInput = description.trim().length > 0;
    const nutritionChips = useMemo(() => getNutritionChips(nutrition), [nutrition]);
    const hasNutrition = nutritionChips.length > 0;

    // Format time for display (HH:mm → h:mm AM/PM)
    const formatTimeDisplay = (timeStr) => {
        if (!timeStr) return "";
        const [h, m] = timeStr.split(":");
        let hrs = parseInt(h);
        const ampm = hrs >= 12 ? "PM" : "AM";
        hrs = hrs % 12 || 12;
        return `${hrs}:${m} ${ampm}`;
    };

    // ─── Photo Handling ──────────────────────────────────────────────

    const handlePhotoSelect = (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            setPhoto(reader.result);
        };
        reader.readAsDataURL(file);
        // Reset input so same file can be re-selected
        e.target.value = "";
    };

    const triggerPhotoUpload = () => {
        fileInputRef.current?.click();
    };

    const handleRemovePhoto = () => {
        setPhoto(null);
        setPhotoOptionsOpen(false);
    };

    const handleChangePhoto = () => {
        setPhotoOptionsOpen(false);
        // Small delay to let sheet close before opening file dialog
        setTimeout(() => triggerPhotoUpload(), 300);
    };

    // ─── Meal Actions ────────────────────────────────────────────────

    const handleCopyMeal = (meal) => {
        setDescription(meal.description);
    };

    const handleLogMeal = () => {
        if (!description.trim()) return;

        const mealData = {
            mealType,
            description: description.trim(),
            date: dateParam,
            time: formatTimeDisplay(time),
            image: photo,
            nutrition,
            insulin,
        };

        if (mealId) {
            updateMealLog(mealId, mealData);
        } else {
            saveMealLog(mealData);
        }

        router.back();
    };

    return (
        <div className="flex flex-col h-full font-sans">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handlePhotoSelect}
                className="hidden"
            />

            {/* Header */}
            <div className="flex-none">
                <AppHeader
                    pageTitle="Log your meal"
                    onBack={() => router.back()}
                />
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto pb-40">
                {/* Photo preview */}
                {photo && (
                    <div className="relative w-full h-52">
                        <img
                            src={photo}
                            alt="Meal photo"
                            className="w-full h-full object-cover"
                        />
                        {/* Three-dot menu */}
                        <button
                            onClick={() => setPhotoOptionsOpen(true)}
                            className="absolute top-3 right-3 w-9 h-9 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
                        >
                            <PiDotsThree size={20} className="text-neutral-700" />
                        </button>
                    </div>
                )}

                <div className="px-6 pt-5">
                    {/* Question + Take Photo */}
                    <div className="flex items-start justify-between mb-4">
                        <h2 className="text-neutral-800 text-base font-semibold tracking-[0.2px] leading-snug">
                            What did you eat or
                            <br />
                            drink?
                        </h2>
                        {!photo && (
                            <div className="w-40">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={triggerPhotoUpload}
                                    className="!h-10"
                                >
                                    <PiCamera size={18} className="mr-2" />
                                    TAKE A PHOTO
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Text Area */}
                    <div className="relative mb-1">
                        <textarea
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Example: cheeseburger and coffee"
                            maxLength={2000}
                            rows={4}
                            className="w-full resize-none rounded-xl border p-4 text-sm text-neutral-800 placeholder:text-neutral-400 outline-none focus:border-neutral-300 transition-colors bg-white"
                        />
                    </div>
                    <div className="flex items-center justify-between mb-6">
                        <span className="text-xs text-neutral-400 bg-neutral-50 px-2 py-0.5 rounded-md font-medium">
                            {2000 - description.length} characters
                        </span>
                        <button className="w-8 h-8 flex items-center justify-center rounded-full border hover:bg-neutral-50 transition-colors">
                            <PiMicrophone size={16} className="text-neutral-500" />
                        </button>
                    </div>

                    {/* Dynamic section: Recents or Nutrition Card */}
                    {!hasInput ? (
                        /* Recent Meals */
                        recentMeals.length > 0 && (
                            <div>
                                <p className="text-sm text-neutral-600 font-medium tracking-[0.2px] mb-3">
                                    {mealTypeInfo.label} you have logged before
                                </p>
                                <div className="flex flex-col divide-y">
                                    {recentMeals.map((meal) => (
                                        <div
                                            key={meal.id}
                                            className="flex items-center gap-3 py-3"
                                        >
                                            {meal.image && (
                                                <img
                                                    src={meal.image}
                                                    alt={meal.description}
                                                    className="w-12 h-12 rounded-lg object-cover shrink-0"
                                                />
                                            )}
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm text-neutral-800 font-semibold truncate">
                                                    {meal.description}
                                                </p>
                                                {meal.nutritionCount > 0 && (
                                                    <span className="inline-block mt-1 px-2 py-0.5 bg-neutral-100 text-neutral-600 text-[11px] font-medium rounded-full">
                                                        +{meal.nutritionCount} nutrition added
                                                    </span>
                                                )}
                                            </div>
                                            <button
                                                onClick={() => handleCopyMeal(meal)}
                                                className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors shrink-0"
                                            >
                                                Copy Meal
                                            </button>
                                        </div>
                                    ))}
                                    <div className="py-3 text-center">
                                        <span className="text-sm text-neutral-400">That&apos;s all</span>
                                    </div>
                                </div>
                            </div>
                        )
                    ) : (
                        /* Nutrition Card */
                        <div className="flex items-center justify-between p-4 bg-neutral-50 rounded-xl border">
                            <div className="flex-1">
                                {hasNutrition ? (
                                    <>
                                        <p className="text-sm text-neutral-800 font-semibold mb-2">
                                            Nutrition info added
                                        </p>
                                        <div className="flex flex-wrap gap-1.5">
                                            {nutritionChips.map((chip, i) => (
                                                <span
                                                    key={i}
                                                    className="inline-block px-2.5 py-1 bg-white border text-[11px] font-medium text-neutral-700 rounded-full"
                                                >
                                                    {chip.label}
                                                </span>
                                            ))}
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <p className="text-sm text-neutral-800 font-semibold">
                                            Know the nutrition facts?
                                        </p>
                                        <p className="text-xs text-neutral-500 mt-0.5">
                                            Not sure? It&apos;s okay, skip this
                                        </p>
                                    </>
                                )}
                            </div>
                            <button
                                onClick={() => setNutritionSheetOpen(true)}
                                className="text-sm font-semibold text-purple-600 hover:text-purple-700 transition-colors shrink-0 ml-3"
                            >
                                {hasNutrition ? "Edit nutrition" : "Add nutrition"}
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Fixed Bottom: Time + Log Button */}
            {hasInput && (
                <div className="fixed bottom-0 left-0 right-0 flex justify-center z-50">
                    <div className="w-full max-w-md bg-white border-t px-6 py-4 space-y-3">
                        {/* Time Picker Row */}
                        <TimeField
                            value={time}
                            onChange={setTime}
                            showIcon={false}
                        />

                        {/* Insulin Option (if developer toggle is on) */}
                        {toggles.insulin && (
                            <button
                                onClick={() => setInsulinSheetOpen(true)}
                                className="w-full flex items-center justify-between border border-[#FDE5CA] bg-[#FFF8EB] rounded-xl px-4 py-4 transition-colors"
                            >
                                {insulin ? (
                                    <div className="flex items-center gap-2">
                                        <PiSyringe size={20} className="text-[#2D3F58]" />
                                        <span className="text-[16px] font-bold text-[#2D3F58]">
                                            {insulin.dosage} units - {insulin.type}
                                        </span>
                                    </div>
                                ) : (
                                    <div className="flex flex-col text-left">
                                        <span className="text-[16px] font-bold text-[#2D3F58] leading-snug">
                                            Did you take insulin with this meal?
                                        </span>
                                        <span className="text-[14px] text-[#475569] mt-0.5">
                                            You can skip this if you didn&apos;t.
                                        </span>
                                    </div>
                                )}
                                {insulin ? (
                                    <PiPencilSimple size={20} className="text-[#2D3F58] shrink-0" />
                                ) : (
                                    <PiArrowRight size={20} className="text-[#2D3F58] shrink-0" />
                                )}
                            </button>
                        )}

                        {/* Log Meal Button */}
                        <Button
                            variant="primary"
                            size="xl"
                            onClick={handleLogMeal}
                        >
                            LOG MEAL
                        </Button>
                    </div>
                </div>
            )}

            {/* ─── Photo Options Bottom Sheet ─────────────────────────── */}
            <BottomSheet
                open={photoOptionsOpen}
                onClose={() => setPhotoOptionsOpen(false)}
                title="Photo options"
            >
                <div className="flex flex-col gap-3">
                    <Button
                        variant="destructive"
                        size="xl"
                        onClick={handleRemovePhoto}
                        className="!h-[56px]"
                    >
                        <PiTrash size={18} className="mr-2" />
                        REMOVE PHOTO
                    </Button>
                    <Button
                        variant="tertiary"
                        size="xl"
                        onClick={handleChangePhoto}
                        className="!h-[56px]"
                    >
                        CHANGE PHOTO
                    </Button>
                </div>
            </BottomSheet>

            {/* ─── Nutrition Info Bottom Sheet ─────────────────────────── */}
            <NutritionInfoSheet
                open={nutritionSheetOpen}
                onClose={() => setNutritionSheetOpen(false)}
                values={nutrition}
                onSave={setNutrition}
            />

            {/* ─── Insulin Log Bottom Sheet ─────────────────────────── */}
            <LogInsulinSheet
                open={insulinSheetOpen}
                onClose={() => setInsulinSheetOpen(false)}
                onLog={setInsulin}
                initialData={insulin}
            />
        </div>
    );
}

export default function LogMealPage() {
    return (
        <Suspense
            fallback={
                <div className="flex items-center justify-center h-full">
                    <p className="text-neutral-400">Loading…</p>
                </div>
            }
        >
            <LogMealContent />
        </Suspense>
    );
}
