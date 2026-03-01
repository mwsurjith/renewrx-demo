"use client";

import React, { useState, useEffect } from "react";
import { PiX, PiArrowRight, PiCaretDown } from "react-icons/pi";
import { BottomSheet, Button } from "../ui";

const INSULIN_TYPES = ["Novolog", "Humalog", "Lispro", "Epidra"];

export default function LogInsulinSheet({ open, onClose, onLog, initialData = null }) {
    const [type, setType] = useState("");
    const [typeSheetOpen, setTypeSheetOpen] = useState(false);
    const [dosage, setDosage] = useState("");

    useEffect(() => {
        if (!open) {
            // Reset state when fully closed
            setTimeout(() => {
                setType("");
                setDosage("");
                setTypeSheetOpen(false);
            }, 300);
        } else if (initialData) {
            setType(initialData.type || "");
            setDosage(initialData.dosage || "");
        }
    }, [open, initialData]);

    const handleLog = () => {
        if (!type || !dosage) return;
        onLog({ type, dosage });
        onClose();
    };

    return (
        <>
            <BottomSheet open={open && !typeSheetOpen} onClose={onClose} title="Add meal-time insulin">
                <div className="flex flex-col gap-4 mb-6 pt-2">
                    {/* Select type list */}
                    <button
                        onClick={() => setTypeSheetOpen(true)}
                        className="flex items-center justify-between border border-neutral-200 rounded-xl px-4 py-3.5 bg-white text-left focus:border-purple-300 transition-colors"
                    >
                        <span className={`text-[15px] ${type ? "text-neutral-800" : "text-neutral-500"}`}>
                            {type || "Select type of insulin"}
                        </span>
                        <PiCaretDown size={18} className="text-neutral-400" />
                    </button>

                    {/* Dosage input */}
                    <div className="flex items-center justify-between border border-neutral-200 rounded-xl px-4 py-3 bg-white focus-within:border-purple-300 transition-colors">
                        <input
                            type="number"
                            placeholder="Enter your insulin dosage"
                            className="bg-transparent outline-none w-full text-[15px] text-neutral-800 placeholder:text-neutral-500 appearance-none m-0"
                            value={dosage}
                            onChange={(e) => setDosage(e.target.value)}
                        />
                        <span className="text-[15px] text-neutral-500 shrink-0 ml-3">units</span>
                    </div>

                    <button className="flex items-center gap-2 mt-2 text-purple-600 font-semibold text-[14px] hover:text-purple-700 transition-colors">
                        Double check your Carbs here
                        <PiArrowRight size={16} />
                    </button>
                </div>

                <Button
                    variant="primary"
                    size="xl"
                    onClick={handleLog}
                    disabled={!type || !dosage}
                >
                    LOG INSULIN
                </Button>
            </BottomSheet>

            {/* Type selector sub-sheet */}
            <BottomSheet open={typeSheetOpen} onClose={() => setTypeSheetOpen(false)} title="Type of insulin">
                <div className="flex flex-col mb-4">
                    {INSULIN_TYPES.map((t, idx) => (
                        <button
                            key={t}
                            onClick={() => {
                                setType(t);
                                setTypeSheetOpen(false);
                            }}
                            className={`py-4 text-center text-[15px] font-semibold text-[#334155] border-b border-neutral-100 last:border-0 active:bg-neutral-50 transition-colors`}
                        >
                            {t}
                        </button>
                    ))}
                </div>
            </BottomSheet>
        </>
    );
}
