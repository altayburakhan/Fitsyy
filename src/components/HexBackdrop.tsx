// src/components/HexBackdrop.tsx
'use client'
import { useEffect, useRef } from 'react'

/**
 * Düz üstlü (flat-top) hex ızgara:
 * - Gri çizgiler
 * - Yalnızca vertex noktaları imleç yakınında parlıyor (core + bloom)
 * - Hex içleri kesinlikle boyanmıyor
 */
export default function HexBackdrop() {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const onMove = (e: MouseEvent) => {
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${((e.clientX - r.left) / r.width) * 100}%`)
      el.style.setProperty('--my', `${((e.clientY - r.top) / r.height) * 100}%`)
    }
    window.addEventListener('mousemove', onMove)
    return () => window.removeEventListener('mousemove', onMove)
  }, [])

  // === Hex metrikleri ===
  const s = 18;                 // kenar uzunluğu (px)
  const h = Math.sqrt(3) * s;   // yükseklik
  const pw = 3 * s;             // pattern width (flat-top tiling)
  const ph = h;                 // pattern height

  const hexPath = (x: number, y: number) => {
    const p = [
      [x + s / 2, y],
      [x + (3 * s) / 2, y],
      [x + 2 * s, y + h / 2],
      [x + (3 * s) / 2, y + h],
      [x + s / 2, y + h],
      [x, y + h / 2],
    ]
    return `M${p.map(([px, py]) => `${px},${py}`).join(' L')} Z`
  }

  const hexVertices = (x: number, y: number) => ([
    [x + s / 2, y],
    [x + (3 * s) / 2, y],
    [x + 2 * s, y + h / 2],
    [x + (3 * s) / 2, y + h],
    [x + s / 2, y + h],
    [x, y + h / 2],
  ])

  // Vertex boyu (sadece noktalar)
  const coreR = 1.2

  // Mask yarıçapı — yayılımı büyütmek/küçültmek için burayı değiştir
  const MASK_RADIUS_PX = 320

  return (
    <div ref={ref} className="pointer-events-none fixed inset-0 -z-10">
      {/* 1) Gri çizgi grid */}
      <svg className="absolute inset-0 h-full w-full" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="hex-lines" width={pw} height={ph} patternUnits="userSpaceOnUse">
            <path d={hexPath(0, 0)} fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="1" />
            <path d={hexPath(1.5 * s, -h / 2)} fill="none" stroke="rgba(255,255,255,.10)" strokeWidth="1" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex-lines)" />
      </svg>

      {/* 2) Vertex parlama – sadece mask alanında görünür */}
      <svg
        className="absolute inset-0 h-full w-full"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          maskImage:
            `radial-gradient(${MASK_RADIUS_PX}px at var(--mx,50%) var(--my,50%), white 0, transparent 70%)`,
          WebkitMaskImage:
            `radial-gradient(${MASK_RADIUS_PX}px at var(--mx,50%) var(--my,50%), white 0, transparent 70%)`,
        }}
      >
        <defs>
          {/* Vertex pattern (yalnız noktalar) */}
          <pattern id="hex-verts" width={pw} height={ph} patternUnits="userSpaceOnUse">
            {hexVertices(0, 0).map(([x, y], i) => (
              <circle key={`a-${i}`} cx={x} cy={y} r={coreR} fill="#22c55e" />
            ))}
            {hexVertices(1.5 * s, -h / 2).map(([x, y], i) => (
              <circle key={`b-${i}`} cx={x} cy={y} r={coreR} fill="#22c55e" />
            ))}
          </pattern>

          {/* Çift kademeli glow */}
          <filter id="glow-core">
            <feGaussianBlur stdDeviation="1.2" />
          </filter>
          <filter id="glow-bloom">
            <feGaussianBlur stdDeviation="8" />
          </filter>
        </defs>

        {/* geniş ve yumuşak bloom (düşük opaklık) */}
        <rect
          width="100%"
          height="100%"
          fill="url(#hex-verts)"
          filter="url(#glow-bloom)"
          opacity="0.30"
          style={{ mixBlendMode: 'screen' }}
        />
        {/* küçük ve parlak çekirdek */}
        <rect
          width="100%"
          height="100%"
          fill="url(#hex-verts)"
          filter="url(#glow-core)"
          opacity="0.85"
          style={{ mixBlendMode: 'screen' }}
        />
      </svg>
    </div>
  )
}
