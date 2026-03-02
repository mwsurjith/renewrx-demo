/**
 * sleep-utils.js
 * 
 * Mock sleep data layer using localStorage.
 * Generates realistic sleep entries for demo purposes.
 */

const STORAGE_KEY = "renewrx_sleep_logs";

// ─── CRUD ─────────────────────────────────────────────────────────────

export function getSleepLogs() {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    } catch { return []; }
}

export function saveSleepLog(entry) {
    const logs = getSleepLogs();
    const newEntry = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        createdAt: new Date().toISOString(),
        ...entry,
    };
    logs.unshift(newEntry);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    return logs;
}

export function saveSleepLogs(newLogs) {
    const existing = getSleepLogs();
    const merged = [...newLogs, ...existing];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
    return merged;
}

// ─── Apple Health Connection State ────────────────────────────────────

const APPLE_HEALTH_KEY = "renewrx_apple_health_connected";

export function getAppleHealthConnected() {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(APPLE_HEALTH_KEY) === "true";
}

export function setAppleHealthConnected(connected) {
    localStorage.setItem(APPLE_HEALTH_KEY, connected ? "true" : "false");
}


export function updateSleepLog(id, updates) {
    const logs = getSleepLogs().map(l => l.id === id ? { ...l, ...updates } : l);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    return logs;
}

export function deleteSleepLog(id) {
    const logs = getSleepLogs().filter(l => l.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
    return logs;
}

export function getSleepForDate(dateStr) {
    return getSleepLogs().filter(l => l.date === dateStr);
}

export function getLatestSleep() {
    const logs = getSleepLogs();
    return logs.length > 0 ? logs[0] : null;
}

// ─── Grouping ─────────────────────────────────────────────────────────

export function groupSleepByDate(logs) {
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

// ─── Score Helpers ────────────────────────────────────────────────────

export function getSleepScoreLabel(score) {
    if (score >= 85) return { label: "Excellent", color: "text-green-600", bg: "bg-green-50" };
    if (score >= 70) return { label: "Good", color: "text-blue-600", bg: "bg-blue-50" };
    if (score >= 50) return { label: "Fair", color: "text-amber-600", bg: "bg-amber-50" };
    return { label: "Poor", color: "text-red-500", bg: "bg-red-50" };
}

export function formatDuration(minutes) {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h}h ${m}m`;
}

// ─── Mock Data Generator ──────────────────────────────────────────────

export function generateAppleHealthSyncedReadings() {
    const today = new Date();
    const logs = [];

    for (let i = 0; i < 7; i++) {
        const d = new Date(today);
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split("T")[0];

        const duration = 360 + Math.floor(Math.random() * 120); // 6h-8h in minutes
        const score = 55 + Math.floor(Math.random() * 40); // 55-95
        const deep = 15 + Math.floor(Math.random() * 15);
        const rem = 18 + Math.floor(Math.random() * 12);
        const awake = 3 + Math.floor(Math.random() * 8);
        const light = 100 - deep - rem - awake;

        const bedHour = 21 + Math.floor(Math.random() * 3); // 9pm-11pm
        const bedMin = Math.floor(Math.random() * 60);
        const wakeHour = 5 + Math.floor(Math.random() * 3); // 5am-7am
        const wakeMin = Math.floor(Math.random() * 60);

        logs.push({
            id: `ah_${dateStr}`,
            date: dateStr,
            createdAt: d.toISOString(),
            duration,
            score,
            bedtime: `${bedHour.toString().padStart(2, "0")}:${bedMin.toString().padStart(2, "0")}`,
            wakeTime: `${wakeHour.toString().padStart(2, "0")}:${wakeMin.toString().padStart(2, "0")}`,
            stages: { deep, light, rem, awake },
            source: "phone",
        });
    }

    return logs;
}

