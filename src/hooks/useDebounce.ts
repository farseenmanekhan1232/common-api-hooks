import { useEffect, useState, useRef } from 'react';

/**
 * a custom hook that debounces a value for a specified delay.
 * 
 * @param value The value to debounce.
 * @param delay The debounce delay in milliseconds.
 * @param immediate If true, triggers the function on the leading edge instead of the trailing edge.
 * @returns The debounced value.
 */

export function useDebounce<T>(value: T, delay: number, immediate = false): T {
    const [debouncedValue, setDebouncedValue] = useState<T>(value);
    const timerRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        if (immediate && !timerRef.current) {
            setDebouncedValue(value);
        }

        // Clearing previous timer
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

        // Setting up a new timer
        timerRef.current = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(timerRef.current!);
            timerRef.current = null;
        };
    }, [value, delay, immediate]);

    return debouncedValue;
}
