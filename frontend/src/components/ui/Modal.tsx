'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ModalProps {
  id: string
  title: string
  children: React.ReactNode
  size?: 'sm' | 'md' | 'lg' | 'xl'
  onClose?: () => void
  closable?: boolean
}

interface ConfirmationModalProps {
  id: string
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  onConfirm: () => void
  onCancel?: () => void
  type?: 'info' | 'warning' | 'danger'
}

interface ModalContextType {
  showModal: (modal: Omit<ModalProps, 'id'>) => string
  showConfirmation: (confirmation: Omit<ConfirmationModalProps, 'id'>) => Promise<boolean>
  closeModal: (id: string) => void
  closeAllModals: () => void
}

const ModalContext = createContext<ModalContextType | undefined>(undefined)

export function ModalProvider({ children }: { children: React.ReactNode }) {
  const [modals, setModals] = useState<ModalProps[]>([])
  const [confirmations, setConfirmations] = useState<ConfirmationModalProps[]>([])

  const showModal = useCallback((modal: Omit<ModalProps, 'id'>) => {
    const id = Math.random().toString(36).substr(2, 9)
    const newModal: ModalProps = {
      ...modal,
      id,
      size: modal.size || 'md',
      closable: modal.closable !== false
    }

    setModals(prev => [...prev, newModal])
    return id
  }, [])

  const closeModal = useCallback((id: string) => {
    setModals(prev => prev.filter(modal => modal.id !== id))
    setConfirmations(prev => prev.filter(confirmation => confirmation.id !== id))
  }, [])

  const closeAllModals = useCallback(() => {
    setModals([])
    setConfirmations([])
  }, [])

  const showConfirmation = useCallback((confirmation: Omit<ConfirmationModalProps, 'id'>) => {
    return new Promise<boolean>((resolve) => {
      const id = Math.random().toString(36).substr(2, 9)
      const newConfirmation: ConfirmationModalProps = {
        ...confirmation,
        id,
        confirmText: confirmation.confirmText || 'Confirm',
        cancelText: confirmation.cancelText || 'Cancel',
        type: confirmation.type || 'info',
        onConfirm: () => {
          closeModal(id)
          confirmation.onConfirm()
          resolve(true)
        },
        onCancel: () => {
          closeModal(id)
          confirmation.onCancel?.()
          resolve(false)
        }
      }

      setConfirmations(prev => [...prev, newConfirmation])
    })
  }, [closeModal])

  const getSizeClasses = (size: ModalProps['size']) => {
    switch (size) {
      case 'sm': return 'max-w-md'
      case 'md': return 'max-w-lg'
      case 'lg': return 'max-w-2xl'
      case 'xl': return 'max-w-4xl'
      default: return 'max-w-lg'
    }
  }

  const getConfirmationStyles = (type: ConfirmationModalProps['type']) => {
    switch (type) {
      case 'warning':
        return {
          icon: (
            <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          ),
          bgColor: 'bg-yellow-100',
          buttonColor: 'bg-yellow-600 hover:bg-yellow-700'
        }
      case 'danger':
        return {
          icon: (
            <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-red-100',
          buttonColor: 'bg-red-600 hover:bg-red-700'
        }
      default:
        return {
          icon: (
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          bgColor: 'bg-blue-100',
          buttonColor: 'bg-blue-600 hover:bg-blue-700'
        }
    }
  }

  return (
    <ModalContext.Provider value={{ showModal, showConfirmation, closeModal, closeAllModals }}>
      {children}

      {/* Modal Backdrop */}
      <AnimatePresence>
        {(modals.length > 0 || confirmations.length > 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                // Close topmost closable modal
                const topModal = modals[modals.length - 1]
                const topConfirmation = confirmations[confirmations.length - 1]
                
                if (topConfirmation) {
                  topConfirmation.onCancel?.()
                } else if (topModal && topModal.closable) {
                  topModal.onClose?.()
                  closeModal(topModal.id)
                }
              }
            }}
          >
            {/* Regular Modals */}
            {modals.map((modal) => (
              <motion.div
                key={modal.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                transition={{ duration: 0.2 }}
                className={`bg-white rounded-lg shadow-xl w-full ${getSizeClasses(modal.size)} max-h-[90vh] overflow-y-auto`}
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <h2 className="text-xl font-semibold text-gray-900">{modal.title}</h2>
                  {modal.closable && (
                    <button
                      onClick={() => {
                        modal.onClose?.()
                        closeModal(modal.id)
                      }}
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  )}
                </div>
                <div className="p-6">
                  {modal.children}
                </div>
              </motion.div>
            ))}

            {/* Confirmation Modals */}
            {confirmations.map((confirmation) => {
              const styles = getConfirmationStyles(confirmation.type)
              return (
                <motion.div
                  key={confirmation.id}
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9, y: 20 }}
                  transition={{ duration: 0.2 }}
                  className="bg-white rounded-lg shadow-xl w-full max-w-md"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="p-6">
                    <div className="flex items-center">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full ${styles.bgColor} flex items-center justify-center`}>
                        {styles.icon}
                      </div>
                      <div className="ml-4">
                        <h3 className="text-lg font-medium text-gray-900">{confirmation.title}</h3>
                        <p className="text-sm text-gray-500 mt-2">{confirmation.message}</p>
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-3 mt-6">
                      <button
                        onClick={confirmation.onCancel}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        {confirmation.cancelText}
                      </button>
                      <button
                        onClick={confirmation.onConfirm}
                        className={`px-4 py-2 text-white rounded-md transition-colors ${styles.buttonColor}`}
                      >
                        {confirmation.confirmText}
                      </button>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </ModalContext.Provider>
  )
}

export function useModal() {
  const context = useContext(ModalContext)
  if (context === undefined) {
    throw new Error('useModal must be used within a ModalProvider')
  }
  return context
}