"use client"
import React, { useRef } from 'react';
import { motion, useInView, Variants } from "framer-motion";
import Image from 'next/image';

const governmentLogos = [
  { src: '/adharIcon.png', alt: 'Aadhar', height: 110 },
  { src: '/digitalIndiaIcon.png', alt: 'Digital India', height: 60 },
  { src: '/msmeIcon.png', alt: 'MSME', height: 90 },
  { src: '/govtOfIndiaIcon.png', alt: 'Government of India', height: 90 },
];

const bankLogos = [
  { src: '/axisBankIcon.png', alt: 'Axis Bank', height: 45 },
  { src: '/bankOfBarodaIcon.png', alt: 'Bank of Baroda', height: 45 },
  { src: '/canaraBankIcon.png', alt: 'Canara Bank', height: 45 },
  { src: '/hdfcIcon.png', alt: 'HDFC Bank', height: 45 },
  { src: '/IciciBankIcon.png', alt: 'ICICI Bank', height: 45 },
  { src: '/yesBankIcon.png', alt: 'Yes Bank', height: 60 },
  { src: '/upstoxIcon.png', alt: 'Upstox', height: 45 },
];

const scrollVariants = (direction: 'left' | 'right'): Variants => ({
  animate: {
    x: direction === 'left' ? ['0%', '-50%'] : ['-50%', '0%'],
    transition: {
      repeat: Infinity,
      duration: 30, 
      ease: 'linear' as const, 
    },
  },
});

const LegalStatus: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="w-full relative" id="legalstatus">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-extrabold mb-4 bg-gradient-to-r from-gray-800 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            OUR LEGAL STATUS
          </h2>
          <p className='text-center font-semibold text-base text-gray-700 max-w-4xl mx-auto'>
            We are a Government Registered Platform, operating with complete legal transparency. Your trust and security are our top priorities. All our services and processes comply with official norms and digital safety standards.
          </p>
        </motion.div>

        <div className="mt-16 flex flex-col space-y-12">
          <div className="relative w-full overflow-hidden h-32">
            <div className="absolute top-0 left-0 h-full w-24 z-10" />
            <div className="absolute top-0 right-0 h-full w-24 z-10" />
            
            <motion.div
              className="absolute top-0 left-0 flex"
              variants={scrollVariants('right')}
              animate="animate"
            >
              {[...governmentLogos, ...governmentLogos].map((logo, index) => (
                <div key={`gov-${index}`} className="flex-shrink-0 w-64 h-32 flex items-center justify-center px-8">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={150}
                    height={logo.height}
                    className="object-contain"
                  />
                </div>
              ))}
            </motion.div>
          </div>

          <div className="relative w-full overflow-hidden h-20">
            <div className="absolute top-0 left-0 h-full w-24  " />
            <div className="absolute top-0 right-0 h-full w-24  " />

            <motion.div
              className="absolute top-0 left-0 flex"
              variants={scrollVariants('left')}
              animate="animate"
            >
              {[...bankLogos, ...bankLogos].map((logo, index) => (
                <div key={`bank-${index}`} className="flex-shrink-0 w-64 h-20 flex items-center justify-center px-8">
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={200}
                    height={logo.height}
                    className="object-contain"
                  />
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LegalStatus;