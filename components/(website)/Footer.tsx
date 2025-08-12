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
              href="https://youtu.be/iIwTglCQn0I?si=aVUqGfBS5v8H9hV_"
              aria-label="YouTube"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
            >
             <Image 
                src="/youtube.svg"
                width={200}
                height={200}
                alt="youtube"
                className="w-[28px] h-auto"
              />
            </a>
            <a
              href="https://www.facebook.com/share/1RKRhQEhBZ/"
              aria-label="Facebook"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
            >
              <Image 
                src="/facebook.svg"
                width={200}
                height={200}
                alt="facebook"
                className="w-[28px] h-auto"
              />
            </a>
            <a
              href="https://wa.me/917210050984"
              aria-label="WhatsApp"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
            >
              <Image 
                src="/whatsapp.svg"
                width={200}
                height={200}
                alt="whatsApp"
                className="w-[28px] h-auto"
              />
            </a>
            <a
              href="https://www.instagram.com/p/DNFnpnyTbrG/?igsh=MWQ2dDhpZXprcjN3Mg=="
              aria-label="Instagram"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
            >
              <Image 
                src="/instagram.svg"
                width={200}
                height={200}
                alt="instagram"
                className="w-[44px] h-auto"
              />
            </a>
            <a
              href="https://g.co/kgs/aoJUcVN"
              aria-label="Location"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
            >
              <Image 
                src="/location.svg"
                width={200}
                height={200}
                alt="location"
                className="w-[34px] h-auto"
              />
            </a>
            <a
              href="https://x.com/rmhsetrust?t=mf2cFMLwySVEJqzWLKaDJQ&s=09"
              aria-label="Twitter"
              className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110"
            >
              <Image 
                src="/twitter.svg"
                width={200}
                height={200}
                alt="location"
                className="w-[24px] h-auto"
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
    <div className="flex items-center mx-10">
      <Link
        href="/privacy-policy"
        className="text-black transition-colors font-medium"
      >
        Privacy Policy
      </Link>
      <span className="mx-2 text-black font-medium">|</span>
      <Link
        href="/terms"
        className="text-black transition-colors font-medium"
      >
        Terms & Conditions
      </Link>
    </div>
  </div>
</div>
      </div>
    </footer>
  );
};

export default Footer;
