/**
 * Blood Pressure Utilities
 * 
 * Classification logic based on AHA 2017 guidelines.
 * localStorage helpers for persisting BP readings.
 */

const BP_STORAGE_KEY = "renewrx_bp_readings";

// ─── Classification Tables ──────────────────────────────────────────

export const BP_COLOR_LOGIC = {
    systolic: [
        { label: "Hypotension", min: 0, max: 89, color: "#3B82F6", textColor: "#FFFFFF", severity: 1, snap: 7.5 },
        { label: "Normal", min: 90, max: 119, color: "#22C55E", textColor: "#FFFFFF", severity: 0, snap: 25 },
        { label: "Elevated", min: 120, max: 129, color: "#EAB308", textColor: "#000000", severity: 2, snap: 45 },
        { label: "Stage 1 HTN", min: 130, max: 139, color: "#F97316", textColor: "#FFFFFF", severity: 3, snap: 63.5 },
        { label: "Stage 2 HTN", min: 140, max: 179, color: "#EF4444", textColor: "#FFFFFF", severity: 4, snap: 80 },
        { label: "HTN Crisis", min: 180, max: 999, color: "#7F1D1D", textColor: "#FFFFFF", severity: 5, snap: 94 },
    ],
    diastolic: [
        { label: "Hypotension", min: 0, max: 59, color: "#3B82F6", textColor: "#FFFFFF", severity: 1, snap: 7.5 },
        { label: "Normal", min: 60, max: 79, color: "#22C55E", textColor: "#FFFFFF", severity: 0, snap: 25 },
        { label: "Elevated", min: 80, max: 84, color: "#EAB308", textColor: "#000000", severity: 2, snap: 45 },
        { label: "Stage 1 HTN", min: 85, max: 89, color: "#F97316", textColor: "#FFFFFF", severity: 3, snap: 63.5 },
        { label: "Stage 2 HTN", min: 90, max: 119, color: "#EF4444", textColor: "#FFFFFF", severity: 4, snap: 80 },
        { label: "HTN Crisis", min: 120, max: 999, color: "#7F1D1D", textColor: "#FFFFFF", severity: 5, snap: 94 },
    ],
    pulse: [
        { label: "Bradycardia", min: 0, max: 49, color: "#EF4444", textColor: "#FFFFFF" },
        { label: "Low Normal", min: 50, max: 59, color: "#EAB308", textColor: "#000000" },
        { label: "Normal", min: 60, max: 100, color: "#22C55E", textColor: "#FFFFFF" },
        { label: "Tachycardia", min: 101, max: 119, color: "#F97316", textColor: "#FFFFFF" },
        { label: "Severe Tachycardia", min: 120, max: 999, color: "#7F1D1D", textColor: "#FFFFFF" },
    ],
};

// ─── Status Helpers ─────────────────────────────────────────────────

export function getSystolicStatus(val) {
    return BP_COLOR_LOGIC.systolic.find(r => val >= r.min && val <= r.max) || BP_COLOR_LOGIC.systolic[1];
}

export function getDiastolicStatus(val) {
    return BP_COLOR_LOGIC.diastolic.find(r => val >= r.min && val <= r.max) || BP_COLOR_LOGIC.diastolic[1];
}

export function getPulseStatus(val) {
    return BP_COLOR_LOGIC.pulse.find(r => val >= r.min && val <= r.max) || BP_COLOR_LOGIC.pulse[2];
}

export function getOverallStatus(systolic, diastolic) {
    const s = getSystolicStatus(systolic);
    const d = getDiastolicStatus(diastolic);
    return s.severity >= d.severity ? s : d;
}

// ─── Display Helpers ────────────────────────────────────────────────

export function getValueColor(statusLabel) {
    if (statusLabel === "Normal") return "#1d9166";
    if (statusLabel === "Hypotension") return "#1d4ed8";
    if (statusLabel === "Elevated") return "#ca8a04";
    if (statusLabel.includes("Stage 1")) return "#ea580c";
    if (statusLabel.includes("Stage 2")) return "#dc2626";
    if (statusLabel.includes("Crisis")) return "#7f1d1d";
    return "#2f4358";
}

export function getStatusBadgeStyle(statusLabel) {
    if (statusLabel === "Normal") return { bg: "#e3f5ee", text: "#195f45" };
    if (statusLabel === "Hypotension") return { bg: "#dbeafe", text: "#1e40af" };
    if (statusLabel === "Elevated") return { bg: "#fef9c3", text: "#854d0e" };
    if (statusLabel.includes("Stage 1")) return { bg: "#ffedd5", text: "#9a3412" };
    if (statusLabel.includes("Stage 2")) return { bg: "#fee2e2", text: "#991b1b" };
    if (statusLabel.includes("Crisis")) return { bg: "#450a0a", text: "#fca5a5" };
    return { bg: "#f2f3f4", text: "#2f4358" };
}

export function shortStatusLabel(label) {
    if (label === "Stage 1 Hypertension") return "Stage 1 HTN";
    if (label === "Stage 2 Hypertension") return "Stage 2 HTN";
    if (label === "Hypertensive Crisis") return "Crisis";
    return label;
}

// ─── Date Helpers ───────────────────────────────────────────────────

function formatDateLabel(dateStr) {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const opts = { month: "short", day: "numeric" };

    if (date.toDateString() === today.toDateString()) {
        return `Today, ${date.toLocaleDateString("en-US", opts)}`;
    }
    if (date.toDateString() === yesterday.toDateString()) {
        return `Yesterday, ${date.toLocaleDateString("en-US", opts)}`;
    }
    return date.toLocaleDateString("en-US", opts);
}

/**
 * Group flat readings array into sections by date.
 * Returns: [{ date: "Today, Feb 27", readings: [...] }, ...]
 */
export function groupReadingsByDate(readings) {
    const groups = {};
    for (const reading of readings) {
        const rDate = reading.date
            ? new Date(reading.date + 'T12:00:00')
            : new Date(reading.createdAt);

        const dateKey = rDate.toDateString();
        if (!groups[dateKey]) {
            groups[dateKey] = {
                date: formatDateLabel(rDate),
                dateKey,
                readings: [],
            };
        }
        groups[dateKey].readings.push(reading);
    }
    // Return sorted newest-first
    return Object.values(groups).sort(
        (a, b) => new Date(b.dateKey) - new Date(a.dateKey)
    );
}

// ─── localStorage CRUD ──────────────────────────────────────────────

export function getBPReadings() {
    if (typeof window === "undefined") return [];
    try {
        const data = localStorage.getItem(BP_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function saveBPReading(reading) {
    const readings = getBPReadings();
    const entry = {
        id: Date.now().toString(),
        ...reading,
        createdAt: new Date().toISOString(),
    };
    readings.unshift(entry); // newest first
    localStorage.setItem(BP_STORAGE_KEY, JSON.stringify(readings));
    return entry;
}

export function saveBPReadings(newReadings) {
    const existing = getBPReadings();
    const merged = [...newReadings, ...existing];
    localStorage.setItem(BP_STORAGE_KEY, JSON.stringify(merged));
    return merged;
}

export function deleteBPReading(id) {
    const readings = getBPReadings().filter(r => r.id !== id);
    localStorage.setItem(BP_STORAGE_KEY, JSON.stringify(readings));
    return readings;
}

export function updateBPReading(id, updatedData) {
    const readings = getBPReadings();
    const idx = readings.findIndex(r => r.id === id);
    if (idx !== -1) {
        readings[idx] = { ...readings[idx], ...updatedData };
        localStorage.setItem(BP_STORAGE_KEY, JSON.stringify(readings));
    }
    return readings;
}

// ─── iHealth Connection State ───────────────────────────────────────

const IHEALTH_KEY = "renewrx_ihealth_connected";

export function getIHealthConnected() {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(IHEALTH_KEY) === "true";
}

export function setIHealthConnected(connected) {
    localStorage.setItem(IHEALTH_KEY, connected ? "true" : "false");
}

// ─── Mock iHealth Synced Data ───────────────────────────────────────

export function generateIHealthSyncedReadings() {
    const now = new Date();
    const today = now.toISOString();

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);

    const twoDaysAgo = new Date(now);
    twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);

    return [
        {
            id: "ih-201",
            systolic: 118, diastolic: 76, pulse: 72,
            time: "7:14 AM", tags: [], type: "iHealth",
            status: "Normal", createdAt: today,
        },
        {
            id: "ih-202",
            systolic: 124, diastolic: 81, pulse: 68,
            time: "9:45 AM", tags: [], type: "iHealth",
            status: "Elevated", createdAt: today,
        },
        {
            id: "ih-203",
            systolic: 132, diastolic: 85, pulse: 75,
            time: "8:20 AM", tags: ["Before Meds"], type: "iHealth",
            status: "Stage 1 HTN", createdAt: yesterday.toISOString(),
        },
        {
            id: "ih-204",
            systolic: 128, diastolic: 82, pulse: 71,
            time: "9:58 PM", tags: ["Evening"], type: "iHealth",
            status: "Elevated", createdAt: yesterday.toISOString(),
        },
        {
            id: "ih-205",
            systolic: 116, diastolic: 74, pulse: 69,
            time: "7:50 AM", tags: [], type: "iHealth",
            status: "Normal", createdAt: twoDaysAgo.toISOString(),
        },
        {
            id: "ih-206",
            systolic: 122, diastolic: 78, pulse: 70,
            time: "8:15 PM", tags: ["Evening"], type: "iHealth",
            status: "Normal", createdAt: twoDaysAgo.toISOString(),
        },
    ];
}
