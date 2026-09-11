'use client'
import Image from 'next/image'
import { useEffect, useRef, useCallback, useState } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { IoCloseSharp } from 'react-icons/io5'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { ProductImage } from '@/lib/types/product-detail'

interface ProductImageModalProps {
  open: boolean
  onClose: () => void
  images: ProductImage[]
  activeIndex: number
  setActiveIndex: (idx: number) => void
  name: string
}

export default function ProductImageModal({
  open,
  onClose,
  images,
  activeIndex,
  setActiveIndex,
  name,
}: ProductImageModalProps) {
  const canNavigate = images.length > 1
  const dialogRef = useRef<HTMLDivElement | null>(null)
  const mobileScrollRef = useRef<HTMLDivElement | null>(null)
  const [loadingStates, setLoadingStates] = useState<Record<string, boolean>>(
    {}
  )
  const [errorStates, setErrorStates] = useState<Record<string, boolean>>({})

  useEffect(() => {
    if (open) dialogRef.current?.focus()
  }, [open])

  useEffect(() => {
    if (open && mobileScrollRef.current) {
      const el = mobileScrollRef.current

      el.scrollTo({ left: el.clientWidth * activeIndex, behavior: 'smooth' })
    }
  }, [open, activeIndex])

  // Throttle scroll handler for better performance
  const handleMobileScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget
      const idx = Math.round(el.scrollLeft / el.clientWidth)

      if (idx !== activeIndex && idx >= 0 && idx < images.length) {
        setActiveIndex(idx)
      }
    },
    [activeIndex, images.length, setActiveIndex]
  )

  const handleImageLoad = useCallback((src: string) => {
    setLoadingStates((prev) => ({ ...prev, [src]: false }))
  }, [])

  const handleImageError = useCallback((src: string) => {
    setLoadingStates((prev) => ({ ...prev, [src]: false }))
    setErrorStates((prev) => ({ ...prev, [src]: true }))
  }, [])

  const handleImageLoadStart = useCallback((src: string) => {
    setLoadingStates((prev) => ({ ...prev, [src]: true }))
  }, [])

  const goPrev = useCallback(() => {
    setActiveIndex((activeIndex - 1 + images.length) % images.length)
  }, [activeIndex, images.length, setActiveIndex])

  const goNext = useCallback(() => {
    setActiveIndex((activeIndex + 1) % images.length)
  }, [activeIndex, images.length, setActiveIndex])

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') goPrev()
      if (e.key === 'ArrowRight') goNext()
    },
    [onClose, goPrev, goNext]
  )

  // Body scroll lock
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'

      return () => {
        document.body.style.overflow = 'unset'
      }
    }
  }, [open])

  // Keyboard event listener
  useEffect(() => {
    if (open) {
      document.addEventListener('keydown', handleKeyDown)

      return () => document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, handleKeyDown])

  if (!open) return null

  const modalContent = (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-white/95 flex items-center justify-center p-4 sm:p-6"
      onClick={onClose}
      ref={dialogRef}
      tabIndex={-1}
    >
      <div
        className="relative w-full max-w-6xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative w-full h-[80vh]">
          {/* Mobile: swipe horizontally between images */}
          <div
            className="sm:hidden w-full h-full overflow-x-auto snap-x snap-mandatory flex scrollbar-hide"
            ref={mobileScrollRef}
            onScroll={handleMobileScroll}
          >
            {images.map((img, idx) => (
              <div
                key={img.id + '-' + idx}
                className="relative w-full h-full shrink-0 snap-center"
              >
                {errorStates[img.url] ? (
                  <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
                    Failed to load image
                  </div>
                ) : (
                  <>
                    {loadingStates[img.url] && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                      </div>
                    )}
                    <Image
                      src={img.url}
                      alt={`${name} ${idx + 1}`}
                      fill
                      className="object-contain"
                      sizes="100vw"
                      preload={idx === activeIndex}
                      onLoadStart={() => handleImageLoadStart(img.url)}
                      onLoad={() => handleImageLoad(img.url)}
                      onError={() => handleImageError(img.url)}
                    />
                  </>
                )}
              </div>
            ))}
          </div>
          {/* Desktop: single image with arrows */}
          <div className="hidden sm:block relative w-full h-full">
            {errorStates[images[activeIndex].url] ? (
              <div className="flex items-center justify-center w-full h-full bg-gray-100 text-gray-500">
                Failed to load image
              </div>
            ) : (
              <>
                {loadingStates[images[activeIndex].url] && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
                  </div>
                )}
                <Image
                  src={images[activeIndex].url}
                  alt={name}
                  fill
                  className="object-contain"
                  sizes="90vw"
                  preload
                  onLoadStart={() =>
                    handleImageLoadStart(images[activeIndex].url)
                  }
                  onLoad={() => handleImageLoad(images[activeIndex].url)}
                  onError={() => handleImageError(images[activeIndex].url)}
                />
              </>
            )}
            {canNavigate && (
              <>
                <Button
                  variant="ghost"
                  onClick={goPrev}
                  aria-label="Previous image"
                  size="icon"
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-10 rounded-full"
                >
                  <ChevronLeft />
                </Button>
                <Button
                  variant="ghost"
                  onClick={goNext}
                  aria-label="Next image"
                  size="icon"
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-10 rounded-full"
                >
                  <ChevronRight />
                </Button>
              </>
            )}
          </div>
          <Button
            variant="ghost"
            onClick={onClose}
            aria-label="Close gallery"
            className="absolute top-2 right-2 z-20 rounded-full h-8 w-8 p-0"
          >
            <IoCloseSharp size={16} />
          </Button>
        </div>
      </div>
    </div>
  )

  return createPortal(modalContent, document.body)
}
