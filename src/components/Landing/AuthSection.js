'use client'

import { useState, useEffect } from 'react'
import { useUser, useClerk, SignInButton, UserButton } from '@clerk/nextjs'
import { UserIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline'
import Button from '../ui/Button'

const AuthSection = ({ isMobile = false, onMenuClose = () => {} }) => {
  const [mounted, setMounted] = useState(false)
  const { isSignedIn, user, isLoaded } = useUser()
  const { signOut } = useClerk()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Don't render until mounted and Clerk is loaded
  if (!mounted || !isLoaded) {
    return null
  }

  if (isMobile) {
    return (
      <>
        {isSignedIn ? (
          <div className="space-y-3">
            <div className="flex items-center space-x-3 p-3 bg-theme-primary/10 rounded-lg">
              <UserIcon className="w-5 h-5 text-theme-primary" />
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
                onMenuClose()
              }}
            >
              <ArrowRightOnRectangleIcon className="w-4 h-4 mr-2" />
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
      </>
    )
  }

  // Desktop version
  return (
    <div className="flex items-center space-x-3">
      {isSignedIn ? (
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
      ) : (
        <>
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
        </>
      )}
    </div>
  )
}

export default AuthSection
