import { useEffect } from 'react'
import NewtonPage from './NewtonPage.jsx'
import LegacyWordCardPage from './LegacyWordCardPage.jsx'

const WORD_CARD_META = {
  title: '词卡 · 一字一世界',
  description: '输入单个汉字或英文单词，深度挖掘其含义，生成精美词卡。',
}

const NEWTON_META = {
  title: '牛顿定律 · 互动概念卡',
  description: '使用 React Three Fiber 构建的牛顿定律互动概念卡。',
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
  const isNewtonRoute = pathname === '/newton' || pathname === '/newton-2' || pathname.startsWith('/newton/') || pathname.startsWith('/newton-2/')

  useEffect(() => {
    if (isNewtonRoute) applyDocumentMeta(NEWTON_META)
    else applyDocumentMeta(WORD_CARD_META)
  }, [isNewtonRoute])

  if (isNewtonRoute) return <NewtonPage />
  return <LegacyWordCardPage />
}
