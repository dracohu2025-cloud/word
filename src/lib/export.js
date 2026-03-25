const EXPORT_FALLBACK_BACKGROUND = '#F5F2ED'

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
