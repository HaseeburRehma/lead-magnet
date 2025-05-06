import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export const isTouchDevice = () => {
  if (typeof window === "undefined") {
    return false // Default to false during server-side rendering
  }
  return "ontouchstart" in window || navigator.maxTouchPoints > 0
}

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
