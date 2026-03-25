import { useEffect, useRef } from 'react'
import { mountWordCardApp } from '../main.js'

export default function LegacyWordCardPage() {
  const rootRef = useRef(null)

  useEffect(() => {
    let cleanup = () => {}

    async function setup() {
      await import('../legacy-word-card.css')
      cleanup = mountWordCardApp(rootRef.current)
    }

    setup()

    return () => {
      cleanup()
    }
  }, [])

  return (
    <div ref={rootRef}>
      <section id="landing" className="view active">
        <div className="landing-bg">
          <div className="bg-glyph bg-glyph-1">字</div>
          <div className="bg-glyph bg-glyph-2">词</div>
          <div className="bg-glyph bg-glyph-3">意</div>
        </div>
        <div className="landing-content">
          <h1 className="site-title">
            <span className="title-char">词</span>
            <span className="title-dot">·</span>
            <span className="title-sub">一字一世界</span>
          </h1>
          <p className="site-desc">
            输入单个汉字或英文单词
            <br />
            深度挖掘其灵魂深处的含义
          </p>
          <form id="search-form" className="search-box">
            <input
              id="search-input"
              type="text"
              placeholder="输入单个汉字或英文单词，如「道」或「Serendipity」"
              autoComplete="off"
              spellCheck="false"
            />
            <button id="search-btn" type="submit" aria-label="搜索">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
              </svg>
            </button>
          </form>
          <p className="search-rules">中文仅支持单个汉字，英文仅支持单个单词。先解词，再铸卡。</p>
          <div id="suggestions" className="suggestions">
            <span className="suggestion-label">试试这些：</span>
            <div className="suggestion-tags" id="suggestion-tags"></div>
          </div>
        </div>
      </section>

      <section id="card-view" className="view">
        <nav className="card-nav">
          <button id="back-btn" className="nav-btn" aria-label="返回">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            <span>返回</span>
          </button>
          <button id="download-btn" className="nav-btn download-btn" aria-label="下载 PNG">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
              <polyline points="7 10 12 15 17 10"></polyline>
              <line x1="12" y1="15" x2="12" y2="3"></line>
            </svg>
            <span>下载 PNG</span>
          </button>
        </nav>

        <div className="card-container">
          <div id="word-card" className="word-card"></div>
        </div>

        <div id="not-found" className="not-found hidden">
          <div className="not-found-icon">🔍</div>
          <h2>暂未收录此词</h2>
          <p>词库还在持续扩充中，试试首页推荐的词汇吧。</p>
          <button id="go-back-btn" className="go-back-btn">返回首页</button>
        </div>
      </section>
    </div>
  )
}
