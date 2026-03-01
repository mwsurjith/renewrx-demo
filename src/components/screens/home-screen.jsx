"use client"

import { NourishedNotebook, BloodPressureWidget } from "../widget";

export default function HomeScreen() {
    return (
        <div className="flex flex-col w-full p-6 gap-8 pb-12">
            <NourishedNotebook />
            <BloodPressureWidget />
        </div>
    );
}