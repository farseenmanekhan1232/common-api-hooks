import { useState } from 'react';

/**
 * A custom hook that synchronizes state with localStorage.
 * 
 * @param key - The key under which to store the value in localStorage.
 * @param initialValue - The initial value to use if the stored value is not found.
 * @returns An array containing the stored value and a function to set it.
 */
export function useLocalStorage<T>(key: string, initialValue: T) {
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Error reading localStorage:', error);
            return initialValue; 
        }
    });

    const setValue = (value: T | ((val: T) => T)) => {
        try {
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            setStoredValue(valueToStore);
            window.localStorage.setItem(key, JSON.stringify(valueToStore)); 
        } catch (error) {
            console.error('Error setting localStorage:', error);
        }
    };

    const removeValue = () => {
        try {
            window.localStorage.removeItem(key);
            setStoredValue(initialValue); 
        } catch (error) {
            console.error('Error removing localStorage item:', error);
        }
    };

    return [storedValue, setValue, removeValue] as const; 
}
