"use client"
import React from 'react';
import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from 'next/image';

const WhoCanJoin: React.FC = () => {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })
 const usersData = [
    {
        title: "Students",
        icon: "/studentIcon.png",
    },
    {
        title: "Housewives",
        icon: "/housewivesIcon.png",
    },
    {
        title: "Job Seekers",
        icon: "/jobseekersIcon.png",
    },
    {
        title: "Freelancers",
        icon: "/freelancersIcon.png",
    },
    {
        title: "Retired Professionals",
        icon: "/retiredProfessionalIcon.png",
    },
    {
        title: "Anyone Wanting To Earn At Home Without Investing",
        icon: "/anyoneIcon.png",
    }
 ]

  return (
    <section ref={ref} className="min-h-screen w-full py-10 max-w-7xl flex items-center" id='join'>
      <div className="container mx-auto px-4">
          <motion.div
                    initial={{ opacity: 0, y: 50 }}
                    animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-8"
                  >
                    <h2 className="text-4xl md:text-5xl font-bold mb-4 pb-5 bg-gradient-to-r from-black via-purple-400 via-50% to-75% to-pink-100 bg-clip-text text-transparent">
                          WHO CAN JOIN US?
                    </h2>
            </motion.div>
          <p className='text-center font-semibold text-lg text-gray-700 max-w-3xl mx-auto'>
            '' Wherever You're From A Village Or A Metro, We Provide Equal Earning Opportunities To Everyone''
          </p>        
        <div className='mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-12 gap-y-10 justify-items-center'>
            {usersData.map((user)=> (
                <div key={user.title} className='bg-gradient-to-br from-purple-400/40 to-gold-200/70 w-full max-w-[240px] h-[300px] border border-purple-400 rounded-3xl p-6 flex flex-col items-center justify-around shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-[4px] '>
                    <Image 
                        alt={user.title}
                        src={user.icon}
                        width={160}
                        height={160}
                        className="object-contain"
                    />
                    <div className="h-16 flex items-center justify-center">
                      <h3 className='text-black font-bold text-xl text-center'>{user.title}</h3>
                    </div>
                </div>
              ))
            }
        </div> 
      </div>
    </section>
  );
};

export default WhoCanJoin;