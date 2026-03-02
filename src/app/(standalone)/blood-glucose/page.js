"use client";

import { Suspense } from "react";
import BGDetailScreen from "@/components/screens/bg-detail-screen";

export default function BloodGlucosePage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><p className="text-neutral-400">Loading…</p></div>}>
            <BGDetailScreen />
        </Suspense>
    );
}
