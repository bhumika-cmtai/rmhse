"use client"
import React, { useEffect, useRef } from 'react';
import { motion, useInView, animate } from "framer-motion";
import Image from 'next/image';

type CounterProps = {
  from: number;
  to: number;
  plus?: boolean;
};

const Counter: React.FC<CounterProps> = ({ from, to, plus = false }) => {
  const nodeRef = useRef<HTMLParagraphElement>(null);
  const isInView = useInView(nodeRef, { once: true });

  useEffect(() => {
    if (isInView) {
      const node = nodeRef.current;
      if (!node) return;

      const controls = animate(from, to, {
        duration: 2,
        ease: "easeOut",
        onUpdate(value) {
          const formattedValue = new Intl.NumberFormat('en-US').format(Math.round(value));
          node.textContent = formattedValue;
        },
      });

      controls.then(() => {
        if (plus) {
          node.textContent += '+';
        }
      });

      return () => controls.stop();
    }
  }, [from, to, isInView, plus]);

  const initialDisplay = new Intl.NumberFormat('en-US').format(from) + (plus && to > from ? '' : (plus ? '+' : ''));

  return <p ref={nodeRef}>{initialDisplay}</p>;
};


// Main Achievements component
const Achievements: React.FC = () => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  const achievementData = [
    { name: "SERVICES PROVIDED", icon: "/servicesIcon.png", numbers: 939, hasPlus: true },
    { name: "TOTAL SEWAMITRA", icon: "/moneyIcon.png", numbers: 4647, hasPlus: true },
    { name: "TOTAL SERVICES", icon: "/servicesProviderIcon.png", numbers: 3500, hasPlus: true },
    { name: "ALL DISTRICT COVERED", icon: "/indiaMapIcon.png", numbers: 75, hasPlus: false },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2, 
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeInOut" as const,
      },
    },
  };

  return (
    <section 
      ref={ref} 
      className="max-w-7xl py-16 md:py-24 "
      id='achievements'
    >
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-2xl md:text-6xl font-bold uppercase tracking-wider bg-gradient-to-r from-purple-400 to-pink-100 bg-clip-text text-transparent">
            Achievements
          </h2>
        </motion.div>


        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {achievementData.map((item, index) => (
            <motion.div
              key={index}
              className=" backdrop-blur-sm rounded-2xl border border-purple-400 shadow-lg p-6 flex flex-col items-center justify-start text-center h-full"
              variants={itemVariants}
            >
              <div className="h-32 flex items-center">
                <Image
                  src={item.icon}
                  alt={item.name}
                  width={120}
                  height={120}
                  className="object-contain"
                />
              </div>
              
              <div className="text-3xl font-bold text-gray-800 mt-4">
                <Counter from={0} to={item.numbers} plus={item.hasPlus} />
              </div>

              <p className="mt-4 text-sm font-semibold text-gray-500 uppercase tracking-wider">
                {item.name}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default Achievements;