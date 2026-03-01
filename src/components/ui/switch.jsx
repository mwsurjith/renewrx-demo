"use client";

import React from "react";

/**
 * Switch Component
 * 
 * A premium-styled toggle switch.
 * 
 * @param {Object} props
 * @param {boolean} props.checked - Whether the switch is on
 * @param {Function} props.onChange - Callback when toggled
 * @param {string} props.className - Additional classes
 */
export default function Switch({ checked, onChange, className = "" }) {
    return (
        <button
            onClick={() => onChange?.(!checked)}
            className={`relative w-12 h-6.5 rounded-full transition-colors duration-200 outline-none p-1 ${checked ? "" : "bg-neutral-200"
                } ${className}`}
            style={checked ? {
                background: 'linear-gradient(225deg, rgba(87, 239, 195, 0.60) 0%, rgba(193, 127, 242, 0.60) 51.26%, rgba(255, 178, 0, 0.60) 100%)'
            } : {}}
        >
            <div
                className={`w-4.5 h-4.5 rounded-full shadow-sm bg-white transition-transform duration-200 ${checked ? "translate-x-5.5" : "translate-x-0"
                    }`}
            />
        </button>
    );
}
