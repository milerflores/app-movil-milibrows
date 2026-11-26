import * as SecureStore from 'expo-secure-store';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform, View } from 'react-native';
import { palettes, themeVars, type ThemeMode, type ThemePalette } from '@/ui/theme';

const STORAGE_KEY = 'milibrows_theme_mode';

interface AppThemeContextValue {
  mode: ThemeMode;
  isDark: boolean;
  palette: ThemePalette;
  setMode: (mode: ThemeMode) => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<AppThemeContextValue>({
  mode: 'light',
  isDark: false,
  palette: palettes.light,
  setMode: () => {},
  toggleMode: () => {},
});

async function loadSavedMode(): Promise<ThemeMode | null> {
  try {
    if (Platform.OS === 'web') {
      const value = typeof window !== 'undefined' ? window.localStorage?.getItem(STORAGE_KEY) : null;
      return value === 'light' || value === 'dark' ? value : null;
    }
    const value = await SecureStore.getItemAsync(STORAGE_KEY);
    return value === 'light' || value === 'dark' ? value : null;
  } catch {
    return null;
  }
}

async function persistMode(mode: ThemeMode) {
  try {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage?.setItem(STORAGE_KEY, mode);
      return;
    }
    await SecureStore.setItemAsync(STORAGE_KEY, mode);
  } catch {
    // Si falla el almacenamiento local, se mantiene en memoria durante la sesión.
  }
}

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setModeState] = useState<ThemeMode>('light');

  useEffect(() => {
    let active = true;
    void loadSavedMode().then((saved) => {
      if (active && saved) setModeState(saved);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof document !== 'undefined') {
      document.documentElement.style.backgroundColor = palettes[mode].canvas;
      document.body.style.backgroundColor = palettes[mode].canvas;
    }
  }, [mode]);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void persistMode(next);
  }, []);

  const toggleMode = useCallback(() => {
    setModeState((prev) => {
      const next: ThemeMode = prev === 'dark' ? 'light' : 'dark';
      void persistMode(next);
      return next;
    });
  }, []);

  const value = useMemo<AppThemeContextValue>(
    () => ({
      mode,
      isDark: mode === 'dark',
      palette: palettes[mode],
      setMode,
      toggleMode,
    }),
    [mode, setMode, toggleMode],
  );

  return (
    <ThemeContext.Provider value={value}>
      <View style={[themeVars[mode], { flex: 1, backgroundColor: palettes[mode].canvas }]}>
        {children}
      </View>
    </ThemeContext.Provider>
  );
}

export function useAppTheme() {
  return useContext(ThemeContext);
}
