'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useUser, UserButton } from '@clerk/nextjs';
import { 
  MagnifyingGlassIcon, 
  PlusIcon, 
  FolderIcon, 
  HomeIcon,
  HeartIcon,
  CubeIcon,
  Bars3Icon,
  XMarkIcon,
  GlobeAltIcon
} from '@heroicons/react/24/outline';
import Button from './ui/Button';

const Header = ({ title, showBack = false }) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'User Products', href: '/products', icon: CubeIcon },
    { name: 'Explore', href: '/explore', icon: MagnifyingGlassIcon },
    { name: 'Community', href: '/community', icon: GlobeAltIcon },
    { name: 'Collections', href: '/collections', icon: FolderIcon },
    { name: 'Favorites', href: '/favorites', icon: HeartIcon },
  ];

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
            <div 
              className="flex items-center space-x-3 cursor-pointer"
              onClick={() => router.push('/')}
            >
              <div className="w-8 h-8 bg-theme-primary/20 rounded-lg flex items-center justify-center">
                <span className="text-theme-primary font-bold text-sm">CH</span>
              </div>
              <h1 className="text-xl font-semibold text-theme-text">
                {title || 'CodeHunt'}
              </h1>
            </div>
          </div>

          {/* Center section - Navigation */}
          {isLoaded && user && (
            <nav className="hidden md:flex items-center space-x-6">
              {navigationItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    size="sm"
                    onClick={() => router.push(item.href)}
                    className="flex items-center space-x-2 text-theme-text-secondary hover:text-theme-primary"
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Button>
                );
              })}
            </nav>
          )}

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {isLoaded && user ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/products')}
                  className="hidden sm:flex items-center space-x-2 btn-outline-primary"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Product</span>
                </Button>
                
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="md:hidden text-theme-text hover:text-theme-primary transition-colors p-2"
                >
                  {isMobileMenuOpen ? <XMarkIcon className="w-5 h-5" /> : <Bars3Icon className="w-5 h-5" />}
                </button>
                
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                      userButtonPopoverCard: "bg-theme-secondary border border-theme-border/20",
                      userButtonPopoverActionButton: "text-theme-text hover:bg-theme-primary/10",
                      userButtonPopoverActionButtonText: "text-theme-text",
                    },
                  }}
                />
              </>
            ) : (
              <Button
                onClick={() => router.push('/sign-in')}
                size="sm"
                className="btn-primary"
              >
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Mobile Menu */}
        {isLoaded && user && (
          <AnimatePresence>
            {isMobileMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
                className="md:hidden bg-theme-secondary/90 backdrop-blur-lg border-t border-theme-border/30 rounded-b-lg overflow-hidden mt-4"
              >
                <div className="px-6 py-4 space-y-3">
                  {navigationItems.map((item) => {
                    const Icon = item.icon;
                    return (
                      <motion.button
                        key={item.name}
                        whileHover={{ x: 10 }}
                        onClick={() => {
                          router.push(item.href);
                          setIsMobileMenuOpen(false);
                        }}
                        className="w-full flex items-center space-x-3 text-left text-theme-text-secondary hover:text-theme-primary transition-all duration-300 font-medium p-2 rounded-lg hover:bg-theme-primary/10"
                      >
                        <Icon className="w-5 h-5" />
                        <span>{item.name}</span>
                      </motion.button>
                    );
                  })}
                  
                  <div className="pt-3 border-t border-theme-border/30">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        router.push('/dashboard');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full justify-start btn-outline-primary"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add Product
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </div>
    </motion.header>
  );
};

export default Header;
