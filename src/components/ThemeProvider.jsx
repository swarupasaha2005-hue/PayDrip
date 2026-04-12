import React, { useEffect } from 'react';
import { useUser } from '../context/UserContext';

const THEMES = {
  female: {
    '--primary': '#CBC2F5',
    '--primary-dark': '#B8A8FF',
    '--accent': '#F5DFF5',
    '--bg': '#FDFCFE',
    '--surface': '#FFFFFF',
    '--surface-2': '#F5F3FF',
    '--border': 'rgba(203, 194, 245, 0.4)',
    '--text': '#2E1065',
    '--text-2': '#6D28D9',
    '--shadow-md': '0 8px 30px rgba(203, 194, 245, 0.15)',
    '--card-grad': 'linear-gradient(135deg, #D1DAFF 0%, #E7D0F5 100%)',
    '--logo-grad': 'linear-gradient(135deg, #CBC2F5 0%, #E7D0F5 100%)',
    '--nav-active': '#F5F3FF',
    '--btn-hover': '#B8A8FF'
  },
  male: {
    '--primary': '#1C1917',
    '--primary-dark': '#000000',
    '--accent': '#A8A29E',
    '--bg': '#F5F5F4',
    '--surface': '#FFFFFF',
    '--surface-2': '#E7E5E4',
    '--border': 'rgba(0, 0, 0, 0.1)',
    '--text': '#1C1917',
    '--text-2': '#44403C',
    '--shadow-md': '0 10px 25px rgba(0, 0, 0, 0.08)',
    '--card-grad': 'linear-gradient(135deg, #44403C 0%, #1C1917 100%)',
    '--logo-grad': 'linear-gradient(135deg, #44403C 0%, #1C1917 100%)',
    '--nav-active': '#E7E5E4',
    '--btn-hover': '#333333'
  },
  other: {
    '--primary': '#0D9488',
    '--primary-dark': '#0F766E',
    '--accent': '#818CF8',
    '--bg': '#F8FAFC',
    '--surface': '#FFFFFF',
    '--surface-2': '#F1F5F9',
    '--border': 'rgba(13, 148, 136, 0.2)',
    '--text': '#0F172A',
    '--text-2': '#475569',
    '--shadow-md': '0 8px 25px rgba(13, 148, 136, 0.12)',
    '--card-grad': 'linear-gradient(135deg, #0D9488 0%, #818CF8 100%)',
    '--logo-grad': 'linear-gradient(135deg, #0D9488 0%, #818CF8 100%)',
    '--nav-active': '#F1F5F9',
    '--btn-hover': '#0F766E'
  },
  default: {
    '--primary': '#B8A8FF',
    '--primary-dark': '#9B87FF',
    '--accent': '#F8BBD0',
    '--bg': '#F5F3FF',
    '--surface': '#FFFFFF',
    '--surface-2': '#FAF9FD',
    '--border': 'rgba(184, 168, 255, 0.2)',
    '--text': '#1E1B4B',
    '--text-2': '#6B7280',
    '--shadow-md': '0 8px 24px rgba(139, 92, 246, 0.10)',
    '--card-grad': 'linear-gradient(135deg, #B8A8FF 0%, #F8BBD0 100%)',
    '--logo-grad': 'linear-gradient(135deg, #B8A8FF 0%, #F8BBD0 100%)',
    '--nav-active': '#FAF9FD',
    '--btn-hover': '#9B87FF'
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
    
    // Smooth transition for bg colors
    root.style.transition = 'background-color 0.4s ease, border-color 0.4s ease';
  }, [gender]);

  return <>{children}</>;
}
