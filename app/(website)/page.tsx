import React from 'react';
import Hero from './home/Hero';
import AboutSection from './home/AboutUs';
import Image from 'next/image';
import WhyChooseUs from './home/WhyChooseUs';

const Page = () => {
  return (
    <div className="min-h-screen py-10">
      <Hero />
      <AboutSection />
      <div className='flex justify-center items-center'>
        <Image 
        src="/posterImg.jpg"
        alt="RMHSE Goolak India"
        width={1280}
        height={504}
        className='lg:w-[1130px] md:w-[800px] h-auto object-contain border-[1px] border-black rounded-[20px]'
        />
      </div>
      <WhyChooseUs />
    </div>
  );
};

export default Page;
