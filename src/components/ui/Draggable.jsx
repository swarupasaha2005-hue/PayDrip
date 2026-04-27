import React, { useState, useRef, useEffect } from 'react';

export default function Draggable({ id, children, defaultPosition = { x: 0, y: 0 } }) {
  const [position, setPosition] = useState(defaultPosition);
  const [isDragging, setIsDragging] = useState(false);
  const offsetRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    // If not dragging, we don't need these global listeners
    if (!isDragging) return;

    const handlePointerMove = (e) => {
      setPosition({
        x: e.clientX - offsetRef.current.x,
        y: e.clientY - offsetRef.current.y,
      });
    };

    const handlePointerUp = () => {
      setIsDragging(false);
      // Automatically export to global window for easy access
      window.__LAYOUT_COORDS__ = window.__LAYOUT_COORDS__ || {};
      window.__LAYOUT_COORDS__[id] = position;
    };

    window.addEventListener('pointermove', handlePointerMove);
    window.addEventListener('pointerup', handlePointerUp);

    return () => {
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerup', handlePointerUp);
    };
  }, [isDragging, position, id]);

  const handlePointerDown = (e) => {
    if (e.target.closest('button') || e.target.closest('a')) return; // Allow clicking buttons
    e.preventDefault();
    setIsDragging(true);
    offsetRef.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  return (
    <div
      onPointerDown={handlePointerDown}
      style={{
        position: 'fixed',
        left: position.x + 'px',
        top: position.y + 'px',
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: 1000,
        touchAction: 'none'
      }}
      data-draggable-id={id}
    >
      {children}
    </div>
  );
}
