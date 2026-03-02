"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/layout";
import { getNotifications, markAllAsRead } from "@/lib/notifications-utils";
import { PiBellZBold, PiWarningCircleFill, PiInfoFill, PiBellRingingFill } from "react-icons/pi";
import { Button } from "@/components/ui";

export default function NotificationsPage() {
    const router = useRouter();
    const [notifications, setNotifications] = useState([]);

    useEffect(() => {
        setNotifications(getNotifications());
        // Mark all as read as soon as the user enters this screen
        markAllAsRead();
    }, []);

    const formatDate = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
    };

    return (
        <div className="flex flex-col h-full bg-[#F8FAFC]">
            <AppHeader pageTitle="Notifications" onBack={() => router.back()} />

            <main className="flex-1 overflow-y-auto w-full px-5 py-6 flex flex-col gap-4">
                {notifications.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center pb-20">
                        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center border border-neutral-100 mb-6 shadow-sm">
                            <PiBellZBold size={48} className="text-neutral-300" />
                        </div>
                        <h3 className="text-lg font-bold text-neutral-800 mb-2">You're all caught up!</h3>
                        <p className="text-sm font-medium text-neutral-500 mb-8 max-w-[250px]">
                            Check back later for important alerts and messages from your care team.
                        </p>
                        <Button variant="secondary" onClick={() => router.back()}>
                            Return Home
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {notifications.map((notif, i) => {
                            const isSevere = notif.type === "severe";
                            const isMild = notif.type === "mild";

                            const IconClass = isSevere ? PiWarningCircleFill : isMild ? PiInfoFill : PiBellRingingFill;
                            const colorClass = isSevere ? "text-red-500" : isMild ? "text-orange-500" : "text-purple-600";
                            const bgIconClass = isSevere ? "bg-red-50" : isMild ? "bg-orange-50" : "bg-purple-50";

                            return (
                                <div key={notif.id} className="bg-white rounded-2xl p-4 shadow-[0_2px_8px_rgba(0,0,0,0.03)] border border-neutral-100 flex gap-4 transition-colors">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bgIconClass}`}>
                                        <IconClass size={24} className={colorClass} />
                                    </div>
                                    <div className="flex flex-col flex-1 pt-0.5 min-w-0">
                                        <div className="flex items-start justify-between gap-2 mb-1">
                                            <span className="text-[15px] font-bold text-neutral-800 tracking-tight leading-tight block">{notif.title}</span>
                                            <span className="text-[10px] font-bold text-neutral-400 whitespace-nowrap pt-0.5">{formatDate(notif.createdAt)}</span>
                                        </div>
                                        <p className="text-[13px] font-medium text-neutral-500 leading-snug">
                                            {notif.message}
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
