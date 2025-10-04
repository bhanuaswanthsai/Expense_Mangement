import { useEffect, useRef, useState } from 'react'

// Reads images from /public/image. Update filenames to match your assets.
const DEFAULTS = ['/image/expense1.jpg', '/image/expense3.jpg', '/image/expense4.jpg']

export default function BackgroundSlideshow({ images = DEFAULTS, interval = 4500, transitionMs = 1000 }) {
  const [index, setIndex] = useState(0)
  const timer = useRef(null)

  useEffect(() => {
    timer.current = setTimeout(() => setIndex((i) => (i + 1) % images.length), interval)
    return () => clearTimeout(timer.current)
  }, [index, images.length, interval])

  return (
    <div aria-hidden className="fixed inset-0 -z-10 pointer-events-none">
      {images.map((src, i) => (
        <img
          key={src}
          src={src}
          alt="background"
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            opacity: i === index ? 1 : 0,
            transition: `opacity ${transitionMs}ms ease`,
            filter: 'brightness(0.7)'
          }}
        />
      ))}
    </div>
  )
}
