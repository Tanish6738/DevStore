'use client';

import React, { useState, useEffect, useRef, useContext } from 'react';
import { 
  SunIcon, 
  MoonIcon, 
  AdjustmentsHorizontalIcon,
  EyeIcon,
  SpeakerWaveIcon,
  KeyboardIcon
} from '@heroicons/react/24/outline';

// Accessibility Settings Context
export const AccessibilityContext = React.createContext();

export function AccessibilityProvider({ children }) {
  const [settings, setSettings] = useState({
    fontSize: 'normal', // 'small', 'normal', 'large', 'xl'
    contrast: 'normal', // 'normal', 'high', 'low'
    theme: 'auto', // 'light', 'dark', 'auto'
    reducedMotion: false,
    screenReader: false,
    keyboardNavigation: true,
    focusVisible: true
  });

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      setSettings(prev => ({ ...prev, ...JSON.parse(savedSettings) }));
    }

    // Detect user preferences
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)');
    
    if (prefersReducedMotion.matches) {
      setSettings(prev => ({ ...prev, reducedMotion: true }));
    }

    // Set initial theme
    setSettings(prev => {
      const newSettings = { ...prev, theme: prefersDarkMode.matches ? 'dark' : 'light' };
      applySettings(newSettings);
      return newSettings;
    });
  }, []);

  const updateSetting = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('accessibility-settings', JSON.stringify(newSettings));
    applySettings(newSettings);
  };

  const applySettings = (newSettings) => {
    const root = document.documentElement;
    
    // Font size
    root.classList.remove('text-sm', 'text-base', 'text-lg', 'text-xl');
    switch (newSettings.fontSize) {
      case 'small':
        root.classList.add('text-sm');
        break;
      case 'large':
        root.classList.add('text-lg');
        break;
      case 'xl':
        root.classList.add('text-xl');
        break;
      default:
        root.classList.add('text-base');
    }

    // Contrast
    root.classList.remove('high-contrast', 'low-contrast');
    if (newSettings.contrast === 'high') {
      root.classList.add('high-contrast');
    } else if (newSettings.contrast === 'low') {
      root.classList.add('low-contrast');
    }

    // Theme
    root.classList.remove('dark', 'light');
    if (newSettings.theme !== 'auto') {
      root.classList.add(newSettings.theme);
    }

    // Reduced motion
    if (newSettings.reducedMotion) {
      root.style.setProperty('--motion-duration', '0s');
    } else {
      root.style.removeProperty('--motion-duration');
    }

    // Focus visible
    if (newSettings.focusVisible) {
      root.classList.add('focus-visible');
    } else {
      root.classList.remove('focus-visible');
    }
  };

  return (
    <AccessibilityContext.Provider value={{ settings, updateSetting }}>
      {children}
    </AccessibilityContext.Provider>
  );
}

// Accessibility Toolbar Component
export function AccessibilityToolbar({ className = '' }) {
  const [isOpen, setIsOpen] = useState(false);
  const { settings, updateSetting } = useContext(AccessibilityContext);
  const toolbarRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (toolbarRef.current && !toolbarRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div className={`fixed bottom-4 right-4 z-50 ${className}`} ref={toolbarRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        className="p-3 bg-theme-primary text-white rounded-full shadow-lg hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-theme-primary focus:ring-offset-2"
        aria-label="Accessibility Settings"
        aria-expanded={isOpen}
      >
        <AdjustmentsHorizontalIcon className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-theme-secondary rounded-lg shadow-xl border border-theme-border p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-medium text-theme-text">Accessibility</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-theme-text-secondary hover:text-theme-text"
              aria-label="Close accessibility settings"
            >
              ×
            </button>
          </div>

          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-theme-text mb-2">
              <EyeIcon className="h-4 w-4 inline mr-1" />
              Font Size
            </label>
            <div className="grid grid-cols-4 gap-2">
              {[
                { value: 'small', label: 'A' },
                { value: 'normal', label: 'A' },
                { value: 'large', label: 'A' },
                { value: 'xl', label: 'A' }
              ].map((size, index) => (
                <button
                  key={size.value}
                  onClick={() => updateSetting('fontSize', size.value)}
                  className={`p-2 text-center border rounded transition-colors ${
                    settings.fontSize === size.value
                      ? 'bg-theme-primary/20 border-theme-primary text-theme-primary'
                      : 'border-theme-border hover:border-theme-primary/50 text-theme-text'
                  }`}
                  style={{ fontSize: `${0.75 + index * 0.25}rem` }}
                >
                  {size.label}
                </button>
              ))}
            </div>
          </div>

          {/* Contrast */}
          <div>
            <label className="block text-sm font-medium text-theme-text mb-2">
              Contrast
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' }
              ].map((contrast) => (
                <button
                  key={contrast.value}
                  onClick={() => updateSetting('contrast', contrast.value)}
                  className={`p-2 text-sm border rounded transition-colors ${
                    settings.contrast === contrast.value
                      ? 'bg-theme-primary/20 border-theme-primary text-theme-primary'
                      : 'border-theme-border hover:border-theme-primary/50 text-theme-text'
                  }`}
                >
                  {contrast.label}
                </button>
              ))}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="block text-sm font-medium text-theme-text mb-2">
              Theme
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'light', label: 'Light', icon: SunIcon },
                { value: 'auto', label: 'Auto', icon: AdjustmentsHorizontalIcon },
                { value: 'dark', label: 'Dark', icon: MoonIcon }
              ].map((theme) => {
                const IconComponent = theme.icon;
                return (
                  <button
                    key={theme.value}
                    onClick={() => updateSetting('theme', theme.value)}
                    className={`p-2 text-sm border rounded flex items-center justify-center transition-colors ${
                      settings.theme === theme.value
                        ? 'bg-theme-primary/20 border-theme-primary text-theme-primary'
                        : 'border-theme-border hover:border-theme-primary/50 text-theme-text'
                    }`}
                  >
                    <IconComponent className="h-4 w-4 mr-1" />
                    {theme.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Toggle Options */}
          <div className="space-y-3">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.reducedMotion}
                onChange={(e) => updateSetting('reducedMotion', e.target.checked)}
                className="rounded border-theme-border text-theme-primary shadow-sm focus:border-theme-primary focus:ring focus:ring-theme-primary/20 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-theme-text">Reduce Motion</span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.keyboardNavigation}
                onChange={(e) => updateSetting('keyboardNavigation', e.target.checked)}
                className="rounded border-theme-border text-theme-primary shadow-sm focus:border-theme-primary focus:ring focus:ring-theme-primary/20 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-theme-text flex items-center">
                <KeyboardIcon className="h-4 w-4 mr-1" />
                Keyboard Navigation
              </span>
            </label>

            <label className="flex items-center">
              <input
                type="checkbox"
                checked={settings.focusVisible}
                onChange={(e) => updateSetting('focusVisible', e.target.checked)}
                className="rounded border-theme-border text-theme-primary shadow-sm focus:border-theme-primary focus:ring focus:ring-theme-primary/20 focus:ring-opacity-50"
              />
              <span className="ml-2 text-sm text-theme-text">Enhanced Focus Indicators</span>
            </label>
          </div>

          {/* Keyboard Shortcuts */}
          <div className="pt-3 border-t border-theme-border">
            <h4 className="text-sm font-medium text-theme-text mb-2">Keyboard Shortcuts</h4>
            <div className="text-xs text-theme-text-secondary space-y-1">
              <div>• Tab / Shift+Tab: Navigate</div>
              <div>• Enter / Space: Activate</div>
              <div>• Escape: Close modals</div>
              <div>• Arrow keys: Navigate lists</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Skip to main content link
export function SkipLink({ targetId = 'main-content', className = '' }) {
  return (
    <a
      href={`#${targetId}`}
      className={`sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-theme-primary text-white px-4 py-2 rounded-md z-50 ${className}`}
    >
      Skip to main content
    </a>
  );
}

// Screen reader announcements
export function LiveRegion({ children, politeness = 'polite', className = '' }) {
  return (
    <div
      aria-live={politeness}
      aria-atomic="true"
      className={`sr-only ${className}`}
    >
      {children}
    </div>
  );
}

// Focus trap for modals
export function useFocusTrap(isActive) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!isActive || !containerRef.current) return;

    const focusableElements = containerRef.current.querySelectorAll(
      'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
    );

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            lastElement.focus();
            e.preventDefault();
          }
        } else {
          if (document.activeElement === lastElement) {
            firstElement.focus();
            e.preventDefault();
          }
        }
      }
    };

    document.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      document.removeEventListener('keydown', handleTabKey);
    };
  }, [isActive]);

  return containerRef;
}
