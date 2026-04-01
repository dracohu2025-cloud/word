import { useEffect, useMemo, useRef } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { ContactShadows, Environment, PerspectiveCamera, Html } from '@react-three/drei'
import * as THREE from 'three'
import { getNewton2MotionStateLabel } from '../newton2MotionState.js'
import { getVelocityArrowScale, getForceArrowScale } from '../newton2ArrowUtils.js'

const START_X = -8
const TRACK_Y = -0.42
const RAIL_Z = 1.72
const POST_SPACING = 5.6
const POST_COUNT = 26

function InfiniteGuideRail({ friction, motionRef }) {
  const leftPosts = useRef([])
  const rightPosts = useRef([])
  const slots = useMemo(() => Array.from({ length: POST_COUNT }, (_, index) => index), [])
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

function CartRig2({ controls, runKey, onMetricsChange, motionRef }) {
  const cartRef = useRef(null)
  const velocityArrowRef = useRef(null)
  const forceArrowRef = useRef(null)
  const frictionArrowRef = useRef(null)
  const velocityLabelRef = useRef(null)
  const forceLabelRef = useRef(null)
  const frictionLabelRef = useRef(null)
  const cameraGoal = useRef(new THREE.Vector3(4.8, 2.85, 8.4))
  const { camera } = useThree()

  const massRatio = (controls.mass - 1) / 9
  const scaleFactor = 0.7 + massRatio * 0.7

  const cartStyle = useMemo(() => {
    const bodyColor = new THREE.Color().lerpColors(
      new THREE.Color('#e8c090'),
      new THREE.Color('#6b3a1f'),
      massRatio,
    )
    const topColor = new THREE.Color().lerpColors(
      new THREE.Color('#f3c995'),
      new THREE.Color('#3d2815'),
      massRatio,
    )

    return {
      bodyColor: bodyColor.getStyle(),
      topColor: topColor.getStyle(),
    }
  }, [massRatio])

  useEffect(() => {
    const sim = motionRef.current

    sim.position = START_X
    sim.velocity = 0
    sim.netForce = 0
    sim.acceleration = 0

    const body = cartRef.current
    if (body) {
      body.position.set(START_X, 0.04, 0)
    }

    onMetricsChange({
      speed: 0,
      acceleration: 0,
      netForce: 0,
      appliedForce: controls.appliedForce,
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

    const appliedForce = controls.appliedForce

    let frictionForce = 0
    if (Math.abs(previousVelocity) > 0.0001) {
      frictionForce = -Math.sign(previousVelocity) * controls.friction * 5.6
    } else if (appliedForce > 0) {
      const staticFrictionThreshold = controls.friction * 4.0
      if (appliedForce <= staticFrictionThreshold) {
        frictionForce = -appliedForce
      }
    }

    const netForce = appliedForce + frictionForce
    const acceleration = netForce / controls.mass
    let nextVelocity = previousVelocity + acceleration * dt

    if (
      Math.abs(previousVelocity) > 0 &&
      appliedForce === 0 &&
      Math.sign(previousVelocity) !== Math.sign(nextVelocity)
    ) {
      nextVelocity = 0
    }

    sim.velocity = nextVelocity
    sim.position += nextVelocity * dt
    sim.netForce = netForce
    sim.acceleration = acceleration

    body.position.set(sim.position, 0.04, 0)

    cameraGoal.current.set(sim.position + 5.3, 2.85, 8.4)
    camera.position.x = THREE.MathUtils.damp(camera.position.x, cameraGoal.current.x, 4.2, dt)
    camera.position.y = THREE.MathUtils.damp(camera.position.y, cameraGoal.current.y, 4.2, dt)
    camera.position.z = THREE.MathUtils.damp(camera.position.z, cameraGoal.current.z, 4.2, dt)
    camera.lookAt(sim.position + 0.4, 0.28, 0)

    if (velocityArrowRef.current) {
      velocityArrowRef.current.position.set(sim.position + 1.2 * scaleFactor, 1.18, 0)
      velocityArrowRef.current.scale.x = getVelocityArrowScale(sim.velocity)
      velocityArrowRef.current.visible = Math.abs(sim.velocity) > 0.03
    }

    if (forceArrowRef.current) {
      const showForce = appliedForce > 0.1
      forceArrowRef.current.visible = showForce
      if (showForce) {
        forceArrowRef.current.position.set(sim.position - 0.6 * scaleFactor, 1.05, 0)
        forceArrowRef.current.scale.x = getForceArrowScale(appliedForce)
      }
    }

    if (frictionArrowRef.current) {
      const frictionMag = Math.abs(frictionForce)
      const showFriction = frictionMag > 0.05
      frictionArrowRef.current.visible = showFriction
      if (showFriction) {
        frictionArrowRef.current.position.set(sim.position - 0.6 * scaleFactor, 0.04, 0)
        frictionArrowRef.current.scale.x = -getForceArrowScale(frictionMag)
      }
    }

    if (velocityLabelRef.current) {
      const v = Math.abs(sim.velocity)
      velocityLabelRef.current.textContent = `${v.toFixed(2)} m/s`
      velocityLabelRef.current.style.display = v > 0.03 ? '' : 'none'
    }

    if (forceLabelRef.current) {
      forceLabelRef.current.textContent = `${appliedForce.toFixed(1)} N`
      forceLabelRef.current.style.display = appliedForce > 0.1 ? '' : 'none'
    }

    if (frictionLabelRef.current) {
      const frictionMag = Math.abs(frictionForce)
      frictionLabelRef.current.textContent = `${frictionMag.toFixed(1)} N`
      frictionLabelRef.current.style.display = frictionMag > 0.05 ? '' : 'none'
    }

    const stateLabel = getNewton2MotionStateLabel({
      speed: sim.velocity,
      netForce,
      appliedForce,
      mass: controls.mass,
    })

    onMetricsChange({
      speed: Math.abs(sim.velocity),
      acceleration,
      netForce,
      appliedForce,
      stateLabel,
    })
  })

  const s = scaleFactor
  const wheelPositions = [
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
          <meshStandardMaterial color={cartStyle.bodyColor} metalness={0.24} roughness={0.38} />
        </mesh>
        <mesh castShadow position={[0, 0.62 * s, 0]}>
          <boxGeometry args={[0.82 * s, 0.26 * s, 0.88 * s]} />
          <meshStandardMaterial color={cartStyle.topColor} metalness={0.1} roughness={0.5} />
        </mesh>
        {wheelPositions.map(([x, y, z]) => (
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

      <group ref={velocityArrowRef}>
        <mesh position={[0.45, 0, 0]}>
          <boxGeometry args={[0.92, 0.07, 0.07]} />
          <meshStandardMaterial color="#58a6ff" emissive="#2c62aa" emissiveIntensity={0.58} />
        </mesh>
        <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.36, 20]} />
          <meshStandardMaterial color="#58a6ff" emissive="#2c62aa" emissiveIntensity={0.58} />
        </mesh>
        <Html position={[0.5, 0.35, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div ref={velocityLabelRef} className="arrow-label arrow-label-velocity">0.00 m/s</div>
        </Html>
      </group>

      <group ref={forceArrowRef}>
        <mesh position={[0.45, 0, 0]}>
          <boxGeometry args={[0.92, 0.07, 0.07]} />
          <meshStandardMaterial color="#4ade80" emissive="#1a8a4a" emissiveIntensity={0.58} />
        </mesh>
        <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.36, 20]} />
          <meshStandardMaterial color="#4ade80" emissive="#1a8a4a" emissiveIntensity={0.58} />
        </mesh>
        <Html position={[0.5, 0.35, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div ref={forceLabelRef} className="arrow-label arrow-label-force">0.0 N</div>
        </Html>
      </group>

      <group ref={frictionArrowRef}>
        <mesh position={[0.45, 0, 0]}>
          <boxGeometry args={[0.92, 0.07, 0.07]} />
          <meshStandardMaterial color="#ff8b73" emissive="#8a3a2a" emissiveIntensity={0.58} />
        </mesh>
        <mesh position={[1, 0, 0]} rotation={[0, 0, -Math.PI / 2]}>
          <coneGeometry args={[0.18, 0.36, 20]} />
          <meshStandardMaterial color="#ff8b73" emissive="#8a3a2a" emissiveIntensity={0.58} />
        </mesh>
        <Html position={[0.5, 0.35, 0]} center distanceFactor={10} style={{ pointerEvents: 'none' }}>
          <div ref={frictionLabelRef} className="arrow-label arrow-label-friction">0.0 N</div>
        </Html>
      </group>
    </>
  )
}

export default function Newton2Scene({ controls, runKey, onMetricsChange }) {
  const motionRef = useRef({
    position: START_X,
    velocity: 0,
    netForce: 0,
    acceleration: 0,
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
        <CartRig2
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
