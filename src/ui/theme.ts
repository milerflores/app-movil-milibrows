import { vars } from 'nativewind';

export type ThemeMode = 'dark' | 'light';

export const darkPalette = {
  canvas: '#1A1A1A',
  black: '#1A1A1A',
  surface: '#242423',
  graphite: '#2B2B2B',
  elevated: '#31302E',
  line: '#343330',
  lineStrong: '#474540',
  ivory: '#FAF8F5',
  white: '#FFFFFF',
  sand: '#F1ECE6',
  stone: '#A8A39B',
  muted: '#7B7770',
  gold: '#C9A24B',
  goldSoft: '#2E291F',
  champagne: '#F3E5B5',
  primaryBg: '#F3E5B5',
  sage: '#7C8068',
  sageLight: '#B6BC9F',
  sageSoft: '#272923',
  caramel: '#A9714F',
  caramelLight: '#D8A586',
  caramelSoft: '#2E241E',
  danger: '#E2847B',
  dangerSoft: '#33201E',
};

export const lightPalette: typeof darkPalette = {
  canvas: '#FAF8F5',
  black: '#1A1A1A',
  surface: '#FFFFFF',
  graphite: '#F1ECE6',
  elevated: '#EAE5DE',
  line: '#E8E5E0',
  lineStrong: '#D5CFC7',
  ivory: '#1A1A1A',
  white: '#FFFFFF',
  sand: '#2B2B2B',
  stone: '#6F6B64',
  muted: '#8F8A82',
  gold: '#C9A24B',
  goldSoft: '#F3E5B5',
  champagne: '#7A5928',
  primaryBg: '#F3E5B5',
  sage: '#7C8068',
  sageLight: '#064E3B',
  sageSoft: '#D1FAE5',
  caramel: '#A9714F',
  caramelLight: '#945F40',
  caramelSoft: '#F5EAE3',
  danger: '#881337',
  dangerSoft: '#FFE4E6',
};

export type ThemePalette = typeof darkPalette;

export const palettes: Record<ThemeMode, ThemePalette> = {
  dark: darkPalette,
  light: lightPalette,
};

// Compatibilidad por defecto (modo claro)
export const palette = lightPalette;

function toVars(p: ThemePalette) {
  return vars({
    '--color-canvas': p.canvas,
    '--color-black': p.black,
    '--color-surface': p.surface,
    '--color-graphite': p.graphite,
    '--color-elevated': p.elevated,
    '--color-line': p.line,
    '--color-line-strong': p.lineStrong,
    '--color-ivory': p.ivory,
    '--color-sand': p.sand,
    '--color-stone': p.stone,
    '--color-muted': p.muted,
    '--color-gold': p.gold,
    '--color-gold-soft': p.goldSoft,
    '--color-champagne': p.champagne,
    '--color-primary-bg': p.primaryBg,
    '--color-sage': p.sage,
    '--color-sage-light': p.sageLight,
    '--color-sage-soft': p.sageSoft,
    '--color-caramel': p.caramel,
    '--color-caramel-light': p.caramelLight,
    '--color-caramel-soft': p.caramelSoft,
    '--color-danger': p.danger,
    '--color-danger-soft': p.dangerSoft,
  });
}

export const themeVars = {
  dark: toVars(darkPalette),
  light: toVars(lightPalette),
};
