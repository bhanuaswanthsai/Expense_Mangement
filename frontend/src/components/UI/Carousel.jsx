import { useEffect, useRef, useState } from 'react'

// Use only your three full-resolution photos from /public/image
const DEFAULT_IMAGES = [
  '/image/expense1.jpg',
  '/image/expense3.jpg',
  '/image/expense4.jpg',
]

export default function Carousel({ images = DEFAULT_IMAGES, interval = 3500 }) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timer = useRef(null)

  useEffect(() => {
    if (paused) return
    timer.current = setTimeout(() => setIndex((i) => (i + 1) % images.length), interval)
    return () => clearTimeout(timer.current)
  }, [index, paused, images.length, interval])

  const go = (i) => setIndex(((i % images.length) + images.length) % images.length)

  return (
    <div className="relative w-full h-56 md:h-72 lg:h-80 overflow-hidden rounded-lg shadow" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)}>
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="carousel"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${i===index ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
        />
      ))}
      <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-2">
        {images.map((_, i) => (
          <button key={i} onClick={()=>go(i)} aria-label={`Go to slide ${i+1}`} className={`w-2.5 h-2.5 rounded-full ${i===index ? 'bg-white' : 'bg-white/50'} border border-white/70`}/>
        ))}
      </div>
      <button aria-label="Previous" onClick={()=>go(index-1)} className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-7 h-7">‹</button>
      <button aria-label="Next" onClick={()=>go(index+1)} className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 text-white rounded-full w-7 h-7">›</button>
    </div>
  )
}
