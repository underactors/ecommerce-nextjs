'use client'

import { useEffect } from 'react'

export default function CatalogLayout({ children }) {
  useEffect(() => {
    const header = document.querySelector('header')
    const footer = document.querySelector('footer')
    const whatsapp = document.querySelector('[class*="whatsapp"], [class*="WhatsApp"]')
    const exitIntent = document.querySelector('[class*="exitIntent"], [class*="ExitIntent"]')

    const hidden = []
    ;[header, footer, whatsapp, exitIntent].forEach((el) => {
      if (el) {
        el.style.display = 'none'
        hidden.push(el)
      }
    })

    return () => {
      hidden.forEach((el) => {
        el.style.display = ''
      })
    }
  }, [])

  return <>{children}</>
}
