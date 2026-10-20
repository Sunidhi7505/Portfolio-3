import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'

const ThemeContext = createContext({ theme: 'dark', toggle: () => {}, explicit: false })

const readInitial = () => {
  // index.html already set data-theme before first paint — just mirror it.
  const attr = document.documentElement.getAttribute('data-theme')
  return attr === 'light' ? 'light' : 'dark'
}

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(readInitial)
  const [explicit, setExplicit] = useState(() => {
    try { return !!localStorage.getItem('theme') } catch { return false }
  })

  // Apply to <html> + <meta theme-color>. A short class enables smooth colour transitions only on toggle.
  useEffect(() => {
    const root = document.documentElement
    root.setAttribute('data-theme', theme)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'light' ? '#f5f7fc' : '#070b14')
  }, [theme])

  // Follow the OS preference until the visitor makes an explicit choice.
  useEffect(() => {
    if (explicit) return undefined
    const mq = window.matchMedia('(prefers-color-scheme: light)')
    const onChange = (e) => setTheme(e.matches ? 'light' : 'dark')
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [explicit])

  const toggle = useCallback(() => {
    const root = document.documentElement
    root.classList.add('theme-transition')
    window.setTimeout(() => root.classList.remove('theme-transition'), 450)
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark'
      try { localStorage.setItem('theme', next) } catch { /* storage unavailable */ }
      return next
    })
    setExplicit(true)
  }, [])

  const value = useMemo(() => ({ theme, toggle, explicit }), [theme, toggle, explicit])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export const useTheme = () => useContext(ThemeContext)
