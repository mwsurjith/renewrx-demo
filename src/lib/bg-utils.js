export const BG_TYPES = [
    { id: "fasting", label: "Fasting" },
    { id: "breakfast", label: "Breakfast" },
    { id: "lunch", label: "Lunch" },
    { id: "dinner", label: "Dinner" },
];

export function getBGLogs() {
    if (typeof window === "undefined") return [];
    try {
        const stored = localStorage.getItem("bloodGlucoseLogs");
        return stored ? JSON.parse(stored) : [];
    } catch (e) {
        return [];
    }
}

export function saveBGLog(logData) {
    if (typeof window === "undefined") return [];
    try {
        const existing = getBGLogs();
        const newLog = {
            id: Date.now().toString(),
            createdAt: new Date().toISOString(),
            ...logData
        };
        const updated = [newLog, ...existing].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        localStorage.setItem("bloodGlucoseLogs", JSON.stringify(updated));
        return updated;
    } catch (e) {
        return [];
    }
}

export function updateBGLog(id, logData) {
    if (typeof window === "undefined") return [];
    try {
        const existing = getBGLogs();
        const updated = existing.map(log =>
            log.id === id ? { ...log, ...logData, updatedAt: new Date().toISOString() } : log
        );
        localStorage.setItem("bloodGlucoseLogs", JSON.stringify(updated));
        return updated;
    } catch (e) {
        return [];
    }
}

export function deleteBGLog(id) {
    if (typeof window === "undefined") return [];
    try {
        const existing = getBGLogs();
        const updated = existing.filter(log => log.id !== id);
        localStorage.setItem("bloodGlucoseLogs", JSON.stringify(updated));
        return updated;
    } catch (e) {
        return [];
    }
}

export function groupBGByDate(logs) {
    const grouped = {};
    for (const log of logs) {
        const dateObj = new Date(log.date || log.createdAt);
        const dateStr = dateObj.toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric'
        });

        if (!grouped[dateStr]) {
            grouped[dateStr] = [];
        }
        grouped[dateStr].push(log);
    }

    return Object.entries(grouped).map(([date, logs]) => ({
        date,
        logs: logs.sort((a, b) => {
            const timeA = new Date(`1970/01/01 ${a.time}`);
            const timeB = new Date(`1970/01/01 ${b.time}`);
            return timeB - timeA;
        })
    }));
}
