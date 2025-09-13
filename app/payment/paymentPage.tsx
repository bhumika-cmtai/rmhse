"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
// MODIFICATION 1: Import Redux tools
import { useDispatch } from 'react-redux';
import { setUser } from '@/lib/redux/authSlice'; // Assuming authSlice is here
import { assignRefferer } from '@/lib/userActions';


const PaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  // MODIFICATION 2: Initialize the useDispatch hook
  const dispatch = useDispatch();
  
  const [loading, setLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState(350);

  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handlePayment = async () => {
    setLoading(true);
    const scriptLoaded = await loadRazorpayScript();

    if (!scriptLoaded) {
      toast.error('Razorpay SDK failed to load. Are you online?');
      setLoading(false);
      return;
    }

    try {
      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }),
      });
      
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create order');

      const keyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/razorpay-key`);
      const { keyId } = await keyResponse.json();

      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'RMHSE',
        description: 'Signup Fee',
        order_id: orderData.id,
        handler: async function (response: any) {
          setIsVerifying(true);
          toast.loading('Verifying your payment...');

          try {
            const verificationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/verify`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                userId: userId,
              }),
            });

            const verificationData = await verificationResponse.json();
            
            toast.dismiss();

            if (verificationData.status === 'success') {
              toast.success('Payment successful! Activating your account...');

              const referrerId = await assignRefferer("DIV");
              
              const activationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/activate-user`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: userId,
                  refferedBy: referrerId,
                  status: "active"
                }),
              });

              // MODIFICATION 3: Get the updated user data from the activation response
              const activationData = await activationResponse.json();

              if (!activationResponse.ok) {
                 // Use the error message from the server's response
                 throw new Error(activationData.message || 'Failed to activate your account. Please contact support.');
              }
             
              // MODIFICATION 4: Update the Redux state with the new user data
              // This assumes your API returns the updated user object under a `data` key.
              if (activationData.data) {
                dispatch(setUser(activationData.data));
              }

              // MODIFICATION 5: Redirect to the dashboard
              toast.success('Account activated! Redirecting...');
              router.push('/dashboard/user'); // Only one redirect is needed.

            } else {
              toast.error(verificationData.message || 'Payment verification failed. Please contact support.');
            }
          } catch (err: any) { // Explicitly type 'err' as 'any' to access '.message'
            toast.dismiss();
            // Use the error message from the caught error
            toast.error(err.message || 'An error occurred during verification.');
          } finally {
            setIsVerifying(false);
          }
        },
        prefill: {},
        theme: {
          color: '#3399cc',
        },
      };

      // @ts-ignore
      const paymentObject = new window.Razorpay(options);
      paymentObject.open();

    } catch (error: any) {
      toast.error(error.message || 'An error occurred during payment.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!userId) {
      toast.error('No user ID found. Redirecting to signup.');
      router.push('/signup');
    }
  }, [userId, router]);


  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 relative">
      {isVerifying && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-lg font-semibold text-gray-700">Verifying Payment...</p>
          <p className="text-sm text-gray-500">Please do not refresh or close the page.</p>
        </div>
      )}

      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-800">Complete Your Signup</h1>
          <p className="text-gray-600 mt-2">
            A one-time fee is required to activate your account.
          </p>
        </div>
        
        <div className="text-center p-6 bg-blue-50 rounded-lg">
            <p className="text-lg font-medium text-gray-700">Amount to Pay</p>
            <p className="text-4xl font-bold text-blue-600">
            ₹{paymentAmount != null ? Number(paymentAmount).toFixed(2) : "-"}
            </p>
        </div>

        <Button
          onClick={handlePayment}
          className="w-full py-3 text-lg font-semibold text-white bg-green-500 rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition duration-300"
          disabled={loading || isVerifying || !userId}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              Preparing...
            </>
          ) : (
            'Pay Now'
          )}
        </Button>

        <div className="text-center text-sm text-gray-500">
            <p>You will be redirected after successful payment.</p>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;