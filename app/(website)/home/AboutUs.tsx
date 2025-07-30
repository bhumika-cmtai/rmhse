"use client"
import { useInView } from "framer-motion"
import {motion} from "framer-motion"
import { useRef } from "react"
import Image from "next/image"

export default function AboutUs() {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true })

  return (
    <section ref={ref} className="py-10 md:py-20 relative overflow-hidden" id="aboutus">
      <div className="absolute inset-0 overflow-hidden">
        <motion.div
          animate={{
            rotate: [0, -360],
          }}
          transition={{
            duration: 20,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
          className="absolute bottom-40 right-10 text-purple-200 text-3xl"
        >
          +
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative ">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-10 md:mb-16" 
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className='bg-gradient-to-r from-black to-purple-400 bg-clip-text text-transparent'>ABOUT</span> <span className='bg-gradient-to-r from-purple-400 to-[#ffc6d2] bg-clip-text text-transparent'>US</span>
          </h2>
        </motion.div>

        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-y-10 lg:gap-x-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            whileHover={{ scale: 1.02 }}
          >
            <Image
              src="/aboutus.png"
              alt="About Us Team Illustration"
              width={600}
              height={500}
              className="w-full max-w-md mx-auto lg:max-w-xl h-auto rounded-3xl"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 50 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-center lg:text-left"
          >
            <h4 className="text-xl font-bold mb-4">
              Building a Better Future Through Genuine Work-from-Home Opportunities:
            </h4>
            <p className="text-black leading-relaxed text-base md:text-lg font-medium ">
              They were founded by  <span className="font-semibold text-purple-600">Mr. Gaurav Prajapati</span> and <span className="font-semibold text-purple-600">Ms. Priya Verma</span> who brought with them one vision for this platform — to make income generation easy, secure, and hassle-free for all Indians. Having years of experience combined and a rich insight into digital requirements and job gaps, they built an ecosystem that matches ordinary people to productive and meaningful work.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  )
}