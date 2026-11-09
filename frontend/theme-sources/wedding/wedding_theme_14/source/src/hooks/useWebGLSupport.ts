/** Synchronous WebGL capability probe. Returns false if WebGL is disabled or unavailable. */
export function hasWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas')
    const gl =
      (canvas.getContext('webgl2') as WebGL2RenderingContext | null) ??
      (canvas.getContext('webgl') as WebGLRenderingContext | null)
    if (!gl) return false
    const ok = typeof gl.getParameter === 'function'
    gl.getExtension('WEBGL_lose_context')?.loseContext()
    return ok
  } catch {
    return false
  }
}
