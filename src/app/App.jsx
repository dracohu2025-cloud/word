import { useEffect } from 'react'
import NewtonFirstLawPage from '../features/newton-first-law/NewtonFirstLawPage.jsx'
import LegacyWordCardPage from './LegacyWordCardPage.jsx'

const WORD_CARD_META = {
  title: '词卡 · 一字一世界',
  description: '输入单个汉字或英文单词，深度挖掘其含义，生成精美词卡。',
}

const NEWTON_META = {
  title: '牛顿第一定律 · 互动概念卡',
  description: '使用 React Three Fiber 与 Rapier 构建的牛顿第一定律互动概念卡样板。',
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
  const isNewtonRoute = pathname === '/newton' || pathname.startsWith('/newton/')

  useEffect(() => {
    applyDocumentMeta(isNewtonRoute ? NEWTON_META : WORD_CARD_META)
  }, [isNewtonRoute])

  return isNewtonRoute ? <NewtonFirstLawPage /> : <LegacyWordCardPage />
}
