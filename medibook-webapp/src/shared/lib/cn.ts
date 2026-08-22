import { clsx, type ClassValue } from 'clsx';

/**
 * Merge conditional Tailwind class names. The only sanctioned way to build
 * dynamic className strings — never concatenate by hand.
 * See docs/REACT_VITEJS_CODING_STANDARDS.md §8.
 */
export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}
