import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

// Combines class names with tailwind merge for utility composition
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Function to get initials from a name
export function getInitials(name: string): string {
  if (!name) return "?";
  
  const parts = name.trim().split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

// Function to format date
export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(d);
}

// Format time duration (minutes to hours and minutes)
export function formatDuration(minutes: number): string {
  if (!minutes) return "No duration set";
  
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) return `${mins} min${mins !== 1 ? 's' : ''}`;
  if (mins === 0) return `${hours} hour${hours !== 1 ? 's' : ''}`;
  
  return `${hours} hour${hours !== 1 ? 's' : ''} ${mins} min${mins !== 1 ? 's' : ''}`;
}