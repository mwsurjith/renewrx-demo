"use client"

import { NourishedNotebook, BloodPressureWidget, SleepTrackerWidget, StressTrackerWidget, GlucoseTrackerWidget } from "../widget";
import { useDeveloper } from "@/context/developer-context";

export default function HomeScreen() {
    const { toggles } = useDeveloper();

    return (
        <div className="flex flex-col w-full p-6 gap-8 pb-12">
            {toggles.nourishNotebook && <NourishedNotebook />}
            {toggles.bloodPressure && <BloodPressureWidget />}
            {toggles.bloodGlucose && <GlucoseTrackerWidget />}
            {toggles.sleepTracking && <SleepTrackerWidget />}
            {toggles.stressTracking && <StressTrackerWidget />}
        </div>
    );
}