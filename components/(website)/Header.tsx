"use client";

import { MoveRight, Menu, X } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState, useEffect } from 'react';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = isMenuOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMenuOpen]);

  const navLinksLaptop = [
    { href: "home", label: "Home" },
    { href: "about", label: "About" },
    { href: "contact", label: "Contact" },
  ];
  const navLinksMobile = [
    { href: "#home", label: "Home" },
    { href: "#about", label: "About" },
    { href: "#contact", label: "Contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 w-full bg-white px-4">
      <nav className='max-w-7xl container flex items-center justify-between p-1 mx-auto px-4'>
        <div className="text-xl font-bold">
          <Link href="/">
            <Image
              src="/logo.png"
              width={200}
              height={200}
              alt='RMHSE logo'
              className='w-[80px] md:w-[110px] h-auto '
            />
          </Link>
        </div>

        <div className="hidden lg:flex items-center gap-6 ml-auto">
          <ul className='flex gap-[76px] text-black font-normal text-[20px]'>
            {navLinksLaptop.map((link) => (
              <li key={link.label}>
                <button
                  onClick={() => {
                    document.getElementById(`${link.href}`)?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="text-black hover:text-pink-500 transition-colors hover:cursor-pointer"
                >
                  {link.label}
                </button>
              </li>
            ))}
          </ul>
          <Link
            href="/login"
            className="ml-4 flex items-center justify-center font-semibold gap-1 bg-green-200 text-white rounded-2xl 
                       px-6 py-2 text-[18px] transition-all border-2 border-green-200 shadow-md"
          >
            Login/Signup
            <MoveRight size={18} />
          </Link>
        </div>

        <div className="lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-black"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-white overflow-hidden transition-all duration-500 ease-in-out
          ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <ul className='flex flex-col items-center gap-6 p-8 text-[20px]'>
          {navLinksMobile.map((link) => (
            <Link key={link.href} href={link.href} onClick={() => setIsMenuOpen(false)}>
              <li className='cursor-pointer hover:text-purple-600 transition-colors'>{link.label}</li>
            </Link>
          ))}
        </ul>
        <div className="p-4 border-t border-gray-200 flex justify-center">
          <Link
            href="/login"
            onClick={() => setIsMenuOpen(false)}
            className="flex items-center justify-center gap-1 bg-green-200 text-white rounded-md 
                       px-4 py-2 text-[20px] border-2 border-green-200 shadow-xl"
          >
            Login/Signup
            <MoveRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
