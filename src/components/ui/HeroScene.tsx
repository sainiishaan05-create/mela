'use client'

import { useRef, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Float, MeshDistortMaterial, Sphere, Torus, MeshWobbleMaterial } from '@react-three/drei'
import * as THREE from 'three'

function GoldOrb({ position, scale = 1, speed = 1 }: { position: [number, number, number]; scale?: number; speed?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.2 * speed
    meshRef.current.rotation.y = state.clock.elapsedTime * 0.3 * speed
  })
  return (
    <Float speed={speed * 1.5} rotationIntensity={0.4} floatIntensity={0.8}>
      <Sphere ref={meshRef} args={[1, 64, 64]} position={position} scale={scale}>
        <MeshDistortMaterial
          color="#C8A96A"
          emissive="#8B6914"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
          distort={0.35}
          speed={2}
          transparent
          opacity={0.85}
        />
      </Sphere>
    </Float>
  )
}

function GoldRing({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  useFrame((state) => {
    if (!meshRef.current) return
    meshRef.current.rotation.x = state.clock.elapsedTime * 0.15
    meshRef.current.rotation.z = state.clock.elapsedTime * 0.1
  })
  return (
    <Float speed={1.2} rotationIntensity={0.6} floatIntensity={1}>
      <Torus ref={meshRef} args={[1, 0.25, 32, 100]} position={position} scale={scale}>
        <MeshWobbleMaterial
          color="#D4B97A"
          emissive="#C8A96A"
          emissiveIntensity={0.2}
          metalness={1}
          roughness={0.05}
          factor={0.3}
          speed={1.5}
          transparent
          opacity={0.7}
        />
      </Torus>
    </Float>
  )
}

function ParticleField() {
  const count = 120
  const positions = useMemo(() => {
    const arr = new Float32Array(count * 3)
    for (let i = 0; i < count; i++) {
      arr[i * 3]     = (Math.random() - 0.5) * 20
      arr[i * 3 + 1] = (Math.random() - 0.5) * 20
      arr[i * 3 + 2] = (Math.random() - 0.5) * 10
    }
    return arr
  }, [])

  const pointsRef = useRef<THREE.Points>(null)
  useFrame((state) => {
    if (!pointsRef.current) return
    pointsRef.current.rotation.y = state.clock.elapsedTime * 0.02
    pointsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.01) * 0.05
  })

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial color="#C8A96A" size={0.04} transparent opacity={0.5} sizeAttenuation />
    </points>
  )
}

export default function HeroScene() {
  return (
    <Canvas
      camera={{ position: [0, 0, 8], fov: 50 }}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 1.5]}
    >
      <ambientLight intensity={0.3} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#C8A96A" />
      <pointLight position={[-5, -3, 3]} intensity={1} color="#E8C97A" />
      <pointLight position={[0, -5, 2]} intensity={0.5} color="#FF6B35" />

      <ParticleField />
      <GoldOrb position={[-4, 1.5, -2]} scale={1.2} speed={0.8} />
      <GoldOrb position={[4.5, -1, -3]} scale={0.8} speed={1.2} />
      <GoldOrb position={[2, 2.5, -4]} scale={0.5} speed={1.5} />
      <GoldRing position={[3.5, 1, -1]} scale={0.9} />
      <GoldRing position={[-3, -1.5, -2]} scale={0.6} />
    </Canvas>
  )
}
