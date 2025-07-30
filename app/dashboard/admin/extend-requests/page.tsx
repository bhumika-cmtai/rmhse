// app/dashboard/extend-request/page.tsx

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


// Define a type for a single limit extension request
type ExtendRequest = {
  id: string;
  userName: string;
  limit: string; // The new requested limit
  requestedAt: string;
  status: 'Pending' | 'Approved';
};

// Sample data for the extend limit requests table
const sampleExtendRequests: ExtendRequest[] = [
  { id: "ER001", userName: "Alice Johnson", limit: "50", requestedAt: "2024-07-28", status: "Pending" },
  { id: "ER002", userName: "Bob Williams", limit: "100", requestedAt: "2024-07-27", status: "Approved" },
  { id: "ER003", userName: "Charlie Brown", limit: "75", requestedAt: "2024-07-26", status: "Pending" },
  { id: "ER004", userName: "Diana Miller", limit: "50", requestedAt: "2024-07-25", status: "Pending" },
  { id: "ER005", userName: "Ethan Davis", limit: "200", requestedAt: "2024-07-24", status: "Approved" },
];

export default function ExtendRequestPage() {
  // State for controlling the approval modal
  const [isApproveModalOpen, setIsApproveModalOpen] = useState(false);
  
  // State to hold the request being approved
  const [requestToApprove, setRequestToApprove] = useState<ExtendRequest | null>(null);

  // --- Modal Handling ---
  
  const handleOpenApproveModal = (request: ExtendRequest) => {
    setRequestToApprove(request);
    setIsApproveModalOpen(true);
  };
  
  // --- Action Handlers (for demonstration) ---
  
  const handleConfirmApprove = () => {
    if (!requestToApprove) return;
    
    console.log(`Approving limit extension for request ID: ${requestToApprove.id} to new limit ${requestToApprove.limit}`);
    // In a real app, you would dispatch an action here to update the user's limit and the request status.
    
    // For demonstration, we'll just log it and close the modal.
    setIsApproveModalOpen(false);
    setRequestToApprove(null);
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Extend Limit Requests</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">S.no.</TableHead>
                  <TableHead>User Name</TableHead>
                  <TableHead>New Limit</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleExtendRequests.map((request, idx) => (
                  <TableRow key={request.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{request.userName}</TableCell>
                    <TableCell>{request.limit}</TableCell>
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
        title="Confirm Limit Extension"
        description={`Are you sure you want to approve the limit extension to ${requestToApprove?.limit} for ${requestToApprove?.userName}?`}
        onConfirm={handleConfirmApprove}
      />
    </div>
  );
}