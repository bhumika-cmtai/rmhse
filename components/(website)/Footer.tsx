"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";

// import { Play, Facebook, Phone } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gradient-to-b from-yellow-100 to-green-200 border-[1px] border-black text-gray-800">
      <div className="container mx-auto  py-4">
        
        {/* Centered Logo & Social Links */}
        <div className="flex flex-col items-center justify-center text-center space-y-6">

          {/* Logo Button */}
          <div className="">
            <Image 
            src="/logo.png"
            width={200}
            height={200}
            alt="logo"
            className="w-[120px] h-auto"
            />
          </div>

          

          {/* Social Links */}
          <div className="flex space-x-4 mt-2">
            
            <a
              href=""
              aria-label="YouTube"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
            >
             <Image 
                src="/youtube.svg"
                width={200}
                height={200}
                alt="youtube"
                className="w-[32px] h-auto"
              />
            </a>
            <a
              href=""
              aria-label="Facebook"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
            >
              <Image 
                src="/facebook.svg"
                width={200}
                height={200}
                alt="facebook"
                className="w-[32px] h-auto"
              />
            </a>
            <a
              href=""
              aria-label="WhatsApp"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
            >
              <Image 
                src="/whatsapp.svg"
                width={200}
                height={200}
                alt="whatsApp"
                className="w-[32px] h-auto"
              />
            </a>
          </div>
        </div>

    {/* Footer Bottom */}
<div className="mt-16 pt-8">
  {/* Full-width divider */}
  <div className="border-t border-black w-full mb-4"></div>

  {/* Bottom text: left & right */}
  <div className="flex flex-col sm:flex-row justify-between items-center text-sm text-gray-700 mb-6">
    <p className=" text-black mb-2 sm:mb-0 font-medium mx-10">
      © 2025 RMHSE Trust. All Rights Reserved
    </p>
    <Link
      href="https://earn4files.yolasite.com/resources/1.png"
      className="text-black transition-colors font-medium mx-10"
    >
      Privacy Policy
    </Link>
  </div>
</div>
      </div>
    </footer>
  );
};

export default Footer;
