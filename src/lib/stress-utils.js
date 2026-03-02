/**
 * stress-utils.js
 * 
 * Mock stress/HRV data layer using localStorage.
 * Generates realistic HRV, Resting Heart Rate, and perceived stress entries for demo purposes.
 */

const STORAGE_KEY = "renewrx_stress_logs";

// ─── CRUD ─────────────────────────────────────────────────────────────

export function getStressLogs() {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch { return []; }
}

export function saveStressLog(entry) {
    const logs = getStressLogs();
    const newEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        createdAt: new Date().toISOString(),
        ...entry,
    };
    logs.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    return logs;
}

export function updateStressLog(id, updates) {
    const logs = getStressLogs().map(l => l.id === id ? { ...l, ...updates } : l);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    return logs;
}

export function deleteStressLog(id) {
    const logs = getStressLogs().filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    return logs;
}

export function getStressForDate(dateStr) {
    return getStressLogs().filter(l => l.date === dateStr);
}

export function getLatestStress() {
    const logs = getStressLogs();
    return logs.length > 0 ? logs[0] : null;
}

// ─── Grouping ─────────────────────────────────────────────────────────

export function groupStressByDate(logs) {
    const groups = {};
    logs.forEach(log => {
        const dateKey = log.date || new Date(log.createdAt).toISOString().split("T")[0];
        if (!groups[dateKey]) groups[dateKey] = [];
        groups[dateKey].push(log);
    });

    return Object.entries(groups)
        .sort(([a], [b]) => b.localeCompare(a))
        .map(([date, entries]) => ({
            date: formatDateLabel(date),
            dateRaw: date,
            entries,
        }));
}

function formatDateLabel(dateStr) {
    const d = new Date(dateStr + "T12:00:00");
    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const diff = Math.round((today - d) / 86400000);
    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

// ─── Level Helpers ────────────────────────────────────────────────────

export function getStressLevel(log) {
    if (log.source === "phone" || log.source === "camera") {
        // Evaluate based on HRV (higher is better) — for Apple Health or PPG camera
        if (log.hrv >= 60) return { label: "Relaxed", color: "text-green-600", bg: "bg-green-50" };
        if (log.hrv >= 40) return { label: "Balanced", color: "text-amber-600", bg: "bg-amber-50" };
        return { label: "Elevated", color: "text-red-500", bg: "bg-red-50" };
    } else {
        // Manual perceived stress (1: Very Calm to 5: Very Stressed)
        if (log.stressLevel <= 2) return { label: "Relaxed", color: "text-green-600", bg: "bg-green-50" };
        if (log.stressLevel === 3) return { label: "Neutral", color: "text-amber-600", bg: "bg-amber-50" };
        return { label: "Stressed", color: "text-red-500", bg: "bg-red-50" };
    }
}

// ─── Mock Data Generator ──────────────────────────────────────────────

export function generateAppleHealthSyncedStressReadings() {
    const today = new Date();
    const logs = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];

        // HRV is highly variable, usually between 20-100ms
        const hrv = 30 + Math.floor(Math.random() * 50);
        // Resting HR is usually 50-80bpm
        const rhr = 55 + Math.floor(Math.random() * 20);

        const hour = 8 + Math.floor(Math.random() * 12);
        const minute = Math.floor(Math.random() * 60);

        logs.push({
            id: `ah_stress_${dateStr}`,
            date: dateStr,
            createdAt: d.toISOString(),
            hrv,
            rhr,
            time: `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`,
            source: "phone", // Apple Health
        });
    }

    return logs;
}
