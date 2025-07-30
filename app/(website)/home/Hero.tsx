"use client"
import Image from 'next/image';
import React from 'react';
import {motion} from 'motion/react'
import PopupPoster from './PopupPoster';
import { useEffect, useState } from 'react';
import Link from 'next/link';
const Hero = () => {
  const [isPopupOpen, setPopupOpen] = useState(false);

  useEffect(() => {
    
    const timer = setTimeout(() => {
      setPopupOpen(true);
    }, 1500); 

    return () => clearTimeout(timer);
  }, []); 

   const handleClosePopup = () => {
    setPopupOpen(false);
  };
  return (
    <section className="max-w-7xl w-full relative  text-center px-4 " id="home">
       <PopupPoster isOpen={isPopupOpen} onClose={handleClosePopup}>
        <Link href="/#contactus" >
          <Image 
          src="/posterImg.jpg"
          alt='job popup'
          width={300}
          height={300}
          className='h-auto w-[300px]'
          onClick={handleClosePopup}
          />
        </Link>
      </PopupPoster>
      <div>
        <div className="flex flex-col">
            <div className=' lg:grid lg:grid-cols-6 justify-between '>
                <div className='lg:col-span-4 flex gap-2 flex-col mx-auto'>     
                    <motion.h1
                      initial={{ opacity: 0, y: -50 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: "easeOut" }}className="text-6xl md:text-8xl mb-4 font-bold font-sans-noto tracking-wide bg-gradient-to-r from-purple-400 to-pink-200 bg-clip-text text-transparent drop-shadow-md drop-shadow-gray-700 ">
                        RMHSE
                    </motion.h1>

                     <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}className="w-full text-sm md:text-base font-semibold text-gray-subtitle ">
                        <p>Work From Home With Zero Investment</p>
                        <p>Empowering Individuals. Creating Opportunities.</p>
                    </motion.div>
                </div>

               <div className=' lg:col-span-2 col-start-5 w-[320px] sm:place-self-center lg:place-self-start h-auto  overflow-hidden rounded-xl'>       
                    <Image 
                      src="/liveVideo2-unscreen.gif"
                      alt='livevideo'
                      width={500}
                      height={300}

                    />
                </div>

            </div>
            <div className='w-full'>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}className="w-full mt-3 leading-[25px] lg:leading-[40px]  md:text-lg font-semibold max-w-3xl mx-auto  text-gray-800">
                    At GROWUP Our Mission Is To Empower Individuals In India By Providing Real Work-from-home Opportunities With No Investment. Whether You Are A Student, Homemaker, Retired Professional, Or Someone Who Wants To Make Extra Money, We Offer Sure-shot And Easy-to-do Work That Enables You To Create A Better Future — From The Comfort Of Your Own Home.
                </motion.p>
            </div>
            {/* blob for right */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.2 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "easeInOut" }} className='absolute block -right-[100px] top-[60px] lg:-top-[40px] lg:-right-[240px] h-[200px] w-[200px] lg:h-[460px] lg:w-[460px] bg-gradient-to-b from-purple-400 to-pink-200 rounded-full opacity-20'>
            </motion.div>
            {/* blob for left  */}
            <motion.div
            initial={{ scale: 0, opacity: 0 }}
            whileInView={{ scale: 1, opacity: 0.2 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: "easeInOut" }} className='absolute block  top-[260px] -left-[150px] lg:top-[240px] lg:-left-[300px] lg:h-[600px] h-[200px] w-[200px] lg:w-[600px] bg-gradient-to-b from-purple-400 to-pink-200 rounded-full opacity-20'>
            </motion.div>
        </div>
        <div></div>
      </div>
    </section>
  );
};

export default Hero;