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
  GlobeAltIcon,
  DocumentTextIcon,
  BookOpenIcon,
  PencilSquareIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import Button from './ui/Button';

const Header = ({ title, showBack = false }) => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [contentDropdownOpen, setContentDropdownOpen] = useState(false);
  const [createDropdownOpen, setCreateDropdownOpen] = useState(false);

  const handleBack = () => {
    router.back();
  };

  const navigationItems = [
    { name: 'Dashboard', href: '/dashboard', icon: HomeIcon },
    { name: 'Explore', href: '/explore', icon: MagnifyingGlassIcon },
    { name: 'Community', href: '/community', icon: GlobeAltIcon },
  ];

  const contentItems = [
    { name: 'My Products', href: '/products', icon: CubeIcon },
    { name: 'My Blogs', href: '/blog', icon: DocumentTextIcon },
    { name: 'Collections', href: '/collections', icon: FolderIcon },
    { name: 'Favorites', href: '/favorites', icon: HeartIcon },
  ];

  const createItems = [
    { name: 'Add Product', href: '/add-product', icon: PlusIcon },
    { name: 'Write Blog', href: '/blog/create', icon: PencilSquareIcon },
    { name: 'Create Collection', href: '/create-collection', icon: FolderIcon },
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
                {title || 'DevStore'}
              </h1>
            </div>
          </div>

          {/* Center section - Navigation */}
          {isLoaded && user && (
            <nav className="hidden lg:flex items-center space-x-6">
              {/* Main Navigation Items */}
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

              {/* Content Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setContentDropdownOpen(!contentDropdownOpen)}
                  className="flex items-center space-x-2 text-theme-text-secondary hover:text-theme-primary"
                >
                  <span>My Content</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${contentDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>

                <AnimatePresence>
                  {contentDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-theme-secondary border border-theme-border/30 rounded-lg shadow-lg z-50"
                      onMouseLeave={() => setContentDropdownOpen(false)}
                    >
                      <div className="py-2">
                        {contentItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.name}
                              onClick={() => {
                                router.push(item.href);
                                setContentDropdownOpen(false);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-theme-text-secondary hover:text-theme-primary hover:bg-theme-primary/10 transition-all duration-200"
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Create Dropdown */}
              <div className="relative">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setCreateDropdownOpen(!createDropdownOpen)}
                  className="flex items-center space-x-2 text-theme-text-secondary hover:text-theme-primary"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Create</span>
                  <ChevronDownIcon className={`w-4 h-4 transition-transform ${createDropdownOpen ? 'rotate-180' : ''}`} />
                </Button>

                <AnimatePresence>
                  {createDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 mt-2 w-48 bg-theme-secondary border border-theme-border/30 rounded-lg shadow-lg z-50"
                      onMouseLeave={() => setCreateDropdownOpen(false)}
                    >
                      <div className="py-2">
                        {createItems.map((item) => {
                          const Icon = item.icon;
                          return (
                            <button
                              key={item.name}
                              onClick={() => {
                                router.push(item.href);
                                setCreateDropdownOpen(false);
                              }}
                              className="w-full flex items-center space-x-3 px-4 py-2 text-left text-theme-text-secondary hover:text-theme-primary hover:bg-theme-primary/10 transition-all duration-200"
                            >
                              <Icon className="w-4 h-4" />
                              <span>{item.name}</span>
                            </button>
                          );
                        })}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Blog Link */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push('/blog')}
                className="flex items-center space-x-2 text-theme-text-secondary hover:text-theme-primary"
              >
                <BookOpenIcon className="w-4 h-4" />
                <span>Blog</span>
              </Button>
            </nav>
          )}

          {/* Right section */}
          <div className="flex items-center space-x-3">
            {isLoaded && user ? (
              <>
                {/* Quick Create Button for mobile/tablet */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => router.push('/blog/create')}
                  className="hidden sm:flex lg:hidden items-center space-x-2 btn-outline-primary"
                >
                  <PencilSquareIcon className="w-4 h-4" />
                  <span>Write</span>
                </Button>
                
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                  className="lg:hidden text-theme-text hover:text-theme-primary transition-colors p-2"
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
                className="lg:hidden bg-theme-secondary/90 backdrop-blur-lg border-t border-theme-border/30 rounded-b-lg overflow-hidden mt-4"
              >
                <div className="px-6 py-4 space-y-4">
                  {/* Main Navigation */}
                  <div className="space-y-2">
                    <h3 className="text-xs font-semibold text-theme-text-secondary uppercase tracking-wide">Navigation</h3>
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
                    <motion.button
                      whileHover={{ x: 10 }}
                      onClick={() => {
                        router.push('/blog');
                        setIsMobileMenuOpen(false);
                      }}
                      className="w-full flex items-center space-x-3 text-left text-theme-text-secondary hover:text-theme-primary transition-all duration-300 font-medium p-2 rounded-lg hover:bg-theme-primary/10"
                    >
                      <BookOpenIcon className="w-5 h-5" />
                      <span>Blog</span>
                    </motion.button>
                  </div>

                  {/* My Content */}
                  <div className="space-y-2 pt-2 border-t border-theme-border/30">
                    <h3 className="text-xs font-semibold text-theme-text-secondary uppercase tracking-wide">My Content</h3>
                    {contentItems.map((item) => {
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
                  </div>

                  {/* Create Actions */}
                  <div className="space-y-2 pt-2 border-t border-theme-border/30">
                    <h3 className="text-xs font-semibold text-theme-text-secondary uppercase tracking-wide">Create</h3>
                    {createItems.map((item) => {
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
