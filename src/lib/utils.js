import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function handleResponse(response, errorMessage) {
  if (!response.ok) {
    throw new Error(errorMessage)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}