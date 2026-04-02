import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, PerspectiveCamera, Html } from '@react-three/drei'
import * as THREE from 'three'
import { getNewton3CartLabel, getPhaseLabel } from '../newton3MotionState.js'
import { getVelocityArrowScale, getForceArrowScale } from '../newton3ArrowUtils.js'

const TRACK_Y = -0.42
const RAIL_Z = 1.72
const POST_SPACING = 5.6
const POST_COUNT = 26

const WALL_X = 3.0
const CART_HALF_LENGTH = 0.9

function cartPositionAgainstWall(s) {
  return WALL_X - CART_HALF_LENGTH * s
}

function InfiniteGuideRail3({ motionRef }) {
  const leftPosts = useRef([])
  const rightPosts = useRef([])
  const slots = useMemo(() => Array.from({ length: POST_COUNT }, (_, i) => i), [])

  useFrame(() => {
    const anchorX = motionRef.current.position
    const base = Math.floor(anchorX / POST_SPACING) * POST_SPACING
    const centerOffset = (POST_COUNT - 1) / 2

    slots.forEach((slot, index) => {
      const x = base + (slot - centerOffset) * POST_SPACING
      const lp = leftPosts.current[index]
      const rp = rightPosts.current[index]
      if (lp) lp.position.x = x
      if (rp) rp.position.x = x
    })
  })

  return (
    <group>
      <mesh receiveShadow position={[0, TRACK_Y, 0]}>
        <boxGeometry args={[3600, 0.16, 5.8]} />
        <meshStandardMaterial color="#121d29" metalness={0.08} roughness={0.94} />
      </mesh>
      <mesh receiveShadow position={[0, TRACK_Y + 0.03, 0]}>
        <boxGeometry args={[3600, 0.03, 1.38]} />
        <meshStandardMaterial
          color="#2d4c68"
          metalness={0.64}
          roughness={0.2}
          emissive="#17324c"
          emissiveIntensity={0.16}
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
              <meshStandardMaterial color="#8fd9ff" emissive="#2b6f9d" emissiveIntensity={0.85} />
            </mesh>
          </group>
          <group ref={node => { rightPosts.current[index] = node }}>
            <mesh position={[0, TRACK_Y + 0.4, -RAIL_Z]}>
              <boxGeometry args={[0.12, 0.62, 0.12]} />
              <meshStandardMaterial color="#5d6f85" metalness={0.48} roughness={0.36} />
            </mesh>
            <mesh position={[0, TRACK_Y + 0.74, -RAIL_Z]}>
              <sphereGeometry args={[0.08, 14, 14]} />
              <meshStandardMaterial color="#8fd9ff" emissive="#2b6f9d" emissiveIntensity={0.85} />
            </mesh>
          </group>
        </group>
      ))}
    </group>
  )
}

function Wall() {
  return (
    <group position={[WALL_X + 0.25, 0, 0]}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.5, 4.2, 4.0]} />
        <meshStandardMaterial color="#3a4558" metalness={0.35} roughness={0.55} />
      </mesh>
      <mesh position={[0, 0, 2.01]}>
        <boxGeometry args={[0.5, 4.2, 0.04]} />
        <meshStandardMaterial color="#4a5a6e" metalness={0.3} roughness={0.4} />
      </mesh>
      <mesh position={[0, 0, -2.01]}>
        <boxGeometry args={[0.5, 4.2, 0.04]} />
        <meshStandardMaterial color="#4a5a6e" metalness={0.3} roughness={0.4} />
      </mesh>
      {[0.6, 1.4, 2.2].map(y => (
        <mesh key={y} position={[-0.26, y, 0]}>
          <boxGeometry args={[0.04, 0.08, 3.8]} />
          <meshStandardMaterial color="#5d6f85" metalness={0.5} roughness={0.35} />
        </mesh>
      ))}
    </group>
  )
}

function CartRig3({ controls, runKey, onMetricsChange, motionRef }) {
  const cartRef = useRef(null)
  const velArrowRef = useRef(null)
  const pushArrowRef = useRef(null)
  const wallArrowRef = useRef(null)
  const velLabelRef = useRef(null)
  const pushLabelRef = useRef(null)
  const wallLabelRef = useRef(null)

  const cameraGoal = useRef(new THREE.Vector3(-4.0, 2.85, 8.4))
  const { camera } = useThree()

  const massRatio = (controls.mass - 1) / 9
  const s = 0.7 + massRatio * 0.7

  const cartStyle = useMemo(() => {
    const body = new THREE.Color().lerpColors(new THREE.Color('#e8c090'), new THREE.Color('#6b3a1f'), massRatio)
    const top = new THREE.Color().lerpColors(new THREE.Color('#f3c995'), new THREE.Color('#3d2815'), massRatio)
    return { body: body.getStyle(), top: top.getStyle() }
  }, [massRatio])

  useEffect(() => {
    const sim = motionRef.current
    const startPos = cartPositionAgainstWall(s)
    sim.position = startPos
    sim.velocity = 0
    sim.phase = 'idle'
    sim.wallForce = 0

    if (cartRef.current) cartRef.current.position.set(startPos, 0.04, 0)

    onMetricsChange({
      speed: 0,
      acceleration: 0,
      appliedForce: 0,
      wallForce: 0,
      stateLabel: '已重置',
      phase: 'idle',
    })
  }, [motionRef, onMetricsChange, runKey, s])

  useFrame((_, delta) => {
    const body = cartRef.current
    if (!body) return

    const dt = Math.min(delta, 1 / 60)
    const sim = motionRef.current
    const { mass, appliedForce } = controls
    const prevVel = sim.velocity

    // Keep cart against wall when idle and no force
    if (appliedForce < 0.1 && Math.abs(sim.velocity) < 0.001) {
      sim.position = cartPositionAgainstWall(s)
      sim.velocity = 0
      sim.phase = 'idle'
      sim.wallForce = 0
    }

    let wallReaction = 0
    const cartFront = sim.position + CART_HALF_LENGTH * s
    const touchingWall = cartFront >= WALL_X - 0.05

    if (appliedForce > 0.1 && touchingWall) {
      wallReaction = -appliedForce
      sim.phase = 'contact'
    } else if (appliedForce > 0.1 && !touchingWall) {
      // Cart moving toward wall
      sim.phase = 'approaching'
    }

    const netForce = appliedForce + wallReaction
    const acceleration = netForce / mass
    let nextVel = prevVel + acceleration * dt

    // Clamp velocity to zero on sign flip
    if (Math.sign(prevVel) !== Math.sign(nextVel) && Math.abs(prevVel) < 0.05) {
      nextVel = 0
    }

    sim.velocity = nextVel
    sim.position += nextVel * dt
    sim.wallForce = wallReaction

    // Don't let cart penetrate wall
    if (sim.position + CART_HALF_LENGTH * s > WALL_X) {
      sim.position = WALL_X - CART_HALF_LENGTH * s
    }

    body.position.set(sim.position, 0.04, 0)

    cameraGoal.current.set(sim.position - 4.0, 2.85, 8.4)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraGoal.current.x, 4.2, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraGoal.current.y, 4.2, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraGoal.current.z, 4.2, dt)
    camera.lookAt(WALL_X - 0.3, 0.28, 0)

    // Velocity arrow
    const vScale = getVelocityArrowScale(sim.velocity)
    const vClamp = Math.min(1, Math.max(0.6, vScale * 0.5))
    if (velArrowRef.current) {
      velArrowRef.current.position.set(sim.position + 1.0 * s, 1.18, 0)
      velArrowRef.current.scale.set(vScale, vClamp, vClamp)
      velArrowRef.current.visible = Math.abs(sim.velocity) > 0.03
    }

    // Push force arrow (green, behind cart, pointing right)
    const showPush = appliedForce > 0.1
    if (pushArrowRef.current) {
      pushArrowRef.current.visible = showPush
      if (showPush) {
        const fScale = getForceArrowScale(appliedForce)
        pushArrowRef.current.position.set(sim.position - 1.2 * s, 1.2, 0)
        pushArrowRef.current.scale.set(fScale, Math.max(0.5, fScale), Math.max(0.5, fScale))
      }
    }

    // Wall reaction arrow (purple, wall side, pointing left)
    const showWall = appliedForce > 0.1 && touchingWall
    if (wallArrowRef.current) {
      wallArrowRef.current.visible = showWall
      if (showWall) {
        const fScale = getForceArrowScale(appliedForce)
        wallArrowRef.current.position.set(sim.position + 1.2 * s, 0.85, 0)
        wallArrowRef.current.scale.set(-fScale, Math.max(0.5, fScale), Math.max(0.5, fScale))
      }
    }

    // Labels
    if (velLabelRef.current) {
      const v = Math.abs(sim.velocity)
      velLabelRef.current.textContent = `${v.toFixed(2)} m/s`
      velLabelRef.current.style.display = v > 0.03 ? '' : 'none'
    }
    if (pushLabelRef.current) {
      pushLabelRef.current.textContent = `${appliedForce.toFixed(1)} N`
      pushLabelRef.current.style.display = showPush ? '' : 'none'
    }
    if (wallLabelRef.current) {
      wallLabelRef.current.textContent = `${appliedForce.toFixed(1)} N`
      wallLabelRef.current.style.display = showWall ? '' : 'none'
    }

    const stateLabel = getNewton3CartLabel({
      speed: sim.velocity,
      netForce,
      appliedForce,
      phase: sim.phase,
    })

    onMetricsChange({
      speed: Math.abs(sim.velocity),
      acceleration,
      appliedForce,
      wallForce: wallReaction,
      stateLabel,
      phase: sim.phase,
    })
  })

  const wheels = [
    [-0.5 * s, -0.06, 0.44 * s],
    [0.5 * s, -0.06, 0.44 * s],
    [-0.5 * s, -0.06, -0.44 * s],
    [0.5 * s, -0.06, -0.44 * s],
  ]

  return (
    <>
      <group ref={cartRef}>
        <mesh castShadow position={[0, 0.3 * s, 0]}>
          <boxGeometry args={[1.8 * s, 0.46 * s, 1.06 * s]} />
          <meshStandardMaterial color={cartStyle.body} metalness={0.24} roughness={0.38} />
        </mesh>
        <mesh castShadow position={[0, 0.62 * s, 0]}>
          <boxGeometry args={[0.82 * s, 0.26 * s, 0.88 * s]} />
          <meshStandardMaterial color={cartStyle.top} metalness={0.1} roughness={0.5} />
        </mesh>
        {wheels.map(([x, y, z]) => (
          <group key={`${x}-${z}`} position={[x, y, z]} rotation={[Math.PI / 2, 0, 0]}>
            <mesh castShadow>
              <cylinderGeometry args={[0.16 * s, 0.16 * s, 0.1 * s, 24]} />
              <meshStandardMaterial color="#1a1f28" metalness={0.15} roughness={0.75} />
            </mesh>
            <mesh position={[0, 0.03, 0]}>
              <cylinderGeometry args={[0.08 * s, 0.08 * s, 0.1 * s, 16]} />
              <meshStandardMaterial color="#8a9bb0" metalness={0.7} roughness={0.25} />
            </mesh>
          </group>
        ))}
      </group>

      {/* Velocity arrow (blue) */}
      <group ref={velArrowRef}>
        <mesh position={[0.45, 0, 0]}>
          <boxGeometry args={[0.92, 0.025, 0.025]} />
          <meshStandardMaterial color="#58a6ff" emissive="#2c62aa" emissiveIntensity={0.58} />
        </mesh>
        <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.08, 0.18, 12]} />
          <meshStandardMaterial color="#58a6ff" emissive="#2c62aa" emissiveIntensity={0.58} />
        </mesh>
        <Html position={[0.5, 0.3, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div ref={velLabelRef} className="arrow-label arrow-label-velocity">0.00 m/s</div>
        </Html>
      </group>

      {/* Push force arrow (green, pointing right) */}
      <group ref={pushArrowRef}>
        <mesh position={[0.45, 0, 0]}>
          <boxGeometry args={[0.92, 0.07, 0.07]} />
          <meshStandardMaterial color="#4ade80" emissive="#1a8a4a" emissiveIntensity={0.58} />
        </mesh>
        <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.36, 20]} />
          <meshStandardMaterial color="#4ade80" emissive="#1a8a4a" emissiveIntensity={0.58} />
        </mesh>
        <Html position={[0.5, 0.35, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div ref={pushLabelRef} className="arrow-label arrow-label-force">0.0 N</div>
        </Html>
      </group>

      {/* Wall reaction arrow (purple, pointing left) */}
      <group ref={wallArrowRef}>
        <mesh position={[0.45, 0, 0]}>
          <boxGeometry args={[0.92, 0.07, 0.07]} />
          <meshStandardMaterial color="#c084fc" emissive="#6a2ea0" emissiveIntensity={0.58} />
        </mesh>
        <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.36, 20]} />
          <meshStandardMaterial color="#c084fc" emissive="#6a2ea0" emissiveIntensity={0.58} />
        </mesh>
        <Html position={[0.5, 0.35, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div ref={wallLabelRef} className="arrow-label arrow-label-reaction">0.0 N</div>
        </Html>
      </group>
    </>
  )
}

export default function Newton3Scene({ controls, runKey, onMetricsChange }) {
  const motionRef = useRef({
    position: WALL_X - CART_HALF_LENGTH * 0.78,
    velocity: 0,
    phase: 'idle',
    wallForce: 0,
  })

  return (
    <div className="newton-scene-canvas">
      <Canvas shadows="basic" dpr={[1, 1.8]}>
        <PerspectiveCamera makeDefault position={[-4.0, 2.85, 8.4]} fov={38} />
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

        <InfiniteGuideRail3 motionRef={motionRef} />
        <Wall />
        <CartRig3
          controls={controls}
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
