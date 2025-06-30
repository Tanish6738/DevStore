'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Settings, User } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Button from './ui/Button'
// import Button from '../ui/Button'
Button

const Header = ({ title = "Settings", showBack = true }) => {
  const router = useRouter()

  const handleBack = () => {
    router.back()
  }

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 bg-theme-background/80 backdrop-blur-lg border-b border-theme-border/30"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            {showBack && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBack}
                className="flex items-center space-x-2"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </Button>
            )}
            
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-theme-primary/20 rounded-lg flex items-center justify-center">
                <Settings className="w-4 h-4 text-theme-primary" />
              </div>
              <h1 className="text-xl font-semibold text-theme-text">{title}</h1>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm">
              <User className="w-4 h-4 mr-2" />
              Profile
            </Button>
          </div>
        </div>
      </div>
    </motion.header>
  )
}

export default Header
