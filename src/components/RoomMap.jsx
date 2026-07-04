import { useRef, useState, useEffect } from 'react'

function dist(t1, t2) {
  return Math.hypot(t1.clientX - t2.clientX, t1.clientY - t2.clientY)
}

export default function RoomMap({ onClose }) {
  const containerRef = useRef(null)
  const [scale, setScale] = useState(1)
  const [origin, setOrigin] = useState({ x: 0, y: 0 }) // transform-origin offset from center
  const [translate, setTranslate] = useState({ x: 0, y: 0 })

  // Track active pointers
  const pointers = useRef({})
  const lastDist = useRef(null)
  const lastMid = useRef(null)
  const lastTranslate = useRef({ x: 0, y: 0 })
  const lastScale = useRef(1)

  // Close on Escape
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = '' }
  }, [])

  const onPointerDown = e => {
    e.currentTarget.setPointerCapture(e.pointerId)
    pointers.current[e.pointerId] = { clientX: e.clientX, clientY: e.clientY }
    const pts = Object.values(pointers.current)
    if (pts.length === 2) {
      lastDist.current = dist(pts[0], pts[1])
      lastMid.current = {
        x: (pts[0].clientX + pts[1].clientX) / 2,
        y: (pts[0].clientY + pts[1].clientY) / 2,
      }
    }
    lastTranslate.current = translate
    lastScale.current = scale
  }

  const onPointerMove = e => {
    if (!pointers.current[e.pointerId]) return
    pointers.current[e.pointerId] = { clientX: e.clientX, clientY: e.clientY }
    const pts = Object.values(pointers.current)

    if (pts.length === 2) {
      // Pinch zoom
      const d = dist(pts[0], pts[1])
      const mid = {
        x: (pts[0].clientX + pts[1].clientX) / 2,
        y: (pts[0].clientY + pts[1].clientY) / 2,
      }
      if (lastDist.current) {
        const ratio = d / lastDist.current
        const newScale = Math.max(0.5, Math.min(8, lastScale.current * ratio))
        // Pan by midpoint movement
        const dx = mid.x - lastMid.current.x
        const dy = mid.y - lastMid.current.y
        setScale(newScale)
        setTranslate({
          x: lastTranslate.current.x + dx,
          y: lastTranslate.current.y + dy,
        })
      }
    } else if (pts.length === 1) {
      // Pan when zoomed
      if (scale <= 1) return
      const dx = e.clientX - Object.values(pointers.current)[0].clientX
      const dy = e.clientY - Object.values(pointers.current)[0].clientY
      // Use movement delta directly
      setTranslate(prev => ({ x: prev.x + e.movementX, y: prev.y + e.movementY }))
    }
  }

  const onPointerUp = e => {
    delete pointers.current[e.pointerId]
    const pts = Object.values(pointers.current)
    if (pts.length < 2) {
      lastDist.current = null
      lastMid.current = null
    }
    if (pts.length === 1) {
      lastTranslate.current = translate
      lastScale.current = scale
    }
  }

  const handleDoubleTap = () => {
    if (scale > 1) {
      setScale(1)
      setTranslate({ x: 0, y: 0 })
    } else {
      setScale(2.5)
    }
  }

  return (
    <div className="map-overlay">
      <div className="map-topbar">
        <span className="map-topbar-title">Deck Map</span>
        <button className="map-close-btn" onClick={onClose}>✕ Close</button>
      </div>

      <div
        ref={containerRef}
        className="map-viewport"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={onPointerUp}
        onDoubleClick={handleDoubleTap}
        style={{ touchAction: 'none' }}
      >
        <img
          src="/deck-map.png"
          alt="Deck map"
          className="map-image"
          draggable={false}
          style={{
            transform: `translate(${translate.x}px, ${translate.y}px) scale(${scale})`,
            transformOrigin: 'center center',
          }}
        />
      </div>

      <p className="map-hint">Pinch to zoom · Double-tap to reset</p>
    </div>
  )
}
