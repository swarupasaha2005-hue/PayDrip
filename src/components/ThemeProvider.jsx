import React, { createContext, useContext, useState, useEffect } from 'react';
import { useUser } from '../hooks/useUser';

const ThemeContext = createContext();

const GENDER_ACCENTS = {
  female: { '--primary': '#EC4899', '--primary-dark': '#BE185D', '--accent': '#FBCFE8' },
  male:   { '--primary': '#3B82F6', '--primary-dark': '#1D4ED8', '--accent': '#BFDBFE' },
  other:  { '--primary': '#10B981', '--primary-dark': '#047857', '--accent': '#A7F3D0' },
  default:{ '--primary': '#8B5CF6', '--primary-dark': '#6D28D9', '--accent': '#DDD6FE' }
};

const MODE_VARS = {
  light: {
    '--bg': '#F8FAFC',
    '--surface': '#FFFFFF',
    '--surface-2': '#F1F5F9',
    '--border': '#E2E8F0',
    '--text': '#0F172A',
    '--text-2': '#334155',
    '--text-3': '#64748B',
    'cursor-fill': '#111827',
    'cursor-stroke': '#FFFFFF'
  },
  dark: {
    '--bg': '#0F172A',
    '--surface': '#1E293B',
    '--surface-2': '#334155',
    '--border': '#334155',
    '--text': '#F8FAFC',
    '--text-2': '#CBD5E1',
    '--text-3': '#94A3B8',
    'cursor-fill': '#F8FAFC',
    'cursor-stroke': '#000000'
  }
};

const makeCursor = (fill, stroke, scale = 1.3) => {
  const scaledWidth = Math.round(24 * scale);
  return `url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="${scaledWidth}" height="${scaledWidth}" viewBox="0 0 24 24" shape-rendering="crispEdges"><path d="M0 0v15h4v-3h3l3 5h4l-3-6h5L0 0z" fill="${encodeURIComponent(fill)}" stroke="${encodeURIComponent(stroke)}" stroke-width="1"/></svg>') 0 0`;
};

export function useTheme() {
  return useContext(ThemeContext);
}

export default function ThemeProvider({ children }) {
  const { gender } = useUser();
  const [themeMode, setThemeMode] = useState('dark');

  const toggleTheme = () => {
    setThemeMode(prev => prev === 'light' ? 'dark' : 'light');
  };

  useEffect(() => {
    const accents = GENDER_ACCENTS[gender] || GENDER_ACCENTS.default;
    const modes = MODE_VARS[themeMode];
    const root = document.documentElement;

    const merged = { ...accents, ...modes };
    Object.entries(merged).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    // Generate Adaptive Cursors
    root.style.setProperty('--cursor-default', `${makeCursor(merged['cursor-fill'], merged['cursor-stroke'], 1.2)}, auto`);
    root.style.setProperty('--cursor-pointer', `${makeCursor(merged['--primary'], merged['cursor-fill'], 1.3)}, pointer`);
    
    // Quick layout transition
    root.style.transition = 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease';
  }, [gender, themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
