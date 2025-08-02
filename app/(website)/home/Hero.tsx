"use client"
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import React from 'react';
import { motion } from "framer-motion";
 

const Hero = () => {
  return (
    // Use responsive padding: smaller on mobile, larger on desktop
    <section
      className="w-full flex items-center min-h-[600px] py-12 sm:py-20 px-4 sm:px-8 lg:px-16  bg-linear-to-br via-65%  from-green-200 via-yellow-100 to-yellow-100 "
      // style={{
      // background: 'linear-gradient(to bottom right, rgba(135, 219, 71, 0.79), rgba(255, 255, 153, 0.79))',
      // }}
      id="home"
    >
      <div className="container mt-[72px]">
      {/* Adjust vertical margin for different screen sizes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center mt-10 md:mt-0">
        
        {/* Left Content */}
        {/* Center text on mobile, align left on desktop. Remove fixed width. */}
        <div className="space-y-6 text-center lg:text-left">
        {/* Responsive font sizes for the heading */}
        <h1 className="text-4xl md:text-5xl font-bold leading-tight">
  <motion.span
    initial={{ x: -100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay: 0 }}
    className="text-gray-900 block"
  >
    Empowering
  </motion.span>

  <motion.span
    initial={{ x: -100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.2 }}
    className="text-gray-900 block"
  >
    Lives
  </motion.span>

  <motion.span
    initial={{ x: -100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.4 }}
    className="text-pink-500 block"
  >
    Through
  </motion.span>

  <motion.span
    initial={{ x: -100, opacity: 0 }}
    animate={{ x: 0, opacity: 1 }}
    transition={{ duration: 0.6, delay: 0.6 }}
    className="text-pink-500 block"
  >
    Technology & Trust
  </motion.span>
</h1>
        
        {/* Responsive font size and remove fixed width. Use max-width for readability on large screens. */}
        {/* Center the text block on mobile */}
        <motion.p
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="text-lg md:text-xl text-black font-medium leading-relaxed max-w-xl mx-auto lg:mx-0"
        >
          Join RMHSE Trust in building a fair, AI-driven future for all. 
          Transparent donations, real impact, powered by cutting-edge technology.
      </motion.p>
        
        {/* Responsive padding and font size for the button */}
        <motion.div
          initial={{ y: 50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6, delay: 1 }}
        >
          <Button className="bg-white shadow-sm border-[1px] border-pink-500 px-8 py-3 md:px-[30px] md:py-[22px] rounded-[18px] font-bold text-base md:text-lg text-pink-500"
            style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}>
            Join Us
          </Button>
        </motion.div>
                
        {/* Trust Indicators */}
        {/* Center the indicators on mobile and allow them to wrap */}
        <div className="flex flex-wrap items-center justify-center lg:justify-start space-x-6 pt-4">
        <motion.div
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5, delay: 1.2 }}
          className="flex items-center space-x-2 mb-2 sm:mb-0"
        >
          <Image 
            src="/check.png"
            alt="check"
            width={25}
            height={25}
            className='w-[25px] h-auto'
          />
          <span className="text-md font-medium text-gray-700">Government Approved</span>
        </motion.div>
          <motion.div
  initial={{ y: 40, opacity: 0 }}
  animate={{ y: 0, opacity: 1 }}
  transition={{ duration: 0.5, delay: 1.4 }}
  className="flex items-center space-x-2"
>
  <Image 
    src="/shield.png"
    alt="shield"
    width={25}
    height={25}
    className='w-[25px] h-auto'
  />
  <span className="text-md font-medium text-gray-700">100% Transparent</span>
</motion.div>
        </div>
        </div>

        {/* Right Content - Hero Image */}
        {/* Ensure image is centered and scales properly */}
        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 1 }}
          className="flex justify-center"
        >
          <Image 
            src="/homeImg.png"
            width={503}
            height={395}
            alt="Hands holding colorful paper cutouts around a globe"
            className="w-full max-w-[500px] h-auto rounded-2xl"
          />
        </motion.div>
      </div>
      </div>
    </section>
  );
}

export default Hero;