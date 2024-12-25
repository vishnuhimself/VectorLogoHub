'use client'

import Image from 'next/image'
import Link from 'next/link'
import type { Route } from 'next'
import { Menu, Upload } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from '@/components/ui/sheet'
import { useState } from 'react'

interface NavItem {
  href: Route
  label: string
}

const navItems: NavItem[] = [
  { href: '/' as Route, label: 'Home' },
  { href: '/alphabet/A' as Route, label: 'Browse by Letter' },
  { href: '/about' as Route, label: 'About' },
  { href: '/contact' as Route, label: 'Contact' },
]

export function Header() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <header className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="relative w-8 h-8">
            <Image
              src="/VectorLogoHub.svg"
              alt="VectorLogoHub Logo"
              fill
              className="object-contain"
              priority
            />
          </div>
          <span className="font-semibold text-xl">VectorLogoHub</span>
        </Link>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map(item => (
            <Link 
              key={item.href}
              href={item.href}
              className="hover:text-primary transition-colors"
            >
              {item.label}
            </Link>
          ))}
          <Link 
            href={'/upload' as Route} 
            className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Logo</span>
          </Link>
        </nav>

        {/* Mobile Navigation */}
        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-[240px]">
            <nav className="flex flex-col gap-4 mt-8">
              {navItems.map(item => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg hover:text-primary transition-colors"
                >
                  {item.label}
                </Link>
              ))}
              <Link 
                href={'/upload' as Route} 
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 bg-primary text-primary-foreground px-4 py-2 rounded-md hover:bg-primary/90 transition-colors"
              >
                <Upload className="h-4 w-4" />
                <span>Upload Logo</span>
              </Link>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
} 