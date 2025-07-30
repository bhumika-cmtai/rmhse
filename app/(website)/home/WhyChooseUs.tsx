"use client"
import React from 'react';
import { useRef } from "react"
import { motion, useInView } from "framer-motion"
import Image from 'next/image';

const featuresData = [
  { id: 1, icon: "/noInvestmentIcon.png", title: 'NO INVESTMENT REQUIRED', description: 'Unlike Other Sites, We Never Demand Registration Fees Or Money To Work. Your Ability Is Your Investment.' },
  { id: 2, icon: "/workFromHomeIcon.png", title: 'WORK FROM ANYWHERE', description: 'Every Task Is Possible From Your Laptop Or Smartphone With Just An Internet Connection.' },
  { id: 3, icon: "/beginnerFriendlyIcon.png", title: 'BEGINNER FRIENDLY', description: 'No Experience? Don\'t Worry. We Have Simple-To-Learn Tasks And Basic Training Assistance.' },
  { id: 4, icon: "/timeManagement.png", title: 'FLEXIBLE WORKING HOURS', description: 'Work According To Your Own Timetable - Full-Time Or Part-Time.' },
  { id: 5, icon: "/authenticateIcon.png", title: 'AUTHENTIC & VERIFIED WORK', description: 'All Jobs Offered Through Our Site Are From Verified Sources With Transparent Payment Systems.' },
];

const WhyChooseUs: React.FC = () => {
  const topFeatures = featuresData.slice(0, 4);
  const bottomFeature = featuresData[4];
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="min-h-screen relative py-20 max-w-7xl flex items-center" id='whychooseus'>
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-black via-purple-400 via-50% to-75% to-pink-100 bg-clip-text text-transparent">
                WHY CHOOSE US
          </h2>
        </motion.div>

        <div className="flex flex-col lg:flex-row items-center justify-center gap-10 lg:gap-16">
          
          <div className="w-full ">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {topFeatures.map((feature) => (
                <div key={feature.id} className="max-w-[400px] backdrop-blur-sm px-4 py-2 rounded-2xl border border-purple-400 flex items-center space-x-4 shadow-sm hover:shadow-lg transition-shadow duration-300">
                    <div className="flex-shrink-0 w-16 h-16 flex items-center justify-center">
                        <Image 
                          alt={feature.title}
                          src={feature.icon}
                          width={64}
                          height={64}
                        />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-800 tracking-wide">{feature.title}</h3>
                        <p className="text-sm text-gray-600 mt-1">{feature.description}</p>
                    </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col md:flex-row justify-center">
                <div className="max-w-[400px] backdrop-blur-sm px-4 py-2 rounded-2xl border border-purple-400 flex items-center space-x-4 shadow-sm hover:shadow-lg transition-shadow duration-300">
                  <div className="flex-shrink-0 w-16 h-16 flex flex-col items-center justify-center">
                      <Image 
                        alt={bottomFeature.title}
                        src={bottomFeature.icon}
                        width={64}
                        height={64}
                      />
                  </div>
                  <div>
                      <h3 className="text-base font-bold text-gray-800 tracking-wide">{bottomFeature.title}</h3>
                      <p className="text-sm text-gray-600 mt-1">{bottomFeature.description}</p>
                  </div>
              </div>
            </div>
          </div>

          <div className="  mt-10 lg:mt-0">
            <div className="relative max-w-md mx-auto">
              <Image  
                alt='why choose us'
                src="/whychooseus.png"
                width={389}
                height={429}
                className='hidden lg:block w-[240px] lg:w-[400px] h-auto object-contain'
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUs;