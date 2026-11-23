import Constants from 'expo-constants';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import { resolveApiUrl } from './api-url';

export const API_URL = resolveApiUrl({
  platform: Platform.OS,
  physicalDevice: Device.isDevice,
  development: __DEV__,
  hostUri: Constants.expoConfig?.hostUri,
  nativeUrl: process.env.EXPO_PUBLIC_API_URL,
  webUrl: process.env.EXPO_PUBLIC_WEB_API_URL,
});
let token: string | null = null;
const expired = new Set<() => void>();
export function setToken(value: string | null) {
  token = value;
}
export function onExpired(callback: () => void) {
  expired.add(callback);
  return () => {
    expired.delete(callback);
  };
}
export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fields: Record<string, string[]> = {},
  ) {
    super(message);
  }
}
export function errorMessage(error: unknown) {
  return error instanceof Error
    ? error.message
    : 'No pudimos completar la operación. Intenta nuevamente.';
}
export function assetUrl(path: string | null) {
  if (!path || !API_URL) return undefined;
  if (API_URL.startsWith('/')) return path.startsWith('/') ? path : `${API_URL}/${path}`;
  return new URL(path, `${API_URL}/`).href;
}
interface Envelope<T> {
  datos: T;
  meta?: { pagina: number; ultima_pagina: number; total: number };
  mensaje?: string;
}
export async function request<T>(
  path: string,
  options: {
    method?: string;
    body?: unknown;
    signal?: AbortSignal;
    anonymous?: boolean;
    bearer?: string;
  } = {},
): Promise<Envelope<T>> {
  if (!API_URL) throw new Error('La conexión con el estudio aún no está configurada.');
  const controller = new AbortController();
  const abort = () => controller.abort();
  options.signal?.addEventListener('abort', abort);
  if (options.signal?.aborted) controller.abort();
  const timeout = setTimeout(abort, 25_000);
  const sentToken = options.bearer ?? (options.anonymous ? null : token);
  try {
    const response = await fetch(`${API_URL}${path}`, {
      method: options.method || 'GET',
      credentials: 'omit',
      signal: controller.signal,
      headers: {
        Accept: 'application/json',
        ...(options.body !== undefined ? { 'Content-Type': 'application/json' } : {}),
        ...(sentToken ? { Authorization: `Bearer ${sentToken}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
    if (response.status === 204) return { datos: undefined as T };
    const data = await response.json().catch(() => null);
    if (!response.ok) {
      if (response.status === 401 && sentToken && sentToken === token)
        expired.forEach((callback) => callback());
      const fields = data?.errores || {};
      const detail = Object.values(fields)
        .flat()
        .filter((v): v is string => typeof v === 'string')
        .join('\n');
      throw new ApiError(
        response.status,
        detail || data?.mensaje || 'No pudimos completar la solicitud.',
        fields,
      );
    }
    if (!data) throw new Error('El estudio devolvió una respuesta inesperada. Intenta nuevamente.');
    return data;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (options.signal?.aborted) throw error;
    throw new Error(
      controller.signal.aborted
        ? 'La conexión tardó demasiado. Intenta nuevamente.'
        : 'No pudimos conectar con el estudio. Revisa tu conexión e intenta nuevamente.',
    );
  } finally {
    clearTimeout(timeout);
    options.signal?.removeEventListener('abort', abort);
  }
}
export async function get<T>(path: string, signal?: AbortSignal) {
  return (await request<T>(path, { signal })).datos;
}
export async function all<T>(path: string, signal?: AbortSignal): Promise<T[]> {
  const items: T[] = [];
  let page = 1;
  while (true) {
    const result = await request<T[]>(`${path}${path.includes('?') ? '&' : '?'}pagina=${page}`, {
      signal,
    });
    items.push(...result.datos);
    if (!result.meta || page >= result.meta.ultima_pagina) return items;
    page++;
  }
}
