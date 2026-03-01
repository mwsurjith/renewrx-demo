"use client";

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from "motion/react";
import { PiX } from "react-icons/pi";

/**
 * BottomSheet Component
 * 
 * A reusable animated bottom sheet with backdrop overlay.
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether the sheet is visible
 * @param {Function} props.onClose - Close callback
 * @param {string} props.title - Sheet title
 * @param {React.ReactNode} props.children - Sheet body content
 * @param {number} props.zIndex - Base z-index (default 100)
 */
export default function BottomSheet({ open, onClose, title, children, zIndex = 100 }) {

    // Lock body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [open]);

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        className="fixed inset-0"
                        style={{ zIndex, backgroundColor: "rgba(0,0,0,0.3)" }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        className="fixed bottom-0 left-0 right-0 flex justify-center"
                        style={{ zIndex: zIndex + 1 }}
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 28, stiffness: 300 }}
                    >
                        <div className="w-full max-w-md bg-white rounded-t-2xl max-h-[90vh] overflow-y-auto font-sans">
                            <div className="pt-6 pb-8">
                                {/* Header */}
                                <div className="px-6 flex items-center justify-between mb-6 border-b pb-4">
                                    <h2 className="text-lg text-neutral-800 font-semibold">
                                        {title}
                                    </h2>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-neutral-50 active:bg-neutral-100 transition-colors"
                                    >
                                        <PiX size={18} className="text-neutral-800" />
                                    </button>
                                </div>

                                {/* Body */}
                                <div className='px-6'>
                                    {children}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
