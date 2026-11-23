import * as Device from 'expo-device';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { AppState, Platform } from 'react-native';
import { ApiError, errorMessage, get, onExpired, request, setToken } from './api';
import { readToken, saveToken } from './storage';
import type { Profile } from './types';

interface AuthState {
  profile: Profile | null;
  loading: boolean;
  sessionError: string;
  signIn: (correo: string, contrasena: string) => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  updateProfile: (profile: Profile) => void;
}
const Context = createContext<AuthState | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [sessionError, setSessionError] = useState('');
  const generation = useRef(0);
  const active = useRef(false);
  const clear = useCallback(() => {
    generation.current++;
    active.current = false;
    setToken(null);
    setProfile(null);
    void saveToken(null).catch(() => {});
  }, []);
  const refresh = useCallback(async () => {
    const version = generation.current;
    if (!active.current) return;
    try {
      const user = await get<Profile>('/mi-perfil');
      if (version !== generation.current) return;
      if (user.roles.length !== 1 || user.roles[0] !== 'cliente' || user.id_empleado) {
        clear();
        return;
      }
      setProfile(user);
      setSessionError('');
    } catch (error) {
      if (version !== generation.current) return;
      if (error instanceof ApiError && (error.status === 401 || error.status === 403)) clear();
      setSessionError(errorMessage(error));
    }
  }, [clear]);
  useEffect(() => {
    let live = true;
    const unsubscribe = onExpired(() => {
      clear();
      setSessionError('Tu sesión ha vencido. Vuelve a iniciar sesión.');
    });
    void (async () => {
      try {
        const saved = await readToken();
        if (!live) return;
        if (saved) {
          setToken(saved);
          active.current = true;
          await refresh();
        }
      } catch {
        if (live) setSessionError('No pudimos recuperar tu sesión. Inicia sesión nuevamente.');
      } finally {
        if (live) setLoading(false);
      }
    })();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') void refresh();
    });
    return () => {
      live = false;
      unsubscribe();
      subscription.remove();
    };
  }, [clear, refresh]);
  async function signIn(correo: string, contrasena: string) {
    const result = await request<{ token: string; perfil: Profile }>('/acceso/token-movil', {
      method: 'POST',
      anonymous: true,
      body: {
        correo: correo.trim().toLowerCase(),
        contrasena,
        nombre_dispositivo: `MiliBrows · ${Device.modelName || Platform.OS}`.slice(0, 100),
      },
    });
    try {
      await saveToken(result.datos.token);
    } catch {
      await request('/acceso/token-movil', { method: 'DELETE', bearer: result.datos.token }).catch(
        () => {},
      );
      throw new Error('No pudimos guardar la sesión de forma segura. Intenta nuevamente.');
    }
    generation.current++;
    active.current = true;
    setToken(result.datos.token);
    setProfile(result.datos.perfil);
    setSessionError('');
  }
  async function signOut() {
    await request('/acceso/token-movil', { method: 'DELETE' });
    clear();
    setSessionError('');
  }
  function updateProfile(value: Profile) {
    if (!active.current) return;
    generation.current++;
    setProfile((current) => (current?.id === value.id ? value : current));
  }
  return (
    <Context.Provider
      value={{
        profile,
        loading,
        sessionError,
        signIn,
        signOut,
        refresh,
        updateProfile,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export function useAuth() {
  const value = useContext(Context);
  if (!value) throw new Error('AuthProvider missing');
  return value;
}
