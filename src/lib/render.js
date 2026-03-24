const INPUT_TYPE_LABELS = {
  english: '单词',
  chinese: '中文词',
}

const MOOD_LABELS = {
  contemplative: '哲学',
  sharp: '批判',
  warm: '人文',
  technical: '技术',
  research: '科研',
  creative: '创意',
  business: '商业',
}

export function formatExplanationParagraphs(text) {
  return String(text ?? '')
    .split('||')
    .map(part => part.trim())
    .filter(Boolean)
    .map(part => `<p>${part.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</p>`)
    .join('')
}

export function renderCardMarkup(data) {
  const inputType = data.inputType || 'english'
  const word = String(data.word ?? '')
  const displayWord = inputType === 'english'
    ? word.charAt(0).toUpperCase() + word.slice(1)
    : word
  const wordClass = inputType === 'english' ? 'card-word-en' : 'card-word-cn'
  const formulaParts = (data.coreSymbolParts || [])
    .map(part => `<span>${part}</span>`)
    .join('<span class="formula-operator">+</span>')
  const formulaMarkup = formulaParts
    ? `${formulaParts}<span class="formula-operator">=</span><span class="formula-result">${data.coreSymbolResult || ''}</span>`
    : ''
  const explanationMarkup = formatExplanationParagraphs(data.explanation)
  const domain = MOOD_LABELS[data.mood] || '语言'
  const inputLabel = INPUT_TYPE_LABELS[inputType] || '词'

  return `
    <div class="card-header animate-in animate-delay-1">
      <div class="card-ref">REF—${domain} / ${displayWord}</div>
      <div class="card-meta-row">
        <span class="card-badge">${inputLabel}</span>
        <span class="card-badge card-badge-soft">${new Date().toISOString().split('T')[0]}</span>
      </div>
      <div class="card-word ${wordClass}">${displayWord}</div>
      <div class="card-phonetic">${data.phonetic || ''}</div>
      <div class="card-translation">${data.translation || ''}</div>
    </div>

    <div class="card-body">
      <section class="card-original-image animate-in animate-delay-2">
        <div class="section-label">原始画面 · Origin</div>
        <div class="section-content">${data.originalImage || ''}</div>
      </section>

      <section class="card-core-symbol animate-in animate-delay-3">
        <div class="section-label">核心意象 · Core Symbol</div>
        <div class="card-formula">${formulaMarkup}</div>
      </section>

      <section class="card-explanation animate-in animate-delay-4">
        <div class="section-label">深层解析 · Insight</div>
        ${explanationMarkup}
      </section>
    </div>

    <section class="card-epiphany animate-in animate-delay-5">
      <div class="section-label section-label-invert">一语道破 · Epiphany</div>
      <div class="epiphany-text">
        <span class="epiphany-mark"></span>${data.epiphanyEn || ''}
      </div>
      <div class="epiphany-text epiphany-secondary">${data.epiphanyCn || ''}</div>
    </section>

    <div class="card-colophon">
      <div class="colophon-left">词卡 · 先解词，后铸卡</div>
      <div class="colophon-right">${inputLabel}</div>
    </div>
  `
}
