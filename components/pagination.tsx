'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import type { Route } from 'next'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl?: string
  tag?: string
}

export function Pagination({ currentPage, totalPages, baseUrl, tag }: PaginationProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', page.toString())

    // Use baseUrl if provided, otherwise construct tag URL
    const url = baseUrl || `/tag/${tag}`
    router.push(`${url}${params.toString() ? `?${params.toString()}` : ''}` as Route)
  }

  return (
    <div className="flex justify-center gap-2">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        Previous
      </Button>
      
      <div className="flex items-center gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
          <Button
            key={page}
            variant={currentPage === page ? "default" : "outline"}
            onClick={() => handlePageChange(page)}
          >
            {page}
          </Button>
        ))}
      </div>

      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  )
}

// Create a wrapped version
export function PaginationWithSuspense(props: PaginationProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Pagination {...props} />
    </Suspense>
  )
} 