import { AnimatePresence, motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { useApp } from '../state/store'

/** Polite live region for short confirmations ("Alamat disalin", …). */
export function Toast() {
  const toast = useApp((s) => s.toast)
  const [visible, setVisible] = useState<typeof toast>(null)
  useEffect(() => {
    if (!toast) return
    setVisible(toast)
    const t = setTimeout(() => setVisible(null), 2600)
    return () => clearTimeout(t)
  }, [toast])
  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      <AnimatePresence>
        {visible && (
          <motion.div key={visible.id} className="toast" initial={{ opacity: 0, y: 12, scale: 0.96 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.3 }}>
            {visible.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
