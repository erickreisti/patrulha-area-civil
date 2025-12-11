export function debounce<F extends (...args: unknown[]) => unknown>(
  func: F,
  wait: number,
  immediate?: boolean
): (...args: Parameters<F>) => void {
  let timeout: NodeJS.Timeout | null = null;

  return (...args: Parameters<F>) => {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };

    const callNow = immediate && !timeout;

    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);

    if (callNow) func(...args);
  };
}
