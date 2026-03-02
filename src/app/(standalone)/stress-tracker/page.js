"use client";

import { Suspense } from "react";
import StressDetailScreen from "@/components/screens/stress-detail-screen";

export default function StressTrackerPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><p className="text-neutral-400">Loading…</p></div>}>
            <StressDetailScreen />
        </Suspense>
    );
}
