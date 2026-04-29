import React, { useMemo } from 'react';

/**
 * GeometricSphere — Minimal, subtle wireframe sphere for ambient background depth.
 * Sits behind all UI content. Purely decorative, no interactivity.
 */
const RING_COUNT = 10;

export default function GeometricSphere() {
  const rings = useMemo(() =>
    Array.from({ length: RING_COUNT }, (_, i) => {
      const step = 90 / (RING_COUNT / 2);
      const angle = i * step;
      return (
        <div
          key={i}
          className="geo-sphere-ring"
          style={{ transform: i % 2 === 0 ? `rotateY(${angle}deg)` : `rotateX(${angle}deg)` }}
        />
      );
    }), []
  );

  return (
    <div className="geo-sphere-wrapper" aria-hidden="true">
      <div className="geo-sphere-core" />
      <div className="geo-sphere-rotator">
        {rings}
      </div>
    </div>
  );
}
