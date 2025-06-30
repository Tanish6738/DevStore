
'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Settings, BookOpen, User, LogOut } from 'lucide-react'
import { useUser, useClerk, SignInButton, UserButton } from '@clerk/nextjs'
import Button from '../ui/Button'

const FloatingNavbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false)
  const { isSignedIn, user } = useUser()
  const { signOut } = useClerk()

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

  const navItems = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'Testimonials', href: '#testimonials' },
    { name: 'Contact', href: '#contact' }
  ]

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
            <BookOpen className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-bold text-theme-text">DevToolkit</span>
        </motion.div>

        {/* Desktop Navigation */}
        <div className="hidden md:flex items-center space-x-8">
          {navItems.map((item, index) => (
            <motion.a
              key={item.name}
              href={item.href}
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="text-theme-text-secondary hover:text-theme-primary transition-all duration-300 font-medium relative group"
            >
              {item.name}
              <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-theme-primary transition-all duration-300 group-hover:w-full"></span>
            </motion.a>
          ))}
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
              <Settings className="w-5 h-5" />
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
                      <Settings className="w-4 h-4 mr-2" />
                      Customize Theme
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Authentication */}
          {isSignedIn ? (
            <div className="flex items-center space-x-3">
              <UserButton 
                appearance={{
                  elements: {
                    avatarBox: "w-8 h-8",
                    userButtonPopoverCard: "bg-theme-secondary border border-theme-border/20",
                    userButtonPopoverActionButton: "text-theme-text hover:bg-theme-primary/10",
                    userButtonPopoverActionButtonText: "text-theme-text",
                    userButtonPopoverFooter: "hidden"
                  }
                }}
                userProfileMode="navigation"
                userProfileUrl="/profile"
              />
            </div>
          ) : (
            <div className="flex items-center space-x-3">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm">
                  Sign In
                </Button>
              </SignInButton>
              <SignInButton mode="modal">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </SignInButton>
            </div>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden text-theme-text hover:text-theme-primary transition-colors"
        >
          {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
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
              {navItems.map((item) => (
                <motion.a
                  key={item.name}
                  href={item.href}
                  whileHover={{ x: 10 }}
                  className="block text-theme-text-secondary hover:text-theme-primary transition-all duration-300 font-medium"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                </motion.a>
              ))}
              
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
                  <Settings className="w-4 h-4 mr-2" />
                  Theme Settings
                </Button>

                {/* Authentication for Mobile */}
                {isSignedIn ? (
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-theme-primary/10 rounded-lg">
                      <User className="w-5 h-5 text-theme-primary" />
                      <div>
                        <p className="text-sm font-medium text-theme-text">
                          {user?.firstName || 'User'}
                        </p>
                        <p className="text-xs text-theme-text-secondary">
                          {user?.primaryEmailAddress?.emailAddress}
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="w-full justify-start text-red-400 hover:bg-red-500/10"
                      onClick={() => {
                        signOut()
                        setIsMobileMenuOpen(false)
                      }}
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <SignInButton mode="modal">
                      <Button variant="ghost" size="sm" className="w-full">
                        Sign In
                      </Button>
                    </SignInButton>
                    <SignInButton mode="modal">
                      <Button variant="primary" size="sm" className="w-full">
                        Get Started
                      </Button>
                    </SignInButton>
                  </div>
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