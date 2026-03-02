export function getNotifications() {
    if (typeof window === "undefined") return [];
    try {
        return JSON.parse(localStorage.getItem("renewrx_notifications") || "[]");
    } catch {
        return [];
    }
}

export function saveNotification(payload) {
    if (typeof window === "undefined") return [];
    const notifications = getNotifications();

    // Check if duplicate in last 4 hours (avoid spam)
    const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;
    const nowMs = Date.now();
    const isDuplicate = notifications.find(n => {
        const diff = nowMs - new Date(n.createdAt).getTime();
        return diff < FOUR_HOURS_MS &&
            n.title === payload.title &&
            n.message === payload.message;
    });

    if (isDuplicate) return notifications;

    const newNotification = {
        id: `notif_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        createdAt: new Date().toISOString(),
        read: false,
        ...payload
    };

    const updated = [newNotification, ...notifications];
    localStorage.setItem("renewrx_notifications", JSON.stringify(updated));

    // Dispatch a custom event to trigger toast globally
    window.dispatchEvent(new CustomEvent("new-notification", { detail: newNotification }));

    // Attempt to play sound
    try {
        const audio = new Audio('/notification-sound.mp3');
        audio.play().catch(e => console.log('Audio blocked', e));
    } catch (e) { }

    return updated;
}

export function markAsRead(id) {
    if (typeof window === "undefined") return [];
    const notifications = getNotifications().map(n =>
        n.id === id ? { ...n, read: true } : n
    );
    localStorage.setItem("renewrx_notifications", JSON.stringify(notifications));
    return notifications;
}

export function markAllAsRead() {
    if (typeof window === "undefined") return [];
    const notifications = getNotifications().map(n => ({ ...n, read: true }));
    localStorage.setItem("renewrx_notifications", JSON.stringify(notifications));

    // Dispatch a read-all event to clear badges
    window.dispatchEvent(new CustomEvent("notifications-read"));
    return notifications;
}

export function getUnreadCount() {
    return getNotifications().filter(n => !n.read).length;
}
