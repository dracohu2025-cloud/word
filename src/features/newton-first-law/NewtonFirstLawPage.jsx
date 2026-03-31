import { Suspense, lazy, useEffect, useMemo } from 'react'
import { useNewtonSimulation } from './useNewtonSimulation.js'

import NewtonScene from './scene/NewtonScene.jsx'

const FORMAL_DEFINITION = '当合外力为零时，物体保持静止状态或匀速直线运动状态。'
const MISCONCEPTION = '"东西总会慢下来"是日常经验，不是定律本身；真正的原因是现实里通常有摩擦和阻力。'
const EPIPHANY = '第一定律谈的不是"会不会动"，而是"改变运动为什么需要原因"。'

export default function NewtonFirstLawPage() {
  const {
    controls,
    metrics,
    explanation,
    runKey,
    setMetrics,
    updateControl,
    resetSimulation,
  } = useNewtonSimulation()

  const hud = useMemo(
    () => [
      ['速度', metrics.speed.toFixed(2)],
      ['合力', metrics.netForce.toFixed(2)],
      ['施力', controls.appliedForce.toFixed(1)],
      ['摩擦', controls.friction.toFixed(2)],
    ],
    [controls.appliedForce, controls.friction, metrics.netForce, metrics.speed],
  )

  const canRenderScene = typeof window !== 'undefined'

  useEffect(() => {
    import('../../style.css')
  }, [])

  return (
    <main className="newton-page">
      <section className="newton-hero">
        <div className="newton-hero-copy">
          <span className="newton-kicker">Prototype 01 · Interactive Concept Card</span>
          <h1>牛顿第一定律</h1>
          <p className="newton-subtitle">
            一张会动的概念卡。你拖动变量，不是为了看一个小游戏，而是为了亲眼看出：
            "停下"通常不是定律本身，而是摩擦在改变运动。
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
        <p>不推它，它不会自己改主意。</p>
      </section>

      <section className="newton-stage-card">
        <div className="newton-stage-header">
          <div>
            <span className="section-tag">主互动区</span>
            <h2>轨道小车实验舱</h2>
          </div>
          <div className="newton-stage-summary">
            <span>调节力、摩擦和初速度</span>
            <span>观察运动状态如何变化</span>
          </div>
        </div>

        <div className="newton-scene-shell">
          {canRenderScene ? (
            <Suspense fallback={<div className="newton-scene-fallback">实验舱正在启动…</div>}>
              <NewtonScene
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
                <small>速度 {metrics.speed.toFixed(2)} · 合力 {metrics.netForce.toFixed(2)}</small>
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

                <label className="newton-control">
                  <span>初速度</span>
                  <strong>{controls.initialSpeed.toFixed(1)}</strong>
                  <input
                    type="range"
                    min="0"
                    max="8"
                    step="0.1"
                    value={controls.initialSpeed}
                    onChange={event => updateControl('initialSpeed', Number(event.target.value))}
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
