'use client'

import { useEffect, useState, useRef } from 'react'
import { useSearchParams } from 'next/navigation'

export default function DownloadPageContent({ slug }: { slug: string }) {
  const [countdown, setCountdown] = useState(10)
  const [isDownloaded, setIsDownloaded] = useState(false)
  const searchParams = useSearchParams()
  const format = searchParams.get('format') || 'svg'
  const size = searchParams.get('size')
  const hasDownloaded = useRef(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          if (!hasDownloaded.current) {
            hasDownloaded.current = true
            if (format === 'png') {
              fetch(`/api/download/${slug}?format=png&size=${size}`)
                .then(res => res.blob())
                .then(blob => {
                  const url = window.URL.createObjectURL(blob)
                  const link = document.createElement('a')
                  link.href = url
                  link.download = `${slug}-${size}x${size}.png`
                  document.body.appendChild(link)
                  link.click()
                  document.body.removeChild(link)
                  window.URL.revokeObjectURL(url)
                })
            } else {
              const link = document.createElement('a')
              link.href = `/api/download/${slug}`
              link.setAttribute('download', `${slug}.svg`)
              document.body.appendChild(link)
              link.click()
              document.body.removeChild(link)
            }
            setIsDownloaded(true)
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [slug, format, size])

  if (isDownloaded) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-6">🎉</div>
          <h1 className="text-3xl font-bold mb-4">Your logo is on its way! ✨</h1>
          <p className="text-xl text-muted-foreground mb-2">
            Thanks for using VectorLogoHub 💖
          </p>
          <p className="text-lg text-muted-foreground">
            Have fun with your new logo! 🚀
          </p>
          <div className="mt-8 text-sm text-muted-foreground">
            If the download didn't start automatically,{' '}
            <a 
              href={`/api/download/${slug}?format=${format}${size ? `&size=${size}` : ''}`}
              className="text-primary hover:underline"
              download
            >
              click here
            </a>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-8">
          Downloading your logo in {format.toUpperCase()} format
        </h1>
        <div className="relative w-32 h-32 mx-auto mb-8">
          <div className="absolute inset-0 border-4 border-secondary rounded-full" />
          <div 
            className="absolute inset-0 border-4 border-primary rounded-full"
            style={{
              clipPath: `polygon(0 0, 100% 0, 100% ${(countdown / 10) * 100}%, 0 ${(countdown / 10) * 100}%)`
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-4xl font-bold">{countdown}</span>
          </div>
        </div>
        <p className="text-lg text-muted-foreground">
          Your download will begin automatically in {countdown} seconds
        </p>
        <p className="text-sm text-muted-foreground mt-2">
          Please do not close this page
        </p>
      </div>
    </div>
  )
} 