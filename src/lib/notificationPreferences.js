export function messageAlertsEnabled(user) {
  const stored = localStorage.getItem('matrix_notif_messages');
  return stored === null ? user?.notif_messages !== false : stored !== 'false';
}