"use client";
import React from "react";
import Link from "next/link";
import Image from "next/image";
// import { Play, Facebook, Phone } from "lucide-react";

const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-gradient-to-br from-pink-100/10 to-sea-green-100/40 text-gray-800">
      <div className="container mx-auto px-6 py-16">
        
        {/* Centered Logo & Social Links */}
        <div className="flex flex-col items-center justify-center text-center space-y-6">

          {/* Logo Button */}
          <div className="">
            <Image 
            src="/logo.png"
            width={200}
            height={200}
            alt="logo"
            className="w-[100px] h-auto"
            />
          </div>

          

          {/* Social Links */}
          <div className="flex space-x-4 mt-2">
            
            <a
              href=""
              aria-label="YouTube"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
            >
              <Image alt="YouTube icon" src="/youtube.png" width={30} height={30} />
            </a>
            <a
              href=""
              aria-label="WhatsApp"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
            >
              <Image alt="WhatsApp icon" src="/whatsapp.png" width={30} height={30} />
            </a>
            {/* <a
              href=""
              aria-label="LinkedIn"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
            >
              <Image alt="LinkedIn icon" src="/linkedin.png" width={30} height={30} />
            </a> */}
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-16 pt-8 border-t border-gray-500 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <p className="mb-4 sm:mb-0 font-medium text-gray-700">
            © 2025 RMHSE || All Rights Reserved
          </p>
          <Link
            href="/https://earn4files.yolasite.com/resources/1.png"
            className="hover:text-black transition-colors font-medium text-gray-700"
          >
            Terms & Conditions
          </Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
