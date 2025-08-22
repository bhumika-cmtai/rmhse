"use client";

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { User, Lock, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
import { login } from "@/lib/redux/authSlice";
import { RootState } from "@/lib/store";

const LoginPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  
  const { isLoading, error, isAuthenticated, user } = useSelector((state: RootState) => state.auth);
  
  // --- MODIFICATION START ---
  const [joinId, setJoinId] = useState(""); // Changed email state to joinId
  // --- MODIFICATION END ---
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // Handle authentication state changes
  useEffect(() => {
    if (isAuthenticated && user) {
      // toast.success("Successfully logged in!");
      // console.log("isAuthenticated", isAuthenticated)
      // console.log("user", user)
      // console.log(user)
      // console.log(user, "user")
      // console.log(isAuthenticated, "isAuthenticated")
      
      // Use replace instead of push to prevent back navigation to login
      if (user.role === 'admin') {
        // console.log("redirecting to admin dashboard")
        router.push('/dashboard/admin');
      } else if (user.role) {
        console.log("redirecting to user dashboard")
        router.push('/dashboard/user');
      } else {
        // console.log("unknown role, redirecting to dashboard")
        router.push('/login');
      }
    }
  }, [isAuthenticated, user, router]);

  // Handle error display
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
  // --- MODIFICATION START ---
  if (!joinId || !password) {
    toast.error("Please fill in all fields");
    return;
  }
  // Dispatch with joinId instead of email
  const result = await dispatch(login({ joinId, password, rememberMe }) as any);
  // --- MODIFICATION END ---
  
  if (!result) {
    // Error is already handled by the slice
    return;
  }
    
    // console.log("Login successful, result:", result);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-100 px-4">
      <div className="w-full max-w-sm p-8 sm:py-8 sm:px-8 space-y-8 bg-gradient-to-br from-yellow-200/40 to-green-200/75 rounded-[20px] shadow-lg">
        
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-pink-500">Login</h1>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          
          {/* Email Input */}
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="email"
              type="text"
              placeholder="RMHSE****"
              className="w-full pl-10 pr-4 py-5 bg-white border-[1px] border-black rounded-[12px] focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={joinId}
              onChange={(e) => setJoinId(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          {/* Password Input */}
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              placeholder="**********"
              className="w-full pl-10 pr-16 py-5 bg-white border-[1px] border-black rounded-[12px] focus:outline-none focus:ring-2 focus:ring-purple-400 transition"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
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

          {/* Remember Me Checkbox */}
          <div className="flex items-center">
            <input
              id="remember-me"
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="h-4 w-4 text-pink-500 focus:ring-pink-400 border-gray-300 rounded"
              disabled={isLoading}
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-800">
              Remember me
            </label>
          </div>
          
          {/* Login Button */}
          <Button
            type="submit"
            className="w-full py-5 font-semibold text-gray-800 bg-[#FDECB4] rounded-[10px] cursor-pointer  hover:bg-yellow-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-400 transition duration-300"
            style={{ boxShadow: '0 6px 4px 0 rgba(0, 0, 0, 0.25)' }}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Logging in...
              </>
            ) : (
              "Login"
            )}
          </Button>
        </form>

        {/* Sign Up Link */}
        <div className="text-center">
          <p className="text-sm text-gray-800">
            Don't have an account?{" "}
            <Link href="/signup" className="font-bold text-pink-500 hover:underline">
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;