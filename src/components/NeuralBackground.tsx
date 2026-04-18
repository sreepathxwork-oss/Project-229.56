import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, extend } from '@react-three/fiber';
import { Effects } from '@react-three/drei';
import { UnrealBloomPass } from 'three-stdlib';
import * as THREE from 'three';

extend({ UnrealBloomPass });

const ParticleSwarm = () => {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const count = 4000; // Optimized for performance while maintaining visual density
  const speedMult = 0.4;
  const dummy = useMemo(() => new THREE.Object3D(), []);
  const target = useMemo(() => new THREE.Vector3(), []);
  const pColor = useMemo(() => new THREE.Color(), []);
  const color = pColor; 
  
  const positions = useMemo(() => {
     const pos = [];
     for(let i=0; i<count; i++) pos.push(new THREE.Vector3((Math.random()-0.5)*100, (Math.random()-0.5)*100, (Math.random()-0.5)*100));
     return pos;
  }, [count]);

  const material = useMemo(() => new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.7 }), []);
  const geometry = useMemo(() => new THREE.TetrahedronGeometry(0.18), []);

  const nodes = 3;
  const activity = 0.6;
  const geometryVal = 22;

  useFrame((state) => {
    if (!meshRef.current) return;
    const time = state.clock.getElapsedTime() * speedMult;
    
    meshRef.current.rotation.y = time * 0.08;
    meshRef.current.rotation.x = Math.sin(time * 0.04) * 0.06;

    for (let i = 0; i < count; i++) {
        const t = time * activity;
        const idxRatio = i / count;
        
        const layerId = Math.floor(idxRatio * nodes);
        const layerNorm = layerId / nodes;
        const pIndex = i % (count / nodes);
        const pRatio = pIndex / (count / nodes);
        
        const theta = pRatio * Math.PI * 2.0;
        const phi = Math.acos(2.0 * ((pIndex + 0.5) / (count / nodes)) - 1.0);
        
        const layerRadius = geometryVal * (layerNorm + 0.4);
        const pulse = Math.sin(t + layerNorm * Math.PI) * 1.5;
        
        const streamX = Math.sin(phi) * Math.cos(theta + t * (layerNorm + 0.3));
        const streamY = Math.sin(phi) * Math.sin(theta + t * (layerNorm + 0.3));
        const streamZ = Math.cos(phi);
        
        const noise = Math.sin(i * 0.5 + t * 4.0) * (0.8 * layerNorm);
        const r = layerRadius + pulse + noise;
        
        target.set(streamX * r, streamY * r, streamZ * r);
        
        const activation = Math.pow(Math.abs(Math.sin(idxRatio * 80.0 + t * 2.5)), 15.0);
        const spark = activation * 0.6;
        
        // Vibrant creative color shifts (Cycling through Cyan, Magenta, Purple, Gold)
        const baseHue = (0.5 + (layerNorm * 0.3) + (time * 0.05)) % 1.0; 
        const saturation = 0.9;
        const lightness = 0.15 + (layerNorm * 0.25) + spark;
        
        color.setHSL(baseHue, saturation, Math.min(lightness, 1.0));
        
        positions[i].lerp(target, 0.08);
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
