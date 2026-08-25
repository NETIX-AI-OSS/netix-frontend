// Applies the stored theme before first paint; keep in sync with ThemeProvider.
;(function () {
  try {
    var stored = localStorage.getItem('netix-theme') || 'system'
    var dark =
      stored === 'dark' ||
      (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches)
    var resolved = dark ? 'dark' : 'light'
    document.documentElement.classList.add(resolved)
    document.documentElement.style.colorScheme = resolved
  } catch {
    // localStorage/matchMedia unavailable — fall back to the light default
  }
})()
