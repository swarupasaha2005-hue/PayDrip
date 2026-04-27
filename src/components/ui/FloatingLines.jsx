import React, { useEffect, useRef } from 'react';
import {
  Mesh,
  OrthographicCamera,
  PlaneGeometry,
  Scene,
  ShaderMaterial,
  Vector2,
  Vector3,
  WebGLRenderer
} from 'three';

import './FloatingLines.css';

const vertexShader = `
precision highp float;

void main() {
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const fragmentShader = `
precision highp float;

uniform float iTime;
uniform vec3  iResolution;
uniform float animationSpeed;

uniform bool enableTop;
uniform bool enableMiddle;
uniform bool enableBottom;

uniform int topLineCount;
uniform int middleLineCount;
uniform int bottomLineCount;

uniform float topLineDistance;
uniform float middleLineDistance;
uniform float bottomLineDistance;

uniform vec3 topWavePosition;
uniform vec3 middleWavePosition;
uniform vec3 bottomWavePosition;

uniform vec2 iMouse;
uniform bool interactive;
uniform float bendRadius;
uniform float bendStrength;
uniform float bendInfluence;

uniform bool parallax;
uniform float parallaxStrength;
uniform vec2 parallaxOffset;

uniform vec3 lineGradient[8];
uniform int lineGradientCount;

const vec3 BLACK = vec3(0.0);
const vec3 PINK  = vec3(233.0, 71.0, 245.0) / 255.0;
const vec3 BLUE  = vec3(47.0,  75.0, 162.0) / 255.0;

mat2 rotate(float r) {
  return mat2(cos(r), sin(r), -sin(r), cos(r));
}

vec3 background_color(vec2 uv) {
  vec3 col = vec3(0.0);

  float y = sin(uv.x - 0.2) * 0.3 - 0.1;
  float m = uv.y - y;

  col += mix(BLUE, BLACK, smoothstep(0.0, 1.0, abs(m)));
  col += mix(PINK, BLACK, smoothstep(0.0, 1.0, abs(m - 0.8)));
  return col * 0.5;
}

vec3 getLineColor(float t, vec3 baseColor) {
  if (lineGradientCount <= 0) {
    return baseColor;
  }

  vec3 gradientColor;
  
  if (lineGradientCount == 1) {
    gradientColor = lineGradient[0];
  } else {
    float clampedT = clamp(t, 0.0, 0.9999);
    float scaled = clampedT * float(lineGradientCount - 1);
    int idx = int(floor(scaled));
    float f = fract(scaled);
    int idx2 = min(idx + 1, lineGradientCount - 1);

    vec3 c1 = lineGradient[idx];
    vec3 c2 = lineGradient[idx2];
    
    gradientColor = mix(c1, c2, f);
  }
  
  return gradientColor * 0.5;
}

float wave(vec2 uv, float offset, vec2 screenUv, vec2 mouseUv, bool shouldBend) {
  float time = iTime * animationSpeed;

  float x_offset   = offset;
  float x_movement = time * 0.1;
  float amp        = sin(offset + time * 0.2) * 0.3;
  float y          = sin(uv.x + x_offset + x_movement) * amp;

  if (shouldBend) {
    vec2 d = screenUv - mouseUv;
    float influence = exp(-dot(d, d) * bendRadius); // radial falloff around cursor
    float bendOffset = (mouseUv.y - screenUv.y) * influence * bendStrength * bendInfluence;
    y += bendOffset;
  }

  float m = uv.y - y;
  return 0.0175 / max(abs(m) + 0.01, 1e-3) + 0.01;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {
  vec2 baseUv = (2.0 * fragCoord - iResolution.xy) / iResolution.y;
  baseUv.y *= -1.0;
  
  if (parallax) {
    baseUv += parallaxOffset;
  }

  vec3 col = vec3(0.0);

  vec3 b = lineGradientCount > 0 ? vec3(0.0) : background_color(baseUv);

  vec2 mouseUv = vec2(0.0);
  if (interactive) {
    mouseUv = (2.0 * iMouse - iResolution.xy) / iResolution.y;
    mouseUv.y *= -1.0;
  }
  
  if (enableBottom) {
    for (int i = 0; i < bottomLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(bottomLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      
      float angle = bottomWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(bottomLineDistance * fi + bottomWavePosition.x, bottomWavePosition.y),
        1.5 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.2;
    }
  }

  if (enableMiddle) {
    for (int i = 0; i < middleLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(middleLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      
      float angle = middleWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      col += lineCol * wave(
        ruv + vec2(middleLineDistance * fi + middleWavePosition.x, middleWavePosition.y),
        2.0 + 0.15 * fi,
        baseUv,
        mouseUv,
        interactive
      );
    }
  }

  if (enableTop) {
    for (int i = 0; i < topLineCount; ++i) {
      float fi = float(i);
      float t = fi / max(float(topLineCount - 1), 1.0);
      vec3 lineCol = getLineColor(t, b);
      
      float angle = topWavePosition.z * log(length(baseUv) + 1.0);
      vec2 ruv = baseUv * rotate(angle);
      ruv.x *= -1.0;
      col += lineCol * wave(
        ruv + vec2(topLineDistance * fi + topWavePosition.x, topWavePosition.y),
        1.0 + 0.2 * fi,
        baseUv,
        mouseUv,
        interactive
      ) * 0.1;
    }
  }

  fragColor = vec4(col, 1.0);
}

void main() {
  vec4 color = vec4(0.0);
  mainImage(color, gl_FragCoord.xy);
  gl_FragColor = color;
}
`;

const MAX_GRADIENT_STOPS = 8;

function hexToVec3(hex) {
  let value = hex.trim();
  if (value.startsWith('#')) {
    value = value.slice(1);
  }
  let r = 255; let g = 255; let b = 255;
  if (value.length === 3) {
    r = parseInt(value[0] + value[0], 16);
    g = parseInt(value[1] + value[1], 16);
    b = parseInt(value[2] + value[2], 16);
  } else if (value.length === 6) {
    r = parseInt(value.slice(0, 2), 16);
    g = parseInt(value.slice(2, 4), 16);
    b = parseInt(value.slice(4, 6), 16);
  }
  return new Vector3(r / 255, g / 255, b / 255);
}

export default function FloatingLines({
  linesGradient,
  enabledWaves = ['top', 'middle', 'bottom'],
  lineCount = [6],
  lineDistance = [5],
  topWavePosition,
  middleWavePosition,
  bottomWavePosition = { x: 2.0, y: -0.7, rotate: -1 },
  animationSpeed = 1,
  interactive = true,
  bendRadius = 5.0,
  bendStrength = -0.5,
  mouseDamping = 0.05,
  parallax = true,
  parallaxStrength = 0.2,
  mixBlendMode = 'screen'
}) {
  const containerRef = useRef(null);
  const targetMouseRef = useRef(new Vector2(-1000, -1000));
  const currentMouseRef = useRef(new Vector2(-1000, -1000));
  const targetInfluenceRef = useRef(0);
  const currentInfluenceRef = useRef(0);
  const targetParallaxRef = useRef(new Vector2(0, 0));
  const currentParallaxRef = useRef(new Vector2(0, 0));

  // Hold a ref to the uniforms so we can mutate them without rebuilding the context
  const uniformsRef = useRef(null);

  const getLineCount = waveType => {
    if (typeof lineCount === 'number') return lineCount;
    if (!enabledWaves.includes(waveType)) return 0;
    const index = enabledWaves.indexOf(waveType);
    return lineCount[index] ?? 6;
  };

  const getLineDistance = waveType => {
    if (typeof lineDistance === 'number') return lineDistance;
    if (!enabledWaves.includes(waveType)) return 0.1;
    const index = enabledWaves.indexOf(waveType);
    return lineDistance[index] ?? 0.1;
  };

  // 1. Initial WebGL Setup (Runs exactly once)
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let active = true;
    const scene = new Scene();
    const camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
    camera.position.z = 1;

    // Use a slightly dark clear color to ensure it matches PayDrip themes well if alpha drops
    const renderer = new WebGLRenderer({ antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setClearColor(0x050510, 1); // Non-white clear color per request
    renderer.domElement.style.width = '100%';
    renderer.domElement.style.height = '100%';
    container.appendChild(renderer.domElement);

    const uniforms = {
      iTime: { value: 0 },
      iResolution: { value: new Vector3(1, 1, 1) },
      animationSpeed: { value: 1.0 },

      enableTop: { value: true },
      enableMiddle: { value: true },
      enableBottom: { value: true },

      topLineCount: { value: 0 },
      middleLineCount: { value: 0 },
      bottomLineCount: { value: 0 },

      topLineDistance: { value: 0 },
      middleLineDistance: { value: 0 },
      bottomLineDistance: { value: 0 },

      topWavePosition: { value: new Vector3(10.0, 0.5, -0.4) },
      middleWavePosition: { value: new Vector3(5.0, 0.0, 0.2) },
      bottomWavePosition: { value: new Vector3(2.0, -0.7, 0.4) },

      iMouse: { value: new Vector2(-1000, -1000) },
      interactive: { value: true },
      bendRadius: { value: 5.0 },
      bendStrength: { value: -0.5 },
      bendInfluence: { value: 0 },

      parallax: { value: true },
      parallaxStrength: { value: 0.2 },
      parallaxOffset: { value: new Vector2(0, 0) },

      lineGradient: { value: Array.from({ length: MAX_GRADIENT_STOPS }, () => new Vector3(1, 1, 1)) },
      lineGradientCount: { value: 0 }
    };

    uniformsRef.current = uniforms;

    const material = new ShaderMaterial({ uniforms, vertexShader, fragmentShader });
    const geometry = new PlaneGeometry(2, 2);
    const mesh = new Mesh(geometry, material);
    scene.add(mesh);

    const startTime = performance.now();

    const setSize = () => {
      if (!active) return;
      const width = container.clientWidth || 1;
      const height = container.clientHeight || 1;
      renderer.setSize(width, height, false);
      const canvasWidth = renderer.domElement.width;
      const canvasHeight = renderer.domElement.height;
      uniforms.iResolution.value.set(canvasWidth, canvasHeight, 1);
    };

    setSize();
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(() => { if (active) setSize(); }) : null;
    if (ro) ro.observe(container);

    const handlePointerMove = event => {
      const rect = renderer.domElement.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      const dpr = renderer.getPixelRatio();

      targetMouseRef.current.set(x * dpr, (rect.height - y) * dpr);
      targetInfluenceRef.current = 1.0;

      if (uniformsRef.current.parallax.value) {
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const offsetX = (x - centerX) / rect.width;
        const offsetY = -(y - centerY) / rect.height;
        const parallaxStr = uniformsRef.current.parallaxStrength.value;
        targetParallaxRef.current.set(offsetX * parallaxStr, offsetY * parallaxStr);
      }
    };

    const handlePointerLeave = () => {
      targetInfluenceRef.current = 0.0;
    };

    renderer.domElement.addEventListener('pointermove', handlePointerMove);
    renderer.domElement.addEventListener('pointerleave', handlePointerLeave);

    let raf = 0;
    const renderLoop = () => {
      if (!active) return;

      uniforms.iTime.value = (performance.now() - startTime) / 1000;

      if (uniforms.interactive.value) {
        // Assume mouseDamping is passed into uniforms, or hardcoded for smoother interactions
        const damp = uniformsRef.current?.mouseDamping || 0.05;
        currentMouseRef.current.lerp(targetMouseRef.current, damp);
        uniforms.iMouse.value.copy(currentMouseRef.current);

        currentInfluenceRef.current += (targetInfluenceRef.current - currentInfluenceRef.current) * damp;
        uniforms.bendInfluence.value = currentInfluenceRef.current;
      }

      if (uniforms.parallax.value) {
        const damp = uniformsRef.current?.mouseDamping || 0.05;
        currentParallaxRef.current.lerp(targetParallaxRef.current, damp);
        uniforms.parallaxOffset.value.copy(currentParallaxRef.current);
      }

      renderer.render(scene, camera);
      raf = requestAnimationFrame(renderLoop);
    };
    renderLoop();

    return () => {
      active = false;
      cancelAnimationFrame(raf);
      if (ro) ro.disconnect();
      renderer.domElement.removeEventListener('pointermove', handlePointerMove);
      renderer.domElement.removeEventListener('pointerleave', handlePointerLeave);
      
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement) {
        renderer.domElement.parentElement.removeChild(renderer.domElement);
      }
    };
  }, []); // EMPTÍED DEPENDENCIES: Only mount ONCE globally.

  // 2. Reactive Prop Synchronization Layer
  useEffect(() => {
    if (!uniformsRef.current) return;
    const u = uniformsRef.current;

    u.animationSpeed.value = animationSpeed;
    
    u.enableTop.value = enabledWaves.includes('top');
    u.enableMiddle.value = enabledWaves.includes('middle');
    u.enableBottom.value = enabledWaves.includes('bottom');

    u.topLineCount.value = enabledWaves.includes('top') ? getLineCount('top') : 0;
    u.middleLineCount.value = enabledWaves.includes('middle') ? getLineCount('middle') : 0;
    u.bottomLineCount.value = enabledWaves.includes('bottom') ? getLineCount('bottom') : 0;

    u.topLineDistance.value = enabledWaves.includes('top') ? getLineDistance('top') * 0.01 : 0.01;
    u.middleLineDistance.value = enabledWaves.includes('middle') ? getLineDistance('middle') * 0.01 : 0.01;
    u.bottomLineDistance.value = enabledWaves.includes('bottom') ? getLineDistance('bottom') * 0.01 : 0.01;

    // Optional positional overrides
    if (topWavePosition) u.topWavePosition.value.set(topWavePosition.x, topWavePosition.y, topWavePosition.rotate);
    if (middleWavePosition) u.middleWavePosition.value.set(middleWavePosition.x, middleWavePosition.y, middleWavePosition.rotate);
    if (bottomWavePosition) u.bottomWavePosition.value.set(bottomWavePosition.x, bottomWavePosition.y, bottomWavePosition.rotate);

    u.interactive.value = interactive;
    u.bendRadius.value = bendRadius;
    u.bendStrength.value = bendStrength;
    
    u.parallax.value = parallax;
    u.parallaxStrength.value = parallaxStrength;
    // We attach mouseDamping dynamically back to the ref object so the render loop can grab it.
    u.mouseDamping = mouseDamping;

    if (linesGradient && linesGradient.length > 0) {
      const stops = linesGradient.slice(0, MAX_GRADIENT_STOPS);
      u.lineGradientCount.value = stops.length;
      stops.forEach((hex, i) => {
        const color = hexToVec3(hex);
        u.lineGradient.value[i].lerp(color, 0.1); // Allows the gradient stops to subtly shift into place.
      });
    } else {
      u.lineGradientCount.value = 0;
    }

  }, [
    linesGradient, enabledWaves, lineCount, lineDistance,
    topWavePosition, middleWavePosition, bottomWavePosition,
    animationSpeed, interactive, bendRadius, bendStrength,
    mouseDamping, parallax, parallaxStrength
  ]);

  return (
    <div
      ref={containerRef}
      className="floating-lines-container"
      style={{
        mixBlendMode: mixBlendMode
      }}
    />
  );
}
