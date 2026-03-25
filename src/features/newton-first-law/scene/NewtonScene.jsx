import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'

const START_X = -8
const TRACK_Y = -0.42
const RAIL_Z = 1.72
const POST_SPACING = 5.6
const POST_COUNT = 26

function InfiniteGuideRail({ friction, motionRef }) {
  const leftPosts = useRef([])
  const rightPosts = useRef([])
  const slots = useMemo(() => Array.from({ length: POST_COUNT }, (_, index) => index), [])
  const frictionRatio = Math.min(1, friction / 0.24)
  const surfaceStyle = useMemo(() => {
    const smoothColor = new THREE.Color('#2d4c68')
    const roughColor = new THREE.Color('#4a4034')
    const laneColor = new THREE.Color().lerpColors(smoothColor, roughColor, frictionRatio)

    return {
      laneColor: laneColor.getStyle(),
      laneRoughness: 0.2 + frictionRatio * 0.68,
      laneMetalness: 0.64 - frictionRatio * 0.42,
      baseColor: new THREE.Color().lerpColors(
        new THREE.Color('#121d29'),
        new THREE.Color('#262018'),
        frictionRatio,
      ).getStyle(),
    }
  }, [frictionRatio])

  useFrame(() => {
    const anchorX = motionRef.current.position
    const base = Math.floor(anchorX / POST_SPACING) * POST_SPACING
    const centerOffset = (POST_COUNT - 1) / 2

    slots.forEach((slot, index) => {
      const x = base + (slot - centerOffset) * POST_SPACING
      const leftPost = leftPosts.current[index]
      const rightPost = rightPosts.current[index]

      if (leftPost) {
        leftPost.position.x = x
      }

      if (rightPost) {
        rightPost.position.x = x
      }
    })
  })

  return (
    <group>
      <mesh receiveShadow position={[0, TRACK_Y, 0]}>
        <boxGeometry args={[3600, 0.16, 5.8]} />
        <meshStandardMaterial
          color={surfaceStyle.baseColor}
          metalness={0.08}
          roughness={0.94}
        />
      </mesh>

      <mesh receiveShadow position={[0, TRACK_Y + 0.03, 0]}>
        <boxGeometry args={[3600, 0.03, 1.38]} />
        <meshStandardMaterial
          color={surfaceStyle.laneColor}
          metalness={surfaceStyle.laneMetalness}
          roughness={surfaceStyle.laneRoughness}
          emissive={frictionRatio < 0.1 ? '#17324c' : '#20160d'}
          emissiveIntensity={frictionRatio < 0.1 ? 0.16 : 0.05}
        />
      </mesh>

      <mesh position={[0, TRACK_Y + 0.1, RAIL_Z]}>
        <boxGeometry args={[3600, 0.07, 0.07]} />
        <meshStandardMaterial color="#7d90a6" metalness={0.72} roughness={0.26} />
      </mesh>

      <mesh position={[0, TRACK_Y + 0.1, -RAIL_Z]}>
        <boxGeometry args={[3600, 0.07, 0.07]} />
        <meshStandardMaterial color="#7d90a6" metalness={0.72} roughness={0.26} />
      </mesh>

      {slots.map((slot, index) => (
        <group key={slot}>
          <group ref={node => { leftPosts.current[index] = node }}>
            <mesh position={[0, TRACK_Y + 0.4, RAIL_Z]}>
              <boxGeometry args={[0.12, 0.62, 0.12]} />
              <meshStandardMaterial color="#5d6f85" metalness={0.48} roughness={0.36} />
            </mesh>
            <mesh position={[0, TRACK_Y + 0.74, RAIL_Z]}>
              <sphereGeometry args={[0.08, 14, 14]} />
              <meshStandardMaterial
                color="#8fd9ff"
                emissive="#2b6f9d"
                emissiveIntensity={0.85}
              />
            </mesh>
          </group>

          <group ref={node => { rightPosts.current[index] = node }}>
            <mesh position={[0, TRACK_Y + 0.4, -RAIL_Z]}>
              <boxGeometry args={[0.12, 0.62, 0.12]} />
              <meshStandardMaterial color="#5d6f85" metalness={0.48} roughness={0.36} />
            </mesh>
            <mesh position={[0, TRACK_Y + 0.74, -RAIL_Z]}>
              <sphereGeometry args={[0.08, 14, 14]} />
              <meshStandardMaterial
                color="#8fd9ff"
                emissive="#2b6f9d"
                emissiveIntensity={0.85}
              />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}

function CartRig({ controls, pushKey, runKey, onMetricsChange, motionRef }) {
  const cartRef = useRef(null)
  const arrowRef = useRef(null)
  const thrustRef = useRef(null)
  const cameraGoal = useRef(new THREE.Vector3(4.8, 2.85, 8.4))
  const pulseTimeLeft = useRef(0)
  const { camera } = useThree()

  useEffect(() => {
    if (pushKey > 0) {
      pulseTimeLeft.current = 0.22
    }
  }, [pushKey])

  useEffect(() => {
    const sim = motionRef.current

    sim.position = START_X
    sim.velocity = controls.initialSpeed
    sim.netForce = 0
    sim.externalForce = 0
    sim.hasPushed = false
    sim.stateLabel = '已重置'

    const body = cartRef.current
    if (body) {
      body.position.set(START_X, 0.04, 0)
    }

    pulseTimeLeft.current = 0
    onMetricsChange({
      speed: Math.abs(sim.velocity),
      netForce: 0,
      position: START_X,
      isPushing: false,
      hasPushed: false,
      stateLabel: '已重置',
    })
  }, [motionRef, onMetricsChange, runKey])

  useFrame((_, delta) => {
    const body = cartRef.current
    if (!body) {
      return
    }

    const dt = Math.min(delta, 1 / 60)
    const sim = motionRef.current
    const previousVelocity = sim.velocity

    let externalForce = 0
    if (pulseTimeLeft.current > 0) {
      externalForce = 7.2
      pulseTimeLeft.current = Math.max(0, pulseTimeLeft.current - dt)
    }

    let frictionForce = 0
    if (Math.abs(previousVelocity) > 0.0001) {
      frictionForce = -Math.sign(previousVelocity) * controls.friction * 5.6
    }

    const netForce = externalForce + frictionForce
    let nextVelocity = previousVelocity + netForce * dt

    if (
      Math.abs(previousVelocity) > 0 &&
      externalForce === 0 &&
      Math.sign(previousVelocity) !== Math.sign(nextVelocity)
    ) {
      nextVelocity = 0
    }

    sim.velocity = nextVelocity
    sim.position += nextVelocity * dt
    sim.netForce = netForce
    sim.externalForce = externalForce

    body.position.set(sim.position, 0.04, 0)

    cameraGoal.current.set(sim.position + 5.3, 2.85, 8.4)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraGoal.current.x, 4.2, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraGoal.current.y, 4.2, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraGoal.current.z, 4.2, dt)
    camera.lookAt(sim.position + 0.4, 0.28, 0)

    if (arrowRef.current) {
      arrowRef.current.position.set(sim.position + 1.2, 1.18, 0)
      arrowRef.current.scale.x = Math.max(0.45, Math.min(2.6, Math.abs(sim.velocity) / 1.9))
      arrowRef.current.visible = Math.abs(sim.velocity) > 0.03
    }

    if (thrustRef.current) {
      const thrustStrength = externalForce > 0 ? Math.min(1, externalForce / 7.2) : 0
      thrustRef.current.position.set(sim.position - 1.08, 0.3, 0)
      thrustRef.current.scale.set(0.55 + thrustStrength * 1.25, 0.55 + thrustStrength * 0.4, 0.55)
      thrustRef.current.visible = thrustStrength > 0.01

      thrustRef.current.children.forEach(node => {
        if (node.material) {
          node.material.opacity = 0.14 + thrustStrength * 0.58
        }
      })
    }

    let stateLabel = '匀速观察'
    if (Math.abs(sim.velocity) < 0.04) {
      stateLabel = '近似静止'
    } else if (externalForce > 0) {
      stateLabel = '受到短推'
    } else if (controls.friction <= 0.005) {
      stateLabel = '接近惯性运动'
    } else if (frictionForce !== 0) {
      stateLabel = '被摩擦减速'
    }

    sim.stateLabel = stateLabel
    sim.hasPushed = sim.hasPushed || externalForce > 0
    onMetricsChange({
      speed: Math.abs(sim.velocity),
      netForce,
      position: sim.position,
      isPushing: externalForce > 0,
      hasPushed: sim.hasPushed,
      stateLabel,
    })
  })

  return (
    <>
      <group ref={cartRef}>
        <mesh castShadow position={[0, 0.3, 0]}>
          <boxGeometry args={[1.8, 0.46, 1.06]} />
          <meshStandardMaterial color="#d18b52" metalness={0.24} roughness={0.38} />
        </mesh>
        <mesh castShadow position={[0, 0.62, 0]}>
          <boxGeometry args={[0.82, 0.26, 0.88]} />
          <meshStandardMaterial color="#f3c995" metalness={0.1} roughness={0.5} />
        </mesh>
        {[
          [-0.5, -0.02, 0.42],
          [0.5, -0.02, 0.42],
          [-0.5, -0.02, -0.42],
          [0.5, -0.02, -0.42],
        ].map(([x, y, z]) => (
          <mesh key={`${x}-${z}`} castShadow position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.18, 0.06, 18, 28]} />
            <meshStandardMaterial color="#0f1319" metalness={0.4} roughness={0.45} />
          </mesh>
        ))}
      </group>

      <group ref={arrowRef}>
        <mesh position={[0.45, 0, 0]}>
          <boxGeometry args={[0.92, 0.07, 0.07]} />
          <meshStandardMaterial color="#58a6ff" emissive="#2c62aa" emissiveIntensity={0.58} />
        </mesh>
        <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.36, 20]} />
          <meshStandardMaterial color="#58a6ff" emissive="#2c62aa" emissiveIntensity={0.58} />
        </mesh>
      </group>

      <group ref={thrustRef}>
        <mesh rotation={[0, 0, Math.PI / 2]}>
          <coneGeometry args={[0.34, 1.38, 18]} />
          <meshStandardMaterial
            color="#ffbf82"
            emissive="#ff9f43"
            emissiveIntensity={1.2}
            transparent
            opacity={0.22}
          />
        </mesh>
        <mesh position={[-0.16, 0, 0]}>
          <sphereGeometry args={[0.2, 18, 18]} />
          <meshStandardMaterial
            color="#fff0cf"
            emissive="#ffc26a"
            emissiveIntensity={1.35}
            transparent
            opacity={0.36}
          />
        </mesh>
      </group>
    </>
  )
}

export default function NewtonScene({ controls, pushKey, runKey, onMetricsChange }) {
  const motionRef = useRef({
    position: START_X,
    velocity: controls.initialSpeed,
    netForce: 0,
    externalForce: 0,
    hasPushed: false,
    stateLabel: '准备中',
  })

  return (
    <div className="newton-scene-canvas">
      <Canvas shadows="basic" dpr={[1, 1.8]}>
        <PerspectiveCamera makeDefault position={[4.8, 2.85, 8.4]} fov={38} />
        <color attach="background" args={['#0c1119']} />
        <fog attach="fog" args={['#0c1119', 12, 54]} />
        <ambientLight intensity={0.72} />
        <directionalLight
          castShadow
          position={[8, 10, 6]}
          intensity={1.55}
          shadow-mapSize-width={1024}
          shadow-mapSize-height={1024}
        />

        <InfiniteGuideRail friction={controls.friction} motionRef={motionRef} />
        <CartRig
          controls={controls}
          pushKey={pushKey}
          runKey={runKey}
          onMetricsChange={onMetricsChange}
          motionRef={motionRef}
        />

        <ContactShadows position={[0, TRACK_Y - 0.02, 0]} scale={42} blur={2.6} opacity={0.32} />
        <Environment preset="night" />
      </Canvas>
    </div>
  )
}
