"use client";

import React, { useRef, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useLocation } from "react-router-dom";

const navItems = [
  { label: 'Dashboard', href: '/dashboard' },
  { label: 'Payments', href: '/subscriptions' },
  { label: 'Planner', href: '/planner' },
  { label: 'Vault', href: '/vault' },
  { label: 'Activity', href: '/activity' },
  { label: 'Metrics', href: '/metrics' },
  { label: 'Contract', href: '/contract-view' }
];

export const SlideTabs = () => {
  const location = useLocation();
  const [position, setPosition] = useState({
    left: 0,
    width: 0,
    opacity: 0,
  });

  const initialIndex = navItems.findIndex(item => item.href === location.pathname);
  const [selected, setSelected] = useState(initialIndex !== -1 ? initialIndex : 0);
  
  const tabsRef = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    const index = navItems.findIndex(item => item.href === location.pathname);
    if (index !== -1) {
      setSelected(index);
    }
  }, [location.pathname]);

  const updateCursorToSelected = () => {
    const selectedTab = tabsRef.current[selected];
    if (selectedTab) {
      const { width } = selectedTab.getBoundingClientRect();
      setPosition({
        left: selectedTab.offsetLeft,
        width,
        opacity: 1,
      });
    }
  };

  const handleHover = (index: number) => {
    const target = tabsRef.current[index];
    if (!target) return;

    const { width } = target.getBoundingClientRect();
    setPosition({
      left: target.offsetLeft,
      width,
      opacity: 1,
    });
  };

  useEffect(() => {
    updateCursorToSelected();
    const timeout = setTimeout(updateCursorToSelected, 100);
    return () => clearTimeout(timeout);
  }, [selected]);

  return (
    <ul
      onMouseLeave={() => {
        updateCursorToSelected();
      }}
      style={{
        position: 'relative',
        margin: '0 auto',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        gap: '2px',
        width: 'fit-content',
        borderRadius: '100px',
        border: '1px solid rgba(255,255,255,0.06)',
        background: 'rgba(255,255,255,0.03)',
        padding: '6px',
        backdropFilter: 'blur(24px)',
        listStyle: 'none',
        boxShadow: '0 2px 16px rgba(0,0,0,0.2)'
      }}
    >
      {navItems.map((tab, i) => (
         <Tab
            key={tab.href}
            ref={(el) => (tabsRef.current[i] = el)}
            onMouseEnter={() => handleHover(i)}
            href={tab.href}
            isActive={selected === i}
          >
            {tab.label}
        </Tab>
      ))}

      <Cursor position={position} />
    </ul>
  );
};

const Tab = React.forwardRef<HTMLLIElement, { children: React.ReactNode; onMouseEnter: () => void; href: string; isActive: boolean }>(
  ({ children, onMouseEnter, href, isActive }, ref) => {
    return (
      <li
        ref={ref}
        onMouseEnter={onMouseEnter}
        style={{
          position: 'relative',
          zIndex: 10,
          display: 'block',
          cursor: 'pointer',
          padding: '10px 20px',
          fontSize: '12px',
          textTransform: 'uppercase' as const,
          transition: 'all 0.3s ease',
          fontWeight: 700,
          letterSpacing: '0.08em',
          listStyle: 'none',
          color: isActive ? 'white' : 'rgba(255,255,255,0.3)',
          fontFamily: 'Outfit, sans-serif'
        }}
      >
        <Link to={href} style={{ display: 'block', width: '100%', height: '100%', whiteSpace: 'nowrap', textDecoration: 'none', color: 'inherit' }}>
            {children}
        </Link>
      </li>
    );
  }
);

const Cursor = ({ position }: { position: any }) => {
  return (
    <motion.li
      animate={position}
      style={{
        position: 'absolute',
        zIndex: 0,
        height: '38px',
        listStyle: 'none',
        borderRadius: '100px',
        background: 'rgba(255,255,255,0.08)',
        backdropFilter: 'blur(4px)'
      }}
      transition={{ type: "spring", stiffness: 400, damping: 35 }}
    />
  );
};
