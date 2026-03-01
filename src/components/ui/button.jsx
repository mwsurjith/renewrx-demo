"use client";

import React from 'react';

/**
 * Button Component
 * 
 * A premium-styled button supporting multiple variants and sizes.
 * 
 * @param {Object} props
 * @param {React.ReactNode} props.children - Button content
 * @param {'primary' | 'secondary' | 'tertiary' | 'destructive' | 'link'} props.variant - Visual style
 * @param {'sm' | 'md' | 'lg' | 'xl'} props.size - Height variant
 * @param {string} props.className - Additional classes
 * @returns {JSX.Element}
 */
export default function Button({
    children,
    onClick,
    variant = "primary",
    size = "md",
    className = "",
    ...props
}) {
    const sizeConfig = {
        sm: { outer: "h-8", inner: "h-7", px: "px-4", text: "text-xs" },
        md: { outer: "h-10", inner: "h-9", px: "px-6", text: "text-sm" },
        lg: { outer: "h-12", inner: "h-11", px: "px-6", text: "text-base" },
        xl: { outer: "h-14", inner: "h-[52px]", px: "px-8", text: "text-base" },
    };

    const config = sizeConfig[size] || sizeConfig.md;

    // Primary: Full gradient background
    if (variant === "primary") {
        return (
            <button
                onClick={onClick}
                className={`flex w-full items-center justify-center rounded-full font-semibold text-neutral-950 tracking-[0.2px] uppercase transition-all duration-200 active:scale-98 hover:shadow-md ${config.outer} ${config.px} ${config.text} ${className}`}
                style={{
                    backgroundImage: "linear-gradient(190deg, rgba(87,239,195,0.6), rgba(193,127,242,0.6) 51%, rgba(255,178,0,0.6))",
                }}
                {...props}
            >
                {children}
            </button>
        );
    }

    // Secondary: Gradient border with white background
    if (variant === "secondary") {
        return (
            <button
                className={`group flex w-full items-center justify-center p-[2px] rounded-full font-semibold whitespace-nowrap transition-all duration-200 active:scale-98 ${config.outer} ${className}`}
                style={{
                    background: 'linear-gradient(225deg, rgba(87, 239, 195, 0.60) 0%, rgba(193, 127, 242, 0.60) 51.26%, rgba(255, 178, 0, 0.60) 100%), #FFF'
                }}
                onClick={onClick}
                {...props}
            >
                <div className={`flex items-center justify-center rounded-full bg-white w-full h-full text-neutral-950 tracking-[0.2px] uppercase transition-colors duration-200 group-hover:bg-neutral-50 ${config.inner} ${config.px} ${config.text}`}>
                    {children}
                </div>
            </button>
        );
    }

    // Destructive: Red background with red text
    if (variant === "destructive") {
        return (
            <button
                onClick={onClick}
                className={`flex w-full items-center justify-center bg-red-50 hover:bg-red-100 active:scale-98 transition-all rounded-full font-bold text-red-500 tracking-[0.2px] uppercase ${config.outer} ${config.px} ${config.text} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }

    // Link: Just text, no background
    if (variant === "link") {
        return (
            <button
                onClick={onClick}
                className={`flex items-center justify-center font-bold text-purple-600 hover:text-purple-700 active:scale-95 transition-all uppercase ${config.text} ${className}`}
                {...props}
            >
                {children}
            </button>
        );
    }

    // Tertiary: Neutral gray background
    return (
        <button
            onClick={onClick}
            className={`flex w-full items-center justify-center bg-neutral-100 hover:bg-neutral-200 active:scale-98 transition-all rounded-full font-bold text-neutral-800 tracking-[0.2px] uppercase ${config.outer} ${config.px} ${config.text} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}
