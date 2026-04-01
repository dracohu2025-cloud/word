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
const CART_HALF_LENGTH = 0.9
const SEPARATION_GAP = 0.15

const INITIAL_POS_A = -1.5
const INITIAL_POS_B = 0.5

function InfiniteGuideRail3({ friction, motionRef }) {
  const leftPosts = useRef([])
  const rightPosts = useRef([])
  const slots = useMemo(() => Array.from({ length: POST_COUNT }, (_, i) => i), [])
  const frictionRatio = Math.min(1, friction / 0.7)
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
    const anchorX = (motionRef.current.positionA + motionRef.current.positionB) / 2
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
        <meshStandardMaterial color={surfaceStyle.baseColor} metalness={0.08} roughness={0.94} />
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

function computeFrictionForce(velocity, frictionCoeff, appliedForceOnCart) {
  if (Math.abs(velocity) > 0.0001) {
    return -Math.sign(velocity) * frictionCoeff * 5.6
  }
  if (Math.abs(appliedForceOnCart) > 0) {
    const staticThreshold = frictionCoeff * 4.0
    if (Math.abs(appliedForceOnCart) <= staticThreshold) {
      return -appliedForceOnCart
    }
  }
  return 0
}

function clampVelocityZero(prevV, nextV, hasContactForce) {
  if (Math.sign(prevV) !== Math.sign(nextV)) {
    if (Math.abs(prevV) < 0.05 || !hasContactForce) {
      return 0
    }
  }
  return nextV
}

function CartMesh({ s, bodyColor, topColor }) {
  const wheels = [
    [-0.5 * s, -0.06, 0.44 * s],
    [0.5 * s, -0.06, 0.44 * s],
    [-0.5 * s, -0.06, -0.44 * s],
    [0.5 * s, -0.06, -0.44 * s],
  ]
  return (
    <>
      <mesh castShadow position={[0, 0.3 * s, 0]}>
        <boxGeometry args={[1.8 * s, 0.46 * s, 1.06 * s]} />
        <meshStandardMaterial color={bodyColor} metalness={0.24} roughness={0.38} />
      </mesh>
      <mesh castShadow position={[0, 0.62 * s, 0]}>
        <boxGeometry args={[0.82 * s, 0.26 * s, 0.88 * s]} />
        <meshStandardMaterial color={topColor} metalness={0.1} roughness={0.5} />
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
    </>
  )
}

function CartRigPair({ controls, runKey, onMetricsChange, motionRef }) {
  const cartARef = useRef(null)
  const cartBRef = useRef(null)
  const labelARef = useRef(null)
  const labelBRef = useRef(null)

  const velArrowARef = useRef(null)
  const velArrowBRef = useRef(null)
  const forceArrowARef = useRef(null)
  const forceArrowBRef = useRef(null)
  const velLabelARef = useRef(null)
  const velLabelBRef = useRef(null)
  const forceLabelARef = useRef(null)
  const forceLabelBRef = useRef(null)

  const cameraGoal = useRef(new THREE.Vector3(4.8, 2.85, 8.4))
  const { camera } = useThree()

  const massRatioA = (controls.massA - 1) / 9
  const massRatioB = (controls.massB - 1) / 9
  const sA = 0.7 + massRatioA * 0.7
  const sB = 0.7 + massRatioB * 0.7

  const styleA = useMemo(() => {
    const body = new THREE.Color().lerpColors(new THREE.Color('#e8c090'), new THREE.Color('#6b3a1f'), massRatioA)
    const top = new THREE.Color().lerpColors(new THREE.Color('#f3c995'), new THREE.Color('#3d2815'), massRatioA)
    return { body: body.getStyle(), top: top.getStyle() }
  }, [massRatioA])

  const styleB = useMemo(() => {
    const body = new THREE.Color().lerpColors(new THREE.Color('#6ba3c8'), new THREE.Color('#1f3a5f'), massRatioB)
    const top = new THREE.Color().lerpColors(new THREE.Color('#95c9f3'), new THREE.Color('#152840'), massRatioB)
    return { body: body.getStyle(), top: top.getStyle() }
  }, [massRatioB])

  useEffect(() => {
    const sim = motionRef.current
    sim.positionA = INITIAL_POS_A
    sim.positionB = INITIAL_POS_B
    sim.velocityA = 0
    sim.velocityB = 0
    sim.phase = 'idle'
    sim.forceOnA = 0
    sim.forceOnB = 0

    if (cartARef.current) cartARef.current.position.set(INITIAL_POS_A, 0.04, 0)
    if (cartBRef.current) cartBRef.current.position.set(INITIAL_POS_B, 0.04, 0)

    onMetricsChange({
      speedA: 0, speedB: 0,
      accelerationA: 0, accelerationB: 0,
      forceOnA: 0, forceOnB: 0,
      stateLabelA: '已重置', stateLabelB: '已重置',
      phase: 'idle',
    })
  }, [motionRef, onMetricsChange, runKey])

  useFrame((_, delta) => {
    const bodyA = cartARef.current
    const bodyB = cartBRef.current
    if (!bodyA || !bodyB) return

    const dt = Math.min(delta, 1 / 60)
    const sim = motionRef.current
    const { massA, massB, appliedForce, friction } = controls

    const prevVelA = sim.velocityA
    const prevVelB = sim.velocityB

    const isInContact = sim.phase === 'idle' || sim.phase === 'contact'
    const isForceActive = appliedForce > 0.1

    let contactForceOnA = 0
    let contactForceOnB = 0

    if (isInContact && isForceActive) {
      contactForceOnA = -appliedForce
      contactForceOnB = +appliedForce
      if (sim.phase === 'idle') sim.phase = 'contact'
    }

    const fricA = computeFrictionForce(prevVelA, friction, contactForceOnA)
    const fricB = computeFrictionForce(prevVelB, friction, contactForceOnB)

    const netForceA = contactForceOnA + fricA
    const netForceB = contactForceOnB + fricB
    const accA = netForceA / massA
    const accB = netForceB / massB

    let nextVelA = prevVelA + accA * dt
    let nextVelB = prevVelB + accB * dt

    nextVelA = clampVelocityZero(prevVelA, nextVelA, isForceActive)
    nextVelB = clampVelocityZero(prevVelB, nextVelB, isForceActive)

    sim.velocityA = nextVelA
    sim.velocityB = nextVelB
    sim.positionA += nextVelA * dt
    sim.positionB += nextVelB * dt
    sim.forceOnA = contactForceOnA
    sim.forceOnB = contactForceOnB

    if (isInContact && (sim.phase === 'contact' || isForceActive)) {
      const gap = sim.positionB - sim.positionA
      if (gap > CART_HALF_LENGTH * (sA + sB) + SEPARATION_GAP) {
        sim.phase = 'separated'
        sim.forceOnA = 0
        sim.forceOnB = 0
      }
    }

    if (sim.phase === 'separated') {
      if (Math.abs(sim.velocityA) < 0.001 && Math.abs(sim.velocityB) < 0.001) {
        sim.phase = 'stopped'
        sim.velocityA = 0
        sim.velocityB = 0
      }
    }

    bodyA.position.set(sim.positionA, 0.04, 0)
    bodyB.position.set(sim.positionB, 0.04, 0)

    const midX = (sim.positionA + sim.positionB) / 2
    const spread = Math.abs(sim.positionB - sim.positionA)
    const camZ = Math.max(8.4, spread * 0.4 + 7)
    cameraGoal.current.set(midX + 3.5, 2.85, camZ)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraGoal.current.x, 3.5, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraGoal.current.y, 3.5, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraGoal.current.z, 3.5, dt)
    camera.lookAt(midX, 0.28, 0)

    // Velocity arrows
    const vScaleA = getVelocityArrowScale(sim.velocityA)
    const vScaleB = getVelocityArrowScale(sim.velocityB)
    const vClampA = Math.min(1, Math.max(0.6, vScaleA * 0.5))
    const vClampB = Math.min(1, Math.max(0.6, vScaleB * 0.5))

    if (velArrowARef.current) {
      velArrowARef.current.position.set(sim.positionA + 1.0 * sA, 1.18, 0)
      velArrowARef.current.scale.set(vScaleA, vClampA, vClampA)
      velArrowARef.current.visible = Math.abs(sim.velocityA) > 0.03
    }
    if (velArrowBRef.current) {
      velArrowBRef.current.position.set(sim.positionB + 1.0 * sB, 1.18, 0)
      velArrowBRef.current.scale.set(vScaleB, vClampB, vClampB)
      velArrowBRef.current.visible = Math.abs(sim.velocityB) > 0.03
    }

    // Force arrows — only during contact
    const showForces = isInContact && isForceActive
    if (forceArrowARef.current) {
      forceArrowARef.current.visible = showForces
      if (showForces) {
        const fScale = getForceArrowScale(appliedForce)
        forceArrowARef.current.position.set(sim.positionA - 0.8 * sA, 1.05, 0)
        forceArrowARef.current.scale.set(-fScale, Math.max(0.5, fScale), Math.max(0.5, fScale))
      }
    }
    if (forceArrowBRef.current) {
      forceArrowBRef.current.visible = showForces
      if (showForces) {
        const fScale = getForceArrowScale(appliedForce)
        forceArrowBRef.current.position.set(sim.positionB + 0.8 * sB, 1.05, 0)
        forceArrowBRef.current.scale.set(fScale, Math.max(0.5, fScale), Math.max(0.5, fScale))
      }
    }

    // Labels
    if (velLabelARef.current) {
      const v = Math.abs(sim.velocityA)
      velLabelARef.current.textContent = `${v.toFixed(2)} m/s`
      velLabelARef.current.style.display = v > 0.03 ? '' : 'none'
    }
    if (velLabelBRef.current) {
      const v = Math.abs(sim.velocityB)
      velLabelBRef.current.textContent = `${v.toFixed(2)} m/s`
      velLabelBRef.current.style.display = v > 0.03 ? '' : 'none'
    }
    if (forceLabelARef.current) {
      forceLabelARef.current.textContent = `${appliedForce.toFixed(1)} N`
      forceLabelARef.current.style.display = showForces ? '' : 'none'
    }
    if (forceLabelBRef.current) {
      forceLabelBRef.current.textContent = `${appliedForce.toFixed(1)} N`
      forceLabelBRef.current.style.display = showForces ? '' : 'none'
    }

    // Floating cart labels
    if (labelARef.current) {
      labelARef.current.textContent = `A车 ${massA.toFixed(1)}kg`
    }
    if (labelBRef.current) {
      labelBRef.current.textContent = `B车 ${massB.toFixed(1)}kg`
    }

    const stateA = getNewton3CartLabel({ speed: sim.velocityA, netForce: netForceA, appliedForce, phase: sim.phase, role: 'A' })
    const stateB = getNewton3CartLabel({ speed: sim.velocityB, netForce: netForceB, appliedForce, phase: sim.phase, role: 'B' })

    onMetricsChange({
      speedA: Math.abs(sim.velocityA),
      speedB: Math.abs(sim.velocityB),
      accelerationA: accA,
      accelerationB: accB,
      forceOnA: contactForceOnA,
      forceOnB: contactForceOnB,
      stateLabelA: stateA,
      stateLabelB: stateB,
      phase: sim.phase,
    })
  })

  return (
    <>
      {/* Cart A — warm colors */}
      <group ref={cartARef}>
        <CartMesh s={sA} bodyColor={styleA.body} topColor={styleA.top} />
        <Html position={[0, 1.1 * sA, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div ref={labelARef} className="arrow-label" style={{ color: '#f0a35f', background: 'rgba(8,13,20,0.72)', fontSize: '12px', fontWeight: 700 }}>A车</div>
        </Html>
      </group>

      {/* Cart B — cool colors */}
      <group ref={cartBRef}>
        <CartMesh s={sB} bodyColor={styleB.body} topColor={styleB.top} />
        <Html position={[0, 1.1 * sB, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div ref={labelBRef} className="arrow-label" style={{ color: '#6ba3c8', background: 'rgba(8,13,20,0.72)', fontSize: '12px', fontWeight: 700 }}>B车</div>
        </Html>
      </group>

      {/* Velocity arrow A (blue) */}
      <group ref={velArrowARef}>
        <mesh position={[0.45, 0, 0]}>
          <boxGeometry args={[0.92, 0.025, 0.025]} />
          <meshStandardMaterial color="#58a6ff" emissive="#2c62aa" emissiveIntensity={0.58} />
        </mesh>
        <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.08, 0.18, 12]} />
          <meshStandardMaterial color="#58a6ff" emissive="#2c62aa" emissiveIntensity={0.58} />
        </mesh>
        <Html position={[0.5, 0.3, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div ref={velLabelARef} className="arrow-label arrow-label-velocity">0.00 m/s</div>
        </Html>
      </group>

      {/* Velocity arrow B (blue) */}
      <group ref={velArrowBRef}>
        <mesh position={[0.45, 0, 0]}>
          <boxGeometry args={[0.92, 0.025, 0.025]} />
          <meshStandardMaterial color="#58a6ff" emissive="#2c62aa" emissiveIntensity={0.58} />
        </mesh>
        <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.08, 0.18, 12]} />
          <meshStandardMaterial color="#58a6ff" emissive="#2c62aa" emissiveIntensity={0.58} />
        </mesh>
        <Html position={[0.5, 0.3, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div ref={velLabelBRef} className="arrow-label arrow-label-velocity">0.00 m/s</div>
        </Html>
      </group>

      {/* Reaction force arrow A (purple, pointing backward) */}
      <group ref={forceArrowARef}>
        <mesh position={[0.45, 0, 0]}>
          <boxGeometry args={[0.92, 0.07, 0.07]} />
          <meshStandardMaterial color="#c084fc" emissive="#6a2ea0" emissiveIntensity={0.58} />
        </mesh>
        <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.36, 20]} />
          <meshStandardMaterial color="#c084fc" emissive="#6a2ea0" emissiveIntensity={0.58} />
        </mesh>
        <Html position={[0.5, 0.35, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div ref={forceLabelARef} className="arrow-label arrow-label-reaction">0.0 N</div>
        </Html>
      </group>

      {/* Action force arrow B (green, pointing forward) */}
      <group ref={forceArrowBRef}>
        <mesh position={[0.45, 0, 0]}>
          <boxGeometry args={[0.92, 0.07, 0.07]} />
          <meshStandardMaterial color="#4ade80" emissive="#1a8a4a" emissiveIntensity={0.58} />
        </mesh>
        <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.36, 20]} />
          <meshStandardMaterial color="#4ade80" emissive="#1a8a4a" emissiveIntensity={0.58} />
        </mesh>
        <Html position={[0.5, 0.35, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div ref={forceLabelBRef} className="arrow-label arrow-label-force">0.0 N</div>
        </Html>
      </group>
    </>
  )
}

export default function Newton3Scene({ controls, runKey, onMetricsChange }) {
  const motionRef = useRef({
    positionA: INITIAL_POS_A,
    positionB: INITIAL_POS_B,
    velocityA: 0,
    velocityB: 0,
    phase: 'idle',
    forceOnA: 0,
    forceOnB: 0,
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

        <InfiniteGuideRail3 friction={controls.friction} motionRef={motionRef} />
        <CartRigPair
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
