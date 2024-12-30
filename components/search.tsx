'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search as SearchIcon } from 'lucide-react'

// Export both default and named export
export function Search() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const currentQuery = searchParams.get('q') || ''

  const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const query = formData.get('q')?.toString().trim()
    
    if (query) {
      router.push(`/search?q=${encodeURIComponent(query)}`)
    }
  }, [router])

  return (
    <div className="py-4 border-b">
      <div className="container mx-auto px-4">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search" 
                name="q"
                placeholder="Search logos..."
                defaultValue={currentQuery}
                className="pl-9"
              />
            </div>
            <Button type="submit">
              Search
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

// Also export as default for pages that need it
export default Search 