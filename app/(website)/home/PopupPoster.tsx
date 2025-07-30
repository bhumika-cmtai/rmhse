
"use client"
import React from 'react';

interface PopupProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode; 
}

const PopupPoster = ({ isOpen, onClose, children }: PopupProps) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 bg-opacity-y backdrop-blur-xs transition-opacity duration-300"
      onClick={onClose} 
    >
      <div
        className="relative mx-4 max-w-lg rounded-lg bg-white shadow-xl transition-transform duration-300 transform scale-100"
        onClick={(e) => e.stopPropagation()} 
      >
        <button
          onClick={onClose}
          className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-900 focus:outline-none"
          aria-label="Close popup"
        >
            x
        </button>
        
        {children}
      </div>
    </div>
  );
};

export default PopupPoster;