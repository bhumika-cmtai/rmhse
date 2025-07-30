'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useDispatch, useSelector } from 'react-redux';
import { addContact, selectLoading, selectError } from '@/lib/redux/contactSlice';
import { AppDispatch } from '@/lib/store';
import { toast } from 'sonner';

const ContactInfoItem = ({ icon, title, children }: { icon: string, title: string, children: React.ReactNode }) => (
    <div className="flex items-center gap-4">
    <div className=" p-3 rounded-full">
        <Image 
        alt={title}
        width={36}
        height={36}
        src={icon}
        /> 
    </div>
    <div>
      <p className="font-semibold text-gray-700">{title}</p>
      <div className="text-gray-600">{children}</div>
    </div>
  </div>
);


const ContactUs = () => {
  const dispatch = useDispatch<AppDispatch>();
  const loading = useSelector(selectLoading);
  const errorFromStore = useSelector(selectError);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    message: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  // CORRECTED handleSubmit function using toast.promise
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.phoneNumber || !formData.message) {
      toast.error('Please fill out all fields.');
      return;
    }

    // Use toast.promise to handle the entire async lifecycle
    toast.promise(dispatch(addContact(formData)), {
      loading: 'Sending your message...',
      success: () => {
        // This block runs only if the promise resolves
        setFormData({ name: '', email: '', phoneNumber: '', message: '' });
        return 'Message sent successfully! We will get back to you soon.';
      },
      error: () => {
        // This block runs if the promise rejects
        return errorFromStore || 'Failed to send message. Please try again.';
      },
    });
  };

  return (
    <section className="relative w-full py-10 overflow-hidden" id="contactus">
      {/* Background Emblem Image */}
      <div className="absolute inset-0 flex items-center justify-center  mt-20">
        <Image
          src="/govtOfIndiaIcon.png" 
          alt="Government Emblem"
          width={600}
          height={600}
          className="ld:w-[900px] object-contain opacity-10"
        />
      </div>

      <div className="container mx-auto px-4 relative">
        {/* Main Title */}
        <div className="text-center mb-12 md:mb-16">
          <h1 className="text-4xl md:text-5xl font-bold uppercase bg-gradient-to-r from-black via-purple-400 via-60% to-pink-200 bg-clip-text text-transparent">
            Contact Us
          </h1>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-center gap-12 lg:gap-24">
          
          {/* Left Side: Contact Info */}
          <div className="w-full md:w-1/2 max-w-lg">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-4">
              Get In Touch With Us
            </h2>
            <p className="text-gray-600 leading-relaxed mb-8">
              We Believe In Empowering Individuals By Providing Genuine Work-From-Home Opportunities That Are Simple, Flexible, And Rewarding. Our Primary Focus Is On Account Opening Form-Filling Jobs, Where Individuals Can Earn From The Comfort Of Their Homes—No Investment, No Targets, And No Prior Experience Required.
            </p>

            <div className="space-y-6 mb-8">
              <ContactInfoItem
                title="Our Location"
                icon="/locationImg.png"
              >
                226010, Gomti Nagar Lucknow, Uttar Pradesh, India
              </ContactInfoItem>
              {/* <ContactInfoItem
                title="Phone Number"
                icon="/phoneImg.png"
              >
                <React.Fragment>
                  <div><span className='font-medium text-gray-600 '>Gaurav prajapati</span>:  +91 7318368107</div>
                  <div><span className='font-medium text-gray-600 '>Priya Verma</span>:  +91 8708718542</div>
                </React.Fragment>
              </ContactInfoItem> */}
               <ContactInfoItem
                title="Email Address"
                icon="/mailImg.png"
              >
                <Link href="mailto:officialgrowup01@gmail.com">officialgrowup01@gmail.com</Link>
              </ContactInfoItem>
            </div>
            
            {/* Social Icons */}
            <div className="flex items-center gap-4 mt-10">
              <a href="https://www.instagram.com/indiagrowup__?igsh=Ymttb3FoZGh1Zm1u" className=" rounded-lg">
                <Image src="/instagram.png" alt="Instagram" width={24} height={24} />
              </a>
              <a href="https://youtube.com/@growup_india_01?feature=shared" className=" rounded-lg ">
                <Image src="/youtube.png" alt="youTube" width={24} height={24} />
              </a>
              <a href="https://x.com/GrowUp_india_?t=ynPhvGl3FYJDB-2QJmzxiQ&s=09" className=" rounded-lg">
                <Image src="/twitter.png" alt="Twitter" width={24} height={24} />
              </a>
              <a href="https://www.linkedin.com/in/rmhse-a25b69294?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app" className=" rounded-lg">
                <Image src="/linkedin.png" alt="LinkedIn" width={24} height={24} />
              </a>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="w-full md:w-1/2 max-w-md">
            <div className="bg-green-200/40 backdrop-blur-sm border-2 border-purple-300 rounded-2xl p-8 shadow-lg">
              <form onSubmit={handleSubmit}>
                <div className="mb-5">
                  <input 
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="YOUR NAME"
                    className="w-full bg-white rounded-lg p-3 text-sm placeholder:text-gray-500 placeholder:uppercase placeholder:text-xs placeholder:tracking-wider focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div className="mb-5">
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="YOUR EMAIL"
                    className="w-full bg-white rounded-lg p-3 text-sm placeholder:text-gray-500 placeholder:uppercase placeholder:text-xs placeholder:tracking-wider focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div className="mb-5">
                  <input 
                    type="tel"
                    name="phoneNumber"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    placeholder="YOUR PHONE NUMBER"
                    className="w-full bg-white rounded-lg p-3 text-sm placeholder:text-gray-500 placeholder:uppercase placeholder:text-xs placeholder:tracking-wider focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  />
                </div>
                <div className="mb-6">
                  <textarea 
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="YOUR MESSAGE"
                    rows={4}
                    className="w-full bg-white rounded-lg p-3 text-sm placeholder:text-gray-500 placeholder:uppercase placeholder:text-xs placeholder:tracking-wider focus:outline-none focus:ring-2 focus:ring-yellow-400"
                  ></textarea>
                </div>
                <div className='bg-gradient-to-r from-green-300 to-gold-200 p-1 rounded-lg'>
                    <button 
                    type="submit"
                    disabled={loading}
                    className="w-full bg-white rounded-lg p-3 font-bold tracking-wider text-gray-600 text-lg hover:cursor-pointer hover:bg-sea-green-100/90 transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                    {loading ? 'Sending...' : 'Send Message'}
                    </button>
                 </div>
              </form>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
};

export default ContactUs;