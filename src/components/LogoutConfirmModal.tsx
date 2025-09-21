'use client'

import { useState } from 'react'
import { FaSignOutAlt, FaTimes } from 'react-icons/fa'

interface LogoutConfirmModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  userName?: string
}

export default function LogoutConfirmModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  userName 
}: LogoutConfirmModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        {/* Background overlay */}
        <div 
          className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
          onClick={onClose}
        />

        {/* Modal panel */}
        <div className="inline-block align-bottom bg-white rounded-2xl text-left overflow-hidden shadow-2xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full border border-gray-100">
          <div className="bg-gradient-to-br from-white to-gray-50 px-6 pt-6 pb-4 sm:p-8 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-red-100 to-red-200 sm:mx-0 sm:h-14 sm:w-14 shadow-lg">
                <FaSignOutAlt className="h-7 w-7 text-red-600" />
              </div>
              <div className="mt-4 text-center sm:mt-0 sm:ml-6 sm:text-left">
                <h3 className="text-2xl leading-7 font-bold text-gray-900 mb-2">
                  Confirm Logout
                </h3>
                <div className="mt-3">
                  <p className="text-gray-600 leading-relaxed">
                    Are you sure you want to logout{userName ? `, <span class="font-semibold text-gray-900">${userName}</span>` : ''}? 
                    You will need to sign in again to access your account.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-gray-50 px-6 py-4 sm:px-8 sm:flex sm:flex-row-reverse gap-3">
            <button
              type="button"
              className="w-full inline-flex justify-center items-center rounded-xl border border-transparent shadow-lg px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-base font-semibold text-white hover:from-red-700 hover:to-red-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:w-auto sm:text-sm transition-all duration-200 transform hover:scale-105"
              onClick={onConfirm}
            >
              <FaSignOutAlt className="mr-2 h-4 w-4" />
              Yes, Logout
            </button>
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center items-center rounded-xl border border-gray-300 shadow-md px-6 py-3 bg-white text-base font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm transition-all duration-200"
              onClick={onClose}
            >
              <FaTimes className="mr-2 h-4 w-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
