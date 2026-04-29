import React, { useState, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../hooks/useUser';
import { ShieldCheck, Zap, Globe, User, UserCircle } from 'lucide-react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { shaderMaterial } from '@react-three/drei';
import * as THREE from 'three';
import GeometricSphere from '../components/ui/geometric-sphere';

// ─── Inline Fluid Shader (the living blob) ──────────────────
const FluidMaterial = shaderMaterial(
  {
    uTime: 0,
    uMouse: new THREE.Vector2(0, 0),
    uColorA: new THREE.Color("#8B5CF6"),
    uColorB: new THREE.Color("#EC4899"),
    uColorC: new THREE.Color("#3B82F6"),
  },
  // Vertex
  `
    uniform float uTime;
    uniform vec2 uMouse;
    varying vec3 vNormal;
    varying vec3 vPosition;

    vec3 mod289(vec3 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 mod289(vec4 x){return x-floor(x*(1.0/289.0))*289.0;}
    vec4 permute(vec4 x){return mod289(((x*34.0)+1.0)*x);}
    vec4 taylorInvSqrt(vec4 r){return 1.79284291400159-0.85373472095314*r;}
    float snoise(vec3 v){
      const vec2 C=vec2(1.0/6.0,1.0/3.0);
      const vec4 D=vec4(0.0,0.5,1.0,2.0);
      vec3 i=floor(v+dot(v,C.yyy));
      vec3 x0=v-i+dot(i,C.xxx);
      vec3 g=step(x0.yzx,x0.xyz);
      vec3 l=1.0-g;
      vec3 i1=min(g.xyz,l.zxy);
      vec3 i2=max(g.xyz,l.zxy);
      vec3 x1=x0-i1+C.xxx;
      vec3 x2=x0-i2+C.yyy;
      vec3 x3=x0-D.yyy;
      i=mod289(i);
      vec4 p=permute(permute(permute(
        i.z+vec4(0.0,i1.z,i2.z,1.0))
        +i.y+vec4(0.0,i1.y,i2.y,1.0))
        +i.x+vec4(0.0,i1.x,i2.x,1.0));
      float n_=0.142857142857;
      vec3 ns=n_*D.wyz-D.xzx;
      vec4 j=p-49.0*floor(p*ns.z*ns.z);
      vec4 x_=floor(j*ns.z);
      vec4 y_=floor(j-7.0*x_);
      vec4 x=x_*ns.x+ns.yyyy;
      vec4 y=y_*ns.x+ns.yyyy;
      vec4 h=1.0-abs(x)-abs(y);
      vec4 b0=vec4(x.xy,y.xy);
      vec4 b1=vec4(x.zw,y.zw);
      vec4 s0=floor(b0)*2.0+1.0;
      vec4 s1=floor(b1)*2.0+1.0;
      vec4 sh=-step(h,vec4(0.0));
      vec4 a0=b0.xzyw+s0.xzyw*sh.xxyy;
      vec4 a1=b1.xzyw+s1.xzyw*sh.zzww;
      vec3 p0=vec3(a0.xy,h.x);
      vec3 p1=vec3(a0.zw,h.y);
      vec3 p2=vec3(a1.xy,h.z);
      vec3 p3=vec3(a1.zw,h.w);
      vec4 norm=taylorInvSqrt(vec4(dot(p0,p0),dot(p1,p1),dot(p2,p2),dot(p3,p3)));
      p0*=norm.x;p1*=norm.y;p2*=norm.z;p3*=norm.w;
      vec4 m=max(0.6-vec4(dot(x0,x0),dot(x1,x1),dot(x2,x2),dot(x3,x3)),0.0);
      m=m*m;
      return 42.0*dot(m*m,vec4(dot(p0,x0),dot(p1,x1),dot(p2,x2),dot(p3,x3)));
    }

    void main(){
      vNormal=normalize(normalMatrix*normal);
      vPosition=position;
      float mouseDist=distance(position.xy,uMouse*2.0);
      float displacement=snoise(position*2.0+uTime*0.15)*0.35;
      displacement-=smoothstep(0.0,1.5,mouseDist)*0.3;
      vec3 newPosition=position+normal*displacement;
      gl_Position=projectionMatrix*modelViewMatrix*vec4(newPosition,1.0);
    }
  `,
  // Fragment
  `
    uniform vec3 uColorA;
    uniform vec3 uColorB;
    uniform vec3 uColorC;
    varying vec3 vNormal;
    varying vec3 vPosition;
    void main(){
      float fresnel=pow(1.0+dot(vNormal,vec3(0.0,0.0,1.0)),2.5);
      vec3 color=mix(uColorA,uColorB,vNormal.y*0.5+0.5);
      color=mix(color,uColorC,vPosition.x*0.3+0.5);
      gl_FragColor=vec4(color+fresnel*0.15,1.0);
    }
  `
);

extend({ FluidMaterial });

function FluidBlob() {
  const matRef = React.useRef();
  const mouse = React.useRef(new THREE.Vector2(0, 0));

  React.useEffect(() => {
    const onMove = (e) => {
      mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  useFrame(({ clock }) => {
    if (matRef.current) {
      matRef.current.uTime = clock.getElapsedTime();
      matRef.current.uMouse.lerp(mouse.current, 0.05);
    }
  });

  return (
    <mesh>
      <icosahedronGeometry args={[1.8, 64]} />
      <fluidMaterial
        ref={matRef}
        key={FluidMaterial.key}
        uColorA={new THREE.Color("#8B5CF6")}
        uColorB={new THREE.Color("#EC4899")}
        uColorC={new THREE.Color("#3B82F6")}
        blending={THREE.AdditiveBlending}
        transparent
      />
    </mesh>
  );
}

// ─── Features Data ──────────────────────────────────────────
const features = [
  { icon: ShieldCheck, title: 'Self-custodial', sub: 'Your keys, your funds via Freighter', color: '#B8A8FF' },
  { icon: Zap,         title: 'Instant & Low-fee', sub: 'Stellar Testnet transactions', color: '#FFB347' },
  { icon: Globe,       title: 'Schedule Payments', sub: 'Lock and release funds by date', color: '#F8BBD0' },
];

// ─── Main Component ─────────────────────────────────────────
export default function Onboarding() {
  const navigate = useNavigate();
  const { name, setName, gender, setGender } = useUser();
  const [step, setStep] = useState(1);

  const handleFinish = (e) => {
    e.preventDefault();
    if (name.trim() && gender) {
      navigate('/dashboard');
    }
  };

  const themeColors = {
    male: {
      accent: '#3b82f6',
      glow: 'rgba(59, 130, 246, 0.25)',
      bg: 'rgba(59, 130, 246, 0.03)'
    },
    female: {
      accent: '#ec4899',
      glow: 'rgba(236, 72, 153, 0.25)',
      bg: 'rgba(236, 72, 153, 0.03)'
    },
    other: {
      accent: '#10b981',
      glow: 'rgba(16, 185, 129, 0.25)',
      bg: 'rgba(16, 185, 129, 0.03)'
    }
  };

  const themeGradients = {
    male: {
      start: '#94b9ff',
      end: '#5c8eff',
      glow: 'rgba(92, 142, 255, 0.15)'
    },
    female: {
      start: '#ff9eb5',
      end: '#f472b6',
      glow: 'rgba(244, 114, 182, 0.15)'
    },
    other: {
      start: '#86efac',
      end: '#10b981',
      glow: 'rgba(16, 185, 129, 0.15)'
    },
    default: {
      start: '#F1F5F9',
      end: '#94A3B8',
      glow: 'rgba(255, 255, 255, 0.05)'
    }
  };

  const curGrad = themeGradients[gender] || themeGradients.default;

  const activeTheme = gender ? themeColors[gender] : {
    accent: 'rgba(255, 255, 255, 0.05)',
    glow: 'rgba(0, 0, 0, 0)',
    bg: 'transparent'
  };

  const GenderButton = ({ value, label }) => {
    const active = gender === value;
    return (
      <button 
        type="button"
        onClick={() => setGender(value)}
        className="dark-btn"
        style={{
          width: '100%',
          padding: '16px',
          borderRadius: '25px',
          backgroundColor: active ? '#222' : '#171717',
          boxShadow: active ? `inset 2px 5px 15px rgb(0, 0, 0), 0 0 20px ${themeColors[value].glow}` : 'inset 2px 5px 10px rgb(5, 5, 5)',
          border: active ? `1px solid ${themeColors[value].accent}` : '1px solid transparent',
          color: active ? 'white' : '#d3d3d3',
          transition: '.4s ease-in-out',
          transform: active ? 'scale(1.05)' : 'scale(1)'
        }}
      >
        {label}
      </button>
    );
  };

  // ─── Step 1: Landing ────────────────────────────────────
  if (step === 1) {
    return (
      <div style={{ 
        position: 'relative', 
        zIndex: 1, 
        minHeight: '100vh', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        padding: 40,
        '--h-grad-start': curGrad.start,
        '--h-grad-end': curGrad.end,
        '--h-glow': curGrad.glow
      }}>
        <GeometricSphere />
          <div className="fade-up" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 80, maxWidth: 1100, width: '100%', alignItems: 'center' }}>
            <div style={{ paddingRight: 40 }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: 56 }}>
                <div style={{ 
                  width: '180px', height: '50px',
                  backgroundColor: 'white',
                  backgroundImage: 'linear-gradient(135deg, white, rgba(255,255,255,0.5))',
                  maskImage: 'url(/logo.png)', WebkitMaskImage: 'url(/logo.png)',
                  maskSize: 'contain', WebkitMaskSize: 'contain',
                  maskRepeat: 'no-repeat', WebkitMaskRepeat: 'no-repeat',
                  maskPosition: 'left center', WebkitMaskPosition: 'left center',
                  filter: 'drop-shadow(0 0 20px rgba(255,255,255,0.15))'
                }} />
              </div>
              <h1 style={{ color: 'white', marginBottom: 32, fontSize: 52 }}>
                Automate your<br />
                <span style={{ 
                  background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'
                }}>
                  payments
                </span><br />
                effortlessly
              </h1>
              <p style={{ fontSize: 18, color: 'var(--text-3)', marginBottom: 48, maxWidth: 480, lineHeight: 1.7, fontWeight: 500 }}>
                Liquid-first financial planning for the Stellar ecosystem. Securely lock, stream, and schedule XLM.
              </p>
              <button onClick={() => setStep(2)} className="pd-btn pd-btn-primary" style={{ padding: '18px 56px', fontSize: 16, borderRadius: '100px' }}>
                Get Started
              </button>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {features.map((f) => {
                const Icon = f.icon;
                return (
                  <div key={f.title} className="glass-panel" style={{ display: 'flex', alignItems: 'center', gap: 24, padding: '28px 36px' }}>
                    <div style={{ width: 56, height: 56, borderRadius: 'var(--radius-md)', background: `${f.color}0D`, display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${f.color}1A` }}>
                      <Icon size={24} color={f.color} />
                    </div>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 18, color: 'white', marginBottom: 4 }}>{f.title}</div>
                      <div style={{ fontSize: 14, color: 'var(--text-3)', fontWeight: 500 }}>{f.sub}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
    );
  }

  // ─── Step 2: Identity Form ──────────────────────────────
  return (
    <div style={{ 
      position: 'relative', 
      zIndex: 1, 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      '--h-grad-start': curGrad.start,
      '--h-grad-end': curGrad.end,
      '--h-glow': curGrad.glow
    }}>
      <GeometricSphere />
        <form 
          className="dark-form" 
          onSubmit={handleFinish} 
          style={{ 
            width: '440px', 
            borderColor: activeTheme.accent,
            boxShadow: `0 0 40px ${activeTheme.glow}`,
            background: gender ? `${activeTheme.bg}` : '#171717',
            transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
          }}
        >
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ width: 64, height: 64, borderRadius: 'var(--radius-lg)', background: 'rgba(255, 255, 255, 0.03)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 24px', border: '1px solid rgba(255, 255, 255, 0.05)' }}>
              <UserCircle size={32} color="#d3d3d3" />
            </div>
            <h2 style={{ fontSize: 24, fontWeight: 700, color: 'white' }}>Initialize Identity</h2>
            <p style={{ color: 'var(--text-3)', fontSize: 14, marginTop: 8, fontWeight: 500 }}>Create your decentralized profile.</p>
          </div>
          
          <div style={{ marginBottom: 32 }}>
            <label className="pd-field-label" style={{ marginBottom: 12, display: 'block', marginLeft: '12px' }}>Display Name</label>
            <div 
              className="dark-field" 
              style={{ 
                borderColor: activeTheme.accent, 
                borderWidth: '1px', 
                borderStyle: 'solid',
                transition: 'all 0.5s ease-in-out'
              }}
            >
              <div style={{ paddingLeft: '4px', display: 'flex', alignItems: 'center' }}>
                <User size={18} color={gender ? activeTheme.accent : "#666"} style={{ transition: 'color 0.5s ease' }} />
              </div>
              <input autoComplete="off" placeholder="How should we call you?" className="dark-input" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>
          </div>

          <div style={{ marginBottom: 40 }}>
            <label className="pd-field-label" style={{ marginBottom: 16, display: 'block', marginLeft: '12px' }}>Identification</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12 }}>
              <GenderButton value="male" label="Male" />
              <GenderButton value="female" label="Female" />
            </div>
            <GenderButton value="other" label="Non-Binary / Other" />
          </div>

          <button 
            type="submit" className="dark-btn" 
            style={{ 
              width: '100%', 
              padding: '18px', 
              borderRadius: '25px', 
              fontSize: 15, 
              opacity: (name.trim() && gender) ? 1 : 0.4,
              background: gender ? 'var(--primary)' : '#252525',
              color: gender ? 'white' : '#d3d3d3',
              boxShadow: gender ? '0 4px 24px var(--primary-glow)' : 'none',
              transition: 'all 0.5s ease'
            }}
            disabled={!name.trim() || !gender}
          >
            Finalize Profile
          </button>
        </form>
      </div>
  );
}
