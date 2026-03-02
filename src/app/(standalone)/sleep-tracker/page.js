"use client";

import { Suspense } from "react";
import SleepDetailScreen from "@/components/screens/sleep-detail-screen";

export default function SleepTrackerPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><p className="text-neutral-400">Loading…</p></div>}>
            <SleepDetailScreen />
        </Suspense>
    );
}
