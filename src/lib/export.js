export function prepareExportNode(root) {
  if (!root?.querySelectorAll) {
    return
  }

  root.querySelectorAll('.animate-in, [class*="animate-delay-"]').forEach(node => {
    node.style.opacity = '1'
    node.style.transform = 'none'
    node.style.animation = 'none'
  })
}
