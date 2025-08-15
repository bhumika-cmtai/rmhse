"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, User,Lock, Loader2, Calendar, Phone,  } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { signup } from "@/lib/redux/authSlice";
import { RootState } from "@/lib/store";
import { generateRoleId,assignRefferer } from '@/lib/userActions';

const SignupPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { isLoading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    fatherName: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    dob: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      toast.success("Successfully signed up! Redirecting...");
      router.push(`/upload-details`);
    }
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

   const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.password || !formData.phoneNumber) {
      toast.error("Please fill in all required fields");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    try {
      // const referrerId = await assignRefferer();
      // const newMemberId = generateMemberId();

      const signupData = {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        phoneNumber: formData.phoneNumber,
        fatherName: formData.fatherName,
        dob: formData.dob || undefined,
        status: "block"
        // memberId: newMemberId,
        // refferedBy: referrerId,
      };
      
      // await dispatch(signup(signupData) as any);

      const result = await dispatch(signup(signupData) as any);

      // If the thunk is successful, it will return an object with a 'redirect' path
      if (result && result.redirect) {
        const { redirect,responseUser } = result;
        // console.log("---result---",result)
        // Provide context-specific feedback to the user before redirecting
        // console.log("----redirect----", redirect)
        if (redirect === '/upload-details') {
          toast.success("Account created! Please complete your details.");
        } else if (redirect === '/payment') {
          // console.log("we hit the /paymetn redirect")
          if (responseUser._id) {
            // console.log("found usr id redirecting to payment page")
            toast.info("Welcome back! Please complete your payment to proceed.");
            router.push(`/payment?userId=${responseUser._id}`);
          }
        } else {
          toast.success("Success! Redirecting...");
        }

        // Programmatically navigate the user to the next step
        // router.push(redirect);
      }

    } catch (err: any) {
      toast.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-100 px-4">
      <div className="w-full max-w-md p-8 sm:px-8 space-y-8 bg-gradient-to-br from-yellow-200/40 to-green-200/75 rounded-[20px] shadow-2xl">
        
        <div className="text-center">
          <h1 className="text-4xl font-bold text-pink-500">Sign up</h1>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit}>
          
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800" />
            <Input
              id="name"
              name="name"
              type="text"
              placeholder="Full name"
              className="w-full pl-10 pr-4 py-5 bg-white border-[1px] border-black rounded-[12px]  focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={formData.name}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800" />
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              className="w-full pl-10 pr-4 py-5 bg-white border-[1px] border-black rounded-[12px] shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={formData.email}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800" />
            <Input
              id="dob"
              name="dob"
              type="date"
              placeholder="Birth Date"
              className="w-full pl-10 pr-4 py-5 bg-white border-[1px] border-black rounded-[12px] shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={formData.dob}
              onChange={handleInputChange}
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800" />
            <Input
              id="phoneNumber"
              name="phoneNumber"
              type="tel"
              placeholder="Phone number"
              className="w-full pl-10 pr-4 py-5 bg-white border-[1px] border-black rounded-[12px] shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={formData.phoneNumber}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800" />
            <Input
              id="fatherName"
              name="fatherName"
              type="text"
              placeholder="Father Name"
              className="w-full pl-10 pr-4 py-5 bg-white border-[1px] border-black rounded-[12px] shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={formData.fatherName}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
          </div>

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800" />
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="w-full pl-10 pr-16 py-5 bg-white border-[1px] border-black rounded-[12px] shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={formData.password}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
          
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-800" />
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              className="w-full pl-10 pr-16 py-5 bg-white border-[1px] border-black rounded-[12px] shadow-md focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-500 hover:text-gray-700"
              disabled={isLoading}
            >
              {showConfirmPassword ? "HIDE" : "SHOW"}
            </button>
          </div>
          
          <Button
            type="submit"
            className="w-full py-5 font-semibold text-gray-800 bg-[#FDECB4] rounded-[10px] shadow-lg cursor-pointer hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition duration-300"
            style={{ boxShadow: '0 6px 4px 0 rgba(0, 0, 0, 0.25)' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing up...
              </>
            ) : (
              "Sign Up"
            )}
          </Button>
        </form>

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