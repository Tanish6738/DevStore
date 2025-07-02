'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { X, Palette, Eye, Download, Save } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import Button from '../ui/Button'
import Input from '../ui/Input'


const CustomThemeCreator = ({ onClose }) => {
  const { saveCustomTheme } = useTheme()
  
  const [themeName, setThemeName] = useState('')
  const [themeColors, setThemeColors] = useState({
    primary: '#3B82F6',
    background: '#1F2937',
    secondary: '#374151',
    text: '#F9FAFB',
    textSecondary: '#D1D5DB',
    border: '#6B7280',
    accent: '#10B981',
    success: '#10B981',
    warning: '#F59E0B',
    error: '#EF4444'
  })
  
  const [previewMode, setPreviewMode] = useState(false)

  const colorFields = [
    { key: 'primary', label: 'Primary Color', description: 'Main brand color' },
    { key: 'background', label: 'Background', description: 'Main background color' },
    { key: 'secondary', label: 'Secondary Background', description: 'Card and panel backgrounds' },
    { key: 'text', label: 'Text Color', description: 'Primary text color' },
    { key: 'textSecondary', label: 'Secondary Text', description: 'Muted text color' },
    { key: 'border', label: 'Border Color', description: 'Border and divider color' },
    { key: 'accent', label: 'Accent Color', description: 'Highlight and accent color' },
    { key: 'success', label: 'Success Color', description: 'Success state color' },
    { key: 'warning', label: 'Warning Color', description: 'Warning state color' },
    { key: 'error', label: 'Error Color', description: 'Error state color' }
  ]

  const handleColorChange = (key, value) => {
    setThemeColors(prev => ({
      ...prev,
      [key]: value
    }))
  }

  const handleSave = () => {
    if (!themeName.trim()) {
      alert('Please enter a theme name')
      return
    }

    const newTheme = {
      name: themeName,
      ...themeColors
    }

    saveCustomTheme(themeName.toLowerCase().replace(/\s+/g, '-'), newTheme)
    onClose()
  }

  const handleExport = () => {
    const themeData = {
      name: themeName || 'Custom Theme',
      ...themeColors
    }
    
    const dataStr = JSON.stringify(themeData, null, 2)
    const dataBlob = new Blob([dataStr], { type: 'application/json' })
    const url = URL.createObjectURL(dataBlob)
    
    const link = document.createElement('a')
    link.href = url
    link.download = `${themeName || 'custom-theme'}.json`
    link.click()
    
    URL.revokeObjectURL(url)
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-bold text-theme-text mb-2">Create Custom Theme</h2>
          <p className="text-theme-text-secondary">Design your perfect color scheme</p>
        </div>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>{previewMode ? 'Edit' : 'Preview'}</span>
          </Button>
          <Button variant="ghost" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Color Editor */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          {/* Theme Name */}
          <div>
            <label className="block text-sm font-medium text-theme-text mb-2">
              Theme Name
            </label>
            <Input
              type="text"
              placeholder="Enter theme name..."
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              className="w-full"
            />
          </div>

          {/* Color Inputs */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-theme-text">Colors</h3>
            {colorFields.map((field) => (
              <motion.div
                key={field.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="flex items-center space-x-4 p-4 bg-theme-background/50 rounded-lg border border-theme-border/20"
              >
                <div className="flex-shrink-0">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-theme-border/30 cursor-pointer relative overflow-hidden"
                    style={{ backgroundColor: themeColors[field.key] }}
                  >
                    <input
                      type="color"
                      value={themeColors[field.key]}
                      onChange={(e) => handleColorChange(field.key, e.target.value)}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                  </div>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-medium text-theme-text mb-1">
                    {field.label}
                  </label>
                  <p className="text-xs text-theme-text-secondary mb-2">
                    {field.description}
                  </p>
                  <Input
                    type="text"
                    value={themeColors[field.key]}
                    onChange={(e) => handleColorChange(field.key, e.target.value)}
                    className="w-full text-sm"
                    placeholder="#000000"
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Preview */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="space-y-6"
        >
          <h3 className="text-lg font-semibold text-theme-text">Preview</h3>
          
          {/* Theme Preview */}
          <div
            className="rounded-2xl p-6 border-2 min-h-[600px]"
            style={{
              backgroundColor: themeColors.background,
              borderColor: themeColors.border,
              color: themeColors.text
            }}
          >
            {/* Preview Header */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: themeColors.primary }}
                >
                  <Palette className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h4 className="font-semibold" style={{ color: themeColors.text }}>
                    {themeName || 'Custom Theme'}
                  </h4>
                  <p className="text-sm" style={{ color: themeColors.textSecondary }}>
                    Theme Preview
                  </p>
                </div>
              </div>
              <div
                className="px-3 py-1 rounded-md text-sm font-medium text-white"
                style={{ backgroundColor: themeColors.primary }}
              >
                Primary
              </div>
            </div>

            {/* Preview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="p-4 rounded-lg border"
                  style={{
                    backgroundColor: themeColors.secondary,
                    borderColor: themeColors.border + '40'
                  }}
                >
                  <div className="flex items-center space-x-3 mb-3">
                    <div
                      className="w-6 h-6 rounded"
                      style={{ backgroundColor: themeColors.accent }}
                    />
                    <div
                      className="h-3 rounded flex-1"
                      style={{ backgroundColor: themeColors.text + '60' }}
                    />
                  </div>
                  <div className="space-y-2">
                    <div
                      className="h-2 rounded"
                      style={{ backgroundColor: themeColors.textSecondary + '40' }}
                    />
                    <div
                      className="h-2 rounded w-2/3"
                      style={{ backgroundColor: themeColors.textSecondary + '40' }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Preview Buttons */}
            <div className="flex space-x-3 mb-6">
              <button
                className="px-4 py-2 rounded-lg text-white font-medium"
                style={{ backgroundColor: themeColors.primary }}
              >
                Primary Button
              </button>
              <button
                className="px-4 py-2 rounded-lg border font-medium"
                style={{
                  borderColor: themeColors.border,
                  color: themeColors.text,
                  backgroundColor: 'transparent'
                }}
              >
                Secondary Button
              </button>
            </div>

            {/* Status Indicators */}
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: themeColors.success }}
                />
                <span style={{ color: themeColors.textSecondary }}>Success State</span>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: themeColors.warning }}
                />
                <span style={{ color: themeColors.textSecondary }}>Warning State</span>
              </div>
              <div className="flex items-center space-x-3">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: themeColors.error }}
                />
                <span style={{ color: themeColors.textSecondary }}>Error State</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center mt-8 pt-6 border-t border-theme-border/30">
        <Button variant="ghost" onClick={onClose}>
          Cancel
        </Button>
        
        <div className="flex space-x-3">
          <Button variant="outline" onClick={handleExport}>
            <Download className="w-4 h-4 mr-2" />
            Export Theme
          </Button>
          <Button variant="primary" onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Theme
          </Button>
        </div>
      </div>
    </div>
  )
}

export default CustomThemeCreator
