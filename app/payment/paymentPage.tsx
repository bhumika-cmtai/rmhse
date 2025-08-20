"use client";

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
// MODIFICATION: Import functions to generate IDs
import { assignRefferer, generateRoleId } from '@/lib/userActions';




const PaymentPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const userId = searchParams.get('userId');
  
  const [loading, setLoading] = useState(false); // For creating the order
  const [isVerifying, setIsVerifying] = useState(false); // --- New state for verification ---
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
      // Step 1: Create the order
      const orderResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/payment/order`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userId }),
      });
      
      const orderData = await orderResponse.json();
      if (!orderResponse.ok) throw new Error(orderData.error || 'Failed to create order');

      // Step 2: Get the Razorpay Key ID
      const keyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/razorpay-key`);
      const { keyId } = await keyResponse.json();

      // Step 3: Configure and open the Razorpay checkout
      const options = {
        key: keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: 'Your Company Name',
        description: 'Signup Fee',
        order_id: orderData.id,
        // --- MODIFICATION: Updated handler function ---
        handler: async function (response: any) {
          setIsVerifying(true); // Start the verification UI state
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
            
            toast.dismiss(); // Dismiss the "Verifying..." toast

            if (verificationData.status === 'success') {
              toast.success('Payment successful! Redirecting...');

              // --- NEW LOGIC AFTER SUCCESSFUL PAYMENT ---
              // 1. Generate the necessary IDs
              // const newRoleId = generateRoleId("MEM");
              // //const joinId = 
              const referrerId = await assignRefferer("DIV");
              // console.log(referrerId)
              // 2. Call the new endpoint to activate the user
              const activationResponse = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/activate-user`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  userId: userId,
                  // roleId: newRoleId,
                  refferedBy: referrerId,
                  status: "active"
                }),
              });

              if (!activationResponse.ok) {
                throw new Error('Failed to activate your account. Please contact support.');
             }
             
             // 3. Redirect to the dashboard
             toast.success('Account activated! Redirecting...');
             router.push('/dashboard/user');


              router.push('/dashboard/user');
            } else {
              toast.error(verificationData.message || 'Payment verification failed. Please contact support.');
            }
          } catch (err) {
            toast.dismiss();
            toast.error('An error occurred during verification.');
          } finally {
            setIsVerifying(false); // Stop the verification UI state
          }
        },
        prefill: {
          // You can prefill user details here if you have them
        },
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
      setLoading(false); // This stops loading once the Razorpay modal opens
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
      {/* --- MODIFICATION: Verification Overlay --- */}
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
          disabled={loading || isVerifying || !userId} // --- Disable button during verification ---
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