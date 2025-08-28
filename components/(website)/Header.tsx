"use client";

import { MoveRight, Menu, X, CreditCard } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import React, {useState, useEffect } from 'react';
import { toast } from 'sonner';

// --- START: TYPE DEFINITIONS ---
declare global {
  interface Window {
    Razorpay: any;
  }
}

interface RazorpaySuccessResponse {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
// --- END: TYPE DEFINITIONS ---

// --- START: DONATE MODAL COMPONENT ---
const DonateModal = ({ onClose, onPayNow }: { onClose: () => void; onPayNow: () => void; }) => (
    <div className="fixed inset-0  bg-opacity-50 z-50 flex justify-center items-center backdrop-blur-sm p-4">
      <div className="bg-gray-50 p-8 sm:p-10 rounded-xl shadow-2xl w-full max-w-3xl relative border border-gray-200">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-800 hover:bg-gray-200 rounded-full p-2 transition-colors duration-300"
          aria-label="Close modal"
        >
          <X size={24} />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10">
          {/* Left Side: Bank Details */}
          <div className="md:border-r md:border-gray-200 md:pr-10">
            <h2 className="text-3xl font-bold mb-6 text-gray-800">
              Direct Bank Transfer
              <span className="block h-1 w-16 bg-green-500 mt-2 rounded"></span>
            </h2>
            <div className="space-y-4 text-md">
              <div className="flex justify-between">
                <p className="text-gray-500">Bank:</p>
                <p className="font-semibold text-gray-800">Axis Bank</p>
              </div>
              {/* <div className="flex justify-between">
                <p className="text-gray-500">A/c Name:</p>
                <p className="font-semibold text-gray-800">Rashtriya Manav Hum Sab Ek</p>
              </div> */}
              <div className="flex justify-between">
                <p className="text-gray-500">Account No:</p>
                <p className="font-semibold text-gray-800">921020057959083</p>
              </div>
              <div className="flex justify-between">
                <p className="text-gray-500">IFSC Code:</p>
                <p className="font-semibold text-gray-800">UTIB0003607</p>
              </div>
            </div>
          </div>
          
          <hr className="md:hidden my-8 border-gray-200" />

          {/* Right Side: Pay Online */}
          <div className="flex flex-col justify-center items-center text-center">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">Pay Online Instantly</h3>
            <button
              onClick={onPayNow}
              className="flex items-center justify-center gap-3 bg-green-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-green-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              <CreditCard size={20} />
              Pay with Card / UPI
            </button>
            <p className="text-xs text-gray-400 mt-4">
              You will be redirected to our secure payment gateway.
            </p>
          </div>
        </div>
      </div>
    </div>
);
// --- END: DONATE MODAL COMPONENT ---


const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDonateModalOpen, setIsDonateModalOpen] = useState(false); // State for our custom modal
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;
    document.body.appendChild(script);
    return () => { document.body.removeChild(script); };
  }, []);
  
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 30);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Effect to handle body scroll when any modal or menu is open
  useEffect(() => {
    document.body.style.overflow = isMenuOpen || isDonateModalOpen ? 'hidden' : 'auto';
    return () => { document.body.style.overflow = 'auto'; };
  }, [isMenuOpen, isDonateModalOpen]);

  const isHomePage = pathname === '/';

  const handleNavigation = (sectionId: string) => {
    setIsMenuOpen(false);
    if (isHomePage) {
      document.getElementById(sectionId)?.scrollIntoView({ behavior: 'smooth' });
    } else {
      router.push(`/#${sectionId}`);
    }
  };

  const openRazorpayModal = () => {
    const razorpayKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID;
    if (!razorpayKey) {
      console.error("Razorpay Key ID is not defined.");
      toast.error("Donation service is currently unavailable.");
      return;
    }
    if (!window.Razorpay) {
        console.error("Razorpay script has not loaded yet.");
        toast.error("Donation script is still loading. Please try again.");
        return;
    }

    const options = {
      key: razorpayKey, 
      amount: "35000",
      currency: "INR",
      name: "RMHSE Foundation",
      description: "Donation for a Cause",
      image: "/logo.png",
      handler: (response: RazorpaySuccessResponse) => {
        toast.success(`Payment successful! Payment ID: ${response.razorpay_payment_id}`);
      },
      prefill: { name: "", email: "", contact: "" },
      notes: { address: "Donation to RMHSE Foundation" },
      theme: { color: "#22c55e" },
      modal: { ondismiss: () => console.log("Payment modal was closed.") },
    };

    const rzp = new window.Razorpay(options);
    rzp.open();
  };
  
  // This function is called from the DonateModal
  const handlePayNowClick = () => {
    setIsDonateModalOpen(false); // Close our custom modal first
    openRazorpayModal();      // Then open Razorpay
  };

  const navLinks = [
    { id: "home", label: "Home" },
    { id: "about", label: "About" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-40 w-full bg-white px-4 shadow-sm">
        <nav className='max-w-7xl container flex items-center justify-between p-1 mx-auto px-4'>
          <div className="text-xl font-bold">
            <Link href="/">
              <Image src="/logo.png" width={200} height={200} alt='RMHSE logo' className='w-[80px] md:w-[110px] h-auto' />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-6 ml-auto">
            <ul className='flex gap-12 text-black font-medium text-lg'>
              {navLinks.map((link) => (
                <li key={link.label}>
                  <button onClick={() => handleNavigation(link.id)} className="text-black hover:text-green-600 transition-colors">{link.label}</button>
                </li>
              ))}
            </ul>
            <button
              onClick={() => setIsDonateModalOpen(true)} // Opens our custom modal
              className="ml-4 flex items-center justify-center font-semibold gap-1 bg-yellow-400 text-black rounded-lg px-5 py-2 text-md transition-all border-2 border-yellow-400 shadow-md hover:bg-yellow-500"
            >
              Donate Now
            </button>
            <Link href="/login" className="ml-2 flex items-center justify-center font-semibold gap-1 bg-green-500 text-white rounded-lg px-5 py-2 text-md transition-all border-2 border-green-500 shadow-md hover:bg-green-600">
              Login/Signup <MoveRight size={18} />
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="lg:hidden">
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="text-black" aria-label="Toggle menu">
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </nav>

        {/* Mobile Menu */}
        <div className={`lg:hidden absolute top-full left-0 w-full bg-white overflow-hidden transition-all duration-300 ease-in-out ${isMenuOpen ? 'max-h-screen opacity-100 shadow-lg' : 'max-h-0 opacity-0'}`}>
          <ul className='flex flex-col items-center gap-6 p-8 text-lg'>
            {navLinks.map((link) => (
              <li key={link.id} className='cursor-pointer hover:text-green-600 transition-colors'>
                <button onClick={() => handleNavigation(link.id)}>{link.label}</button>
              </li>
            ))}
          </ul>
          <div className="p-4 border-t border-gray-200 flex flex-col items-center gap-4">
            <button
              onClick={() => {
                setIsMenuOpen(false);
                setIsDonateModalOpen(true); // Opens our custom modal
              }}
              className="w-full flex items-center justify-center gap-1 bg-yellow-400 text-black rounded-md px-4 py-2 text-lg font-semibold border-2 border-yellow-400 shadow-md"
            >
              Donate Now
            </button>
            <Link href="/login" onClick={() => setIsMenuOpen(false)} className="w-full flex items-center justify-center gap-1 bg-green-500 text-white rounded-md px-4 py-2 text-lg font-semibold border-2 border-green-500 shadow-md">
              Login/Signup <MoveRight size={16} strokeWidth={2.5} />
            </Link>
          </div>
        </div>
      </header>
      
      {/* Conditionally render the custom modal */}
      {isDonateModalOpen && <DonateModal onClose={() => setIsDonateModalOpen(false)} onPayNow={handlePayNowClick} />}
    </>
  );
};

export default Header;