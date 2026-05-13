'use client'

import gsap from 'gsap'
import { useLayoutEffect, useRef } from 'react'

export default function PageMotion({ children }: { children: React.ReactNode }) {
  const scope = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!scope.current) return

    const ctx = gsap.context(() => {
      const target = scope.current?.querySelectorAll('.motion-item')
      const items = gsap.utils.toArray(target || [])
      gsap.fromTo(
        items,
        { autoAlpha: 0, y: 18, filter: 'blur(8px)' },
        {
          autoAlpha: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.75,
          ease: 'power3.out',
          stagger: 0.08,
        }
      )
    }, scope)

    return () => ctx.revert()
  }, [])

  return <div ref={scope}>{children}</div>
}
