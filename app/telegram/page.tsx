"use client";
import React, { useState } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import Link from "next/link";
import { toast } from "sonner";
import { selectAppLinksLoading, verifyCredentialsAndGetLink } from "@/lib/redux/appLinkSlice";

import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/store";


const Page = () => {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>(); // <-- Initialize dispatch
  const isLoading = useSelector(selectAppLinksLoading); // <-- Get loading state from Redux

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Password is required.");
      return;
    }

    const credentials = {
      appName: "telegram",
      password: password,
    };
    
    // Dispatch the thunk and wait for its result
    const redirectUrl = await dispatch(verifyCredentialsAndGetLink(credentials));
    
    // If the thunk returned a URL, redirect the user
    if (redirectUrl) {
      router.push(redirectUrl);
    } 
    // Error handling is now done inside the slice, so no 'catch' block is needed here.
  };

  return (
    // FIX: This section is now the full-width container that handles positioning and overflow.
    // The max-width and centering classes have been moved to an inner div.
    <section
      className="w-full relative overflow-hidden" // CHANGED: Simplified classes
      id="get-started"
    >
      {/* FIX: This new div now handles the content centering and max-width. */}
      <div className="max-w-7xl w-full relative z-10 px-4 py-4 mx-auto">
        <div className="w-full flex justify-center min-h-screen ">
          <div className="relative w-full max-w-3xl flex flex-col items-center py-6">
              <Image 
                src="/freelancersIcon.png"
                width={200}
                height={200}
                alt="Auth Image"
                className="mb-4"
              />
            <div className="w-full max-w-lg mx-auto rounded-3xl p-[2px] bg-gradient-to-b from-[#A6F4C5] to-[#B6A7FF]">
              <div className="w-full h-full flex flex-col items-center gap-6 rounded-[22px] bg-white/90 backdrop-blur-sm p-8 ">
                {/* Telegram FORM*/}
                <h1 className="font-bold text-2xl bg-gradient-to-r from-black via-purple-400 to-pink-200 via-60% bg-clip-text text-transparent">Telegram Form: </h1>
                <div className="w-full rounded-2xl p-[1.5px] bg-[linear-gradient(90deg,_#c6ffdd_0%,_#fbd786_50%,_#f7797d_100%)] bg-[length:200%_auto] transition-all duration-500 hover:bg-[position:100%_0] shadow-md hover:shadow-lg">
                  <div className="flex flex-col w-full items-center gap-4 rounded-[14px] bg-white py-10">
                    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
                      {/* Name */}
                      <input 
                       id="name"
                       value={name}
                       onChange={(e) => setName(e.target.value)}
                       required
                       disabled={isLoading}
                       type="text" 
                       placeholder="Your Full Name" 
                       className="border-[1px] border-gray-400 px-3 py-2 rounded-sm"
                      />
                      {/* Phone Number */}
                      <input 
                       id="phoneNumber"
                       value={phoneNumber}
                       onChange={(e) => setPhoneNumber(e.target.value)}
                       required
                       disabled={isLoading}
                       type="text" 
                       placeholder="Your Phone number" 
                       className="border-[1px] border-gray-400 px-3 py-2 rounded-sm"
                      />
                      {/* Password */}
                      <input 
                       id="password"
                       value={password}
                       onChange={(e) => setPassword(e.target.value)}
                       required
                       disabled={isLoading}
                       type="password" 
                       placeholder="Password" 
                       className="border-[1px] border-gray-400 px-3 py-2 rounded-sm"
                      />
                      <div className="w-full mx-auto rounded-3xl p-[2px] bg-gradient-to-b from-[#A6F4C5] to-[#B6A7FF] hover:from-gold-200 hover:to-purple-500 transition-all duration-500">
                          <button className="w-full h-full text-center rounded-[22px] bg-white/90 backdrop-blur-sm px-4 py-1" disabled={isLoading}>
                              {isLoading ? "Submitting..." : "Submit"}
                          </button>
                      </div>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {/* blob for right -  */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 0.2 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, ease: "easeInOut" }}
                  className="absolute block -right-[100px] top-[60px] lg:-top-[40px] lg:-right-[100px] h-[200px] w-[200px] lg:h-[300px] lg:w-[300px] bg-gradient-to-b from-purple-400 to-pink-200 rounded-full opacity-20"
                ></motion.div>
                {/* blob for left -  */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  whileInView={{ scale: 1, opacity: 0.2 }}
                  viewport={{ once: true }}
                  transition={{ duration: 1, ease: "easeInOut" }}
                  className="absolute block top-[260px] -left-[150px] lg:top-[240px] lg:-left-[300px] lg:h-[600px] h-[200px] w-[200px] lg:w-[600px] bg-gradient-to-b from-purple-400 to-pink-200 rounded-full opacity-20"
                ></motion.div>
      </div>
    </section>
  );
};

export default Page;