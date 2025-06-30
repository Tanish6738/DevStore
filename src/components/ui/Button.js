'use client'

import { motion } from 'framer-motion'
import { forwardRef } from 'react'

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  disabled = false,
  onClick,
  type = 'button',
  ...props 
}, ref) => {
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-theme-primary disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-theme-primary text-white hover:opacity-90 hover:shadow-lg border border-transparent',
    outline: 'bg-transparent text-theme-primary border-2 border-theme-primary hover:bg-theme-primary hover:text-white',
    ghost: 'bg-transparent text-theme-text hover:bg-theme-primary/10',
    secondary: 'bg-theme-secondary text-theme-text hover:bg-theme-primary/10 border border-theme-border'
  }
  
  const sizes = {
    sm: 'px-3 py-2 text-sm rounded-md',
    md: 'px-4 py-2 text-base rounded-lg',
    lg: 'px-6 py-3 text-lg rounded-lg',
    xl: 'px-8 py-4 text-xl rounded-xl'
  }
  
  const classes = `${baseClasses} ${variants[variant]} ${sizes[size]} ${className}`
  
  const buttonContent = (
    <button
      ref={ref}
      type={type}
      className={classes}
      disabled={disabled}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
  
  // Add motion wrapper for enhanced animations
  return (
    <motion.div
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {buttonContent}
    </motion.div>
  )
})

Button.displayName = 'Button'

export default Button
