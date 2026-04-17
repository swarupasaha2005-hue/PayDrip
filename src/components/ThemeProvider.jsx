import React, { useEffect } from 'react';
import { useUser } from '../hooks/useUser';

const THEMES = {
  female: {
    '--primary': '#D946EF',
    '--primary-dark': '#86198F',
    '--accent': '#FBCFE8',
    '--bg': '#0F0518',
    '--surface': 'rgba(217, 70, 239, 0.05)',
    '--surface-2': 'rgba(217, 70, 239, 0.1)',
    '--border': 'rgba(217, 70, 239, 0.2)',
    '--border-glow': 'rgba(217, 70, 239, 0.4)',
    '--text': '#FDF4FF',
    '--text-2': '#F0ABFC',
    '--shadow-md': '0 12px 32px rgba(217, 70, 239, 0.15), 0 0 30px rgba(217, 70, 239, 0.2), inset 0 0 20px rgba(217, 70, 239, 0.1)',
    '--card-grad': 'radial-gradient(circle at top right, rgba(217,70,239,0.3), transparent 60%), radial-gradient(circle at bottom left, rgba(134,25,143,0.3), transparent 70%), linear-gradient(135deg, rgba(217,70,239,0.1), rgba(134,25,143,0.05))',
    '--blob-1': '#D946EF',
    '--blob-2': '#BE185D',
    '--blob-3': '#6D28D9',
    '--shape-blob': '40% 60% 70% 30% / 50% 30% 70% 50%',
    '--shape-blob-hover': '50% 50% 60% 40% / 40% 60% 40% 60%',
    '--shape-organic': '30% 70% 50% 50% / 50% 30% 70% 50%',
  },
  male: {
    '--primary': '#3B82F6',
    '--primary-dark': '#1D4ED8',
    '--accent': '#93C5FD',
    '--bg': '#050B14',
    '--surface': 'rgba(59, 130, 246, 0.05)',
    '--surface-2': 'rgba(59, 130, 246, 0.1)',
    '--border': 'rgba(59, 130, 246, 0.2)',
    '--border-glow': 'rgba(59, 130, 246, 0.4)',
    '--text': '#EFF6FF',
    '--text-2': '#93C5FD',
    '--shadow-md': '0 12px 32px rgba(59, 130, 246, 0.15), 0 0 30px rgba(59, 130, 246, 0.2), inset 0 0 20px rgba(59, 130, 246, 0.1)',
    '--card-grad': 'radial-gradient(circle at top right, rgba(59,130,246,0.3), transparent 60%), radial-gradient(circle at bottom left, rgba(29,78,216,0.3), transparent 70%), linear-gradient(135deg, rgba(59,130,246,0.1), rgba(29,78,216,0.05))',
    '--blob-1': '#3B82F6',
    '--blob-2': '#0284C7',
    '--blob-3': '#4F46E5',
    '--shape-blob': '20% 20% 20% 20% / 20% 20% 20% 20%',
    '--shape-blob-hover': '25% 25% 25% 25% / 25% 25% 25% 25%',
    '--shape-organic': '15% 15% 15% 15% / 15% 15% 15% 15%',
  },
  other: {
    '--primary': '#10B981',
    '--primary-dark': '#047857',
    '--accent': '#6EE7B7',
    '--bg': '#021008',
    '--surface': 'rgba(16, 185, 129, 0.05)',
    '--surface-2': 'rgba(16, 185, 129, 0.1)',
    '--border': 'rgba(16, 185, 129, 0.2)',
    '--border-glow': 'rgba(16, 185, 129, 0.4)',
    '--text': '#ECFDF5',
    '--text-2': '#6EE7B7',
    '--shadow-md': '0 12px 32px rgba(16, 185, 129, 0.15), 0 0 30px rgba(16, 185, 129, 0.2), inset 0 0 20px rgba(16, 185, 129, 0.1)',
    '--card-grad': 'radial-gradient(circle at top right, rgba(16,185,129,0.3), transparent 60%), radial-gradient(circle at bottom left, rgba(4,120,87,0.3), transparent 70%), linear-gradient(135deg, rgba(16,185,129,0.1), rgba(4,120,87,0.05))',
    '--blob-1': '#10B981',
    '--blob-2': '#14B8A6',
    '--blob-3': '#22C55E',
    '--shape-blob': '60% 40% 30% 70% / 60% 30% 70% 40%',
    '--shape-blob-hover': '40% 60% 70% 30% / 40% 70% 30% 60%',
    '--shape-organic': '50% 50% 50% 50% / 60% 40% 60% 40%',
  },
  default: {
    '--primary': '#8B5CF6',
    '--primary-dark': '#6D28D9',
    '--accent': '#C4B5FD',
    '--bg': '#0A0A0F',
    '--surface': 'rgba(139, 92, 246, 0.05)',
    '--surface-2': 'rgba(139, 92, 246, 0.1)',
    '--border': 'rgba(139, 92, 246, 0.2)',
    '--border-glow': 'rgba(139, 92, 246, 0.4)',
    '--text': '#F5F3FF',
    '--text-2': '#C4B5FD',
    '--shadow-md': '0 12px 32px rgba(139, 92, 246, 0.15), 0 0 30px rgba(139, 92, 246, 0.2), inset 0 0 20px rgba(139, 92, 246, 0.1)',
    '--card-grad': 'radial-gradient(circle at top right, rgba(139,92,246,0.3), transparent 60%), radial-gradient(circle at bottom left, rgba(109,40,217,0.3), transparent 70%), linear-gradient(135deg, rgba(139,92,246,0.1), rgba(109,40,217,0.05))',
    '--blob-1': '#8B5CF6',
    '--blob-2': '#DB2777',
    '--blob-3': '#3B82F6',
    '--shape-blob': '60% 40% 30% 70% / 60% 30% 70% 40%',
    '--shape-blob-hover': '40% 60% 70% 30% / 40% 70% 30% 60%',
    '--shape-organic': '30% 70% 70% 30% / 30% 30% 70% 70%',
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
