export function useTheme() {
  const dark = useState('theme-dark', () => false)

  function applyTheme() {
    if (typeof document === 'undefined') return
    document.documentElement.classList.toggle('dark', dark.value)
    try { localStorage.setItem('upgr-theme', dark.value ? 'dark' : 'light') } catch {}
  }

  function toggleTheme() {
    dark.value = !dark.value
    applyTheme()
  }

  function initTheme() {
    try { dark.value = localStorage.getItem('upgr-theme') === 'dark' } catch {}
    applyTheme()
  }

  return { dark, applyTheme, toggleTheme, initTheme }
}
