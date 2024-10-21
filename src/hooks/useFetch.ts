import { useEffect, useState } from 'react';

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
                if (!response.ok) {throw new Error('Error fetching data');}
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
