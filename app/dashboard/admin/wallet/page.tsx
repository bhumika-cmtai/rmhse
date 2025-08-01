"use client";

import React, { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Wallet, Send, Hourglass, CheckCircle, XCircle, Info } from "lucide-react";
import { toast } from "sonner";

// Define the structure for a single withdrawal request
type WithdrawalRequest = {
  id: string;
  amount: number;
  status: 'pending' | 'approved' | 'rejected';
  date: Date;
  rejectionReason?: string; // Optional field for the reason
};

// Mock data for existing withdrawal history with a rejection reason
const mockWithdrawals: WithdrawalRequest[] = [
  { id: 'w3', amount: 500.00, status: 'approved', date: new Date(2024, 5, 15) },
  { id: 'w2', amount: 1200.50, status: 'rejected', date: new Date(2024, 6, 2), rejectionReason: "Invalid bank details provided. Please update your payment information." },
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

// --- Request Info Modal Component ---
const RequestInfoModal = ({
    open,
    onOpenChange,
    request,
  }: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    request: WithdrawalRequest | null;
  }) => {
    if (!request) return null;
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Viewing details for your withdrawal request made on {request.date.toLocaleDateString()}.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {/* Status Section (Always shows) */}
            <div className="space-y-2">
              <Label>Status</Label>
              <div>
                <WithdrawalStatusBadge status={request.status} />
              </div>
            </div>
  
            {/* Reason Section (Only shows if rejected) */}
            {request.status === 'rejected' && (
              <div className="space-y-2">
                <Label>Reason for Rejection</Label>
                <p className="text-sm font-medium p-3 bg-muted rounded-md border">
                  {request.rejectionReason || "No reason provided."}
                </p>
              </div>
            )}
          </div>
          <DialogFooter className="sm:justify-end">
            <DialogClose asChild>
              <Button type="button">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

export default function WalletPage() {
  const [walletBalance, setWalletBalance] = useState(2540.50);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>(mockWithdrawals);
  
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [requestToShowInfo, setRequestToShowInfo] = useState<WithdrawalRequest | null>(null);

  const hasPendingRequest = useMemo(() => 
    withdrawals.some(req => req.status === 'pending'), 
    [withdrawals]
  );

  const handleWithdrawRequest = () => {
    const amount = parseFloat(withdrawAmount);

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

    const newRequest: WithdrawalRequest = {
      id: `w${Date.now()}`,
      amount: amount,
      status: 'pending',
      date: new Date(),
    };

    setWithdrawals([newRequest, ...withdrawals]);
    toast.success(`Request to withdraw ₹${amount.toFixed(2)} has been sent!`);
    setWithdrawAmount("");
  };
  
  const handleOpenInfoModal = (request: WithdrawalRequest) => {
    setRequestToShowInfo(request);
    setIsInfoModalOpen(true);
  };

  const sortedWithdrawals = useMemo(() => 
    withdrawals.sort((a, b) => b.date.getTime() - a.date.getTime()), 
    [withdrawals]
  );

  return (
    <div className="w-full mx-auto mt-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Wallet</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
                        <TableHead className="text-center">Action</TableHead>
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
                                <TableCell className="text-center">
                                    <Button
                                      size="icon"
                                      variant="outline"
                                      onClick={() => handleOpenInfoModal(req)}
                                      title="View Details"
                                    >
                                      <Info className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                                You have not made any withdrawal requests yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* Request Info Modal */}
      <RequestInfoModal
        open={isInfoModalOpen}
        onOpenChange={setIsInfoModalOpen}
        request={requestToShowInfo}
      />
    </div>
  );
}