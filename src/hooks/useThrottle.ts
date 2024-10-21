import { useRef, useCallback } from 'react';

/**
 * a custom hook that throttles a callback function for a specified delay.
 *
 * @param callback The function to throttle.
 * @param delay The throttle delay in milliseconds.
 * @returns A throttled function.
 */

export function useThrottle<T extends (...args: any[]) => void>(
    callback: T,
    delay: number
): (...args: Parameters<T>) => void {
    const lastCall = useRef(0);
    const throttledFunction = useCallback((...args: Parameters<T>) => {
        const now = Date.now();
        if (now - lastCall.current > delay) {
            lastCall.current = now;
            callback(...args);
        }
    }, [callback, delay]);

    return throttledFunction;
}
