"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PiBellRingingFill, PiXBold, PiWarningCircleFill, PiInfoFill } from "react-icons/pi";
import { AnimatePresence, motion } from "motion/react";

export default function NotificationToast() {
    const [toast, setToast] = useState(null);
    const router = useRouter();

    useEffect(() => {
        const handleNewNotification = (e) => {
            const notif = e.detail;
            setToast(notif);

            // Auto dismiss after 5 seconds
            setTimeout(() => {
                setToast(prev => prev?.id === notif.id ? null : prev);
            }, 5000);
        };

        window.addEventListener("new-notification", handleNewNotification);
        return () => window.removeEventListener("new-notification", handleNewNotification);
    }, []);

    if (!toast) return null;

    const Icon = toast.type === "severe" ? PiWarningCircleFill :
        toast.type === "mild" ? PiInfoFill : PiBellRingingFill;

    const iconColor = toast.type === "severe" ? "text-red-500" :
        toast.type === "mild" ? "text-orange-500" : "text-purple-600";

    const bgColor = toast.type === "severe" ? "bg-red-50" :
        toast.type === "mild" ? "bg-orange-50" : "bg-purple-50";

    return (
        <AnimatePresence>
            <motion.div
                initial={{ y: -100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -100, opacity: 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 25 }}
                className="fixed top-6 left-4 right-4 z-[999]"
            >
                <div
                    onClick={() => {
                        setToast(null);
                        router.push("/notifications");
                    }}
                    className="bg-white rounded-[20px] max-w-sm mx-auto shadow-[0_8px_30px_rgba(0,0,0,0.12)] p-4 pr-12 flex gap-4 cursor-pointer relative border border-neutral-100/50"
                >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center shrink-0 ${bgColor}`}>
                        <Icon size={24} className={iconColor} />
                    </div>
                    <div className="flex flex-col pt-0.5">
                        <span className="text-sm font-bold text-neutral-800 tracking-tight leading-tight">{toast.title}</span>
                        <span className="text-xs font-medium text-neutral-500 mt-1 line-clamp-2 leading-snug">{toast.message}</span>
                    </div>

                    <button
                        className="absolute right-4 top-4 p-1 rounded-full text-neutral-400 hover:bg-neutral-100"
                        onClick={(e) => {
                            e.stopPropagation();
                            setToast(null);
                        }}
                    >
                        <PiXBold size={14} />
                    </button>
                </div>
            </motion.div>
        </AnimatePresence>
    );
}
