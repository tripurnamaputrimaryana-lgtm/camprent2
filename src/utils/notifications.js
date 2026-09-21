const STORAGE_KEY = 'admin_notifications';

const normalizeNotification = (item) => ({
  id: item.id || Date.now() + Math.random(),
  type: item.type || 'info',
  title: item.title || 'Notifikasi',
  message: item.message || '',
  read: Boolean(item.read),
  createdAt: item.createdAt || new Date().toISOString()
});

export const getNotifications = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.map(normalizeNotification) : [];
  } catch (error) {
    return [];
  }
};

export const emitNotificationsChanged = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('admin-notifications-updated'));
  }
};

export const saveNotifications = (items) => {
  const safeList = Array.isArray(items) ? items.slice(0, 20) : [];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(safeList));
  emitNotificationsChanged();
};

export const addAdminNotification = ({ title, message, type = 'info' }) => {
  const current = getNotifications();
  const next = [
    normalizeNotification({
      id: Date.now() + Math.random(),
      type,
      title,
      message,
      read: false,
      createdAt: new Date().toISOString()
    }),
    ...current
  ].slice(0, 20);

  saveNotifications(next);
  return next[0];
};

export const markAllNotificationsAsRead = () => {
  const current = getNotifications().map((item) => ({ ...item, read: true }));
  saveNotifications(current);
  return current;
};

export const markOneNotificationAsRead = (id) => {
  const current = getNotifications().map((item) =>
    item.id === id ? { ...item, read: true } : item
  );
  saveNotifications(current);
  return current;
};
