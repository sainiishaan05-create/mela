'use client'

import { useEffect } from 'react'

/** Hides the site header + footer so the share card page is a clean screenshottable graphic. */
export default function HideChrome() {
  useEffect(() => {
    const header = document.querySelector('header')
    const footer = document.querySelector('footer')
    if (header) header.style.display = 'none'
    if (footer) footer.style.display = 'none'
    return () => {
      if (header) header.style.display = ''
      if (footer) footer.style.display = ''
    }
  }, [])
  return null
}
