"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "../layout";
import { PiCopy, PiHeartFill } from "react-icons/pi";
import { getIHealthConnected, setIHealthConnected } from "@/lib/bp-utils";
import { getAppleHealthConnected, setAppleHealthConnected } from "@/lib/sleep-utils";

export default function DeviceManagementScreen() {
    const router = useRouter();
    const [ahConnected, setAhConnected] = useState(false);
    const [iHealthConnected, setIHealthState] = useState(false);

    useEffect(() => {
        setAhConnected(getAppleHealthConnected());
        setIHealthState(getIHealthConnected());
    }, []);

    const handleRemoveAH = () => {
        setAppleHealthConnected(false);
        setAhConnected(false);
    };

    const handleRemoveIHealth = () => {
        setIHealthConnected(false);
        setIHealthState(false);
    };

    const connections = [
        {
            id: 'apple_health',
            name: 'Apple Health',
            type: 'app',
            connected: ahConnected,
            icon: <PiHeartFill size={24} className="text-[#ff3b30]" />,
            details: [
                { label: "Permissions", value: "Read Sleep & Stress Data" }
            ],
            onRemove: handleRemoveAH
        },

        {
            id: 'ihealth',
            name: 'iHealth Neo Wireless',
            brand: 'iHealth',
            type: 'device',
            connected: iHealthConnected,
            image: "https://ihealthlabs.com/cdn/shop/files/Neo_60ad73cc-ee77-4bdf-bf89-f5df4b93378f.png?v=1719337375",
            onRemove: handleRemoveIHealth
        }
    ];

    const apps = connections.filter(c => c.type === 'app');
    const devices = connections.filter(c => c.type === 'device');

    const renderCard = (item) => {
        const isConnected = item.connected || item.customStatus;
        if (!isConnected) {
            return (
                <div key={item.id} className="border border-neutral-200 rounded-2xl p-4 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center justify-between opacity-60">
                    <div className="flex items-center gap-2">
                        {item.icon && <div className="w-8 h-8 rounded-lg bg-neutral-50 flex items-center justify-center border border-neutral-100">{item.icon}</div>}
                        <span className="text-[#2D3F58] font-bold text-base">{item.name}</span>
                    </div>
                    <span className="text-sm font-medium text-neutral-500">Not Connected</span>
                </div>
            );
        }

        return (
            <div key={item.id} className="border border-neutral-200 rounded-2xl p-4 bg-white shadow-[0_2px_8px_rgba(0,0,0,0.02)]">
                <div className="flex items-center justify-between mb-4 border-b border-neutral-100 pb-4">
                    <div className="flex items-center gap-1.5">
                        {item.icon ? (
                            <div className="flex items-center gap-2">
                                {item.icon}
                                <span className="text-[#2D3F58] font-bold tracking-tighter text-lg">{item.name}</span>
                            </div>
                        ) : item.brand === 'iHealth' ? (
                            <span className="text-orange-500 font-bold tracking-tighter text-lg">iHealth<span className="text-[8px] align-super">&reg;</span></span>
                        ) : (
                            <span className="text-base text-[#2D3F58] font-bold tracking-tight">{item.name}</span>
                        )}
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className={`w-2.5 h-2.5 rounded-full ${item.customStatusColor || 'bg-emerald-500'}`}></div>
                        <span className="text-sm font-bold text-[#2D3F58]">{item.customStatus || 'Connected'}</span>
                    </div>
                </div>

                {item.image && (
                    <div className="flex items-center gap-4 mb-5">
                        <div className="w-10 h-10 rounded-lg bg-neutral-50 flex items-center justify-center shrink-0 border border-neutral-100 shadow-sm">
                            <img src={item.image} alt={item.name} className="w-full h-full object-contain p-1.5 opacity-80 mix-blend-multiply" />
                        </div>
                        <h3 className="text-base text-[#2D3F58] font-bold tracking-tight flex-1">
                            {item.name}
                        </h3>
                    </div>
                )}

                {item.details && item.details.map((detail, idx) => (
                    <div key={idx} className={`mb-4 ${detail.copyable ? 'border-b border-neutral-100 pb-4 flex items-end justify-between' : ''}`}>
                        <div>
                            <p className="text-xs text-neutral-500 mb-0.5">{detail.label}</p>
                            <p className="text-sm font-bold text-[#2D3F58]">{detail.value}</p>
                        </div>
                        {detail.copyable && (
                            <button className="w-8 h-8 flex items-center justify-center hover:bg-neutral-50 rounded-md transition-colors">
                                <PiCopy size={20} className="text-[#2D3F58]" />
                            </button>
                        )}
                    </div>
                ))}

                {(item.connected || item.customStatus) && (
                    <button onClick={item.onRemove} className="w-full h-12 rounded-xl font-bold text-red-500 bg-red-50 hover:bg-red-100 transition-colors uppercase tracking-wide text-[13px] mt-2">
                        REMOVE CONNECTION
                    </button>
                )}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-neutral-50 font-sans">
            <AppHeader
                pageTitle="Device Management"
                onBack={() => router.back()}
            />

            <div className="flex-1 overflow-y-auto px-6 py-6 pb-20">
                <div className="mb-8">
                    <p className="text-sm font-medium text-neutral-600 tracking-tight mb-3">Health Apps:</p>
                    <div className="flex flex-col gap-3">
                        {apps.map(renderCard)}
                    </div>
                </div>

                <div className="mb-8">
                    <p className="text-sm font-medium text-neutral-600 tracking-tight mb-3">Paired Devices:</p>
                    <div className="flex flex-col gap-3">
                        {devices.map(renderCard)}
                    </div>
                </div>
            </div>
        </div>
    );
}
