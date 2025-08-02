"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, User,Lock, Loader2, Calendar, Phone,  } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

// Combined the components into one for a clean, page-level implementation.
const SignupPage = () => {
  const router = useRouter();
  
  // --- All your existing logic is preserved ---
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const users = [
      { email: "admin@gmail.com", password: "admin123", role: "admin" },
      { email: "test@gmail.com", password: "test123", role: "user" },
    ];

    const matchedUser = users.find(
      (u) => u.email === email && u.password === password
    );

    // Using a timeout to simulate network delay
    setTimeout(() => {
      if (matchedUser) {
        toast.success("Successfully logged in!");
        setTimeout(() => {
          if (matchedUser.role === "admin") {
            router.push("/dashboard/admin");
          } else {
            router.push("/dashboard/user");
          }
        }, 1000);
      } else {
        toast.error("Invalid credentials");
        setLoading(false);
      }
    }, 1000);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-100 px-4">
      {/* --- UI has been completely updated to match the image --- */}
      <div className="w-full max-w-md p-8 sm:px-8 space-y-8 bg-gradient-to-br from-yellow-200/40 to-green-200/75 rounded-[20px] shadow-2xl">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-pink-500">Sign up</h1>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* Full Name Input */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-" />
            <Input
              id="name"
              type="text"
              placeholder="Full name"
              className="w-full pl-10 pr-4 py-5 bg-white border-[1px] border-black rounded-[12px]  focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>


          {/* Email Input */}
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800" />
            <Input
              id="email"
              type="email"
              placeholder="example@email.com"
              className="w-full pl-10 pr-4 py-5 bg-white border-[1px] border-black rounded-[12px] shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Birth date Input */}
          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800" />
            <Input
              id="dob"
              type="text"
              placeholder="Birth Date"
              className="w-full pl-10 pr-4 py-5 bg-white border-[1px] border-black rounded-[12px] shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Phone number Input */}
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800" />
            <Input
              id="phoneNumber"
              type="text"
              placeholder="Phone number"
              className="w-full pl-10 pr-4 py-5 bg-white border-[1px] border-black rounded-[12px] shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={loading}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-16 py-5 bg-white border-[1px] border-black rounded-[12px] shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
          
          {/* Confirm Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800" />
            <Input
              id="confirm_password"
              type={showPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-16 py-5 bg-white border-[1px] border-black rounded-[12px] shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={loading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-gray-700"
              disabled={loading}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>

          
          {/* Signup Button */}
          <Button
            type="submit"
            className="w-full py-5 font-semibold text-gray-800 bg-[#FDECB4] rounded-[10px] shadow-lg cursor-pointer hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition duration-300"
            style={{ boxShadow: '0 6px 4px 0 rgba(0, 0, 0, 0.25)' }}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing up...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-800">
            Already have an account?{" "}
            <Link href="/login" className="font-bold text-pink-500 hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;