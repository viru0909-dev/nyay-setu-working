import React, { useRef, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, useAnimations, OrbitControls, Html } from '@react-three/drei';
import * as THREE from 'three';
import avatarModelUrl from '../../assets/old_man_in_coat_-_human_riged_model.glb';

function AvatarModel({ isTalking, state }) {
    const group = useRef();
    const { scene, animations } = useGLTF(avatarModelUrl);
    const { actions } = useAnimations(animations, group);

    // Jaw / Morph target refs tracking
    const jawBoneRef = useRef(null);
    const morphTargetRefs = useRef([]);
    const spineRef = useRef(null);

    // 1. Process scene for DoubleSide rendering and extract bones/morph targets
    useEffect(() => {
        // Reset refs on load
        morphTargetRefs.current = [];
        jawBoneRef.current = null;
        spineRef.current = null;

        scene.traverse((child) => {
            if (child.isMesh && child.material) {
                if (Array.isArray(child.material)) {
                    child.material.forEach((m) => (m.side = THREE.DoubleSide));
                } else {
                    child.material.side = THREE.DoubleSide;
                }

                // Check for morph targets related to the mouth/jaw/viseme
                if (child.morphTargetDictionary) {
                    const dict = child.morphTargetDictionary;
                    const possibleKeys = Object.keys(dict).filter((k) => 
                        k.toLowerCase().includes('jaw') || 
                        k.toLowerCase().includes('mouth') || 
                        k.toLowerCase().includes('viseme') ||
                        k.toLowerCase().includes('open')
                    );
                    if (possibleKeys.length > 0) {
                        morphTargetRefs.current.push({
                            mesh: child,
                            indices: possibleKeys.map(k => dict[k])
                        });
                    }
                }
            }

            // Fallback: Check for Jaw/Spine bones if no morph targets
            if (child.isBone) {
                const name = child.name.toLowerCase();
                if (name.includes('jaw') || name.includes('mouth')) {
                    jawBoneRef.current = child;
                }
                if (name.includes('spine') || name.includes('chest')) {
                    if (!spineRef.current) spineRef.current = child; // grab first spine
                }
            }
        });
    }, [scene]);

    // 2. Play Idle or Talking animations from the GLB (if they exist)
    useEffect(() => {
        if (!actions || Object.keys(actions).length === 0) return;

        const idleAnimName = Object.keys(actions).find((n) => n.toLowerCase().includes('idle'));
        const talkAnimName = Object.keys(actions).find((n) => n.toLowerCase().includes('talk') || n.toLowerCase().includes('speak'));

        const idleAction = idleAnimName ? actions[idleAnimName] : null;
        const talkAction = talkAnimName ? actions[talkAnimName] : null;

        if (isTalking && talkAction) {
            talkAction.reset().fadeIn(0.3).play();
            if (idleAction) idleAction.fadeOut(0.3);
        } else if (idleAction) {
            idleAction.reset().fadeIn(0.3).play();
            if (talkAction) talkAction.fadeOut(0.3);
        }

        return () => {
            if (idleAction) idleAction.fadeOut(0.3);
            if (talkAction) talkAction.fadeOut(0.3);
        }
    }, [isTalking, actions]);

    // 3. Lip-sync & Procedural motion inside useFrame
    useFrame(({ clock }) => {
        const time = clock.getElapsedTime();
        
        // Target mouth open weight (Sine wave simulated speech)
        // Frequency ~8hz to simulate fast talking mouth movement
        const targetWeight = isTalking 
            ? Math.abs(Math.sin(time * 15)) * (0.5 + 0.5 * Math.sin(time * 5)) 
            : 0;

        // Apply Morph Targets for Lip Sync
        let appliedMorph = false;
        if (morphTargetRefs.current.length > 0) {
            morphTargetRefs.current.forEach(({ mesh, indices }) => {
                indices.forEach((idx) => {
                    mesh.morphTargetInfluences[idx] = THREE.MathUtils.lerp(
                        mesh.morphTargetInfluences[idx],
                        targetWeight,
                        0.2
                    );
                    appliedMorph = true;
                });
            });
        }
        
        // Fallback: Apply Jaw bone rotation if no morph targets found
        if (!appliedMorph && jawBoneRef.current) {
            jawBoneRef.current.rotation.x = THREE.MathUtils.lerp(
                jawBoneRef.current.rotation.x,
                isTalking ? targetWeight * 0.3 : 0, 
                0.2
            );
        }

        // Procedural breathing / sway when listening / idle
        if (!isTalking && spineRef.current && (state === 'listening' || state === 'idle')) {
            spineRef.current.rotation.x = THREE.MathUtils.lerp(
                spineRef.current.rotation.x,
                Math.sin(time * 2) * 0.02,
                0.1
            );
        }
        
        // Hover effect for the entire group
        if (group.current) {
            group.current.position.y = -2.0 + Math.sin(time) * 0.02; // Restore to moderate y position to maintain visibility
        }
    });

    return (
        <group ref={group} dispose={null} position={[0, -2.0, 0]} scale={[2.1, 2.1, 2.1]}>
            <primitive object={scene} />
        </group>
    );
}

// Preload the model for faster rendering
useGLTF.preload(avatarModelUrl);

export default function VakilAvatar3D({ state = 'idle' }) {
    // The prompt requested a boolean prop for talking state
    const isTalking = state === 'talking';

    return (
        <div style={{ width: '100%', height: '100%', position: 'relative' }}>
            <Canvas camera={{ position: [0, 1.2, 5], fov: 35 }}>
                {/* Lighting */}
                <ambientLight intensity={0.7} />
                <directionalLight position={[2, 5, 5]} intensity={1.2} />
                
                {/* Rim Lights for dramatic effect */}
                <pointLight position={[-3, 2, -2]} color="#ffffff" intensity={1} />
                <pointLight position={[3, -2, -2]} color="#ffffff" intensity={1} />
                
                {/* Center / Face Light -> Brightens when talking */}
                <pointLight position={[0, 1.5, 2]} color="#ffffff" intensity={isTalking ? 1.5 : 0.8} />

                {/* 3D Content wrapper */}
                <React.Suspense fallback={
                    <Html center>
                        <div style={{ color: '#818cf8', fontWeight: 'bold' }}>Loading Avatar...</div>
                    </Html>
                }>
                    <AvatarModel isTalking={isTalking} state={state} />
                </React.Suspense>

                {/* Camera controls */}
                <OrbitControls 
                    enableZoom={false}
                    enablePan={false}
                    target={[0, 1.2, 0]} // Aim camera at the chest/neck level
                    maxPolarAngle={Math.PI / 2 + 0.1}
                    minPolarAngle={Math.PI / 2 - 0.5}
                />
            </Canvas>
        </div>
    );
}
