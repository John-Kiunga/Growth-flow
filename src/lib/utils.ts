import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateStr: any) {
  if (!dateStr) return '—';
  
  let date: Date;
  
  // Handle Firestore Timestamp
  if (dateStr && typeof dateStr === 'object' && 'toDate' in dateStr) {
    date = dateStr.toDate();
  } else {
    date = new Date(dateStr);
  }

  if (isNaN(date.getTime())) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
}

export function extractDomain(url: string): string | null {
  try {
    const domain = url
      .replace('https://', '')
      .replace('http://', '')
      .replace('www.', '')
      .split(/[/?#]/)[0];
    return domain || null;
  } catch {
    return null;
  }
}
