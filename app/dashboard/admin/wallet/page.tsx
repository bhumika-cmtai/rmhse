"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Wallet, Send, Hourglass, CheckCircle, XCircle, Info, Loader2, Loader } from "lucide-react";
import { toast } from "sonner";

import { AppDispatch, RootState } from "@/lib/store";
import { fetchCurrentUser } from "@/lib/redux/authSlice";
import {
  createWithdrawal,
  getWithdrawalsByUserId,
  selectWithdrawals,
  selectWithdrawalLoading,
  selectWithdrawalError,
} from "@/lib/redux/withdrawalSlice";
import { Withdrawal } from "@/lib/redux/withdrawalSlice";

// A helper component to render the correct status badge with colors
const WithdrawalStatusBadge = ({ status }: { status: Withdrawal['status'] }) => {
  const statusConfig = {
    pending: { variant: "default", icon: <Hourglass className="h-3 w-3" />, label: "Pending" },
    processing: { variant: "default", icon: <Loader  className="h-3 w-3" />, label: "Processing" },
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
    request: Withdrawal | null;
  }) => {
    if (!request) return null;
  
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Viewing details for your withdrawal request made on {new Date(request.createdOn).toLocaleDateString()}.
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
                  {request.reason || "No reason provided."}
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
  const dispatch: AppDispatch = useDispatch();
  
  const { user, isLoading: authLoading } = useSelector((state: RootState) => state.auth);
  const withdrawals = useSelector(selectWithdrawals);
  const isLoading = useSelector(selectWithdrawalLoading);
  const error = useSelector(selectWithdrawalError);

  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [requestToShowInfo, setRequestToShowInfo] = useState<Withdrawal | null>(null);

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  useEffect(() => {
    if (user?._id) {
      dispatch(getWithdrawalsByUserId(user._id));
    }
  }, [dispatch, user]);

  const hasPendingRequest = useMemo(() => 
    withdrawals.some(req => req.status === 'pending'), 
    [withdrawals]
  );

  const handleWithdrawRequest = async () => {
    const amount = parseFloat(withdrawAmount);

    // --- All validation checks are performed here first ---

    if (!user?._id) {
        toast.error("Could not identify user. Please refresh and try again.");
        return;
    }
    if (hasPendingRequest) {
      toast.error("You already have a withdrawal request pending.");
      return;
    }
    if (isNaN(amount) || amount <= 0) {
      toast.error("Please enter a valid positive amount.");
      return;
    }
    if (user?.income !== undefined && amount > user.income) {
      toast.error("Withdrawal amount cannot exceed your current balance.");
      return;
    }
    // Check if user has provided either bank details OR a UPI ID
    const hasBankDetails = user.Ifsc && user.account_number && user.upi_id;
    // const hasUpiId = user.upi_id;

    if (!hasBankDetails) {
        toast.error("Please add your bank details or UPI ID in your profile to withdraw.");
        return;
    }
    
    // --- If all checks pass, proceed to dispatch ---

    const result = await dispatch(createWithdrawal({ userId: user._id, amount }));

    if (result) {
        toast.success(`Request to withdraw ₹${amount.toFixed(2)} has been sent!`);
        setWithdrawAmount("");
    } else if (error) {
        toast.error(error);
    }
  };
  
  const handleOpenInfoModal = (request: Withdrawal) => {
    setRequestToShowInfo(request);
    setIsInfoModalOpen(true);
  };

  const sortedWithdrawals = useMemo(() => 
    [...withdrawals].sort((a, b) => b.createdOn - a.createdOn), 
    [withdrawals]
  );

  const formatDate = (timestamp: string | number) => {
    if (!timestamp) return 'N/A';
    const numericTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    if (isNaN(numericTimestamp)) return 'Invalid Date';
    return new Date(numericTimestamp).toLocaleDateString('en-IN');
};

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
            {authLoading ? (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            ) : (
                <div className="text-4xl font-bold">
                ₹{(user?.income ?? 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
            )}
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
                disabled={hasPendingRequest || isLoading}
              />
              <Button
                className="w-full sm:w-auto gap-2"
                onClick={handleWithdrawRequest}
                disabled={hasPendingRequest || isLoading}
              >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : hasPendingRequest ? (
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
                    {isLoading && sortedWithdrawals.length === 0 ? (
                        <TableRow>
                            <TableCell colSpan={4} className="text-center h-24">
                                <Loader2 className="mx-auto h-6 w-6 animate-spin" />
                            </TableCell>
                        </TableRow>
                    ) : sortedWithdrawals.length > 0 ? (
                        sortedWithdrawals.map((req) => (
                            <TableRow key={req._id}>
                                <TableCell className="font-medium">{formatDate(req.createdOn)}</TableCell>
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