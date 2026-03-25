import html2canvas from 'html2canvas'
import { validateInput } from './lib/analysis.js'
import { getExportBackgroundColor, prepareExportNode } from './lib/export.js'
import { renderCardMarkup } from './lib/render.js'

// ═══════════════════════════════════════════════
// DOM Elements
// ═══════════════════════════════════════════════
const suggestions = [
  '道', '意', '缘', '悟', '空',
  'Serendipity', 'Resilience', 'Entropy', 'Ephemeral', 'Incubate'
]

export function mountWordCardApp(root = document) {
  const landing = root.querySelector('#landing')
  const cardView = root.querySelector('#card-view')
  const searchForm = root.querySelector('#search-form')
  const searchInput = root.querySelector('#search-input')
  const searchBtn = root.querySelector('#search-btn')
  const backBtn = root.querySelector('#back-btn')
  const downloadBtn = root.querySelector('#download-btn')
  const goBackBtn = root.querySelector('#go-back-btn')
  const wordCard = root.querySelector('#word-card')
  const notFound = root.querySelector('#not-found')
  const suggestionTags = root.querySelector('#suggestion-tags')

  if (!landing || !cardView || !searchInput || !searchBtn || !wordCard) {
    return () => {}
  }

  let isSearching = false
  let isComposing = false
  let pendingSearchAfterCompose = false
  let compositionFallbackTimer = null
  const cleanups = []

  function on(target, eventName, handler) {
    if (!target) {
      return
    }

    target.addEventListener(eventName, handler)
    cleanups.push(() => target.removeEventListener(eventName, handler))
  }

  function initSuggestions() {
    if (!suggestionTags) {
      return
    }

    suggestionTags.innerHTML = suggestions
      .map(word => `<span class="suggestion-tag" data-word="${word}">${word}</span>`)
      .join('')

    suggestionTags.querySelectorAll('.suggestion-tag').forEach(tag => {
      on(tag, 'click', () => {
        searchInput.value = tag.dataset.word
        handleSearch()
      })
    })
  }

  function showView(viewId) {
    root.querySelectorAll('.view').forEach(view => view.classList.remove('active'))
    root.querySelector(`#${viewId}`)?.classList.add('active')
    window.scrollTo(0, 0)
  }

  function showLanding() {
    showView('landing')
    wordCard.innerHTML = ''
    notFound?.classList.add('hidden')
    searchInput.value = ''
    searchInput.focus()
    cardView.removeAttribute('data-mood')
  }

  function showToast(message, duration = 2500) {
    let toast = document.querySelector('.toast')
    if (!toast) {
      toast = document.createElement('div')
      toast.className = 'toast'
      document.body.appendChild(toast)
    }
    toast.textContent = message
    toast.classList.add('show')
    setTimeout(() => toast.classList.remove('show'), duration)
  }

  function renderCard(data) {
    cardView.setAttribute('data-mood', data.mood || 'contemplative')
    wordCard.style.display = 'block'
    wordCard.innerHTML = renderCardMarkup(data)
  }

  async function handleSearch() {
    const word = searchInput.value.trim()
    const validation = validateInput(word)

    if (!validation.ok) {
      showToast(validation.message)
      return
    }

    if (isSearching) {
      return
    }

    isSearching = true
    showView('card-view')
    notFound?.classList.add('hidden')
    wordCard.innerHTML = `
      <div class="card-loading">
        <div class="loading-spinner"></div>
        <div class="loading-text">正在解析「${word}」的深层含义…</div>
      </div>
    `
    wordCard.style.display = 'block'

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ word }),
      })

      if (!response.ok) {
        const errorPayload = await response.json().catch(() => null)
        throw new Error(errorPayload?.error || `HTTP ${response.status}`)
      }

      const data = await response.json()

      if (data.error) {
        throw new Error(data.error)
      }

      renderCard(data)
    } catch (err) {
      console.error('Search error:', err)
      wordCard.style.display = 'none'
      notFound?.classList.remove('hidden')
      const errorText = notFound?.querySelector('p')
      if (errorText) {
        errorText.textContent = `解析失败：${err.message}。请稍后重试。`
      }
    } finally {
      isSearching = false
    }
  }

  function requestSearch() {
    if (isComposing) {
      pendingSearchAfterCompose = true
      if (compositionFallbackTimer) {
        clearTimeout(compositionFallbackTimer)
      }
      compositionFallbackTimer = setTimeout(() => {
        if (pendingSearchAfterCompose) {
          pendingSearchAfterCompose = false
          handleSearch()
        }
      }, 300)
      return
    }
    handleSearch()
  }

  async function handleDownload() {
    if (!wordCard.innerHTML || wordCard.querySelector('.card-loading')) {
      showToast('请先生成词卡')
      return
    }

    showToast('正在生成 PNG…')
    if (downloadBtn) {
      downloadBtn.disabled = true
    }

    try {
      const canvas = await html2canvas(wordCard, {
        scale: 2,
        useCORS: true,
        backgroundColor: getExportBackgroundColor(wordCard),
        logging: false,
        width: wordCard.scrollWidth,
        height: wordCard.scrollHeight,
        onclone: clonedDocument => {
          prepareExportNode(clonedDocument.getElementById('word-card'))
        },
      })

      const link = document.createElement('a')
      const wordText = wordCard.querySelector('.card-word')?.textContent || 'card'
      link.download = `词卡_${wordText}.png`
      link.href = canvas.toDataURL('image/png')
      link.click()

      showToast('词卡已下载 ✓')
    } catch (err) {
      console.error('Download error:', err)
      showToast('下载失败，请重试')
    } finally {
      if (downloadBtn) {
        downloadBtn.disabled = false
      }
    }
  }

  on(searchForm, 'submit', event => {
    event.preventDefault()
    requestSearch()
  })
  on(searchBtn, 'pointerdown', requestSearch)
  on(searchBtn, 'click', requestSearch)
  on(searchInput, 'compositionstart', () => {
    isComposing = true
  })
  on(searchInput, 'compositionend', () => {
    isComposing = false
    if (pendingSearchAfterCompose) {
      pendingSearchAfterCompose = false
      if (compositionFallbackTimer) {
        clearTimeout(compositionFallbackTimer)
        compositionFallbackTimer = null
      }
      handleSearch()
    }
  })
  on(searchInput, 'keydown', event => {
    if (event.key === 'Enter') {
      event.preventDefault()
      requestSearch()
    }
  })
  on(backBtn, 'click', showLanding)
  on(goBackBtn, 'click', showLanding)
  on(downloadBtn, 'click', handleDownload)

  initSuggestions()
  searchInput.focus()

  return () => {
    if (compositionFallbackTimer) {
      clearTimeout(compositionFallbackTimer)
    }
    cleanups.reverse().forEach(cleanup => cleanup())
  }
}
