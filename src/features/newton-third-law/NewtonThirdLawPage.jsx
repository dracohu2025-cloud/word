import { Suspense, lazy, useEffect, useMemo } from 'react'
import { useNewtonThirdSimulation } from './useNewtonThirdSimulation.js'
import { getPhaseLabel } from './newton3MotionState.js'

const Newton3Scene = lazy(() => import('./scene/Newton3Scene.jsx'))

const FORMAL_DEFINITION = '两个物体之间的作用力和反作用力总是大小相等、方向相反、作用在不同物体上。'
const MISCONCEPTION = '"作用力和反作用力会互相抵消"是错误的——它们作用在不同物体上，不可能抵消。抵消只发生在同一个物体上的一对平衡力上。'
const EPIPHANY = '第三定律揭示的不是"平衡"，而是"对称"——宇宙中不存在单向的力。'

export default function NewtonThirdLawPage() {
  const {
    controls,
    metrics,
    explanation,
    runKey,
    setMetrics,
    updateControl,
    resetSimulation,
  } = useNewtonThirdSimulation()

  const hud = useMemo(
    () => [
      ['速度', `${metrics.speed.toFixed(2)} m/s`],
      ['加速度', `${metrics.acceleration.toFixed(2)} m/s²`],
      ['推力（你施加）', `${(metrics.appliedForce || controls.appliedForce).toFixed(1)} N`],
      ['墙反作用力', `${Math.abs(metrics.wallForce).toFixed(1)} N`],
    ],
    [metrics.speed, metrics.acceleration, metrics.appliedForce, metrics.wallForce, controls.appliedForce],
  )

  const phaseLabel = useMemo(
    () => getPhaseLabel(metrics.phase, controls.appliedForce),
    [metrics.phase, controls.appliedForce],
  )

  const canRenderScene = typeof window !== 'undefined'

  useEffect(() => {
    import('../../style.css')
  }, [])

  return (
    <main className="newton-page">
      <section className="newton-hero">
        <div className="newton-hero-copy">
          <span className="newton-kicker">Prototype 03 · Interactive Concept Card</span>
          <h1>牛顿第三定律</h1>
          <p className="newton-subtitle">
            一张会动的概念卡。你推小车撞墙，不是为了看一个小游戏，
            而是为了亲眼看出：你推墙的力和墙推回来的力永远大小相等、方向相反。
          </p>
        </div>
        <div className="newton-status-grid">
          {hud.map(([label, value]) => (
            <div key={label} className="newton-status-card">
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="newton-human-line">
        <span className="section-tag">一句人话</span>
        <p>你推墙，墙也在推你——力永远是成对出现的。</p>
      </section>

      <section className="newton-stage-card">
        <div className="newton-stage-header">
          <div>
            <span className="section-tag">主互动区</span>
            <h2>推墙实验舱</h2>
          </div>
          <div className="newton-stage-summary">
            <span>推小车撞墙</span>
            <span>观察力成对出现</span>
          </div>
        </div>

        <div className="newton-scene-shell">
          {canRenderScene ? (
            <Suspense fallback={<div className="newton-scene-fallback">实验舱正在启动…</div>}>
              <Newton3Scene
                controls={controls}
                runKey={runKey}
                onMetricsChange={setMetrics}
              />
            </Suspense>
          ) : (
            <div className="newton-scene-fallback">3D 场景将在浏览器环境中渲染</div>
          )}

          <div className="newton-scene-overlay">
            <div className="newton-scene-topline">
              <div className="newton-scene-readout">
                <span className="section-tag">舱内读数</span>
                <strong>{phaseLabel}</strong>
                <small>速度 {metrics.speed.toFixed(2)} · 推力 {(metrics.appliedForce || controls.appliedForce).toFixed(1)} N · 墙力 {Math.abs(metrics.wallForce).toFixed(1)} N</small>
              </div>
            </div>

            <div className="newton-scene-console">
              <div className="newton-slider-dock">
                <label className="newton-control">
                  <span>推力 (N)</span>
                  <strong>{controls.appliedForce.toFixed(1)}</strong>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={controls.appliedForce}
                    onChange={e => updateControl('appliedForce', Number(e.target.value))}
                  />
                </label>

                <label className="newton-control">
                  <span>质量 (kg)</span>
                  <strong>{controls.mass.toFixed(1)}</strong>
                  <input
                    type="range"
                    min="1"
                    max="10"
                    step="0.5"
                    value={controls.mass}
                    onChange={e => updateControl('mass', Number(e.target.value))}
                  />
                </label>

                <div className="newton-reset-slot">
                  <button
                    type="button"
                    className="button-secondary newton-reset-button"
                    onClick={resetSimulation}
                  >
                    重新开始
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="newton-copy-grid">
        <article className="newton-copy-card">
          <span className="section-tag">实时解释</span>
          <p>{explanation}</p>
        </article>
        <article className="newton-copy-card">
          <span className="section-tag">正式定义</span>
          <p>{FORMAL_DEFINITION}</p>
        </article>
        <article className="newton-copy-card">
          <span className="section-tag">误解纠偏</span>
          <p>{MISCONCEPTION}</p>
        </article>
        <article className="newton-copy-card newton-copy-card-epiphany">
          <span className="section-tag">顿悟句</span>
          <p>{EPIPHANY}</p>
        </article>
      </section>
    </main>
  )
}
