import { createElement } from 'react'
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, test } from 'vitest'
import App from '../src/app/App.jsx'

describe('app routing', () => {
  test('keeps the word card experience on the root path', () => {
    const html = renderToStaticMarkup(createElement(App, { pathname: '/' }))

    expect(html).toContain('一字一世界')
    expect(html).toContain('search-input')
    expect(html).not.toContain('牛顿第一定律')
  })

  test('renders the newton page only under /newton', () => {
    const html = renderToStaticMarkup(createElement(App, { pathname: '/newton' }))

    expect(html).toContain('牛顿第一定律')
    expect(html).not.toContain('search-input')
  })
})
