"use client";

import React from 'react';
import { PiInfo, PiArrowsClockwise } from 'react-icons/pi';

export default function CGMChart({ currentReading = 157, lastUpdated = "Jun 7, 9:30 AM" }) {
    return (
        <div className="mt-8 flex flex-col gap-4">
            <div className="flex items-center gap-1.5">
                <h3 className="text-lg font-bold text-[#2D264B] tracking-tight">CGM</h3>
                <PiInfo size={16} className="text-neutral-500" />
            </div>

            <div className="bg-white rounded-[24px] border border-neutral-100 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden">
                {/* Header inside Chart Card */}
                <div className="p-5 pb-0 flex items-start justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-5 h-5 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                            <div className="w-2.5 h-2.5 rounded-full bg-purple-400"></div>
                        </div>
                        <div className="flex flex-col">
                            <div className="flex items-baseline gap-1">
                                <span className={`text-[28px] font-bold tracking-tight ${currentReading > 140 ? 'text-red-500' : currentReading < 70 ? 'text-blue-500' : 'text-[#2EBD25]'}`}>{currentReading}</span>
                                <span className="text-sm font-medium text-neutral-500">mg/dL</span>
                            </div>
                            <span className="text-xs text-neutral-500 tracking-tight">{lastUpdated}</span>
                        </div>
                    </div>

                    <button className="text-neutral-800 hover:opacity-70 transition-opacity">
                        <PiArrowsClockwise size={24} />
                    </button>
                </div>

                {/* Legends */}
                <div className="flex flex-wrap items-center justify-center gap-6 mt-6 mb-2">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-red-400"></div>
                        <span className="text-xs font-bold text-neutral-600">High</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-[#2EBD25]"></div>
                        <span className="text-xs font-bold text-neutral-600">In-range</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded bg-blue-400"></div>
                        <span className="text-xs font-bold text-neutral-600">Low</span>
                    </div>
                </div>

                {/* SVG Chart */}
                <div className="relative w-full h-[220px] mt-2 select-none pointer-events-none">
                    <svg viewBox="0 0 400 220" preserveAspectRatio="none" className="w-full h-full">
                        <defs>
                            <clipPath id="lowClip">
                                <rect x="0" y="180" width="400" height="40" />
                            </clipPath>
                            <clipPath id="highClip">
                                <rect x="0" y="0" width="400" height="40" />
                            </clipPath>
                        </defs>

                        {/* Target Range Background Area */}

                        {/* Define Y range for 60 to 140 (pixel 40 to 180) */}
                        <rect x="0" y="40" width="400" height="140" fill="rgba(87,239,195,0.08)" />

                        {/* Out of bound / Meal window vertical highlight overlay */}
                        <rect x="180" y="0" width="80" height="220" fill="rgba(244,113,113,0.06)" />

                        {/* Dashed Threshold Lines */}
                        <line x1="0" y1="40" x2="400" y2="40" stroke="#C17FF2" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                        <line x1="0" y1="180" x2="400" y2="180" stroke="#C17FF2" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

                        {/* Axis Labels (Fake) */}
                        <text x="375" y="32" fontSize="12" fill="#888">140</text>
                        <text x="375" y="195" fontSize="12" fill="#888">60</text>

                        {/* The perfectly matched smooth path. Colors are applied by re-rendering with clip paths */}
                        <path d="M 30,40 C 50,90 70,130 90,130 C 110,130 115,185 130,185 C 145,185 145,185 160,185 C 175,185 180,130 190,130 C 200,130 205,100 220,100 C 235,100 235,110 250,110 C 265,110 270,30 280,30 C 290,30 295,60 305,60 C 315,60 325,140 340,140 C 355,140 355,120 365,120 C 375,120 380,120 400,120" fill="none" stroke="#2EBD25" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M 30,40 C 50,90 70,130 90,130 C 110,130 115,185 130,185 C 145,185 145,185 160,185 C 175,185 180,130 190,130 C 200,130 205,100 220,100 C 235,100 235,110 250,110 C 265,110 270,30 280,30 C 290,30 295,60 305,60 C 315,60 325,140 340,140 C 355,140 355,120 365,120 C 375,120 380,120 400,120" fill="none" stroke="#3B82F6" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#lowClip)" />
                        <path d="M 30,40 C 50,90 70,130 90,130 C 110,130 115,185 130,185 C 145,185 145,185 160,185 C 175,185 180,130 190,130 C 200,130 205,100 220,100 C 235,100 235,110 250,110 C 265,110 270,30 280,30 C 290,30 295,60 305,60 C 315,60 325,140 340,140 C 355,140 355,120 365,120 C 375,120 380,120 400,120" fill="none" stroke="#EF4444" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" clipPath="url(#highClip)" />

                        {/* Nodes */}
                        <circle cx="90" cy="130" r="5" fill="white" stroke="#2EBD25" strokeWidth="3" />
                        <circle cx="130" cy="185" r="5" fill="white" stroke="#3B82F6" strokeWidth="3" />
                        <circle cx="160" cy="185" r="5" fill="white" stroke="#3B82F6" strokeWidth="3" />
                        <circle cx="190" cy="130" r="5" fill="white" stroke="#2EBD25" strokeWidth="3" />
                        <circle cx="220" cy="100" r="5" fill="white" stroke="#2EBD25" strokeWidth="3" />
                        <circle cx="250" cy="110" r="5" fill="white" stroke="#2EBD25" strokeWidth="3" />
                        <circle cx="280" cy="30" r="5" fill="white" stroke="#EF4444" strokeWidth="3" />
                        <circle cx="305" cy="60" r="5" fill="white" stroke="#2EBD25" strokeWidth="3" />
                        <circle cx="340" cy="140" r="5" fill="white" stroke="#2EBD25" strokeWidth="3" />
                        <circle cx="365" cy="120" r="5" fill="white" stroke="#2EBD25" strokeWidth="3" />
                    </svg>

                    {/* X Axis Overlay text */}
                    <div className="absolute bottom-[2px] left-0 w-[400px] flex justify-between px-[50px]">
                        <span className="text-xs text-neutral-500 font-medium ml-2">9 am</span>
                        <span className="text-xs text-neutral-500 font-medium ml-4">12 pm</span>
                        <span className="text-xs text-neutral-500 font-medium mr-[50px]">3 pm</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
