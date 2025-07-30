// app/dashboard/withdraw/page.tsx

"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { CheckCircle } from "lucide-react";

// A generic confirmation modal for the approval action
const ConfirmationModal = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
           <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
           <Button type="button" variant="default" onClick={onConfirm}>Confirm Approve</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


// Define a type for a single withdrawal request
type WithdrawRequest = {
  id: string;
  userName: string;
  amount: string;
  requestedAt: string;
  status: 'Pending' | 'Approved';
};

// Sample data for the withdrawal requests table
const sampleWithdrawRequests: WithdrawRequest[] = [
  { id: "WR001", userName: "Alice Johnson", amount: "500.00", requestedAt: "2024-07-28", status: "Pending" },
  { id: "WR002", userName: "Bob Williams", amount: "1200.50", requestedAt: "2024-07-27", status: "Pending" },
  { id: "WR003", userName: "Charlie Brown", amount: "75.25", requestedAt: "2024-07-26", status: "Approved" },
  { id: "WR004", userName: "Diana Miller", amount: "2500.00", requestedAt: "2024-07-25", status: "Pending" },
  { id: "WR005", userName: "Ethan Davis", amount: "300.00", requestedAt: "2024-07-24", status: "Approved" },
];

export default function WithdrawPage() {
  // State for controlling the approval modal
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  
  // State to hold the request being approved
  const [requestToApprove, setRequestToApprove] = useState<WithdrawRequest | null>(null);

  // --- Modal Handling ---
  
  const handleOpenApproveModal = (request: WithdrawRequest) => {
    setRequestToApprove(request);
    setIsApproveModalOpen(true);
  };
  
  // --- Action Handlers (for demonstration) ---
  
  const handleConfirmApprove = () => {
    if (!requestToApprove) return;
    
    console.log(`Approving withdrawal request ID: ${requestToApprove.id} for ₹${requestToApprove.amount}`);
    // In a real app, you would dispatch an action here to update the request status in your backend.
    
    // For demonstration, we'll just log it and close the modal.
    setIsApproveModalOpen(false);
    setRequestToApprove(null);
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Withdraw Payment Requests</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">S.no.</TableHead>
                  <TableHead>User Name</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleWithdrawRequests.map((request, idx) => (
                  <TableRow key={request.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{request.userName}</TableCell>
                    <TableCell>{`₹${request.amount}`}</TableCell>
                    <TableCell>{request.requestedAt}</TableCell>
                    <TableCell>
                      <Badge variant={request.status === 'Approved' ? 'default' : 'secondary'}>
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        size="sm" 
                        variant="default" 
                        onClick={() => handleOpenApproveModal(request)}
                        disabled={request.status === 'Approved'}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Approve
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        open={isApproveModalOpen}
        onOpenChange={setIsApproveModalOpen}
        title="Confirm Approval"
        description={`Are you sure you want to approve the withdrawal of ₹${requestToApprove?.amount} for ${requestToApprove?.userName}?`}
        onConfirm={handleConfirmApprove}
      />
    </div>
  );
}