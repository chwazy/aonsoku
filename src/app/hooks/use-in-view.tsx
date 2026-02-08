import { useEffect, useRef, useState } from 'react'

type UseInViewOptions = {
  root?: Element | null
  rootMargin?: string
  threshold?: number | number[]
}

export function useInView<T extends Element>({
  root = null,
  rootMargin = '200px',
  threshold = 0,
}: UseInViewOptions = {}) {
  const ref = useRef<T | null>(null)
  const [isInView, setIsInView] = useState(false)

  useEffect(() => {
    const element = ref.current
    if (!element) return

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry) return
        setIsInView(entry.isIntersecting)
      },
      { root, rootMargin, threshold },
    )

    observer.observe(element)

    return () => {
      observer.unobserve(element)
      observer.disconnect()
    }
  }, [root, rootMargin, threshold])

  return {
    ref,
    isInView,
  }
}
