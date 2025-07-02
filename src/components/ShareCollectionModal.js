'use client';

import { useState, useEffect } from 'react';
import { 
  XMarkIcon, 
  ShareIcon, 
  LinkIcon, 
  ClipboardIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import Button from './ui/Button';
import Input from './ui/Input';
import Card from './ui/Card';

export default function ShareCollectionModal({ 
  isOpen, 
  onClose, 
  collection
}) {
  const [copied, setCopied] = useState(false);
  const [shareUrl, setShareUrl] = useState('');

  useEffect(() => {
    if (isOpen && collection) {
      const url = `${window.location.origin}/collections/${collection._id}`;
      setShareUrl(url);
    }
  }, [isOpen, collection]);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy link:', error);
    }
  };

  const handleShareToSocial = (platform) => {
    const text = `Check out my "${collection?.name}" collection on DevStore`;
    const url = shareUrl;
    
    let shareUrl2;
    switch (platform) {
      case 'twitter':
        shareUrl2 = `https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`;
        break;
      case 'linkedin':
        shareUrl2 = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(text)}`;
        break;
      case 'facebook':
        shareUrl2 = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl2, '_blank', 'width=600,height=400');
  };

  const handleClose = () => {
    setCopied(false);
    onClose();
  };

  if (!isOpen || !collection) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative w-full max-w-md transform transition-all">
          <Card className="p-6 card-theme">
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-theme-primary/10 rounded-lg">
                  <ShareIcon className="h-5 w-5 text-theme-primary" />
                </div>
                <h3 className="text-lg font-semibold text-theme-text">
                  Share Collection
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="text-theme-text-secondary hover:text-theme-text transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            {/* Collection Info */}
            <div className="mb-6 p-4 bg-theme-secondary rounded-lg border border-theme-border">
              <h4 className="font-medium text-theme-text mb-1">
                {collection.name}
              </h4>
              <p className="text-sm text-theme-text-secondary">
                {collection.description || 'A curated collection of developer products'}
              </p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs px-2 py-1 bg-theme-primary/10 text-theme-primary rounded-full">
                  {collection.isPublic ? 'Public' : 'Private'}
                </span>
                <span className="text-xs text-theme-text-secondary">
                  {collection.itemCount || 0} items
                </span>
              </div>
            </div>

            {/* Privacy Notice */}
            {!collection.isPublic && (
              <div className="mb-6 p-3 bg-theme-secondary border border-theme-warning rounded-lg">
                <p className="text-sm text-theme-warning">
                  This collection is private. Only people with the link can view it.
                </p>
              </div>
            )}

            {/* Share Link */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-theme-text mb-2">
                Share Link
              </label>
              <div className="flex gap-2">
                <Input
                  type="text"
                  value={shareUrl}
                  readOnly
                  className="flex-1 input-theme"
                />
                <Button
                  onClick={handleCopyLink}
                  variant="outline"
                  className="btn-outline-primary"
                >
                  {copied ? (
                    <CheckIcon className="h-4 w-4" />
                  ) : (
                    <ClipboardIcon className="h-4 w-4" />
                  )}
                </Button>
              </div>
              {copied && (
                <p className="mt-1 text-sm text-theme-success">Link copied to clipboard!</p>
              )}
            </div>

            {/* Social Sharing */}
            {collection.isPublic && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-theme-text mb-3">
                  Share on Social Media
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <Button
                    onClick={() => handleShareToSocial('twitter')}
                    variant="outline"
                    className="btn-outline-primary flex flex-col items-center p-4"
                  >
                    <svg className="h-6 w-6 mb-2 text-theme-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                    <span className="text-xs text-theme-text">Twitter</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleShareToSocial('linkedin')}
                    variant="outline"
                    className="btn-outline-primary flex flex-col items-center p-4"
                  >
                    <svg className="h-6 w-6 mb-2 text-theme-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                    <span className="text-xs text-theme-text">LinkedIn</span>
                  </Button>
                  
                  <Button
                    onClick={() => handleShareToSocial('facebook')}
                    variant="outline"
                    className="btn-outline-primary flex flex-col items-center p-4"
                  >
                    <svg className="h-6 w-6 mb-2 text-theme-text-secondary" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                    <span className="text-xs text-theme-text">Facebook</span>
                  </Button>
                </div>
              </div>
            )}

            {/* Close Button */}
            <Button
              onClick={handleClose}
              className="w-full btn-primary"
            >
              Done
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
}
