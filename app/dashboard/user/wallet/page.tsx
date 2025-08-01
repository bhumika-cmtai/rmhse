"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Wallet, Send, Hourglass, CheckCircle, XCircle } from "lucide-react";
import { toast } from "sonner";

// Define the structure for a single withdrawal request
type WithdrawalRequest = {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: Date;
};

// Mock data for existing withdrawal history.
const mockWithdrawals: WithdrawalRequest[] = [
  { id: 'w3', amount: 500.00, status: 'approved', date: new Date(2024, 5, 15) },
  { id: 'w2', amount: 1200.50, status: 'rejected', date: new Date(2024, 6, 2) },
  { id: 'w1', amount: 250.25, status: 'approved', date: new Date(2024, 4, 20) },
];

// A helper component to render the correct status badge with colors
const WithdrawalStatusBadge = ({ status }: { status: WithdrawalRequest['status'] }) => {
  const statusConfig = {
    pending: { variant: "default", icon: <Hourglass className="h-3 w-3" />, label: "Pending" },
    approved: { variant: "success", icon: <CheckCircle className="h-3 w-3" />, label: "Approved" },
    rejected: { variant: "destructive", icon: <XCircle className="h-3 w-3" />, label: "Rejected" },
  };

  const { variant, icon, label } = statusConfig[status];

  return (
    <Badge variant={variant as any} className="gap-1.5">
      {icon}
      {label}
    </Badge>
  );
};

export default function WalletPage() {
  // State for the wallet's total balance
  const [walletBalance, setWalletBalance] = useState(2540.50);
  // State for the user-entered withdrawal amount
  const [withdrawAmount, setWithdrawAmount] = useState("");
  // State for the list of all withdrawal requests
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(mockWithdrawals);

  // Memoize checking if a request is already pending to prevent re-renders
  const hasPendingRequest = useMemo(() => 
    withdrawals.some(req => req.status === 'pending'), 
    [withdrawals]
  );

  // This function handles the new withdrawal request
  const handleWithdrawRequest = () => {
    const amount = parseFloat(withdrawAmount);

    // --- Validation ---
    if (hasPendingRequest) {
      toast.error("You already have a withdrawal request pending.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }
    if (amount > walletBalance) {
      toast.error("Withdrawal amount cannot exceed your current balance.");
      return;
    }

    // --- Create and add the new request ---
    const newRequest: WithdrawalRequest = {
      id: `w${Date.now()}`,
      amount: amount,
      status: 'pending',
      date: new Date(),
    };

    // Add the new request to the top of the list
    setWithdrawals([newRequest, ...withdrawals]);

    // Update balance (optional, you might want to wait for approval)
    // setWalletBalance(prev => prev - amount); 

    toast.success(`Request to withdraw ₹${amount.toFixed(2)} has been sent!`);
    setWithdrawAmount(""); // Clear the input field
  };
  
  // Sort withdrawals by date to show the most recent first
  const sortedWithdrawals = useMemo(() => 
    withdrawals.sort((a, b) => b.date.getTime() - a.date.getTime()), 
    [withdrawals]
  );

  return (
    <div className="w-full mx-auto mt-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Wallet</h1>
      </div>

      {/* Top Half: Balance and Withdraw Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Total Balance Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Balance</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">
              ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              This is your total withdrawable amount.
            </p>
          </CardContent>
        </Card>

        {/* Withdraw Request Card */}
        <Card>
          <CardHeader>
            <CardTitle>Request a Withdrawal</CardTitle>
            <CardDescription>Enter the amount you wish to withdraw.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="number"
                placeholder="e.g., 500.00"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                disabled={hasPendingRequest}
              />
              <Button
                className="w-full sm:w-auto gap-2"
                onClick={handleWithdrawRequest}
                disabled={hasPendingRequest}
              >
                {hasPendingRequest ? (
                  <>
                    <Hourglass className="h-4 w-4" />
                    Request Pending
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Withdraw
                  </>
                )}
              </Button>
            </div>
            {hasPendingRequest && (
                <p className="text-center text-sm text-muted-foreground mt-4">
                    Your latest request is awaiting approval.
                </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Bottom Half: Withdrawal History */}
      <Card>
        <CardHeader>
          <CardTitle>Withdrawal History</CardTitle>
          <CardDescription>A record of all your past withdrawal requests.</CardDescription>
        </CardHeader>
        <CardContent>
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead className="text-right">Amount</TableHead>
                        <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {sortedWithdrawals.length > 0 ? (
                        sortedWithdrawals.map((req) => (
                            <TableRow key={req.id}>
                                <TableCell className="font-medium">{req.date.toLocaleDateString()}</TableCell>
                                <TableCell className="text-right">₹{req.amount.toFixed(2)}</TableCell>
                                <TableCell className="text-center">
                                    <WithdrawalStatusBadge status={req.status} />
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="text-center h-24">
                                You have not made any withdrawal requests yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>
    </div>
  );
}