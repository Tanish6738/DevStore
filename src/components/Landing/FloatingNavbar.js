
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Bars3Icon, 
  XMarkIcon, 
  Cog6ToothIcon, 
  BookOpenIcon,
  MagnifyingGlassIcon,
  FolderIcon,
  HomeIcon,
  HeartIcon,
  CubeIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline'
import { useUser } from '@clerk/nextjs'
import dynamic from 'next/dynamic'
import Button from '../ui/Button'
import AuthSection from './AuthSection'

const FloatingNavbar = () => {
  const { user, isLoaded } = useUser()
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }

    const handleClickOutside = (event) => {
      if (isThemeMenuOpen && !event.target.closest('[data-theme-menu]')) {
        setIsThemeMenuOpen(false)
      }
    }

    window.addEventListener('scroll', handleScroll)
    document.addEventListener('click', handleClickOutside)
    
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('click', handleClickOutside)
    }
  }, [isThemeMenuOpen])

  // Don't render until mounted and Clerk is loaded
  if (!mounted || !isLoaded) {
    return null
  }

  // Navigation items for non-authenticated users
  const guestNavItems = [
    { name: 'Home', href: '/' },
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' }
  ]

  // Navigation items for authenticated users (same as Header component)
  const userNavItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'User Products', href: '/products', icon: CubeIcon },
    { name: 'Explore', href: '/explore', icon: MagnifyingGlassIcon },
    { name: 'Community', href: '/community', icon: GlobeAltIcon },
    { name: 'Collections', href: '/collections', icon: FolderIcon },
    { name: 'Favorites', href: '/favorites', icon: HeartIcon },
  ]

  // Determine which navigation items to show based on authentication status
  const navItems = isLoaded && user ? userNavItems : guestNavItems

  return (
    <motion.nav
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className={`fixed top-4 left-1/2 transform -translate-x-1/2 w-[90%] max-w-6xl z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-theme-background/80 backdrop-blur-lg shadow-2xl' 
          : 'bg-transparent'
      } rounded-2xl`}
    >
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <motion.div
          whileHover={{ scale: 1.05 }}
          className="flex items-center space-x-2"
        >
          <div className="w-8 h-8 bg-gradient-to-br from-theme-primary to-theme-accent rounded-lg flex items-center justify-center">
            <BookOpenIcon className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-theme-text">DevStore</span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item, index) => {
            const Icon = item.icon
            return (
              <motion.a
                key={item.name}
                href={item.href}
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-theme-text-secondary hover:text-theme-primary transition-all duration-300 font-medium relative group flex items-center space-x-2"
              >
                {Icon && <Icon className="w-4 h-4" />}
                <span>{item.name}</span>
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-theme-primary transition-all duration-300 group-hover:w-full"></span>
              </motion.a>
            )
          })}
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center space-x-4">
          {/* Theme Settings */}
          <div className="relative" data-theme-menu>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
              className="p-2 text-theme-text-secondary hover:text-theme-primary transition-colors rounded-lg hover:bg-theme-secondary/30"
            >
              <Cog6ToothIcon className="w-5 h-5" />
            </motion.button>

            <AnimatePresence>
              {isThemeMenuOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 top-12 w-48 bg-theme-secondary/90 backdrop-blur-lg border border-theme-border/20 rounded-lg shadow-xl z-50 overflow-hidden"
                >
                  <div className="p-3">
                    <p className="text-xs font-semibold text-theme-text-secondary uppercase tracking-wide mb-2">
                      Theme Settings
                    </p>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-left"
                      onClick={() => {
                        window.location.href = '/theme-settings'
                        setIsThemeMenuOpen(false)
                      }}
                    >
                      <Cog6ToothIcon className="w-4 h-4 mr-2" />
                      Customize Theme
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Authentication */}
          {mounted && <AuthSection />}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-theme-text hover:text-theme-primary transition-colors"
        >
          {isMobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden bg-theme-secondary/90 backdrop-blur-lg border-t border-theme-border/30 rounded-b-2xl overflow-hidden"
          >
            <div className="px-6 py-4 space-y-4">
              {navItems.map((item) => {
                const Icon = item.icon
                return (
                  <motion.a
                    key={item.name}
                    href={item.href}
                    whileHover={{ x: 10 }}
                    className="flex items-center space-x-3 text-theme-text-secondary hover:text-theme-primary transition-all duration-300 font-medium"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {Icon && <Icon className="w-5 h-5" />}
                    <span>{item.name}</span>
                  </motion.a>
                )
              })}
              
              <div className="pt-4 border-t border-theme-border/30 space-y-3">
                {/* Theme Settings for Mobile */}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="w-full justify-start"
                  onClick={() => {
                    window.location.href = '/theme-settings'
                    setIsMobileMenuOpen(false)
                  }}
                >
                  <Cog6ToothIcon className="w-4 h-4 mr-2" />
                  Theme Settings
                </Button>

                {/* Authentication for Mobile */}
                {mounted && (
                  <AuthSection 
                    isMobile={true} 
                    onMenuClose={() => setIsMobileMenuOpen(false)} 
                  />
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}

export default FloatingNavbar