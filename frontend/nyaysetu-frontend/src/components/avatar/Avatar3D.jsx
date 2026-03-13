import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

// ─── Skin & Clothing Palette ───
const SKIN = '#c68642';
const SKIN_DARK = '#a0522d';
const HAIR = '#1a1a2e';
const SUIT = '#1e293b';
const SHIRT = '#f8fafc';
const TIE = '#7c3aed';
const EYE_WHITE = '#f1f5f9';
const PUPIL = '#0f172a';
const LIP = '#8b4513';

// Helper: create a material once
function mat(color) {
  return new THREE.MeshStandardMaterial({ color, roughness: 0.6, metalness: 0.1 });
}

// ─── Individual Body Part Components ───

function Head({ mouthRef }) {
  return (
    <group position={[0, 1.62, 0]}>
      {/* Skull */}
      <mesh>
        <sphereGeometry args={[0.22, 32, 32]} />
        <meshStandardMaterial color={SKIN} roughness={0.5} />
      </mesh>

      {/* Hair (back cap) */}
      <mesh position={[0, 0.06, -0.04]} scale={[1.05, 0.9, 1.0]}>
        <sphereGeometry args={[0.22, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.55]} />
        <meshStandardMaterial color={HAIR} roughness={0.8} />
      </mesh>
      {/* Hair sides */}
      <mesh position={[-0.18, 0.03, 0.04]}>
        <boxGeometry args={[0.06, 0.12, 0.14]} />
        <meshStandardMaterial color={HAIR} roughness={0.8} />
      </mesh>
      <mesh position={[0.18, 0.03, 0.04]}>
        <boxGeometry args={[0.06, 0.12, 0.14]} />
        <meshStandardMaterial color={HAIR} roughness={0.8} />
      </mesh>

      {/* Left Eye */}
      <group position={[-0.075, 0.03, 0.19]}>
        <mesh>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color={EYE_WHITE} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <sphereGeometry args={[0.018, 16, 16]} />
          <meshStandardMaterial color={PUPIL} roughness={0.2} />
        </mesh>
      </group>

      {/* Right Eye */}
      <group position={[0.075, 0.03, 0.19]}>
        <mesh>
          <sphereGeometry args={[0.035, 16, 16]} />
          <meshStandardMaterial color={EYE_WHITE} roughness={0.3} />
        </mesh>
        <mesh position={[0, 0, 0.025]}>
          <sphereGeometry args={[0.018, 16, 16]} />
          <meshStandardMaterial color={PUPIL} roughness={0.2} />
        </mesh>
      </group>

      {/* Eyebrows */}
      <mesh position={[-0.075, 0.075, 0.19]} rotation={[0, 0, 0.15]}>
        <boxGeometry args={[0.06, 0.012, 0.015]} />
        <meshStandardMaterial color={HAIR} roughness={0.7} />
      </mesh>
      <mesh position={[0.075, 0.075, 0.19]} rotation={[0, 0, -0.15]}>
        <boxGeometry args={[0.06, 0.012, 0.015]} />
        <meshStandardMaterial color={HAIR} roughness={0.7} />
      </mesh>

      {/* Nose */}
      <mesh position={[0, -0.01, 0.21]}>
        <coneGeometry args={[0.025, 0.06, 8]} />
        <meshStandardMaterial color={SKIN_DARK} roughness={0.6} />
      </mesh>

      {/* Ears */}
      <mesh position={[-0.22, 0.0, 0.0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={SKIN_DARK} roughness={0.6} />
      </mesh>
      <mesh position={[0.22, 0.0, 0.0]}>
        <sphereGeometry args={[0.04, 8, 8]} />
        <meshStandardMaterial color={SKIN_DARK} roughness={0.6} />
      </mesh>

      {/* Mouth – scaled dynamically for lip sync */}
      <mesh ref={mouthRef} position={[0, -0.08, 0.2]}>
        <boxGeometry args={[0.08, 0.02, 0.02]} />
        <meshStandardMaterial color={LIP} roughness={0.5} />
      </mesh>

      {/* Mustache */}
      <mesh position={[0, -0.05, 0.2]}>
        <boxGeometry args={[0.09, 0.015, 0.018]} />
        <meshStandardMaterial color={HAIR} roughness={0.7} />
      </mesh>
    </group>
  );
}

function Neck() {
  return (
    <mesh position={[0, 1.4, 0]}>
      <cylinderGeometry args={[0.06, 0.07, 0.08, 16]} />
      <meshStandardMaterial color={SKIN} roughness={0.5} />
    </mesh>
  );
}

function Torso() {
  return (
    <group position={[0, 1.1, 0]}>
      {/* Suit jacket */}
      <mesh>
        <boxGeometry args={[0.5, 0.55, 0.25]} />
        <meshStandardMaterial color={SUIT} roughness={0.7} metalness={0.05} />
      </mesh>

      {/* Shirt V (visible beneath jacket) */}
      <mesh position={[0, 0.1, 0.126]}>
        <planeGeometry args={[0.12, 0.35]} />
        <meshStandardMaterial color={SHIRT} roughness={0.4} side={THREE.DoubleSide} />
      </mesh>

      {/* Tie */}
      <mesh position={[0, 0.05, 0.13]}>
        <boxGeometry args={[0.04, 0.3, 0.01]} />
        <meshStandardMaterial color={TIE} roughness={0.4} metalness={0.15} />
      </mesh>
      {/* Tie knot */}
      <mesh position={[0, 0.2, 0.135]}>
        <sphereGeometry args={[0.025, 8, 8]} />
        <meshStandardMaterial color={TIE} roughness={0.4} />
      </mesh>

      {/* Collar left */}
      <mesh position={[-0.06, 0.24, 0.12]} rotation={[0, 0, 0.4]}>
        <boxGeometry args={[0.08, 0.06, 0.015]} />
        <meshStandardMaterial color={SHIRT} roughness={0.4} />
      </mesh>
      {/* Collar right */}
      <mesh position={[0.06, 0.24, 0.12]} rotation={[0, 0, -0.4]}>
        <boxGeometry args={[0.08, 0.06, 0.015]} />
        <meshStandardMaterial color={SHIRT} roughness={0.4} />
      </mesh>

      {/* Lapel left */}
      <mesh position={[-0.14, 0.12, 0.125]} rotation={[0, 0, 0.25]}>
        <boxGeometry args={[0.1, 0.3, 0.012]} />
        <meshStandardMaterial color={SUIT} roughness={0.7} />
      </mesh>
      {/* Lapel right */}
      <mesh position={[0.14, 0.12, 0.125]} rotation={[0, 0, -0.25]}>
        <boxGeometry args={[0.1, 0.3, 0.012]} />
        <meshStandardMaterial color={SUIT} roughness={0.7} />
      </mesh>

      {/* Suit buttons */}
      <mesh position={[0, 0.05, 0.13]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color={'#0f172a'} roughness={0.3} metalness={0.3} />
      </mesh>
      <mesh position={[0, -0.05, 0.13]}>
        <sphereGeometry args={[0.012, 8, 8]} />
        <meshStandardMaterial color={'#0f172a'} roughness={0.3} metalness={0.3} />
      </mesh>
    </group>
  );
}



function Arm({ side, armRef }) {
  const s = side === 'left' ? -1 : 1;
  return (
    <group ref={armRef} position={[s * 0.3, 1.28, 0]}>
      {/* Upper arm */}
      <mesh position={[0, -0.12, 0]}>
        <boxGeometry args={[0.1, 0.28, 0.12]} />
        <meshStandardMaterial color={SUIT} roughness={0.7} />
      </mesh>

      {/* Forearm pivot */}
      <group position={[0, -0.28, 0]}>
        {/* Forearm */}
        <mesh position={[0, -0.1, 0]}>
          <boxGeometry args={[0.09, 0.24, 0.11]} />
          <meshStandardMaterial color={SUIT} roughness={0.7} />
        </mesh>

        {/* Hand */}
        <group position={[0, -0.25, 0]}>
          <mesh>
            <boxGeometry args={[0.08, 0.06, 0.04]} />
            <meshStandardMaterial color={SKIN} roughness={0.5} />
          </mesh>
          {/* Fingers (simplified) */}
          <mesh position={[0, -0.05, 0]}>
            <boxGeometry args={[0.07, 0.05, 0.03]} />
            <meshStandardMaterial color={SKIN} roughness={0.5} />
          </mesh>
        </group>
      </group>
    </group>
  );
}


// ─── Main Avatar Component ───

export default function Avatar3D({ mode = 'idle', audioData }) {
  const groupRef = useRef();
  const headGroupRef = useRef();
  const mouthRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();

  useFrame((state) => {
    const t = state.clock.getElapsedTime();

    // ── Breathing (whole body gentle sway) ──
    if (groupRef.current) {
      groupRef.current.position.y = Math.sin(t * 1.5) * 0.005;
    }

    // ── Head animations ──
    if (headGroupRef.current) {
      switch (mode) {
        case 'idle':
          headGroupRef.current.rotation.y = Math.sin(t * 0.4) * 0.06;
          headGroupRef.current.rotation.x = 0;
          headGroupRef.current.rotation.z = 0;
          break;
        case 'thinking':
          headGroupRef.current.rotation.y = Math.sin(t * 0.25) * 0.1;
          headGroupRef.current.rotation.z = Math.sin(t * 0.35) * 0.12;
          headGroupRef.current.rotation.x = -0.05;
          break;
        case 'speaking':
          headGroupRef.current.rotation.x = Math.sin(t * 3.5) * 0.04; // nodding
          headGroupRef.current.rotation.y = Math.sin(t * 0.8) * 0.06;
          headGroupRef.current.rotation.z = 0;
          break;
        default:
          break;
      }
    }

    // ── Lip Sync ──
    if (mouthRef.current) {
      let openness = 0;
      if (mode === 'speaking') {
        if (audioData && audioData.length > 0) {
          let sum = 0;
          for (let i = 0; i < audioData.length; i++) sum += Math.abs(audioData[i]);
          openness = Math.min((sum / audioData.length) * 6, 1);
        } else {
          // Simulated lip movement when no real audio data
          openness = (Math.sin(t * 8) * 0.5 + 0.5) * 0.7;
        }
      }
      // Scale mouth Y from 0.02 (closed) to ~0.08 (open)
      const scaleY = 1 + openness * 3;
      mouthRef.current.scale.y = THREE.MathUtils.lerp(mouthRef.current.scale.y, scaleY, 0.3);
      // Shift mouth down slightly when open
      mouthRef.current.position.y = -0.08 - openness * 0.015;
    }

    // ── Arm / Hand Gestures ──
    if (leftArmRef.current && rightArmRef.current) {
      switch (mode) {
        case 'idle':
          // Arms relaxed at sides, gentle sway
          leftArmRef.current.rotation.x = Math.sin(t * 0.5) * 0.02;
          leftArmRef.current.rotation.z = 0.05;
          rightArmRef.current.rotation.x = Math.sin(t * 0.5 + 1) * 0.02;
          rightArmRef.current.rotation.z = -0.05;
          break;

        case 'thinking':
          // Right hand near chin (thinking pose)
          rightArmRef.current.rotation.x = -0.9;
          rightArmRef.current.rotation.z = -0.3;
          leftArmRef.current.rotation.x = 0.1;
          leftArmRef.current.rotation.z = 0.08;
          break;

        case 'speaking':
          // Animated gesticulating - both hands move expressively
          leftArmRef.current.rotation.x = -0.3 + Math.sin(t * 2.2) * 0.25;
          leftArmRef.current.rotation.z = 0.15 + Math.sin(t * 1.8) * 0.1;
          rightArmRef.current.rotation.x = -0.4 + Math.sin(t * 2.5 + 1.5) * 0.3;
          rightArmRef.current.rotation.z = -0.15 + Math.cos(t * 2.0) * 0.12;
          break;

        default:
          break;
      }
    }
  });

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      {/* Head group for rotation */}
      <group ref={headGroupRef}>
        <Head mouthRef={mouthRef} />
      </group>

      <Neck />
      <Torso />
      <Arm side="left" armRef={leftArmRef} />
      <Arm side="right" armRef={rightArmRef} />
    </group>
  );
}
