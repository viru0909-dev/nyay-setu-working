import React from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import Avatar3D from './Avatar3D';

export default function VakilAvatar3D({ state = 'idle', audioData }) {
    // Map the external 'state' prop to the 'mode' prop expected by Avatar3D
    let mode = 'idle';
    if (state === 'talking' || state === 'speaking') mode = 'speaking';
    if (state === 'thinking' || state === 'processing') mode = 'thinking';

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas camera={{ position: [0, 1.5, 2.5], fov: 35 }}>
                {/* Lighting */}
                <ambientLight intensity={1.2} />
                <directionalLight position={[0, 2, 5]} intensity={1.5} color="#ffffff" castShadow />
                <directionalLight position={[-3, -2, -2]} intensity={0.5} color="#abcdef" />
                <directionalLight position={[3, -2, -2]} intensity={0.5} color="#fedcba" />

                {/* Procedural Avatar — no async loading needed */}
                <Avatar3D mode={mode} audioData={audioData} />

                {/* Camera controls */}
                <OrbitControls
                    enableZoom={false}
                    enablePan={false}
                    target={[0, 1.2, 0]}
                    maxPolarAngle={Math.PI / 2 + 0.1}
                    minPolarAngle={Math.PI / 2 - 0.5}
                />
            </Canvas>
        </div>
    );
}
