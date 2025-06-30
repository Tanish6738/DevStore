'use client'

import Header from '@/components/Header'
import ThemeAccessibilitySettings from '@/components/theme/ThemeAccessibilitySettings'
// import ThemeAccessibilitySettings from '@/components/ThemeAccessibilitySettings'

export default function ThemeSettingsPage() {
  return (
    <>
      <Header />
      <div className="min-h-screen bg-theme-background py-12 ">
        <ThemeAccessibilitySettings />
      </div>
    </>
  )
}
