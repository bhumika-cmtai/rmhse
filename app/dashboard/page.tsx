"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { Loader2 } from 'lucide-react';

export default function DashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading } = useSelector((state: RootState) => state.auth);

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated || !user) {
        // If not authenticated, redirect to login
        router.push('/login');
        return;
      }

      // Redirect based on user role
      if (user.role === 'admin') {
        console.log("dashboard page admin")
        router.push('/dashboard/admin');
      } else if (user.role === 'user') {
        console.log("dashboard page user")
        router.push('/dashboard/user');
      } else {
        console.log("dashboard page unknown")
        // Fallback for unknown roles
        router.push('/login');
      }
    }
  }, [user, isAuthenticated, isLoading, router]);

  // Show loading while determining redirect
  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-100">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-pink-500" />
        {/* <p className="text-gray-600">Redirecting to dashboard...</p> */}
      </div>
    </div>
  );
} 