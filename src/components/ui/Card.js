'use client'

import { motion } from 'framer-motion'

const Card = ({ children, className = '', ...props }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={`card-theme p-6 shadow-lg ${className}`}
      {...props}
    >
      {children}
    </motion.div>
  )
}

const CardHeader = ({ children, className = '', ...props }) => {
  return (
    <div className={`mb-4 ${className}`} {...props}>
      {children}
    </div>
  )
}

const CardTitle = ({ children, className = '', ...props }) => {
  return (
    <h3 className={`text-xl font-semibold text-theme-text mb-2 ${className}`} {...props}>
      {children}
    </h3>
  )
}

const CardDescription = ({ children, className = '', ...props }) => {
  return (
    <p className={`text-theme-text-secondary ${className}`} {...props}>
      {children}
    </p>
  )
}

const CardContent = ({ children, className = '', ...props }) => {
  return (
    <div className={className} {...props}>
      {children}
    </div>
  )
}

const CardFooter = ({ children, className = '', ...props }) => {
  return (
    <div className={`mt-4 pt-4 border-t border-theme-border ${className}`} {...props}>
      {children}
    </div>
  )
}

export default Card
export { CardHeader, CardTitle, CardDescription, CardContent, CardFooter }
