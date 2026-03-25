import { describe, expect, test } from 'vitest'
import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import NewtonFirstLawPage from '../src/features/newton-first-law/NewtonFirstLawPage.jsx'

describe('newton first law page', () => {
  test('renders the core interactive concept card sections', () => {
    const html = renderToStaticMarkup(createElement(NewtonFirstLawPage))

    expect(html).toContain('牛顿第一定律')
    expect(html).toContain('不推它，它不会自己改主意。')
    expect(html).toContain('摩擦系数')
    expect(html).toContain('初速度')
    expect(html).toContain('推一下')
    expect(html).toContain('正式定义')
    expect(html).toContain('误解纠偏')
    expect(html).toContain('顿悟句')
  })

  test('keeps only intuitive controls inside the experiment cabin', () => {
    const html = renderToStaticMarkup(createElement(NewtonFirstLawPage))

    expect(html).not.toContain('观察重点')
    expect(html).not.toContain('外力模式')
    expect(html).not.toContain('持续推动')
    expect(html).not.toContain('暂停')
    expect(html).not.toContain('运行控制')
    expect(html).toContain('推一下')
    expect(html).toContain('重新开始')
    expect(html).not.toContain('实验参数')
  })
})
