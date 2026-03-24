const CHINESE_RE = /^[\u3400-\u4dbf\u4e00-\u9fff]$/
const ENGLISH_RE = /^[A-Za-z]+(?:['-][A-Za-z]+)*$/

export function normalizeInput(value) {
  return String(value ?? '').trim()
}

export function getInputType(value) {
  const normalized = normalizeInput(value)

  if (CHINESE_RE.test(normalized)) {
    return 'chinese'
  }

  if (ENGLISH_RE.test(normalized)) {
    return 'english'
  }

  return 'unknown'
}

export function validateInput(value) {
  const normalized = normalizeInput(value)

  if (!normalized) {
    return { ok: false, message: '请输入单个汉字或单个英文单词' }
  }

  if (/[\u3400-\u4dbf\u4e00-\u9fff]/.test(normalized) && /[A-Za-z]/.test(normalized)) {
    return { ok: false, message: '请输入单个汉字或单个英文单词' }
  }

  if (/[\u3400-\u4dbf\u4e00-\u9fff]/.test(normalized) && !CHINESE_RE.test(normalized)) {
    return { ok: false, message: '中文输入仅支持单个汉字' }
  }

  if (/[A-Za-z]/.test(normalized) && !ENGLISH_RE.test(normalized)) {
    return { ok: false, message: '英文输入仅支持单个单词' }
  }

  if (getInputType(normalized) === 'unknown') {
    return { ok: false, message: '请输入单个汉字或单个英文单词' }
  }

  return { ok: true }
}

export function getSystemPrompt() {
  return `你是一个遵循 ljg-word 方法论的解词助手。目标不是翻译，而是帮助用户掌握一个字或词的深层含义。

请严格输出 JSON，不要输出 Markdown 代码块，不要输出额外说明。
输出风格必须适合“词卡”排版：凝练、可视化、可印刷，避免学术论文式冗长表达。

{
  "word": "词本身",
  "phonetic": "音标或拼音",
  "translation": "简短翻译，不超过12个汉字",
  "originalImage": "用一句话描述这个字/词最原始、最物理的画面，尽量控制在36个汉字以内",
  "coreSymbolParts": ["要素1", "要素2", "要素3"],
  "coreSymbolResult": "结果，尽量控制在14个汉字以内",
  "explanation": "严格写2段中文，段落之间用 || 分隔。每段控制在55到90个汉字之间。要有洞见，但必须凝练，避免学术化铺陈。重要词可用 **加粗**。",
  "epiphanyEn": "一句具有哲学高度的英文金句，控制在18个单词以内",
  "epiphanyCn": "对应的中文金句，控制在28个汉字以内",
  "mood": "从 contemplative、sharp、warm、technical、research、creative、business 中选一个"
}

额外硬性约束：
1. coreSymbolParts 必须短促有力，每项尽量控制在8个汉字以内，绝不能写成长句。
2. coreSymbolParts 和 coreSymbolResult 必须更像“意象标签”，而不是解释句子。
3. explanation 必须适合移动端阅读，不要使用过多从句。`
}

export function buildPrompt(word, inputType) {
  if (inputType === 'chinese') {
    return `请按照 ljg-word 的解词原则，深度解析这个汉字：「${word}」。

硬性要求：
1. 目标不是普通释义，而是解释这个汉字的深层结构与精神重心。
2. 原始画面：尽量回到字形、构件、古义或最初物理画面。
3. 核心意象：提炼成 3 个要素 + 1 个结果的公式。
4. 深层解释：写 2 到 3 段中文，展示古义、现代使用、文学/哲学/日常之间的内在连线，而不是字典式罗列。
5. 一语道破：给出中英双语金句，必须有哲学高度。
6. 输出必须符合 JSON 结构。`
  }

  return `请按照 ljg-word 的原始方法，深度解析这个英文单词："${word}"。

硬性要求：
1. 目标不是翻译，而是让用户掌握它的深层含义和现代用法。
2. 原始画面：追到词源最物理、最可感的画面。
3. 核心意象：提炼成 3 个要素 + 1 个结果的公式。
4. 深层解释：用中文写 2 到 3 段，展示词源、语义扩展、跨领域用法之间的内在联系，而不是词典释义。
5. 一语道破：给出中英双语金句，必须有哲学高度。
6. 输出必须符合 JSON 结构。

再次强调：目标不是翻译。

排版约束：
1. originalImage 控制在 36 个汉字以内。
2. coreSymbolParts 每项尽量控制在 8 个汉字以内，必须是“标签”，不是解释句。
3. coreSymbolResult 控制在 14 个汉字以内。
4. explanation 严格写 2 段，每段 55 到 90 个汉字。
5. epiphanyEn 控制在 18 个单词以内，epiphanyCn 控制在 28 个汉字以内。`
}

function extractJsonText(content) {
  const cleaned = String(content ?? '')
    .trim()
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')

  const firstBrace = cleaned.indexOf('{')
  const lastBrace = cleaned.lastIndexOf('}')

  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    return cleaned.slice(firstBrace, lastBrace + 1)
  }

  return cleaned
}

function stripOuterPunctuation(value) {
  return String(value ?? '')
    .trim()
    .replace(/^[，。、；：,.;:!?！？\s]+/u, '')
    .replace(/[，。、；：,.;:!?！？\s]+$/u, '')
}

function clampText(value, maxLength) {
  const normalized = stripOuterPunctuation(value).replace(/\s+/g, ' ').trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  const sliced = normalized.slice(0, maxLength)
  const lastBreakpoint = Math.max(
    sliced.lastIndexOf('，'),
    sliced.lastIndexOf('。'),
    sliced.lastIndexOf('、'),
    sliced.lastIndexOf(','),
    sliced.lastIndexOf('.'),
    sliced.lastIndexOf(' '),
  )

  if (lastBreakpoint >= Math.floor(maxLength * 0.55)) {
    return stripOuterPunctuation(sliced.slice(0, lastBreakpoint))
  }

  return stripOuterPunctuation(sliced)
}

function normalizeFormulaPart(value) {
  const compact = stripOuterPunctuation(value)
    .replace(/[()（）【】[\]「」『』]/g, '')
    .replace(/\s+/g, '')

  if (!compact) {
    return ''
  }

  const firstSplit = compact.split(/[，,。；;：:、\/]/u)[0]
  return clampText(firstSplit, 8)
}

function clampExplanationParagraph(value, softLimit = 92, hardLimit = 132) {
  const normalized = String(value ?? '').replace(/\s+/g, ' ').trim()

  if (normalized.length <= softLimit) {
    return normalized
  }

  const sentenceEndPattern = /[。！？.!?]/gu
  let match
  let lastBeforeSoft = -1
  let firstAfterSoft = -1

  while ((match = sentenceEndPattern.exec(normalized)) !== null) {
    const index = match.index
    if (index < softLimit) {
      lastBeforeSoft = index
      continue
    }

    if (index <= hardLimit) {
      firstAfterSoft = index
      break
    }
  }

  if (firstAfterSoft !== -1) {
    return normalized.slice(0, firstAfterSoft + 1).trim()
  }

  if (lastBeforeSoft >= Math.floor(softLimit * 0.55)) {
    return normalized.slice(0, lastBeforeSoft + 1).trim()
  }

  return `${stripOuterPunctuation(normalized.slice(0, softLimit))}…`
}

function normalizeExplanation(value) {
  const parts = String(value ?? '')
    .split('||')
    .map(part => String(part ?? '').trim())
    .filter(Boolean)
    .slice(0, 2)
    .map(part => clampExplanationParagraph(part))

  return parts.join(' || ')
}

function normalizeEpiphanyEn(value) {
  const normalized = String(value ?? '').replace(/\s+/g, ' ').trim()
  const words = normalized.split(' ').filter(Boolean)
  return words.slice(0, 18).join(' ')
}

export function parseWordAnalysis(content, rawInput, inputType) {
  const normalized = normalizeInput(rawInput)
  const jsonText = extractJsonText(content)
  const parsed = JSON.parse(jsonText)

  const coreSymbolParts = Array.isArray(parsed.coreSymbolParts)
    ? parsed.coreSymbolParts
      .slice(0, 3)
      .map(normalizeFormulaPart)
      .filter(Boolean)
    : []

  return {
    word: parsed.word || normalized,
    inputType,
    phonetic: stripOuterPunctuation(parsed.phonetic || ''),
    translation: clampText(parsed.translation || '', 14),
    originalImage: clampText(parsed.originalImage || '', 40),
    coreSymbolParts,
    coreSymbolResult: clampText(parsed.coreSymbolResult || '', 14),
    explanation: normalizeExplanation(parsed.explanation || ''),
    epiphanyEn: normalizeEpiphanyEn(parsed.epiphanyEn || ''),
    epiphanyCn: clampText(parsed.epiphanyCn || '', 28),
    mood: parsed.mood || 'contemplative',
  }
}
