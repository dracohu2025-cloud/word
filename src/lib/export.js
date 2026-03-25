const EXPORT_FALLBACK_BACKGROUND = '#F5F2ED'
const DEFAULT_EXPORT_SCALE = 2
const MAX_DESKTOP_EXPORT_EDGE = 4096
const MAX_CONSTRAINED_EXPORT_EDGE = 2300

function normalizeUserAgent(userAgent) {
  return String(userAgent || '').toLowerCase()
}

function isWechat(userAgent) {
  return normalizeUserAgent(userAgent).includes('micromessenger')
}

function isIosWebKit(userAgent) {
  const normalized = normalizeUserAgent(userAgent)
  const isAppleMobile = /(iphone|ipad|ipod)/.test(normalized)
  const usesWebKit = normalized.includes('applewebkit')
  const isAlternativeBrowser = /(crios|fxios|edgios|mercury)/.test(normalized)

  return isAppleMobile && usesWebKit && !isAlternativeBrowser
}

export function shouldUsePreviewExport(userAgent) {
  return isWechat(userAgent) || isIosWebKit(userAgent)
}

export function getExportScale({
  userAgent,
  devicePixelRatio = 1,
  width = 1,
  height = 1,
} = {}) {
  const maxEdge = Math.max(width || 1, height || 1, 1)
  const constrained = shouldUsePreviewExport(userAgent)
  const edgeLimit = constrained ? MAX_CONSTRAINED_EXPORT_EDGE : MAX_DESKTOP_EXPORT_EDGE
  const edgeScaleCap = edgeLimit / maxEdge
  const targetScale = constrained ? 1.6 : DEFAULT_EXPORT_SCALE

  return Math.max(
    1,
    Math.min(targetScale, devicePixelRatio || targetScale, edgeScaleCap),
  )
}

export function normalizeExportBackgroundColor(backgroundColor, fallback = EXPORT_FALLBACK_BACKGROUND) {
  if (!backgroundColor) {
    return fallback
  }

  const normalized = String(backgroundColor).replace(/\s+/g, '').toLowerCase()

  if (normalized === 'transparent' || normalized === 'rgba(0,0,0,0)') {
    return fallback
  }

  return backgroundColor
}

function getNodeComputedStyle(node) {
  return node?.ownerDocument?.defaultView?.getComputedStyle?.(node) ?? null
}

export function getExportBackgroundColor(node, fallback = EXPORT_FALLBACK_BACKGROUND) {
  return normalizeExportBackgroundColor(getNodeComputedStyle(node)?.backgroundColor, fallback)
}

export function prepareExportNode(root) {
  if (!root?.querySelectorAll) {
    return
  }

  if (root.style) {
    root.style.backgroundColor = getExportBackgroundColor(root)
  }

  root.querySelectorAll('.animate-in, [class*="animate-delay-"]').forEach(node => {
    node.style.opacity = '1'
    node.style.transform = 'none'
    node.style.animation = 'none'
  })

  root.querySelectorAll('*').forEach(node => {
    const computedStyle = getNodeComputedStyle(node)

    if (!computedStyle) {
      return
    }

    const hasBackdrop = (
      computedStyle.backdropFilter && computedStyle.backdropFilter !== 'none'
    ) || (
      computedStyle.webkitBackdropFilter && computedStyle.webkitBackdropFilter !== 'none'
    )

    if (!hasBackdrop) {
      return
    }

    node.style.backdropFilter = 'none'
    node.style.webkitBackdropFilter = 'none'
    node.style.backgroundColor = normalizeExportBackgroundColor(computedStyle.backgroundColor)
  })
}
