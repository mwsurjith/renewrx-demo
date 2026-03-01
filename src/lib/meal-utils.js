/**
 * Meal Utilities
 * 
 * localStorage helpers for persisting meal logs.
 * Meal types and mock data for the Nourish Notebook feature.
 */

const MEAL_STORAGE_KEY = "renewrx_meal_logs";

// ─── Meal Types ─────────────────────────────────────────────────────

export const MEAL_TYPES = [
    { id: "breakfast", label: "Breakfast", icon: "☕", color: "#10B981", bgColor: "#ECFDF5" },
    { id: "lunch", label: "Lunch", icon: "🍲", color: "#EC4899", bgColor: "#FDF2F8" },
    { id: "dinner", label: "Dinner", icon: "🍽️", color: "#8B5CF6", bgColor: "#F5F3FF" },
    { id: "snack", label: "Snack", icon: "🥕", color: "#F59E0B", bgColor: "#FFFBEB" },
];

// ─── Mock Recent Meals (for demo purposes) ──────────────────────────

const MOCK_RECENT_MEALS = {
    breakfast: [
        {
            id: "recent-b1",
            description: "Yoghurt and waffles",
            image: "https://images.unsplash.com/photo-1562376552-0d160a2f238d?q=80&w=200&auto=format&fit=crop",
            nutritionCount: 3,
        },
        {
            id: "recent-b2",
            description: "Beef Cheeseburger and Coffee",
            image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?q=80&w=200&auto=format&fit=crop",
            nutritionCount: 0,
        },
    ],
    lunch: [
        {
            id: "recent-l1",
            description: "Grilled chicken salad with avocado",
            image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?q=80&w=200&auto=format&fit=crop",
            nutritionCount: 5,
        },
        {
            id: "recent-l2",
            description: "Pasta with tomato sauce",
            image: "https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?q=80&w=200&auto=format&fit=crop",
            nutritionCount: 0,
        },
    ],
    dinner: [
        {
            id: "recent-d1",
            description: "Salmon with steamed vegetables",
            image: "https://images.unsplash.com/photo-1467003909585-2f8a72700288?q=80&w=200&auto=format&fit=crop",
            nutritionCount: 4,
        },
    ],
    snack: [
        {
            id: "recent-s1",
            description: "Mixed nuts and berries",
            image: "https://images.unsplash.com/photo-1606923829579-0cb981a83e2e?q=80&w=200&auto=format&fit=crop",
            nutritionCount: 2,
        },
    ],
};

// ─── Recent Meals Helper ────────────────────────────────────────────

export function getRecentMeals(mealType) {
    return MOCK_RECENT_MEALS[mealType] || [];
}

// ─── Date Helpers ───────────────────────────────────────────────────

function formatMealDateLabel(dateStr) {
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

// ─── localStorage CRUD ──────────────────────────────────────────────

export function getMealLogs() {
    if (typeof window === "undefined") return [];
    try {
        const data = localStorage.getItem(MEAL_STORAGE_KEY);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

export function getMealLogById(id) {
    const logs = getMealLogs();
    return logs.find(m => m.id === id);
}

export function saveMealLog(meal) {
    const logs = getMealLogs();
    const entry = {
        id: Date.now().toString(),
        ...meal,
        createdAt: new Date().toISOString(),
    };
    logs.unshift(entry); // newest first
    localStorage.setItem(MEAL_STORAGE_KEY, JSON.stringify(logs));
    return entry;
}

export function updateMealLog(id, updates) {
    const logs = getMealLogs();
    const idx = logs.findIndex(m => m.id === id);
    if (idx === -1) return null;

    logs[idx] = { ...logs[idx], ...updates, updatedAt: new Date().toISOString() };
    localStorage.setItem(MEAL_STORAGE_KEY, JSON.stringify(logs));
    return logs[idx];
}

export function deleteMealLog(id) {
    const logs = getMealLogs().filter(m => m.id !== id);
    localStorage.setItem(MEAL_STORAGE_KEY, JSON.stringify(logs));
    return logs;
}

/**
 * Group meal logs by date.
 * Returns: [{ date: "Today, Mar 1", meals: [...] }, ...]
 */
export function groupMealsByDate(meals) {
    const groups = {};
    for (const meal of meals) {
        const mDate = meal.date
            ? new Date(meal.date + "T12:00:00")
            : new Date(meal.createdAt);

        const dateKey = mDate.toDateString();
        if (!groups[dateKey]) {
            groups[dateKey] = {
                date: formatMealDateLabel(mDate),
                dateKey,
                meals: [],
            };
        }
        groups[dateKey].meals.push(meal);
    }
    return Object.values(groups).sort(
        (a, b) => new Date(b.dateKey) - new Date(a.dateKey)
    );
}

/**
 * Get meals for a specific date grouped by meal type
 * @param {string} dateStr - YYYY-MM-DD format date
 * @returns {Object} - { breakfast: [...], lunch: [...], dinner: [...], snack: [...] }
 */
export function getMealsForDate(dateStr) {
    const logs = getMealLogs();
    const result = { breakfast: [], lunch: [], dinner: [], snack: [] };

    for (const meal of logs) {
        const mDate = meal.date
            ? meal.date
            : new Date(meal.createdAt).toISOString().split("T")[0];

        if (mDate === dateStr && result[meal.mealType]) {
            result[meal.mealType].push(meal);
        }
    }
    return result;
}
