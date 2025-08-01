"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Edit, Info } from "lucide-react";
import { toast } from "sonner";

// Define a type for a single withdrawal request with updated fields
type WithdrawRequest = {
  id: string;
  userName: string;
  amount: string;
  requestedAt: string;
  status: 'Processing' | 'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string; // Optional field for the reason
};

// Sample data with all possible statuses and a rejection reason
const sampleWithdrawRequests: WithdrawRequest[] = [
  { id: "WR001", userName: "Alice Johnson", amount: "500.00", requestedAt: "2024-07-28", status: "Pending" },
  { id: "WR002", userName: "Bob Williams", amount: "1200.50", requestedAt: "2024-07-27", status: "Pending" },
  { id: "WR003", userName: "Charlie Brown", amount: "75.25", requestedAt: "2024-07-26", status: "Approved" },
  { id: "WR004", userName: "Diana Miller", amount: "2500.00", requestedAt: "2024-07-25", status: "Rejected", rejectionReason: "User account is currently under a standard security review. Please try again in 24-48 hours." },
  { id: "WR005", userName: "Ethan Davis", amount: "300.00", requestedAt: "2024-07-24", status: "Approved" },
  { id: "WR006", userName: "Fiona White", amount: "850.00", requestedAt: "2024-07-23", status: "Rejected", rejectionReason: "Insufficient account activity to process withdrawal." },
];

// --- Edit Request Modal Component ---
const EditRequestModal = ({
  open,
  onOpenChange,
  request,
  onUpdateRequest,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: WithdrawRequest | null;
  onUpdateRequest: (id: string, newStatus: WithdrawRequest['status'], reason?: string) => void;
}) => {
  const [newStatus, setNewStatus] = useState<WithdrawRequest['status']>('Pending');
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (request) {
      setNewStatus(request.status);
      setReason(request.rejectionReason || "");
    }
  }, [request]);

  if (!request) return null;

  const isRejecting = newStatus === 'Rejected';
  const isSubmitDisabled = isRejecting && !reason.trim();

  const handleSubmit = () => {
    const finalReason = newStatus === 'Approved' ? undefined : reason;
    onUpdateRequest(request.id, newStatus, finalReason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Withdrawal Request</DialogTitle>
          <DialogDescription>
            Manage the request for <span className="font-semibold">{request.userName}</span> of <span className="font-semibold">₹{request.amount}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status-select">Status</Label>
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value as WithdrawRequest['status'])}>
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Pending">Pending</SelectItem>
                <SelectItem value="Approved">Approved</SelectItem>
                <SelectItem value="Rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isRejecting && (
            <div className="space-y-2">
              <Label htmlFor="rejection-reason">Reason for Rejection</Label>
              <Textarea
                id="rejection-reason"
                placeholder="Provide a clear reason..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
              />
            </div>
          )}
        </div>
        <DialogFooter className="sm:justify-end gap-2">
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancel</Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitDisabled}>
            Update Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- Request Info Modal Component (Updated) ---
const RequestInfoModal = ({
  open,
  onOpenChange,
  request,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: WithdrawRequest | null;
}) => {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>
            Viewing details for the request from <span className="font-semibold">{request.userName}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {/* Status Section (Always shows) */}
          <div className="space-y-2">
            <Label>Status</Label>
            <div>
              <Badge
                variant={
                  request.status === 'Approved' ? 'default' :
                  request.status === 'Rejected' ? 'destructive' : 'secondary'
                }
              >
                {request.status}
              </Badge>
            </div>
          </div>

          {/* Reason Section (Only shows if rejected) */}
          {request.status === 'Rejected' && (
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


export default function WithdrawPage() {
  const [withdrawals, setWithdrawals] = useState<WithdrawRequest[]>(sampleWithdrawRequests);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState<WithdrawRequest | null>(null);
  
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [requestToShowInfo, setRequestToShowInfo] = useState<WithdrawRequest | null>(null);

  const handleOpenEditModal = (request: WithdrawRequest) => {
    setRequestToEdit(request);
    setIsEditModalOpen(true);
  };

  const handleOpenInfoModal = (request: WithdrawRequest) => {
    setRequestToShowInfo(request);
    setIsInfoModalOpen(true);
  };

  const handleUpdateRequest = (id: string, newStatus: WithdrawRequest['status'], reason?: string) => {
    setWithdrawals(prev =>
      prev.map(req =>
        req.id === id ? { ...req, status: newStatus, rejectionReason: newStatus === 'Rejected' ? reason : undefined } : req
      )
    );
    toast.success(`Request has been updated to "${newStatus}".`);
    setIsEditModalOpen(false);
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Withdrawal Requests</h1>
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
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {withdrawals.map((request, idx) => (
                  <TableRow key={request.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{request.userName}</TableCell>
                    <TableCell>{`₹${request.amount}`}</TableCell>
                    <TableCell>{request.requestedAt}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          request.status === 'Approved' ? 'default' :
                          request.status === 'Rejected' ? 'destructive' : 'secondary'
                        }
                      >
                        {request.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex items-center justify-center gap-2">
                        {/* Edit Button (Disabled if not pending) */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenEditModal(request)}
                          disabled={request.status !== 'Pending'}
                          title="Edit Request"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        {/* Info Button (Always shows) */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleOpenInfoModal(request)}
                          title="View Details"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Request Modal */}
      <EditRequestModal
        open={isEditModalOpen}
        onOpenChange={setIsEditModalOpen}
        request={requestToEdit}
        onUpdateRequest={handleUpdateRequest}
      />

      {/* Request Info Modal */}
      <RequestInfoModal
        open={isInfoModalOpen}
        onOpenChange={setIsInfoModalOpen}
        request={requestToShowInfo}
      />
    </div>
  );
}