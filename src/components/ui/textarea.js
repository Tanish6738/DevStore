'use client'

import { forwardRef } from 'react'

const Textarea = forwardRef(({ 
  className = '', 
  placeholder = '',
  rows = 4,
  ...props 
}, ref) => {
  return (
    <textarea
      className={`input-theme w-full resize-vertical ${className}`}
      placeholder={placeholder}
      rows={rows}
      ref={ref}
      {...props}
    />
  )
})

Textarea.displayName = 'Textarea'

export { Textarea }
