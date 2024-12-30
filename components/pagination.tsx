'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { Route } from 'next'

interface PaginationProps {
  currentPage: number
  totalPages: number
  baseUrl?: string
  searchParams?: Record<string, string>
  tag?: string
}

export function Pagination({ 
  currentPage, 
  totalPages, 
  baseUrl = '', 
  searchParams = {} 
}: PaginationProps) {
  const router = useRouter()
  const existingParams = useSearchParams()

  const handlePageChange = (page: number) => {
    // Create new URLSearchParams with existing parameters
    const params = new URLSearchParams(existingParams.toString())
    
    // Update or add the page parameter
    params.set('page', page.toString())
    
    // Ensure search query is preserved
    if (searchParams.q) {
      params.set('q', searchParams.q)
    }

    // Construct the new URL
    const newUrl = `${baseUrl}?${params.toString()}`
    
    router.push(newUrl as Route, {
      scroll: true
    })
  }

  return (
    <div className="flex items-center justify-center gap-4">
      <Button
        variant="outline"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Previous
      </Button>

      <span className="text-sm text-muted-foreground">
        Page {currentPage} of {totalPages}
      </span>

      <Button
        variant="outline"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-2" />
      </Button>
    </div>
  )
}

export function PaginationWithSuspense(props: PaginationProps) {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Pagination {...props} />
    </Suspense>
  )
} 