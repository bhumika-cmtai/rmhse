import React from 'react';
import Hero from './home/Hero';
import AboutSection from './home/AboutUs';
import Image from 'next/image';
import WhyChooseUs from './home/WhyChooseUs';
import OurProcess from './home/OurProcess';
import LatestNotification from './home/LatestNotification';
import ContactUs from './home/ContactUs';

const Page = () => {
  return (
    <div className="min-h-screen py-10 ">
      <Hero />
      <OurProcess />
      <AboutSection />
      <LatestNotification />
      <div className='flex justify-center items-center py-20'>
        <Image 
        src="/posterImg.jpg"
        alt="RMHSE Goolak India"
        width={1280}
        height={504}
        className='lg:w-[1130px] md:w-[800px] h-auto object-contain border-[1px] border-black rounded-[20px]'
        />
      </div>
      <WhyChooseUs />
      <ContactUs />
    </div>
  );
};

export default Page;
