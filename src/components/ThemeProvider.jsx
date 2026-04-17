import React, { useEffect } from 'react';
import { useUser } from '../hooks/useUser';

const THEMES = {
  female: {
    '--primary': '#D8B4E2',
    '--primary-dark': '#C084D1',
    '--accent': '#FADDE1',
    '--bg': '#FDF9FF',
    '--surface': 'rgba(255, 255, 255, 0.45)',
    '--surface-2': 'rgba(250, 245, 252, 0.55)',
    '--border': 'rgba(255, 255, 255, 0.70)',
    '--text': '#311042',
    '--text-2': '#774C8B',
    '--shadow-md': '0 12px 32px rgba(216, 180, 226, 0.15)',
    '--card-grad': 'linear-gradient(135deg, rgba(216,180,226,0.8) 0%, rgba(250,221,225,0.7) 100%)',
    '--blob-1': '#E5C0ED',
    '--blob-2': '#FCE7EB',
    '--blob-3': '#D1C0F0',
  },
  male: {
    '--primary': '#4C63B6',
    '--primary-dark': '#2B3A7A',
    '--accent': '#E2C275',
    '--bg': '#F4F6FB',
    '--surface': 'rgba(255, 255, 255, 0.5)',
    '--surface-2': 'rgba(238, 242, 250, 0.6)',
    '--border': 'rgba(200, 210, 230, 0.4)',
    '--text': '#101C3D',
    '--text-2': '#475C8A',
    '--shadow-md': '0 12px 32px rgba(76, 99, 182, 0.12)',
    '--card-grad': 'linear-gradient(135deg, rgba(76,99,182,0.85) 0%, rgba(43,58,122,0.9) 100%)',
    '--blob-1': '#A9B8F0',
    '--blob-2': '#E5D6A8',
    '--blob-3': '#728BDA',
  },
  other: {
    '--primary': '#4DB6AC',
    '--primary-dark': '#00897B',
    '--accent': '#81C784',
    '--bg': '#F1FAF8',
    '--surface': 'rgba(255, 255, 255, 0.45)',
    '--surface-2': 'rgba(240, 252, 248, 0.55)',
    '--border': 'rgba(255, 255, 255, 0.65)',
    '--text': '#00332C',
    '--text-2': '#2F6B61',
    '--shadow-md': '0 12px 32px rgba(77, 182, 172, 0.15)',
    '--card-grad': 'linear-gradient(135deg, rgba(77,182,172,0.85) 0%, rgba(129,199,132,0.8) 100%)',
    '--blob-1': '#A7EBE3',
    '--blob-2': '#C8E6C9',
    '--blob-3': '#80CBC4',
  },
  default: {
    '--primary': '#B8A8FF',
    '--primary-dark': '#9B87FF',
    '--accent': '#F8BBD0',
    '--bg': '#F5F3FF',
    '--surface': 'rgba(255, 255, 255, 0.4)',
    '--surface-2': 'rgba(250, 249, 253, 0.5)',
    '--border': 'rgba(255, 255, 255, 0.6)',
    '--text': '#1E1B4B',
    '--text-2': '#6B7280',
    '--shadow-md': '0 12px 32px rgba(0, 0, 0, 0.08)',
    '--card-grad': 'linear-gradient(135deg, rgba(184,168,255,0.8) 0%, rgba(248,187,208,0.8) 100%)',
    '--blob-1': '#DCD3FF',
    '--blob-2': '#FCE7EB',
    '--blob-3': '#A7F3D0',
  }
};

export default function ThemeProvider({ children }) {
  const { gender } = useUser();

  useEffect(() => {
    const theme = THEMES[gender] || THEMES.default;
    const root = document.documentElement;

    Object.entries(theme).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    
    // Smooth transition for layout changes
    root.style.transition = 'all 0.6s cubic-bezier(0.16, 1, 0.3, 1)';
  }, [gender]);

  return <>{children}</>;
}
