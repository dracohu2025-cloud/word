export function getNewton3Explanation({
  phase,
  massA,
  massB,
  appliedForce,
  speedA,
  speedB,
  forceOnA,
  forceOnB,
}) {
  if (appliedForce < 0.1 && phase === 'idle') {
    return '拖动"推力"滑块，观察两辆小车如何同时受到大小相等、方向相反的力——即使它们的质量不同。'
  }

  if (phase === 'contact' && appliedForce > 0.1) {
    const absForce = Math.abs(appliedForce).toFixed(1)
    const absAccA = Math.abs(forceOnA / massA).toFixed(2)
    const absAccB = Math.abs(forceOnB / massB).toFixed(2)

    if (Math.abs(massA - massB) < 0.01) {
      return `两车质量相同（${massA.toFixed(1)} kg），受到大小相等方向相反的 ${absForce} N 力，所以加速度也相同——它们以相同速率向相反方向加速。`
    }

    return `A车推B车的力是 ${absForce} N，B车反推A车的力也是 ${absForce} N——大小相等，方向相反。但A车（${massA.toFixed(1)} kg）加速度 ${absAccA} m/s²，B车（${massB.toFixed(1)} kg）加速度 ${absAccB} m/s²。力相同，质量不同，加速度就不同。`
  }

  if (phase === 'separated') {
    const moving = (Math.abs(speedA) > 0.01 ? 1 : 0) + (Math.abs(speedB) > 0.01 ? 1 : 0)
    if (moving > 0) {
      return `小车已经分离，但它们曾经受到的力永远是成对的。现在各自独立地被摩擦力减速——A车向左 ${Math.abs(speedA).toFixed(2)} m/s，B车向右 ${Math.abs(speedB).toFixed(2)} m/s。`
    }
    return '两辆小车都因摩擦力停下来了。但回顾整个过程：无论质量如何不同，两车之间的力始终是大小相等、方向相反的。'
  }

  if (phase === 'stopped') {
    return '两辆小车都停下来了。回顾整个过程：无论质量如何不同，力始终是大小相等、方向相反的。第三定律不关心质量——它只说力永远是成对的。'
  }

  return '第三定律：每一个作用力，都有一个大小相等、方向相反的反作用力。调节滑块，亲眼验证这一点。'
}
