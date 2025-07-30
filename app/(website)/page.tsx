"use client"
import Hero from './home/Hero'
import WhatWeDo from './home/WhatWeDo';
import AboutUs from './home/AboutUs';
import WhyChooseUs from './home/WhyChooseUs';
import WhoCanJoin from './home/WhoCanJoin';
import LegalStatus from './home/LegalStatus';
import Achievements from './home/Achievements';
import Testimonials from './home/Testimonials';
import ContactUs from './home/ContactUs';


export default function HomePage() {
  

  return (
    <main className="flex min-h-screen max-w-7xl flex-col items-center justify-center py-20 mx-auto ">
     
      <Hero />
      <WhatWeDo />
      <AboutUs />
      <WhyChooseUs />
      <WhoCanJoin />
      <Testimonials />
      <LegalStatus />
      <Achievements />
      <ContactUs />
    </main>
  );
}