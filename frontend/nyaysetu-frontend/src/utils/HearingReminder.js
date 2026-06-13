export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        alert('Notifications not supported');
        return false;
    }

    if (Notification.permission === 'granted') {
        return true;
    }

    const permission = await Notification.requestPermission();
    return permission === 'granted';
};

export const scheduleHearingReminder = async (hearing) => {
    const allowed = await requestNotificationPermission();

    if (!allowed) return;

    const hearingTime = new Date(hearing.scheduledDate);

    const reminderTime =
        hearingTime.getTime() -
        15 * 60 * 1000;

    const delay = reminderTime - Date.now();

    if (delay <= 0) {
        alert('Reminder can only be set for future hearings.');
        return;
    }

    setTimeout(() => {
        new Notification('Upcoming Hearing', {
            body: `${hearing.caseTitle} starts in 15 minutes`
        });
    }, delay);

    alert('Reminder scheduled successfully.');
};