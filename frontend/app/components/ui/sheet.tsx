'use client'

import React, { createContext, useContext, useState } from 'react'
import { X } from 'lucide-react'

interface SheetContextType {
  open: boolean
  setOpen: (open: boolean) => void
}

const SheetContext = createContext<SheetContextType | undefined>(undefined)

interface SheetProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children: React.ReactNode
}

export function Sheet({ open: controlledOpen, onOpenChange, children }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false)

  const isOpen = controlledOpen !== undefined ? controlledOpen : uncontrolledOpen
  const setOpen = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen)
    } else {
      setUncontrolledOpen(newOpen)
    }
  }

  return (
    <SheetContext.Provider value={{ open: isOpen, setOpen }}>
      {children}
    </SheetContext.Provider>
  )
}

interface SheetTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  children: React.ReactNode
}

export function SheetTrigger({ asChild, children, onClick, ...props }: SheetTriggerProps) {
  const context = useContext(SheetContext)
  if (!context) throw new Error('SheetTrigger must be used within Sheet')

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    context.setOpen(true)
    onClick?.(e)
  }

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement<any>, {
      onClick: handleClick,
    })
  }

  return (
    <button onClick={handleClick} {...props}>
      {children}
    </button>
  )
}

interface SheetContentProps extends React.HTMLAttributes<HTMLDivElement> {
  side?: 'left' | 'right'
  children: React.ReactNode
}

export function SheetContent({ side = 'left', className = '', children, ...props }: SheetContentProps) {
  const context = useContext(SheetContext)
  if (!context) throw new Error('SheetContent must be used within Sheet')

  const handleClose = () => context.setOpen(false)

  if (!context.open) return null

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-40 bg-black/50"
        onClick={handleClose}
      />
      {/* Drawer */}
      <div
        className={`fixed top-0 z-50 h-full w-80 bg-white shadow-lg transition-transform ${
          side === 'left'
            ? `left-0 transform ${context.open ? 'translate-x-0' : '-translate-x-full'}`
            : `right-0 transform ${context.open ? 'translate-x-0' : 'translate-x-full'}`
        } ${className}`}
        {...props}
      >
        {children}
      </div>
    </>
  )
}

interface SheetHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function SheetHeader({ className = '', children, ...props }: SheetHeaderProps) {
  return (
    <div className={`flex items-center justify-between border-b border-gray-200 p-4 ${className}`} {...props}>
      {children}
      <SheetClose />
    </div>
  )
}

interface SheetTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
}

export function SheetTitle({ className = '', children, ...props }: SheetTitleProps) {
  return (
    <h2 className={`text-lg font-semibold text-gray-900 flex-1 ${className}`} {...props}>
      {children}
    </h2>
  )
}

export function SheetClose() {
  const context = useContext(SheetContext)
  if (!context) throw new Error('SheetClose must be used within Sheet')

  return (
    <button
      onClick={() => context.setOpen(false)}
      className="inline-flex items-center justify-center rounded-lg hover:bg-gray-100 transition-colors"
      aria-label="Close"
    >
      <X size={20} />
    </button>
  )
}
