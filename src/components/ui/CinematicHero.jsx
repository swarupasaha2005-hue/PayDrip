import React from 'react';

export default function CinematicHero({ children, height = 'auto', minHeight = '400px', padding = '80px 0', breakout = false }) {

  return (
    <div style={{ 
      position: 'relative', 
      width: breakout ? 'calc(100% + 80px)' : '100%', 
      marginLeft: breakout ? '-40px' : '0',
      height, 
      minHeight, 
      overflow: 'hidden',
      padding,
      backgroundColor: 'transparent',
      zIndex: 1
    }}>
      {/* Content Layer */}
      <div style={{ 
        position: 'relative', 
        zIndex: 10,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center'
      }}>
        {children}
      </div>
    </div>
  );
}
