import { useState, useEffect, useCallback } from 'react'
import NewtonFirstLawPage from '../features/newton-first-law/NewtonFirstLawPage.jsx'
import NewtonSecondLawPage from '../features/newton-second-law/NewtonSecondLawPage.jsx'
import NewtonThirdLawPage from '../features/newton-third-law/NewtonThirdLawPage.jsx'

const TABS = [
  { key: 'first', label: '牛顿第一定律', hash: '#1' },
  { key: 'second', label: '牛顿第二定律', hash: '#2' },
  { key: 'third', label: '牛顿第三定律', hash: '#3' },
]

function getInitialTab(pathname, hash) {
  if (pathname.includes('-2')) return 'second'
  if (pathname.includes('-3') || hash === '#3') return 'third'
  if (hash === '#2') return 'second'
  return 'first'
}

export default function NewtonPage() {
  const [activeTab, setActiveTab] = useState(() =>
    getInitialTab(
      typeof window !== 'undefined' ? window.location.pathname : '',
      typeof window !== 'undefined' ? window.location.hash : '',
    ),
  )

  useEffect(() => {
    const title = activeTab === 'third'
      ? '牛顿第三定律 · 互动概念卡'
      : activeTab === 'second'
        ? '牛顿第二定律 · 互动概念卡'
        : '牛顿第一定律 · 互动概念卡'
    document.title = title
  }, [activeTab])

  const handleTabChange = useCallback((key) => {
    setActiveTab(key)
    if (typeof window !== 'undefined') {
      const tab = TABS.find(t => t.key === key)
      if (tab) {
        window.history.replaceState(null, '', tab.hash)
      }
    }
  }, [])

  useEffect(() => {
    const onHashChange = () => {
      const hash = window.location.hash
      if (hash === '#3') setActiveTab('third')
      else if (hash === '#2') setActiveTab('second')
      else if (hash === '#1' || hash === '') setActiveTab('first')
    }
    window.addEventListener('hashchange', onHashChange)
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  return (
    <>
      <nav className="newton-tabs">
        {TABS.map(tab => (
          <button
            key={tab.key}
            className={`newton-tab ${activeTab === tab.key ? 'newton-tab-active' : ''}`}
            onClick={() => handleTabChange(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      {activeTab === 'third' ? <NewtonThirdLawPage />
        : activeTab === 'second' ? <NewtonSecondLawPage />
        : <NewtonFirstLawPage />}
    </>
  )
}
