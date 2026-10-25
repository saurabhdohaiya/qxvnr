import { useEffect, useState } from 'react';
import { API } from '../lib/constants';
import type { WindResponse } from '../types/wind';

export function useWindData(reload: number, month: string) {
  const [data, setData] = useState<WindResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    setError('');
    fetch(`${API}/api/wind?month=${encodeURIComponent(month)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`Elexon service returned ${response.status}`);
        if (!response.headers.get('content-type')?.includes('application/json')) {
          throw new Error('The wind API did not return JSON. Make sure FastAPI is running on port 8000, then refresh.');
        }
        return response.json() as Promise<WindResponse>;
      })
      .then(setData)
      .catch((reason: unknown) => {
        if (!(reason instanceof DOMException && reason.name === 'AbortError')) {
          setError(reason instanceof Error ? reason.message : 'Could not load Elexon data');
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [month, reload]);

  return { data, loading, error };
}
