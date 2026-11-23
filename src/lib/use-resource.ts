import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { all, errorMessage, get } from './api';
import { useAuth } from './auth';

export function useResource<T>(path: string | null, paginated = false) {
  const { profile } = useAuth();
  const key = path ? `${profile?.id ?? 'public'}:${path}` : null;
  const [state, setState] = useState<{
    data: T | null;
    loading: boolean;
    error: string;
    key: string | null;
  }>({ data: null, loading: !!path, error: '', key: path });
  const [revision, setRevision] = useState(0);
  const reload = useCallback(() => setRevision((v) => v + 1), []);
  const requestKey = `${key}:${revision}`;
  const serial = useRef<string | null>(null);
  useFocusEffect(
    useCallback(() => {
      const current = requestKey;
      serial.current = current;
      if (!path) return;
      const controller = new AbortController();
      setState((old) => ({
        data: old.key === key ? old.data : null,
        key,
        loading: true,
        error: '',
      }));
      const load = paginated
        ? (all<unknown>(path, controller.signal) as Promise<T>)
        : get<T>(path, controller.signal);
      void load
        .then((data) => {
          if (serial.current === current && !controller.signal.aborted)
            setState({ data, loading: false, error: '', key });
        })
        .catch((error) => {
          if (serial.current === current && !controller.signal.aborted)
            setState((old) => ({ ...old, loading: false, error: errorMessage(error) }));
        });
      return () => controller.abort();
    }, [path, paginated, key, requestKey]),
  );
  return {
    data: path && state.key === key ? state.data : null,
    loading: !!path && (state.key !== key || state.loading),
    error: path && state.key === key ? state.error : '',
    reload,
  };
}
