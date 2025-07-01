'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
// import { Button } from './ui/Button';

import { MagnifyingGlassIcon, PlusIcon, FolderIcon, HomeIcon } from '@heroicons/react/24/outline';
import Button from './ui/Button';

const Header = ({ title, showBack = false }) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();

  const handleBack = () => {
    router.back();
  };

  return (
    <motion.header
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border/30"
    >
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Left section */}
          <div className="flex items-center space-x-4">
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <div className="w-8 h-8 bg-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-primary font-bold text-sm">DT</span>
              </div>
              <h1 className="text-xl font-semibold text-foreground">
                {title || 'DevToolkit'}
              </h1>
            </div>
          </div>

          {/* Center section - Navigation */}
          {isLoaded && user && (
            <nav className="hidden md:flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/dashboard')}
                className="flex items-center space-x-2"
              >
                <HomeIcon className="w-4 h-4" />
                <span>Dashboard</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/explore')}
                className="flex items-center space-x-2"
              >
                <MagnifyingGlassIcon className="w-4 h-4" />
                <span>Explore</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/collections')}
                className="flex items-center space-x-2"
              >
                <FolderIcon className="w-4 h-4" />
                <span>Collections</span>
              </Button>
            </nav>
          )}

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {isLoaded && user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/add-product')}
                  className="hidden sm:flex items-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Tool</span>
                </Button>
                
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              </>
            ) : (
              <Button
                onClick={() => router.push('/sign-in')}
                size="sm"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;
