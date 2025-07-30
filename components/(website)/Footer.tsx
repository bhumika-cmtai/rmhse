"use client"
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';

const Footer: React.FC = () => {
  const servicesLinks = [
    "Work From Anywhere",
    "Pending KYC Approval Tasks",
    "New Account Opening Work",
    "Data Management & Entry",
    "Customer Support Services",
  ];

  const usefulLinks = [
    { name: "Home", href: "" },
    { name: "About Us", href: "aboutus" },
    { name: "What We Do", href: "whatwedo" },
    { name: "Who Can Join", href: "join" },
    { name: "Why Choose Us?", href: "whychooseus" },
  ];
  
  const supportLinks = [
      { name: "Contact", href: "contactus" },
  ];

  return (
    <footer className="w-full bg-gradient-to-br from-pink-100/10 to-sea-green-100/40 text-gray-800">
      <div className="container mx-auto px-6 py-16">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">

          <div className="lg:col-span-2">
            <div className="inline-block p-1 rounded-full bg-gradient-to-r from-yellow-400 to-green-300">
              <Link
                href="#"
                className="flex h-full w-full items-center justify-center gap-[6px] back bg-green-200 rounded-full  px-8 py-3 text-lg font-semibold text-gray-800 transition-colors"
               >
                RMHSE
              </Link>
            </div>
            <p className="mt-6 text-gray-600 leading-relaxed max-w-sm">
              At GrowUp, your growth is our mission. Join our team today and start earning while learning—right from your home!
            </p>
            <div className="flex space-x-4 mt-6">
              <a href="https://www.instagram.com/indiagrowup__?igsh=Ymttb3FoZGh1Zm1u" aria-label="Instagram" className="w-10 h-10 rounded-lg flex items-center justify-center transition-transform hover:scale-110">
                <Image
                  alt="Instagram icon"
                  src="/instagram.png"
                  width={30}
                  height={30}
                /> 
              </a>
              <a href="https://youtube.com/@growup_india_01?feature=shared" aria-label="Youtube" className="w-10 h-10 rounded-lg flex items-center justify-center  transition-transform hover:scale-110">
                <Image
                  alt="youtube icon"
                  src="/youtube.png"
                  width={30}
                  height={30}
                />
              </a>
              <a href="https://x.com/GrowUp_india_?t=ynPhvGl3FYJDB-2QJmzxiQ&s=09" aria-label="Twitter" className="w-10 h-10 rounded-lg flex items-center justify-center  transition-transform hover:scale-110">
                <Image
                  alt="twitter icon"
                  src="/twitter.png"
                  width={30}
                  height={30}
                />
              </a>
              <a href="https://www.linkedin.com/in/rmhse-a25b69294?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app " aria-label="Twitter" className="w-10 h-10 rounded-lg flex items-center justify-center  transition-transform hover:scale-110">
                <Image
                  alt="linkedin icon"
                  src="/linkedin.png"
                  width={30}
                  height={30}
                />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Our Services</h3>
            <ul className="space-y-2">
              {servicesLinks.map((link, index) => (
                <li key={index}>
                  <Link href="#" className="text-gray-600 text-base text-nowrap mb-2 hover:text-black transition-colors">
                    {link}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Useful Links</h3>
            <ul className="space-y-2">
              {usefulLinks.map((link) => (
                <li key={link.name}>
                  <button onClick={() => {
                  document.getElementById(`${link.href}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-600 hover:text-black transition-colors"
                >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Support</h3>
             <ul className="space-y-3 mb-8">
              {supportLinks.map((link) => (
                <li key={link.name}>
                  <button onClick={() => {
                  document.getElementById(`${link.href}`)?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="text-gray-600 hover:text-black transition-colors"
                >
                    {link.name}
                  </button>
                </li>
              ))}
            </ul>
            
            
          </div>

        </div>

        <div className="mt-16 pt-8 border-t border-gray-500 flex flex-col sm:flex-row justify-between items-center text-sm text-gray-500">
          <p className="mb-4 sm:mb-0 font-medium text-gray-700">
            © 2025 RMHSE || All Rights Reserved
          </p>
          <Link href="/https://earn4files.yolasite.com/resources/1.png" className="hover:text-black transition-colors font-medium text-gray-700">
            Terms & Conditions
          </Link>
        </div>

      </div>
    </footer>
  );
};

export default Footer;