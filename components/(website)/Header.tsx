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
    { href: "aboutus", label: "About Us" },
    { href: "join", label: "Who Can Join?" },
    { href: "contactus", label: "Contact Us" },
  ];
  const navLinksMobile = [
    { href: "#home", label: "Home" },
    { href: "#aboutus", label: "About Us" },
    { href: "#join", label: "Who Can Join?" },
    { href: "#contactus", label: "Contact Us" },
  ];

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 ease-in-out
        ${isScrolled || isMenuOpen ? 'bg-white shadow-md' : 'bg-transparent'}
      `}
    >
      <nav className='max-w-7xl container flex items-center justify-between p-1 mx-auto px-4'>
        <div className="text-xl font-bold ">
          <Link href="/">
            <Image
              src="/growupIcon.png"
              width={100}
              height={100}
              alt='RMHSE logo'
              className='w-[60px] md:w-[80px] h-auto '
              />
            </Link>
        </div>

        <ul className='hidden lg:flex gap-8 text-gray-800 font-semibold text-lg'>
          {navLinksLaptop.map((link) => (
            <li key={link.label}>
              <button onClick={() => {
                document.getElementById(`${link.href}`)?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="text-gray-600 hover:text-purple-600 transition-colors hover:cursor-pointer  "
              >
                {link.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block  ">
          <Link
            href="/login"
            className="flex items-center justify-center gap-1 bg-sea-green-100 rounded-full 
                       px-4 py-2 font-semibold text-gray-800 transition-all text-lg border-2 border-sea-green-100 drop-shadow-gold-200/70 drop-shadow-lg"
          >
            User Dashboard
            <MoveRight size={18} />
          </Link>
        </div>

        <div className="lg:hidden">
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-800"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </nav>

      <div
        className={`
          lg:hidden absolute top-full left-0 w-full bg-white overflow-hidden transition-all duration-500 ease-in-out
          ${isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'}
        `}
      >
        <ul className='flex flex-col items-center gap-6 p-8 text-lg'>
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
            className="flex items-center justify-center gap-1 bg-sea-green-100 rounded-full 
                       px-4 py-2 font-semibold text-gray-800 transition-all text-lg border-2 border-sea-green-100 drop-shadow-gold-200/70 drop-shadow-lg bg-[length:200%_auto] hover:bg-[right_center]"
          >
            User Dashboard
            <MoveRight size={16} strokeWidth={2.5} />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Header;
