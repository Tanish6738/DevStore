'use client'

import { forwardRef } from 'react'

const Input = forwardRef(({ 
  type = 'text', 
  className = '', 
  placeholder = '',
  ...props 
}, ref) => {
  return (
    <input
      type={type}
      className={`input-theme w-full ${className}`}
      placeholder={placeholder}
      ref={ref}
      {...props}
    />
  )
})

Input.displayName = 'Input'

export default Input
