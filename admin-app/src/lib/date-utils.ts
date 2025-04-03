import { format, formatISO, parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { pl } from 'date-fns/locale';

// Format date to Polish format
export function formatDatePL(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'd MMMM yyyy', { locale: pl });
}

// Format date to ISO format for API requests
export function formatDateISO(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatISO(dateObj, { representation: 'date' });
}

// Get first day of current month
export function getFirstDayOfMonth(): Date {
  return startOfMonth(new Date());
}

// Get last day of current month
export function getLastDayOfMonth(): Date {
  return endOfMonth(new Date());
}

// Format hours with 2 decimal places
export function formatHours(hours: number): string {
  return hours.toFixed(2);
}
