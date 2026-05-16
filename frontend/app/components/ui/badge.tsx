import React from 'react'

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive'
}

export function Badge({ className = '', variant = 'default', ...props }: BadgeProps) {
  const baseStyles = 'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors'

  const variantStyles = {
    default: 'bg-primary text-white',
    secondary: 'bg-gray-200 text-gray-900',
    outline: 'border border-gray-300 text-gray-700 bg-white',
    destructive: 'bg-red-600 text-white',
  }

  return (
    <div className={`${baseStyles} ${variantStyles[variant]} ${className}`} {...props} />
  )
}
