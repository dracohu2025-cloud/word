import { useEffect } from 'react'
import NewtonFirstLawPage from '../features/newton-first-law/NewtonFirstLawPage.jsx'
import NewtonSecondLawPage from '../features/newton-second-law/NewtonSecondLawPage.jsx'
import LegacyWordCardPage from './LegacyWordCardPage.jsx'

const WORD_CARD_META = {
  title: '词卡 · 一字一世界',
  description: '输入单个汉字或英文单词，深度挖掘其含义，生成精美词卡。',
}

const NEWTON_META = {
  title: '牛顿第一定律 · 互动概念卡',
  description: '使用 React Three Fiber 与 Rapier 构建的牛顿第一定律互动概念卡样板。',
}

const NEWTON2_META = {
  title: '牛顿第二定律 · 互动概念卡',
  description: '使用 React Three Fiber 构建的牛顿第二定律 F=ma 互动概念卡。',
}

function applyDocumentMeta({ title, description }) {
  if (typeof document === 'undefined') {
    return
  }

  document.title = title
  const meta = document.querySelector('meta[name="description"]')
  if (meta) {
    meta.setAttribute('content', description)
  }
}

export default function App({ pathname = typeof window !== 'undefined' ? window.location.pathname : '/' }) {
  const isNewton1Route = pathname === '/newton' || pathname.startsWith('/newton/')
  const isNewton2Route = pathname === '/newton-2' || pathname.startsWith('/newton-2/')

  useEffect(() => {
    if (isNewton2Route) applyDocumentMeta(NEWTON2_META)
    else if (isNewton1Route) applyDocumentMeta(NEWTON_META)
    else applyDocumentMeta(WORD_CARD_META)
  }, [isNewton1Route, isNewton2Route])

  if (isNewton2Route) return <NewtonSecondLawPage />
  if (isNewton1Route) return <NewtonFirstLawPage />
  return <LegacyWordCardPage />
}
