// app/dashboard/wallet/page.tsx

"use client";

import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Wallet, Send, CheckCircle } from "lucide-react";
import { toast } from "sonner";

export default function WalletPage() {
  // State to manage the status of the withdrawal request.
  // 'initial': No request sent yet.
  // 'sent': Request has been sent and is pending approval.
  const [requestStatus, setRequestStatus] = useState<'initial' | 'sent'>('initial');
  
  // Mock data for the user's wallet balance.
  // In a real application, this would come from a Redux store or an API call.
  const walletBalance = "2,540.50";

  // This function simulates sending the withdrawal request.
  const handleSendRequest = () => {
    // In a real app, you would dispatch an action to a backend API here.
    // For example: dispatch(sendWithdrawalRequest({ amount: walletBalance }));
    
    console.log(`Withdrawal request sent for amount: ₹${walletBalance}`);

    // Provide immediate feedback to the user.
    toast.success("Withdrawal request sent successfully!");
    
    // Update the state to reflect that the request has been sent.
    setRequestStatus('sent');
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">My Wallet</h1>
      </div>

      <Card className="max-w-md mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto bg-blue-100 rounded-full p-3 w-fit">
            <Wallet className="h-8 w-8 text-blue-600" />
          </div>
          <CardDescription className="pt-2">Current Balance</CardDescription>
          <CardTitle className="text-5xl font-bold tracking-tight">
            ₹{walletBalance}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mt-4">
            <Button
              size="lg"
              className="w-full gap-2"
              onClick={handleSendRequest}
              // Disable the button once the request has been sent.
              disabled={requestStatus === 'sent'}
            >
              {requestStatus === 'initial' ? (
                <>
                  <Send className="h-4 w-4" />
                  Send Withdraw Request
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4" />
                  Waiting for Approval
                </>
              )}
            </Button>
            {requestStatus === 'sent' && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                    Your request has been submitted. You will be notified once it is approved.
                </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}