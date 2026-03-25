import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, Float, PerspectiveCamera } from '@react-three/drei'
import { Physics, RigidBody } from '@react-three/rapier'
import * as THREE from 'three'

function Track() {
  const markers = useMemo(() => Array.from({ length: 30 }, (_, index) => index), [])

  return (
    <group>
      <mesh receiveShadow position={[0, -0.35, 0]}>
        <boxGeometry args={[180, 0.18, 2.8]} />
        <meshStandardMaterial color="#2b313a" metalness={0.15} roughness={0.85} />
      </mesh>
      {markers.map(marker => (
        <mesh key={marker} position={[-60 + marker * 4, -0.23, 0]}>
          <boxGeometry args={[0.14, 0.04, 1.8]} />
          <meshStandardMaterial color="#8ea0b5" metalness={0.3} roughness={0.45} />
        </mesh>
      ))}
    </group>
  )
}

function CartRig({ controls, paused, runKey, onMetricsChange }) {
  const cartRef = useRef(null)
  const arrowRef = useRef(null)
  const pulseTimeLeft = useRef(0)
  const { camera } = useThree()

  useEffect(() => {
    pulseTimeLeft.current = controls.forceMode === 'pulse' ? 0.28 : 0
  }, [controls.forceMode, runKey])

  useEffect(() => {
    const body = cartRef.current
    if (!body) {
      return
    }

    body.setTranslation({ x: -8, y: 0.08, z: 0 }, true)
    body.setLinvel({ x: controls.initialSpeed, y: 0, z: 0 }, true)
    body.setAngvel({ x: 0, y: 0, z: 0 }, true)
    pulseTimeLeft.current = controls.forceMode === 'pulse' ? 0.28 : 0
    onMetricsChange({
      speed: controls.initialSpeed,
      netForce: 0,
      stateLabel: '已重置',
    })
  }, [controls.initialSpeed, controls.forceMode, onMetricsChange, runKey])

  useFrame((_, delta) => {
    const body = cartRef.current
    if (!body) {
      return
    }

    const dt = Math.min(delta, 1 / 30)
    const velocity = body.linvel()
    let force = 0

    if (!paused) {
      if (controls.forceMode === 'continuous') {
        force += 2.4
      } else if (controls.forceMode === 'pulse' && pulseTimeLeft.current > 0) {
        force += 6
        pulseTimeLeft.current = Math.max(0, pulseTimeLeft.current - dt)
      }

      if (Math.abs(velocity.x) > 0.0001) {
        force -= Math.sign(velocity.x) * controls.friction * 5.5
      }

      body.applyImpulse({ x: force * dt, y: 0, z: 0 }, true)
    }

    const nextVelocity = body.linvel()
    const nextTranslation = body.translation()
    const speed = Math.abs(nextVelocity.x)

    camera.position.lerp(new THREE.Vector3(nextTranslation.x + 5.6, 2.8, 8.2), 0.08)
    camera.lookAt(nextTranslation.x, 0.5, 0)

    if (arrowRef.current) {
      arrowRef.current.position.set(nextTranslation.x + 1.3, 1.35, 0)
      arrowRef.current.scale.x = Math.max(0.6, Math.min(2.4, speed / 2))
    }

    let stateLabel = '匀速观察'
    if (paused) {
      stateLabel = '已暂停'
    } else if (speed < 0.04) {
      stateLabel = '近似静止'
    } else if (controls.forceMode === 'continuous') {
      stateLabel = '受持续外力'
    } else if (controls.friction <= 0.005) {
      stateLabel = '接近惯性运动'
    } else if (force < 0) {
      stateLabel = '被摩擦减速'
    }

    onMetricsChange({
      speed,
      netForce: force,
      stateLabel,
    })
  })

  return (
    <>
      <RigidBody
        ref={cartRef}
        colliders="cuboid"
        canSleep={false}
        restitution={0}
        friction={0}
        linearDamping={0}
        angularDamping={1}
        enabledRotations={[false, false, false]}
        enabledTranslations={[true, false, false]}
      >
        <Float speed={1.8} rotationIntensity={0.08} floatIntensity={0.06}>
          <mesh castShadow position={[0, 0.16, 0]}>
            <boxGeometry args={[1.6, 0.48, 0.9]} />
            <meshStandardMaterial color="#d28b4f" metalness={0.18} roughness={0.45} />
          </mesh>
          <mesh castShadow position={[-0.42, -0.16, 0.38]}>
            <cylinderGeometry args={[0.16, 0.16, 0.18, 24]} />
            <meshStandardMaterial color="#20242a" />
          </mesh>
          <mesh castShadow position={[0.42, -0.16, 0.38]}>
            <cylinderGeometry args={[0.16, 0.16, 0.18, 24]} />
            <meshStandardMaterial color="#20242a" />
          </mesh>
          <mesh castShadow position={[-0.42, -0.16, -0.38]}>
            <cylinderGeometry args={[0.16, 0.16, 0.18, 24]} />
            <meshStandardMaterial color="#20242a" />
          </mesh>
          <mesh castShadow position={[0.42, -0.16, -0.38]}>
            <cylinderGeometry args={[0.16, 0.16, 0.18, 24]} />
            <meshStandardMaterial color="#20242a" />
          </mesh>
        </Float>
      </RigidBody>

      <group ref={arrowRef}>
        <mesh position={[0.4, 0, 0]}>
          <boxGeometry args={[0.9, 0.07, 0.07]} />
          <meshStandardMaterial color="#58a6ff" emissive="#2c62aa" emissiveIntensity={0.5} />
        </mesh>
        <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.36, 20]} />
          <meshStandardMaterial color="#58a6ff" emissive="#2c62aa" emissiveIntensity={0.5} />
        </mesh>
      </group>
    </>
  )
}

export default function NewtonScene({ controls, paused, runKey, onMetricsChange }) {
  return (
    <div className="newton-scene-shell">
      <Canvas shadows="basic" dpr={[1, 1.8]}>
        <PerspectiveCamera makeDefault position={[-2, 2.8, 8.2]} fov={40} />
        <color attach="background" args={['#0d1218']} />
        <fog attach="fog" args={['#0d1218', 10, 42]} />
        <ambientLight intensity={0.65} />
        <directionalLight
          castShadow
          position={[6, 8, 5]}
          intensity={1.45}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />
        <Physics gravity={[0, 0, 0]}>
          <Track />
          <CartRig
            controls={controls}
            paused={paused}
            runKey={runKey}
            onMetricsChange={onMetricsChange}
          />
        </Physics>
        <ContactShadows position={[0, -0.42, 0]} scale={40} blur={2.4} opacity={0.35} />
        <Environment preset="city" />
      </Canvas>
    </div>
  )
}
