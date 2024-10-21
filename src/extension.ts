import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';


async function createHooksFolder(context: vscode.ExtensionContext) {
    const workspaceFolders = vscode.workspace.workspaceFolders;

    if (!workspaceFolders) {
        vscode.window.showErrorMessage("No workspace is open.");
        return;
    }

    const workspacePath = workspaceFolders[0].uri.fsPath;
    let targetPath: string | null = null;

    const findHooksDirectory = (dir: string): string | null => {
        const entries = fs.readdirSync(dir);

        for (const entry of entries) {
            const entryPath = path.join(dir, entry);
            const stats = fs.statSync(entryPath);

            if (stats.isDirectory()) {
                if (entry === 'src' || entry === 'app') {
                    return entryPath; 
                } else {
                    const result = findHooksDirectory(entryPath);
                    if (result) {
                        return result; 
                    }
                }
            }
        }

        return null; 
    };

 
    targetPath = findHooksDirectory(workspacePath);

    if (!targetPath) {
        vscode.window.showErrorMessage("No src or app folder found in the workspace.");
        return;
    }

    const hooksPath = path.join(targetPath, 'hooks');

    
    if (!fs.existsSync(hooksPath)) {
        fs.mkdirSync(hooksPath, { recursive: true });
    }

    // Hooks
    const hooks = {
        useDebounce: `import { useEffect, useState, useRef } from 'react';

/**
 * A custom hook that debounces a value for a specified delay.
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

        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }

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
`,

        useThrottle: `import { useRef, useCallback } from 'react';

/**
 * A custom hook that throttles a callback function for a specified delay.
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
`,

        useFetch: `import { useEffect, useState } from 'react';

/**
 * A custom hook that fetches data from a specified URL.
 * 
 * @param url - The URL to fetch data from.
 * @returns An object containing the data, loading state, and error (if any).
 */
export function useFetch(url: string) {
    const [data, setData] = useState<any>(null); 
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null); 

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(url);
                if (!response.ok) {
                    throw new Error('Error fetching data');
                }
                const result = await response.json();
                setData(result);
            } catch (err) {
                if (err instanceof Error) {
                    setError(err.message); 
                } else {
                    setError('An unknown error occurred'); 
                }
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [url]);

    return { data, loading, error };
}
`,

        useLocalStorage: `import { useState } from 'react';

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
`
    };

    Object.entries(hooks).forEach(([hookName, hookContent]) => {
        fs.writeFileSync(path.join(hooksPath, `${hookName}.ts`), hookContent);
    });

    vscode.window.showInformationMessage(`Hooks folder created.`);
}

export function activate(context: vscode.ExtensionContext) {
    const disposable = vscode.commands.registerCommand('react-hooks.createHooksFolder', () => {
        createHooksFolder(context);
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
