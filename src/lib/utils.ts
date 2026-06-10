import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { differenceInDays, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getPregnancyWeek(dueDate: Date | string): number {
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  const daysUntilDue = differenceInDays(due, new Date());
  const weeksRemaining = Math.ceil(daysUntilDue / 7);
  const currentWeek = 40 - weeksRemaining;
  return Math.max(4, Math.min(40, currentWeek));
}

export function getDaysUntilDue(dueDate: Date | string): number {
  const due = typeof dueDate === 'string' ? parseISO(dueDate) : dueDate;
  return Math.max(0, differenceInDays(due, new Date()));
}

export function formatRelativeTime(date: Date | string, locale = 'en'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  const diffMs = Date.now() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 30) return `${diffDays}d ago`;
  return d.toLocaleDateString(locale === 'zh' ? 'zh-CN' : locale === 'ko' ? 'ko-KR' : 'en-US');
}

export function getCountryFlag(country: string): string {
  const flags: Record<string, string> = {
    Singapore: '🇸🇬',
    Malaysia: '🇲🇾',
    'United States': '🇺🇸',
    'United Kingdom': '🇬🇧',
    Australia: '🇦🇺',
    Canada: '🇨🇦',
    China: '🇨🇳',
    'South Korea': '🇰🇷',
    Japan: '🇯🇵',
    India: '🇮🇳',
    Philippines: '🇵🇭',
    Indonesia: '🇮🇩',
    Thailand: '🇹🇭',
    Vietnam: '🇻🇳',
    'Hong Kong': '🇭🇰',
    Taiwan: '🇹🇼',
    Germany: '🇩🇪',
    France: '🇫🇷',
    Netherlands: '🇳🇱',
    'New Zealand': '🇳🇿',
  };
  return flags[country] || '🌍';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function truncate(text: string, length: number): string {
  if (text.length <= length) return text;
  return text.slice(0, length) + '...';
}

export const COUNTRIES = [
  'Australia', 'Canada', 'China', 'France', 'Germany',
  'Hong Kong', 'India', 'Indonesia', 'Japan', 'Malaysia',
  'Netherlands', 'New Zealand', 'Philippines', 'Singapore',
  'South Korea', 'Taiwan', 'Thailand', 'United Kingdom',
  'United States', 'Vietnam',
].sort();
