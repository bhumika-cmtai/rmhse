import { Button } from '@/components/ui/button';
import { Check, Heart } from 'lucide-react';
import Image from 'next/image';
import React from 'react'

const Hero = () => {
  return (
    <section className="w-full bg-gradient-to-r from-[#87DB47] to-yellow-100 min-h-[600px] flex items-center px-16">
      <div className="container ">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 items-center">
          {/* Left Content */}
          <div className="space-y-6 w-[500px]">
            <h1 className="text-5xl lg:text-5xl font-bold leading-tight">
              <span className="text-gray-900">Empowering</span><br />
              <span className="text-gray-900">Lives </span>
              <span className="text-pink-500">Through</span><br />
              <span className="text-pink-500">Technology & Trust</span>
            </h1>
            
            <p className="text-[20px] text-black font-medium leading-relaxed w-[610px]">
              Join RMHSE Trust in building a fair, AI-driven future for all. 
              Transparent donations, real impact, powered by cutting-edge technology.
            </p>
            
            <Button className="bg-white border-[1px] border-pink-500  px-[30px] py-[22px] rounded-[18px] font-bold text-lg text-pink-500">
              Join Us
            </Button>
            
            {/* Trust Indicators */}
            <div className="flex items-center space-x-6 pt-4">
              <div className="flex items-center space-x-2">
                <Image 
                src="/check.png"
                alt='check'
                width={100}
                height={100}
                className='w-[25px] h-auto '
                />
                <span className="text-md font-medium text-gray-700">Government Approved</span>
              </div>
              <div className="flex items-center space-x-2">
               <Image 
                src="/shield.png"
                alt='check'
                width={100}
                height={100}
                className='w-[25px] h-auto '
                />
                <span className="text-md font-medium text-gray-700">100% Transparent</span>
              </div>
            </div>
          </div>

          {/* Right Content - Hero Image */}
          <div className="flex justify-center">
            <div className="relative">
              <img 
                src="/homeImg.png"
                alt="Hands holding colorful paper cutouts around a globe"
                className="w-full max-w-md h-auto rounded-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero
