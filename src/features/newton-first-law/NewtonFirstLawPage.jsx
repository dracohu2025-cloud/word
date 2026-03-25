import { Suspense, lazy, useMemo } from 'react'
import { useNewtonSimulation } from './useNewtonSimulation.js'

const NewtonScene = lazy(() => import('./scene/NewtonScene.jsx'))

const FORMAL_DEFINITION = '当合外力为零时，物体保持静止状态或匀速直线运动状态。'
const MISCONCEPTION = '“东西总会慢下来”是日常经验，不是定律本身；真正的原因是现实里通常有摩擦和阻力。'
const EPIPHANY = '第一定律谈的不是“会不会动”，而是“改变运动为什么需要原因”。'

function formatForceMode(value) {
  if (value === 'continuous') return '持续推'
  if (value === 'pulse') return '短推一下'
  return '无外力'
}

function formatFocus(value) {
  if (value === 'distance') return '更关注位移'
  return '速度与受力'
}

export default function NewtonFirstLawPage() {
  const {
    controls,
    metrics,
    explanation,
    paused,
    runKey,
    setPaused,
    setMetrics,
    updateControl,
    resetSimulation,
  } = useNewtonSimulation()

  const hud = useMemo(
    () => [
      ['速度', metrics.speed.toFixed(2)],
      ['合外力', metrics.netForce.toFixed(2)],
      ['状态', metrics.stateLabel],
      ['摩擦', controls.friction.toFixed(2)],
    ],
    [controls.friction, metrics.netForce, metrics.speed, metrics.stateLabel],
  )

  const canRenderScene = typeof window !== 'undefined'

  return (
    <main className="newton-page">
      <section className="newton-hero">
        <div className="newton-hero-copy">
          <span className="newton-kicker">Prototype 01 · Interactive Concept Card</span>
          <h1>牛顿第一定律</h1>
          <p className="newton-subtitle">
            一张会动的概念卡。你拖动变量，不是为了看一个小游戏，而是为了亲眼看出：
            “停下”通常不是定律本身，而是摩擦在改变运动。
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
            <span>外力模式：{formatForceMode(controls.forceMode)}</span>
            <span>观察重点：{formatFocus(controls.focusMode)}</span>
          </div>
        </div>

        {canRenderScene ? (
          <Suspense fallback={<div className="newton-scene-fallback">实验舱正在启动…</div>}>
            <NewtonScene
              controls={controls}
              paused={paused}
              runKey={runKey}
              onMetricsChange={setMetrics}
            />
          </Suspense>
        ) : (
          <div className="newton-scene-fallback">3D 场景将在浏览器环境中渲染</div>
        )}

        <div className="newton-controls">
          <label className="newton-control">
            <span>摩擦系数</span>
            <strong>{controls.friction.toFixed(2)}</strong>
            <input
              type="range"
              min="0"
              max="0.24"
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
              min="0.5"
              max="8"
              step="0.1"
              value={controls.initialSpeed}
              onChange={event => updateControl('initialSpeed', Number(event.target.value))}
            />
          </label>

          <label className="newton-control newton-control-select">
            <span>外力模式</span>
            <select
              value={controls.forceMode}
              onChange={event => updateControl('forceMode', event.target.value)}
            >
              <option value="none">无外力</option>
              <option value="pulse">短推一下</option>
              <option value="continuous">持续推</option>
            </select>
          </label>

          <label className="newton-control newton-control-select">
            <span>观察重点</span>
            <select
              value={controls.focusMode}
              onChange={event => updateControl('focusMode', event.target.value)}
            >
              <option value="speed-force">速度与受力</option>
              <option value="distance">更关注位移</option>
            </select>
          </label>
        </div>

        <div className="newton-actions">
          <button type="button" className="button-primary" onClick={resetSimulation}>重新开始</button>
          <button
            type="button"
            className="button-secondary"
            onClick={() => setPaused(current => !current)}
          >
            {paused ? '继续' : '暂停'}
          </button>
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
