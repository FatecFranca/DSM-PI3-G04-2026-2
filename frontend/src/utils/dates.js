// Dates are stored as ISO day strings ("2026-10-21") plus "HH:MM" times,
// always interpreted in the user's local time zone.

const pad = (n) => String(n).padStart(2, '0');

export function toISODate(date) {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function parseISODate(iso) {
  const [y, m, d] = String(iso).split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function todayISO() {
  return toISODate(new Date());
}

export function addDays(iso, days) {
  const date = parseISODate(iso);
  date.setDate(date.getDate() + days);
  return toISODate(date);
}

export function daysFromToday(days) {
  return addDays(todayISO(), days);
}

export function diffInDays(fromIso, toIso) {
  const ms = parseISODate(toIso) - parseISODate(fromIso);
  return Math.round(ms / 86400000);
}

export function weekdayOf(iso) {
  return parseISODate(iso).getDay();
}

export function startOfWeek(iso) {
  const day = weekdayOf(iso);
  // Monday-first weeks (Brazilian convention)
  const offset = day === 0 ? -6 : 1 - day;
  return addDays(iso, offset);
}

export function weekDates(iso) {
  const start = startOfWeek(iso);
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export const WEEKDAYS_SHORT = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];
export const WEEKDAYS_LONG = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
export const WEEKDAY_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function formatDate(iso, options = { day: '2-digit', month: '2-digit', year: 'numeric' }) {
  if (!iso) return '';
  return parseISODate(iso).toLocaleDateString('pt-BR', options);
}

export function formatDateLong(iso) {
  return formatDate(iso, { weekday: 'long', day: 'numeric', month: 'long' });
}

export function formatDateShort(iso) {
  return formatDate(iso, { weekday: 'short', day: 'numeric', month: 'short' }).replace(/\./g, '');
}

/** "Hoje", "Amanhã", "Ontem" or a short date */
export function formatRelativeDay(iso) {
  const diff = diffInDays(todayISO(), iso);
  if (diff === 0) return 'Hoje';
  if (diff === 1) return 'Amanhã';
  if (diff === -1) return 'Ontem';
  return formatDateShort(iso);
}

export function formatDateTime(timestamp) {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatTime(timestamp) {
  return new Date(timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
}

export function timeAgo(timestamp) {
  const seconds = Math.round((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'agora';
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return `há ${days} d`;
  return new Date(timestamp).toLocaleDateString('pt-BR');
}

export function timeToMinutes(time) {
  const [h, m] = String(time).split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

export function minutesToTime(total) {
  return `${pad(Math.floor(total / 60) % 24)}:${pad(total % 60)}`;
}

/** Timestamp (ms) for a given ISO day + "HH:MM" */
export function toTimestamp(iso, time = '00:00') {
  const date = parseISODate(iso);
  const minutes = timeToMinutes(time);
  date.setHours(Math.floor(minutes / 60), minutes % 60, 0, 0);
  return date.getTime();
}

export function nowTime() {
  const now = new Date();
  return `${pad(now.getHours())}:${pad(now.getMinutes())}`;
}

/** Bookable hour slots offered across the platform */
export const DAY_SLOTS = ['06:00', '07:00', '08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'];
