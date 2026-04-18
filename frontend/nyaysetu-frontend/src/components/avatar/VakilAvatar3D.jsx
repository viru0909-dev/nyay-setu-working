import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

function AnimatedSphere({ state = 'idle' }) {
    const meshRef = useRef();
    const glowRef = useRef();
    const particlesRef = useRef();
    const time = useRef(0);

    // Generate small orbiting particles
    const particlePositions = useMemo(() => {
        const positions = new Float32Array(30 * 3);
        for (let i = 0; i < 30; i++) {
            const theta = Math.random() * Math.PI * 2;
            const phi = Math.random() * Math.PI;
            const r = 0.6 + Math.random() * 0.3;
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);
        }
        return positions;
    }, []);

    useFrame((_, delta) => {
        time.current += delta;
        const t = time.current;

        if (meshRef.current) {
            // Gentle slow rotation
            meshRef.current.rotation.y += delta * 0.15;

            // Very subtle floating bob
            meshRef.current.position.y = Math.sin(t * 0.5) * 0.03;

            // State-based — all very subtle
            if (state === 'thinking' || state === 'processing') {
                meshRef.current.rotation.y += delta * 0.4;
            } else if (state === 'talking' || state === 'speaking') {
                const pulse = 1 + Math.sin(t * 3) * 0.02;
                meshRef.current.scale.setScalar(pulse);
            } else {
                meshRef.current.scale.setScalar(1);
            }
        }

        // Animate glow ring — slow steady rotation
        if (glowRef.current) {
            glowRef.current.rotation.y -= delta * 0.08;
        }

        // Animate particles — very slow drift
        if (particlesRef.current) {
            particlesRef.current.rotation.y += delta * 0.08;
        }
    });

    // Color based on state
    const stateColor = {
        idle: '#6366f1',
        thinking: '#f59e0b',
        talking: '#3b82f6',
        speaking: '#3b82f6',
        listening: '#ef4444',
        passive: '#f59e0b',
        processing: '#f59e0b'
    };

    const color = stateColor[state] || '#6366f1';

    return (
        <group position={[0, 0, 0]}>
            {/* Main sphere — small */}
            <mesh ref={meshRef}>
                <sphereGeometry args={[0.35, 64, 64]} />
                <meshStandardMaterial
                    color={color}
                    metalness={0.3}
                    roughness={0.15}
                    emissive={color}
                    emissiveIntensity={0.3}
                    envMapIntensity={1.0}
                />
            </mesh>

            {/* Outer glow ring */}
            <mesh ref={glowRef}>
                <torusGeometry args={[0.55, 0.008, 16, 100]} />
                <meshBasicMaterial color={color} transparent opacity={0.5} />
            </mesh>

            {/* Second ring */}
            <mesh rotation={[Math.PI / 3, 0, 0]}>
                <torusGeometry args={[0.62, 0.006, 16, 100]} />
                <meshBasicMaterial color={color} transparent opacity={0.2} />
            </mesh>

            {/* Orbiting particles */}
            <points ref={particlesRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        count={30}
                        array={particlePositions}
                        itemSize={3}
                    />
                </bufferGeometry>
                <pointsMaterial
                    color={color}
                    size={0.02}
                    transparent
                    opacity={0.7}
                    sizeAttenuation
                />
            </points>
        </group>
    );
}

export default function VakilAvatar3D({ state = 'idle', audioData }) {
    let mode = 'idle';
    if (state === 'talking' || state === 'speaking') mode = 'speaking';
    if (state === 'thinking' || state === 'processing') mode = 'thinking';
    if (state === 'listening') mode = 'listening';

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas camera={{ position: [0, 0, 3], fov: 40 }}>
                {/* Lighting */}
                <ambientLight intensity={0.6} />
                <directionalLight position={[2, 3, 5]} intensity={1.2} color="#ffffff" />
                <directionalLight position={[-3, -1, -2]} intensity={0.4} color="#818cf8" />
                <pointLight position={[0, 0, 2]} intensity={0.8} color="#6366f1" />

                {/* Animated Sphere — centered */}
                <AnimatedSphere state={mode} />
            </Canvas>
        </div>
    );
}
