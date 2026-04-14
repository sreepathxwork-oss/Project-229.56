import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Effects } from '@react-three/drei';
import { UnrealBloomPass } from 'three-stdlib';
import * as THREE from 'three';

extend({ UnrealBloomPass });

const ParticleSwarm = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 12000; // Slightly reduced for performance as a background
  const speedMult = 0.5; // Slower for a more ambient background feel
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const pColor = useMemo(() => new THREE.Color(), []);
  const color = pColor; 
  
  const positions = useMemo(() => {
     const pos = [];
     for(let i=0; i<count; i++) pos.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
     return pos;
  }, [count]);

  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6 }), []);
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.15), []);

  const PARAMS = useMemo(() => ({"nodes":2.26,"activity":0.419,"geometry":18.5}), []);
  const addControl = (id: string, _l: string, _min: number, _max: number, val: number) => {
      return (PARAMS as any)[id] !== undefined ? (PARAMS as any)[id] : val;
  };

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speedMult;
    
    // Subtle scene rotation
    meshRef.current.rotation.y = time * 0.1;
    meshRef.current.rotation.x = Math.sin(time * 0.05) * 0.1;

    for (let i = 0; i < count; i++) {
        const nodes = addControl("nodes", "Synaptic Density", 1, 10, 5);
        const activity = addControl("activity", "Neural Pulse", 0.1, 3.0, 1.2);
        const geometryVal = addControl("geometry", "Core Coherence", 5.0, 50.0, 25.0);
        
        const t = time * activity;
        const idxRatio = i / count;
        
        const layerId = Math.floor(idxRatio * nodes);
        const layerNorm = layerId / nodes;
        const pIndex = i % (count / nodes);
        const pRatio = pIndex / (count / nodes);
        
        const theta = pRatio * Math.PI * 2.0;
        const phi = Math.acos(2.0 * ((pIndex + 0.5) / (count / nodes)) - 1.0);
        
        const layerRadius = geometryVal * (layerNorm + 0.5);
        const pulse = Math.sin(t + layerNorm * Math.PI) * 2.0;
        
        const streamX = Math.sin(phi) * Math.cos(theta + t * (layerNorm + 0.2));
        const streamY = Math.sin(phi) * Math.sin(theta + t * (layerNorm + 0.2));
        const streamZ = Math.cos(phi);
        
        const noise = Math.sin(i * 0.5 + t * 5.0) * (0.5 * layerNorm);
        const r = layerRadius + pulse + noise;
        
        const posX = streamX * r;
        const posY = streamY * r;
        const posZ = streamZ * r;
        
        const activation = Math.pow(Math.abs(Math.sin(idxRatio * 100.0 + t * 2.0)), 20.0);
        const spark = activation * 0.5;
        
        target.set(posX, posY, posZ);
        
        const baseHue = 0.55 + (layerNorm * 0.15); 
        const saturation = 0.8;
        const lightness = 0.1 + (layerNorm * 0.2) + spark;
        
        color.setHSL(baseHue % 1.0, saturation, Math.min(lightness, 1.0));
        
        positions[i].lerp(target, 0.05);
        dummy.position.copy(positions[i]);
        dummy.updateMatrix();
        meshRef.current.setMatrixAt(i, dummy.matrix);
        meshRef.current.setColorAt(i, pColor);
    }
    meshRef.current.instanceMatrix.needsUpdate = true;
    if (meshRef.current.instanceColor) meshRef.current.instanceColor.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} />
  );
};

export const NeuralBackground = () => {
  return (
    <div className="fixed inset-0 z-[-1] pointer-events-none">
      <div className="absolute inset-0 bg-void/40 backdrop-blur-[2px] z-[1]" />
      <Canvas camera={{ position: [0, 0, 60], fov: 60 }}>
        <fog attach="fog" args={['#000000', 10, 150]} />
        <ParticleSwarm />
        <Effects disableGamma>
            {/* @ts-ignore */}
            <unrealBloomPass threshold={0} strength={1.2} radius={0.5} />
        </Effects>
      </Canvas>
    </div>
  );
};
