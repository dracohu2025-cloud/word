export function getNewton3Explanation({
  phase,
  mass,
  appliedForce,
  speed,
  wallForce,
}) {
  if (appliedForce < 0.1 && phase === 'idle') {
    return '拖动"推力"滑块向右推小车——当小车碰到墙时，观察墙如何以完全相同的力推回来。'
  }

  if (phase === 'contact' && appliedForce > 0.1) {
    const f = appliedForce.toFixed(1)
    return `你用 ${f} N 的力推小车撞墙，墙就以 ${f} N 的力推回来——大小相等，方向相反。小车不动（合力为零），但力确实成对存在。继续增大推力，墙的反作用力也会同步增大。`
  }

  if (appliedForce > 0.1 && speed > 0.03) {
    return '小车正在向墙移动——一旦碰到墙，就会产生大小相等、方向相反的力对。'
  }

  if (appliedForce < 0.1 && speed > 0.03) {
    return '推力已撤除，小车被摩擦力减速。之前推墙时，作用力与反作用力始终成对——撤力后力对消失。'
  }

  return '第三定律：每一个作用力，都有一个大小相等、方向相反的反作用力。调节推力滑块，亲眼验证。'
}
