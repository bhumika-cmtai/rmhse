"use client"
import React, { Suspense } from 'react';
import { Loader2 } from 'lucide-react';
import PaymentPage from './paymentPage';
export default function PaymentPageWrapper() {
  return (
    // The Suspense boundary is crucial. It provides a fallback UI
    // while the client-side component (PaymentComponent) is loading.
    <Suspense fallback={<LoadingState />}>
      <PaymentPage />
    </Suspense>
  );
}

// A simple fallback component to show while waiting for the client
const LoadingState = () => (
  <div className="flex h-screen w-full items-center justify-center bg-gray-100">
    <div className="text-center">
        <Loader2 className="mx-auto h-12 w-12 animate-spin text-blue-600" />
        <p className="mt-4 text-lg font-semibold text-gray-700">Loading Payment Gateway...</p>
    </div>
  </div>
);