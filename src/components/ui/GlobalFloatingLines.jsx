import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useApp } from '../../hooks/useApp';
import { useUser } from '../../hooks/useUser';
import FloatingLines from './FloatingLines';

export default function GlobalFloatingLines() {
  const { activityFeed, onboardedUsers, dripFlows } = useApp();
  const { gender } = useUser();
  const location = useLocation();

  // Targets for interpolation
  const targets = useRef({ count: 6, speed: 0.5, bend: -0.5 });
  const [current, setCurrent] = useState({ count: 6, speed: 0.5, bend: -0.5 });
  
  const [gradient, setGradient] = useState(['#E947F5', '#FF8AFB']);
  const [waves, setWaves] = useState(['middle']);

  // Recalculate targets based on contexts
  useEffect(() => {
    let intensity = 1.0;
    if (location.pathname === '/activity') intensity = 1.2;
    if (location.pathname === '/dashboard') intensity = 0.6;
    if (location.pathname === '/planner') intensity = 0.9;

    const totalCount = activityFeed.length;
    const totalVol = activityFeed.reduce((acc, t) => acc + parseFloat(t.amount || 0), 0);
    const activeUsers = onboardedUsers.length;

    // Smooth limits: Lines between 5 and 15
    // Smooth limits: Strongly decouple line variations
    targets.current.count = Math.max(5, Math.min(10, 5 + Math.log10(totalCount + 1))) * intensity;
    
    // Ambient speed: Massive division to decouple high volume. Strict cap at 0.08 max.
    targets.current.speed = Math.max(0.01, Math.min(0.08, 0.02 + (totalVol / 1000000))) * intensity;
    
    // Ambient bend: Keep incredibly stable between -0.6 and -0.3
    targets.current.bend = Math.max(-0.6, Math.min(-0.3, -0.4 - (activeUsers * 0.01))) * intensity;

    // Gender Colors
    const gen = gender ? gender.toLowerCase() : '';
    if (gen === 'male') setGradient(['#2F4BA2', '#4BA5FA']);
    else if (gen === 'female' || !gen) setGradient(['#E947F5', '#FF8AFB']);
    else setGradient(['#10B981', '#34D399']); // Other

    // Risk based waves
    const hasHigh = dripFlows.some(f => f.strategy === 'aggressive' && f.status === 'active');
    const hasMed = dripFlows.some(f => f.strategy === 'balanced' && f.status === 'active');

    if (hasHigh) setWaves(['top', 'middle', 'bottom']);
    else if (hasMed) setWaves(['top', 'middle']);
    else setWaves(['middle']); // Conservative

  }, [activityFeed.length, activityFeed, onboardedUsers.length, dripFlows, gender, location.pathname]);

  // Smooth interpolation loop
  useEffect(() => {
    let frame;
    const lerp = (start, end, amt) => (1 - amt) * start + amt * end;
    let lastUpdate = Date.now();
    
    const loop = () => {
      frame = requestAnimationFrame(loop);
      
      const now = Date.now();
      if (now - lastUpdate < 33) return; // Throttling to ~30 updates per second for performance
      lastUpdate = now;

      setCurrent(prev => {
        const dCount = Math.abs(prev.count - targets.current.count);
        const dSpeed = Math.abs(prev.speed - targets.current.speed);
        const dBend = Math.abs(prev.bend - targets.current.bend);
        
        // Break early if we've reached target bounds
        if (dCount < 0.1 && dSpeed < 0.01 && dBend < 0.01) return prev;

        // Heavy Damping loop ~0.005 step
        return {
          count: lerp(prev.count, targets.current.count, 0.005),
          speed: lerp(prev.speed, targets.current.speed, 0.005),
          bend: lerp(prev.bend, targets.current.bend, 0.005)
        };
      });
    };
    loop();
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: -1, opacity: 0.8 }}>
      <FloatingLines 
        enabledWaves={waves}
        lineCount={Math.round(current.count)}
        lineDistance={[8, 6, 4]} 
        bendRadius={5.0}
        bendStrength={current.bend}
        interactive={true}
        parallax={true}
        linesGradient={gradient}
        animationSpeed={current.speed}
        mixBlendMode="screen"
      />
    </div>
  );
}
