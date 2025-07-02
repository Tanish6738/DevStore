'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowRightIcon, PlusIcon, LinkIcon } from '@heroicons/react/24/outline';
import Header from '@/components/Header';
import Button from '@/components/ui/Button';
import Card from '@/components/ui/Card';

export default function AddProductPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          router.replace('/products');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [router]);

  const handleRedirectNow = () => {
    router.replace('/products');
  };

  const handleGoToDashboard = () => {
    router.replace('/dashboard');
  };

  return (
    <div className="min-h-screen bg-theme-background">
      <Header title="Add Product" />
      
      <div className="container mx-auto px-6 py-8">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <div className="w-20 h-20 bg-theme-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <LinkIcon className="w-10 h-10 text-theme-primary" />
            </div>
            
            <h1 className="text-3xl font-bold text-theme-text mb-4">
              Add New Product
            </h1>
            
            <p className="text-theme-text-secondary text-lg mb-6">
              We&apos;re redirecting you to the Products page where you can add new developer tools and resources to your collection.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="bg-theme-secondary/50 backdrop-blur-sm border-theme-border/30 p-8 text-center">
              <div className="mb-6">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-theme-primary/20 rounded-full mb-4">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                  >
                    <div className="w-8 h-8 border-3 border-theme-primary border-t-transparent rounded-full"></div>
                  </motion.div>
                </div>
                
                <h2 className="text-xl font-semibold text-theme-text mb-2">
                  Redirecting in {countdown} seconds
                </h2>
                
                <p className="text-theme-text-secondary">
                  You&apos;ll be taken to the Products page where you can bookmark your favorite developer tools.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleRedirectNow}
                  className="btn-primary flex items-center justify-center space-x-2"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Go to Products Now</span>
                  <ArrowRightIcon className="w-4 h-4" />
                </Button>
                
                <Button
                  variant="outline"
                  onClick={handleGoToDashboard}
                  className="btn-outline-primary flex items-center justify-center space-x-2"
                >
                  <span>Go to Dashboard</span>
                </Button>
              </div>
            </Card>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="bg-theme-secondary/30 backdrop-blur-sm border-theme-border/20 p-6">
              <h3 className="text-lg font-semibold text-theme-text mb-4 flex items-center">
                <PlusIcon className="w-5 h-5 text-theme-primary mr-2" />
                What you can do on the Products page:
              </h3>
              
              <ul className="space-y-3 text-theme-text-secondary">
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-theme-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Add new developer tools by URL with automatic metadata fetching</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-theme-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Organize tools with categories and custom tags</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-theme-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Add personal notes and ratings to your bookmarks</span>
                </li>
                <li className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-theme-primary rounded-full mt-2 flex-shrink-0"></div>
                  <span>Create collections to group related tools together</span>
                </li>
              </ul>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
