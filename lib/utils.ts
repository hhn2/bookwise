import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const getInitials = (name: string): string => name
  .split(" ")           // Returns string[]
  .map((part) => part[0])  // Gets first letter of each part
  .join("")            // Joins the letters together
  .toUpperCase()       // Converts to uppercase
  .slice(0, 2);        // Takes first two characters