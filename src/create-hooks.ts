#!/usr/bin/env node

import fs from "fs";
import path from "path";

const hooks = {
  useDebounce: `import { useEffect, useState, useRef } from 'react';

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
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [value, delay, immediate]);

  return debouncedValue;
}`,

  useThrottle: `import { useRef, useCallback } from 'react';

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
}`,

  useFetch: `import { useEffect, useState } from 'react';

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
}`,

  useLocalStorage: `import { useState } from 'react';

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
}`,
};

function findTargetDirectory(dir: string): string | null {
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const entryPath = path.join(dir, entry);
    const stats = fs.statSync(entryPath);

    if (stats.isDirectory()) {
      if (entry === "src" || entry === "app") {
        return entryPath;
      } else {
        const result = findTargetDirectory(entryPath);
        if (result) {
          return result;
        }
      }
    }
  }

  return null;
}

function createHooksFolder() {
  const currentDir = process.cwd();
  const targetPath = findTargetDirectory(currentDir);

  if (!targetPath) {
    console.error(
      "No src or app folder found in the current directory or its subdirectories."
    );
    process.exit(1);
  }

  const hooksPath = path.join(targetPath, "hooks");

  if (!fs.existsSync(hooksPath)) {
    fs.mkdirSync(hooksPath, { recursive: true });
  }

  Object.entries(hooks).forEach(([hookName, hookContent]) => {
    fs.writeFileSync(path.join(hooksPath, `${hookName}.ts`), hookContent);
  });

  console.log(`Hooks folder created successfully in ${hooksPath}`);
}

createHooksFolder();
