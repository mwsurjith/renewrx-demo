"use client";

import React, { useState, useEffect } from "react";
import {
    PiLeaf,
    PiBowlFood,
    PiDrop,
    PiBarbell,
    PiPlant,
    PiAtom,
} from "react-icons/pi";
import BottomSheet from "../ui/bottom-sheet";
import { Button } from "../ui";

/**
 * Nutrition fields definition
 * Carbs is the "primary" macro — always shown as its own chip when present.
 */
const NUTRITION_FIELDS = [
    { key: "kcal", label: "kcal", unit: "kcal", icon: PiLeaf },
    { key: "carbs", label: "Carbohydrates", unit: "g", icon: PiBowlFood },
    { key: "fat", label: "Fat", unit: "g", icon: PiDrop },
    { key: "protein", label: "Protein", unit: "g", icon: PiBarbell },
    { key: "fiber", label: "Fiber", unit: "g", icon: PiPlant },
    { key: "sodium", label: "Sodium", unit: "mg", icon: PiAtom },
];

/**
 * NutritionInfoSheet Component
 *
 * Bottom sheet for entering macro nutritional values.
 * Each field has an icon, label, numeric input, and unit label.
 *
 * @param {Object} props
 * @param {boolean} props.open
 * @param {Function} props.onClose
 * @param {Object} props.values - Current nutrition values { kcal, carbs, fat, protein, fiber, sodium }
 * @param {Function} props.onSave - Called with the nutrition object on submit
 */
export default function NutritionInfoSheet({ open, onClose, values, onSave }) {
    const [fields, setFields] = useState({
        kcal: "",
        carbs: "",
        fat: "",
        protein: "",
        fiber: "",
        sodium: "",
    });

    // Sync incoming values when opening
    useEffect(() => {
        if (open && values) {
            setFields({
                kcal: values.kcal ?? "",
                carbs: values.carbs ?? "",
                fat: values.fat ?? "",
                protein: values.protein ?? "",
                fiber: values.fiber ?? "",
                sodium: values.sodium ?? "",
            });
        }
    }, [open, values]);

    const handleChange = (key, val) => {
        // Only allow numbers and empty
        const cleaned = val.replace(/[^0-9.]/g, "");
        setFields((prev) => ({ ...prev, [key]: cleaned }));
    };

    const hasAnyValue = Object.values(fields).some((v) => v !== "" && v !== undefined);

    const handleSubmit = () => {
        // Convert to numbers, strip empties
        const result = {};
        for (const f of NUTRITION_FIELDS) {
            if (fields[f.key] !== "" && fields[f.key] !== undefined) {
                result[f.key] = parseFloat(fields[f.key]);
            }
        }
        onSave?.(result);
        onClose?.();
    };

    return (
        <BottomSheet open={open} onClose={onClose} title="Nutrition info">
            {/* Subtitle */}
            <p className="text-sm text-neutral-500 leading-relaxed mb-6">
                Use a food label or app to find these numbers. Only enter them if you know them
            </p>

            {/* Fields */}
            <div className="flex flex-col divide-y">
                {NUTRITION_FIELDS.map((field) => {
                    const Icon = field.icon;
                    return (
                        <div
                            key={field.key}
                            className="flex items-center justify-between py-4"
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={20} className="text-neutral-500" />
                                <span className="text-sm text-neutral-800 font-medium">
                                    {field.label}
                                </span>
                            </div>
                            <div className="flex items-center border rounded-lg overflow-hidden">
                                <input
                                    type="text"
                                    inputMode="decimal"
                                    value={fields[field.key]}
                                    onChange={(e) => handleChange(field.key, e.target.value)}
                                    placeholder="105"
                                    className="w-16 text-sm text-neutral-800 text-right px-3 py-2 outline-none bg-transparent placeholder:text-neutral-300"
                                />
                                <span className="text-xs text-neutral-400 pr-3 font-medium">
                                    {field.unit}
                                </span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Submit Button */}
            <div className="mt-6">
                <Button
                    variant="primary"
                    size="xl"
                    onClick={handleSubmit}
                    disabled={!hasAnyValue}
                    className={!hasAnyValue ? "opacity-50 pointer-events-none" : ""}
                >
                    ADD NUTRITION INFO
                </Button>
            </div>
        </BottomSheet>
    );
}

// ─── Utility: Generate nutrition chip display ────────────────────────

/**
 * Generates chip data for displaying nutrition info.
 *
 * Rules:
 * - If carbs is present: show "Carbs Xg" chip
 * - If other macros > 0: show "+N nutrition added" chip
 * - If carbs is NOT present and only 1 other macro: show that macro chip
 * - If carbs is NOT present and 2+ other macros: show "+N nutrition added"
 */
export function getNutritionChips(nutrition) {
    if (!nutrition || Object.keys(nutrition).length === 0) return [];

    const chips = [];
    const otherEntries = [];

    for (const [key, val] of Object.entries(nutrition)) {
        if (val === undefined || val === null || val === "") continue;
        if (key === "carbs") {
            chips.push({ label: `Carbs ${val}g`, primary: true });
        } else {
            const field = NUTRITION_FIELDS.find((f) => f.key === key);
            otherEntries.push({ key, val, label: field?.label || key, unit: field?.unit || "" });
        }
    }

    const hasCarbs = chips.length > 0;

    if (hasCarbs && otherEntries.length > 0) {
        chips.push({ label: `+${otherEntries.length} nutrition added`, primary: false });
    } else if (!hasCarbs && otherEntries.length === 1) {
        const entry = otherEntries[0];
        chips.push({ label: `${entry.label} ${entry.val}${entry.unit}`, primary: true });
    } else if (!hasCarbs && otherEntries.length >= 2) {
        chips.push({ label: `+${otherEntries.length} nutrition added`, primary: false });
    }

    return chips;
}
