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

// ─── Dexcom Connection State ──────────────────────────────────────────────

export function getDexcomConnected() {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("dexcomConnected") === "true";
}

export function setDexcomConnected(value) {
    if (typeof window === "undefined") return;
    localStorage.setItem("dexcomConnected", value ? "true" : "false");
}

export function generateCGMSyncedReadings() {
    if (typeof window === "undefined") return [];

    const now = new Date();
    const dateStr = now.toISOString().split("T")[0];
    const formatTime = (d) => `${d.getHours().toString().padStart(2, "0")}:${d.getMinutes().toString().padStart(2, "0")}`;

    let wakeTimeStr = "08:00"; // default
    try {
        const sleeps = JSON.parse(localStorage.getItem("renewrx_sleep_logs") || "[]");
        const todaysSleep = sleeps.find(s => {
            const sDate = s.date || new Date(s.createdAt).toISOString().split("T")[0];
            return sDate === dateStr;
        });
        if (todaysSleep && todaysSleep.wakeTime) {
            wakeTimeStr = todaysSleep.wakeTime;
        }
    } catch (e) { }

    const mockReadings = [];
    mockReadings.push({
        date: dateStr,
        time: wakeTimeStr,
        value: 140, // Match the screenshot
        unit: "mg/dL",
        typeId: "fasting",
        typeLabel: "Fasting",
        source: "cgm"
    });

    try {
        const meals = JSON.parse(localStorage.getItem("renewrx_meal_logs") || "[]");
        const todaysMeals = meals.filter(m => {
            const mDate = m.date ? m.date : new Date(m.createdAt).toISOString().split("T")[0];
            return mDate === dateStr;
        });

        todaysMeals.forEach(meal => {
            if (meal.time) {
                const [h, m] = meal.time.split(":");
                const mealDate = new Date(now);
                mealDate.setHours(parseInt(h, 10), parseInt(m, 10), 0, 0);
                mealDate.setHours(mealDate.getHours() + 1);

                mockReadings.push({
                    date: dateStr,
                    time: formatTime(mealDate),
                    value: Math.floor(Math.random() * (160 - 110 + 1) + 110),
                    unit: "mg/dL",
                    typeId: meal.mealType || "snack",
                    typeLabel: meal.mealType ? meal.mealType.charAt(0).toUpperCase() + meal.mealType.slice(1) : "Meal",
                    ppPhase: "1h PP",
                    source: "cgm"
                });
            }
        });
    } catch (e) { }

    const existingLogs = getBGLogs();

    // Clear previously generated cgm logs for today to prevent duplicates
    const filteredExisting = existingLogs.filter(log => {
        const lDate = log.date || new Date(log.createdAt).toISOString().split("T")[0];
        if (log.source === "cgm" && lDate === dateStr) return false;
        return true;
    });

    let newLogs = [...filteredExisting];

    mockReadings.forEach(log => {
        newLogs = [{
            id: `cgm_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
            createdAt: now.toISOString(),
            ...log
        }, ...newLogs];
    });

    localStorage.setItem("bloodGlucoseLogs", JSON.stringify(newLogs));
    return newLogs;
}
