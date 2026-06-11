'use client'
import { useEffect } from 'react'

declare global {
  interface Window {
    adsbygoogle?: unknown[]
  }
}

interface AdBannerProps {
  slot: string
  format?: 'auto' | 'horizontal' | 'vertical' | 'rectangle'
  className?: string
}

export default function AdBanner({ slot, format = 'auto', className = '' }: AdBannerProps) {
  const clientId = process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID

  useEffect(() => {
    try {
      window.adsbygoogle = window.adsbygoogle || []
      window.adsbygoogle.push({})
    } catch {}
  }, [])

  if (!clientId) return null

  return (
    <div className={`ad-container my-4 rounded-[20px] border border-black/10 bg-white/55 p-3 text-center shadow-sm backdrop-blur ${className}`}>
      <p className="mb-2 text-[10px] font-medium uppercase tracking-[0.2em] text-black/35">Advertisement</p>
      <ins
        className="adsbygoogle"
        style={{ display: 'block', width: '100%' }}
        data-ad-client={clientId}
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  )
}
