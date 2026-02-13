import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatNumber(num: number): string {
  return new Intl.NumberFormat("fa-IR").format(num);
}

export function formatPrice(amount: number, currency: string = "تومان"): string {
  return `${formatNumber(amount)} ${currency}`;
}

export function getResourceTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    article: "مقاله",
    course: "دوره",
    video: "ویدیو",
    playlist: "پلی‌لیست",
    roadmap: "نقشه‌راه",
  };
  return labels[type] || type;
}

export function getResourceTypeColor(type: string): string {
  const colors: Record<string, string> = {
    article: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    course: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    video: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    playlist: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    roadmap: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  };
  return colors[type] || "bg-gray-100 text-gray-800";
}

export function getLevelLabel(level: string): string {
  const labels: Record<string, string> = {
    beginner: "مبتدی",
    intermediate: "متوسط",
    advanced: "پیشرفته",
  };
  return labels[level] || level;
}

export function getLevelColor(level: string): string {
  const colors: Record<string, string> = {
    beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  };
  return colors[level] || "bg-gray-100 text-gray-800";
}
