"use client";

import { Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // --- FIX FOR HYDRATION ERROR ---
  // We need to ensure the server and initial client render match.w
  // This state will be false on the server and true on the client after mounting.
  const [hasMounted, setHasMounted] = useState(false);

  useEffect(() => {
    setHasMounted(true);
  }, []);
  // --------------------------------

  useEffect(() => {
    // Only add the scroll listener if the component has mounted on the client
    if (!hasMounted) return;

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    
    window.addEventListener('scroll', handleScroll);
    // Also call it once to set initial state
    handleScroll(); 
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [hasMounted]); // Depend on hasMounted


  // Determine header background, but only after client has mounted
  const headerBg = hasMounted && (isScrolled || isMenuOpen) ? 'bg-white shadow-md' : 'bg-transparent';

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out
        ${headerBg}
      `}
    >
      <nav className='max-w-7xl container flex items-center justify-between p-1 mx-auto px-4'>
        <Link href="#home" aria-label="Go to homepage">
          <Image
            src="/growupIcon.png"
            width={100}
            height={100}
            alt='RMHSE logo'
            className='w-[60px] md:w-[80px] h-auto'
          />
        </Link>
      </nav>
    </header>
  );
};

export default Header;