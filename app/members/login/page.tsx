"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Lock, Loader2 } from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion } from "framer-motion";
import Image from 'next/image';

// Redux imports
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
// import { loginLeader, selectIsLoading, selectError } from '@/lib/redux/slices/authSlice'; // Adjust path if needed
import { loginLeader, selectIsLoading, selectError } from '@/lib/redux/authSlice';

const Page = () => {
    const router = useRouter();
    // Use AppDispatch for type safety with thunks
    const dispatch: AppDispatch = useDispatch(); 

    // Get loading and error states from the Redux store
    const isLoading = useSelector(selectIsLoading);
    const error = useSelector(selectError);

    // Local state for the form input
    const [password, setPassword] = useState("");
  
    // Effect to show an error toast whenever the error state in Redux changes
    useEffect(() => {
        if (error) {
            toast.error(error);
        }
    }, [error]);


    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault(); 
      if (!password) {
            toast.error("wrong password");
        // toast.error("Password is required.");
        return;
      }
      
      // Dispatch the thunk and wait for it to complete.
      // It will return the user object on success or null on failure.
      const result = await dispatch(loginLeader({ password }));

      // If the result is not null, the login was successful.
      if (result) {
        toast.success("Leader login successful!");
        router.push("/members/dashboard"); // Redirect to the dashboard
      }
      // If result is null, the `useEffect` above will handle showing the error toast.
    };

  return (
    <section
      className="w-full min-h-screen relative flex items-center justify-center px-4 py-8 bg-[#F8FAFF] overflow-hidden"
      id="login"
    >
      <div className="w-full max-w-6xl flex flex-col items-center justify-center relative z-10">
        
        <div className="w-full max-w-md bg-gradient-to-br from-[#F0FAF7]/80 to-[#EFF8FF]/80 backdrop-blur-md rounded-3xl p-8 shadow-2xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-6 text-center">Leader Login</h1>
          <div className="flex justify-center mb-4">
            <Image
              src="/loginImg.png" 
              width={160}
              height={160}
              alt="Leader Login Illustration"
              className="object-contain"
            />
          </div>
          <form onSubmit={handleSubmit} className="space-y-5">
            
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your leader password"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  // The button is now disabled by the isLoading state from Redux
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="pt-2">
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Please wait
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Background blobs remain the same */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.2 }}
        viewport={{ once: true }}
        transition={{ duration: 1.5, ease: "easeInOut" }}
        className="absolute block -right-[100px] top-[60px] lg:-top-[40px] lg:-right-[100px] h-[200px] w-[200px] lg:h-[300px] lg:w-[300px] bg-gradient-to-b from-purple-400 to-pink-200 rounded-full opacity-20"
      ></motion.div>
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 0.2 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: "easeInOut" }}
        className="absolute block top-[260px] -left-[150px] lg:top-[240px] lg:-left-[300px] lg:h-[600px] h-[200px] w-[200px] lg:w-[600px] bg-gradient-to-b from-purple-400 to-pink-200 rounded-full opacity-20"
      ></motion.div>
    </section>
  );
};

export default Page;