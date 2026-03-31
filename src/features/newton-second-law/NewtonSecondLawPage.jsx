import { Suspense, lazy, useEffect, useMemo } from 'react'
import { useNewtonSecondSimulation } from './useNewtonSecondSimulation.js'

const Newton2Scene = lazy(() => import('./scene/Newton2Scene.jsx'))

const FORMAL_DEFINITION = '物体的加速度与所受合力成正比，与质量成反比：F = ma。'
const MISCONCEPTION = '"力越大速度越大"是不准确的；力越大，加速度越大——加速度才是力直接决定的东西。'
const EPIPHANY = '第二定律不是关于"快慢"，而是关于"改变的快慢"。质量抵抗改变，力驱动改变。'

export default function NewtonSecondLawPage() {
  const {
    controls,
    metrics,
    explanation,
    runKey,
    setMetrics,
    updateControl,
    resetSimulation,
  } = useNewtonSecondSimulation()

  const hud = useMemo(
    () => [
      ['速度', metrics.speed.toFixed(2)],
      ['加速度', metrics.acceleration.toFixed(2)],
      ['合力', metrics.netForce.toFixed(2)],
      ['施力', metrics.appliedForce.toFixed(2)],
    ],
    [metrics.speed, metrics.acceleration, metrics.netForce, metrics.appliedForce],
  )

  const canRenderScene = typeof window !== 'undefined'

  useEffect(() => {
    import('../../style.css')
  }, [])

  return (
    <main className="newton-page">
      <section className="newton-hero">
        <div className="newton-hero-copy">
          <span className="newton-kicker">Prototype 02 · Interactive Concept Card</span>
          <h1>牛顿第二定律</h1>
          <p className="newton-subtitle">
            一张会动的概念卡。你调节力和质量，不是为了看一个小游戏，
            而是为了亲眼看出：力决定加速度，质量抵抗加速度——F = ma。
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
        <p>力越大，加速度越大；质量越大，加速度越小。</p>
      </section>

      <section className="newton-stage-card">
        <div className="newton-stage-header">
          <div>
            <span className="section-tag">主互动区</span>
            <h2>F = ma 实验舱</h2>
          </div>
          <div className="newton-stage-summary">
            <span>调节力、质量和摩擦</span>
            <span>观察加速度如何变化</span>
          </div>
        </div>

        <div className="newton-scene-shell">
          {canRenderScene ? (
            <Suspense fallback={<div className="newton-scene-fallback">实验舱正在启动…</div>}>
              <Newton2Scene
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
                <strong>{metrics.stateLabel}</strong>
                <small>速度 {metrics.speed.toFixed(2)} · 加速度 {metrics.acceleration.toFixed(2)} · 合力 {metrics.netForce.toFixed(2)}</small>
              </div>
            </div>

            <div className="newton-scene-console">
              <div className="newton-slider-dock newton-slider-dock-3">
                <label className="newton-control">
                  <span>施加力 (N)</span>
                  <strong>{controls.appliedForce.toFixed(1)}</strong>
                  <input
                    type="range"
                    min="0"
                    max="20"
                    step="0.5"
                    value={controls.appliedForce}
                    onChange={event => updateControl('appliedForce', Number(event.target.value))}
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
                    onChange={event => updateControl('mass', Number(event.target.value))}
                  />
                </label>

                <label className="newton-control">
                  <span>摩擦系数</span>
                  <strong>{controls.friction.toFixed(2)}</strong>
                  <input
                    type="range"
                    min="0"
                    max="0.7"
                    step="0.01"
                    value={controls.friction}
                    onChange={event => updateControl('friction', Number(event.target.value))}
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
