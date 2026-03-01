"use client";

import { Suspense } from "react";
import BPDetailScreen from "@/components/screens/bp-detail-screen";

export default function BloodPressurePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><p className="text-neutral-400">Loading…</p></div>}>
            <BPDetailScreen />
        </Suspense>
    );
}
