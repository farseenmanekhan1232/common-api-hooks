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

  useApi: `import { useState, useCallback } from 'react';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

interface ApiOptions {
  method?: HttpMethod;
  headers?: Record<string, string>;
  body?: any;
}

export function useApi<T>(baseUrl: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const request = useCallback(async (endpoint: string, options: ApiOptions = {}) => {
    setLoading(true);
    setError(null);

    try {
      const url = \`\${baseUrl}\${endpoint}\`;
      const response = await fetch(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body ? JSON.stringify(options.body) : undefined,
      });

      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }

      const result = await response.json();
      setData(result);
      return result;
    } catch (e) {
      setError(e instanceof Error ? e : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  return { data, loading, error, request };
}`,

  usePagination: `import { useState, useCallback, useEffect } from 'react';

interface PaginationOptions {
  initialPage?: number;
  initialPageSize?: number;
  totalItems?: number;
}

export function usePagination<T>({
  initialPage = 1,
  initialPageSize = 10,
  totalItems = 0,
}: PaginationOptions = {}) {
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [pageSize, setPageSize] = useState(initialPageSize);
  const [total, setTotal] = useState(totalItems);
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const totalPages = Math.ceil(total / pageSize);

  const fetchPage = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(\`\${url}?page=\${currentPage}&pageSize=\${pageSize}\`);
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      const result = await response.json();
      setData(result.data);
      setTotal(result.total);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize]);

  const goToPage = useCallback((page: number) => {
    setCurrentPage(Math.max(1, Math.min(page, totalPages)));
  }, [totalPages]);

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const prevPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  return {
    currentPage,
    pageSize,
    totalPages,
    total,
    data,
    loading,
    error,
    setPageSize,
    fetchPage,
    goToPage,
    nextPage,
    prevPage,
  };
}`,

  useInfiniteScroll: `import { useState, useEffect, useCallback, useRef } from 'react';

interface InfiniteScrollOptions {
  threshold?: number;
  initialPage?: number;
}

export function useInfiniteScroll<T>({
  threshold = 100,
  initialPage = 1,
}: InfiniteScrollOptions = {}) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(initialPage);

  const observer = useRef<IntersectionObserver | null>(null);
  const lastElementRef = useCallback((node: HTMLElement | null) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setPage(prevPage => prevPage + 1);
      }
    }, { rootMargin: \`\${threshold}px\` });
    if (node) observer.current.observe(node);
  }, [loading, hasMore, threshold]);

  const fetchMore = useCallback(async (url: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(\`\${url}?page=\${page}\`);
      if (!response.ok) {
        throw new Error(\`HTTP error! status: \${response.status}\`);
      }
      const newData = await response.json();
      setData(prevData => [...prevData, ...newData]);
      setHasMore(newData.length > 0);
    } catch (e) {
      setError(e instanceof Error ? e : new Error('An unknown error occurred'));
    } finally {
      setLoading(false);
    }
  }, [page]);

  return { data, loading, error, hasMore, lastElementRef, fetchMore };
}`,
};

function findTargetDirectory(dir: string): string | null {
  // Check if /src exists
  const srcPath = path.join(dir, "src");
  if (fs.existsSync(srcPath) && fs.statSync(srcPath).isDirectory()) {
    // Check if /src/app exists
    const srcAppPath = path.join(srcPath, "app");
    if (fs.existsSync(srcAppPath) && fs.statSync(srcAppPath).isDirectory()) {
      return srcAppPath;
    }
    return srcPath;
  }

  // Check if /app exists
  const appPath = path.join(dir, "app");
  if (fs.existsSync(appPath) && fs.statSync(appPath).isDirectory()) {
    return appPath;
  }

  return null;
}

function createHooksFolder() {
  const currentDir = process.cwd();
  const targetPath = findTargetDirectory(currentDir);

  if (!targetPath) {
    console.error(
      "No src, src/app, or app folder found in the current directory."
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
