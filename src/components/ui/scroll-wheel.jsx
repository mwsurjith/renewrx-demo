"use client";

import React, { useRef, useCallback } from 'react';

/**
 * ScrollWheel Component
 * 
 * A drag-to-scroll vertical number picker. Shows the selected value
 * with neighbors above and below for context.
 * 
 * @param {Object} props
 * @param {number} props.value - Current selected value
 * @param {Function} props.onChange - Callback when value changes
 * @param {number} props.min - Minimum value (default 40)
 * @param {number} props.max - Maximum value (default 250)
 * @param {string} props.color - Accent color for the selected value
 */
export default function ScrollWheel({ value, onChange, min = 40, max = 250, color }) {
    const isDragging = useRef(false);
    const startY = useRef(0);
    const startValue = useRef(value);

    const clamp = (v) => Math.min(max, Math.max(min, v));

    const handlePointerDown = useCallback((e) => {
        isDragging.current = true;
        startY.current = e.clientY;
        startValue.current = value;
        e.target.setPointerCapture(e.pointerId);
    }, [value]);

    const handlePointerMove = useCallback((e) => {
        if (!isDragging.current) return;
        const dy = startY.current - e.clientY;
        const dv = Math.round(dy / 22);
        const newVal = clamp(startValue.current + dv);
        if (newVal !== value) onChange(newVal);
    }, [value, onChange, min, max]);

    const handlePointerUp = useCallback(() => {
        isDragging.current = false;
    }, []);

    return (
        <div
            className="flex flex-col items-center select-none touch-none cursor-grab active:cursor-grabbing"
            onPointerDown={handlePointerDown}
            onPointerMove={handlePointerMove}
            onPointerUp={handlePointerUp}
            onPointerCancel={handlePointerUp}
            style={{ width: 90 }}
        >
            {/* Previous value */}
            <div className="h-11 flex items-center justify-center">
                <span className="text-[22px] text-neutral-300 tabular-nums font-medium">
                    {clamp(value - 1)}
                </span>
            </div>

            {/* Selected value */}
            <div className="h-[52px] flex items-center justify-center relative">
                <div className="absolute inset-x-0 top-0 h-px bg-neutral-200" />
                <span
                    className="text-[30px] font-semibold tabular-nums transition-colors duration-200"
                    style={{ color }}
                >
                    {value}
                </span>
                <div className="absolute inset-x-0 bottom-0 h-px bg-neutral-200" />
            </div>

            {/* Next value */}
            <div className="h-11 flex items-center justify-center">
                <span className="text-[22px] text-neutral-300 tabular-nums font-medium">
                    {clamp(value + 1)}
                </span>
            </div>
        </div>
    );
}
