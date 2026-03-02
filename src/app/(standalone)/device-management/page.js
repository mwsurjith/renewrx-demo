"use client";

import { Suspense } from "react";
import DeviceManagementScreen from "@/components/screens/device-management-screen";

export default function DeviceManagementPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center h-full"><p className="text-neutral-400">Loading…</p></div>}>
            <DeviceManagementScreen />
        </Suspense>
    );
}
