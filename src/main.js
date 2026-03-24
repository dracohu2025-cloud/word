import './style.css'
import html2canvas from 'html2canvas'
import { validateInput } from './lib/analysis.js'
import { prepareExportNode } from './lib/export.js'
import { renderCardMarkup } from './lib/render.js'

// ═══════════════════════════════════════════════
// DOM Elements
// ═══════════════════════════════════════════════
const landing = document.getElementById('landing')
const cardView = document.getElementById('card-view')
const searchForm = document.getElementById('search-form')
const searchInput = document.getElementById('search-input')
const searchBtn = document.getElementById('search-btn')
const backBtn = document.getElementById('back-btn')
const downloadBtn = document.getElementById('download-btn')
const goBackBtn = document.getElementById('go-back-btn')
const wordCard = document.getElementById('word-card')
const notFound = document.getElementById('not-found')
const suggestionTags = document.getElementById('suggestion-tags')
let isSearching = false
let isComposing = false
let pendingSearchAfterCompose = false
let compositionFallbackTimer = null

// ═══════════════════════════════════════════════
// Sample suggestions
// ═══════════════════════════════════════════════
const suggestions = [
  '道', '意', '缘', '悟', '空',
  'Serendipity', 'Resilience', 'Entropy', 'Ephemeral', 'Incubate'
]

function initSuggestions() {
  suggestionTags.innerHTML = suggestions
    .map(w => `<span class="suggestion-tag" data-word="${w}">${w}</span>`)
    .join('')

  suggestionTags.querySelectorAll('.suggestion-tag').forEach(tag => {
    tag.addEventListener('click', () => {
      searchInput.value = tag.dataset.word
      handleSearch()
    })
  })
}

// ═══════════════════════════════════════════════
// View Management
// ═══════════════════════════════════════════════
function showView(viewId) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'))
  document.getElementById(viewId).classList.add('active')
  window.scrollTo(0, 0)
}

function showLanding() {
  showView('landing')
  wordCard.innerHTML = ''
  notFound.classList.add('hidden')
  searchInput.value = ''
  searchInput.focus()
  // Reset mood on card-view
  cardView.removeAttribute('data-mood')
}

// ═══════════════════════════════════════════════
// Toast
// ═══════════════════════════════════════════════
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

// ═══════════════════════════════════════════════
// Search Handler
// ═══════════════════════════════════════════════
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
  notFound.classList.add('hidden')

  // Show loading state
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
      body: JSON.stringify({ word })
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
    notFound.classList.remove('hidden')
    notFound.querySelector('p').textContent = `解析失败：${err.message}。请稍后重试。`
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

// ═══════════════════════════════════════════════
// Card Renderer
// ═══════════════════════════════════════════════
function renderCard(data) {
  cardView.setAttribute('data-mood', data.mood || 'contemplative')
  wordCard.style.display = 'block'
  wordCard.innerHTML = renderCardMarkup(data)
}

// ═══════════════════════════════════════════════
// PNG Download
// ═══════════════════════════════════════════════
async function handleDownload() {
  if (!wordCard.innerHTML || wordCard.querySelector('.card-loading')) {
    showToast('请先生成词卡')
    return
  }

  showToast('正在生成 PNG…')
  downloadBtn.disabled = true

  try {
    const canvas = await html2canvas(wordCard, {
      scale: 2,
      useCORS: true,
      backgroundColor: null,
      logging: false,
      width: wordCard.scrollWidth,
      height: wordCard.scrollHeight,
      onclone: (clonedDocument) => {
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
    downloadBtn.disabled = false
  }
}

// ═══════════════════════════════════════════════
// Event Listeners
// ═══════════════════════════════════════════════
searchForm?.addEventListener('submit', (event) => {
  event.preventDefault()
  requestSearch()
})
searchBtn.addEventListener('pointerdown', requestSearch)
searchBtn.addEventListener('click', requestSearch)
searchInput.addEventListener('compositionstart', () => {
  isComposing = true
})
searchInput.addEventListener('compositionend', () => {
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
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    requestSearch()
  }
})

backBtn.addEventListener('click', showLanding)
goBackBtn?.addEventListener('click', showLanding)
downloadBtn.addEventListener('click', handleDownload)

// ═══════════════════════════════════════════════
// Init
// ═══════════════════════════════════════════════
initSuggestions()
searchInput.focus()
