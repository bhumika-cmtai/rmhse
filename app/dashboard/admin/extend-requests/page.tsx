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
import { Edit } from "lucide-react";
import { toast } from "sonner";

// Define a type for a single limit extension request
type ExtendRequest = {
  id: string;
  userName: string;
  limit: string; // The new requested limit
  requestedAt: string;
  status: 'Processing'|'Pending' | 'Approved' | 'Rejected';
  rejectionReason?: string;
};

// Sample data with all possible statuses
const sampleExtendRequests: ExtendRequest[] = [
  { id: "ER001", userName: "Alice Johnson", limit: "50", requestedAt: "2024-07-28", status: "Pending" },
  { id: "ER002", userName: "Bob Williams", limit: "100", requestedAt: "2024-07-27", status: "Approved" },
  { id: "ER003", userName: "Charlie Brown", limit: "75", requestedAt: "2024-07-26", status: "Pending" },
  { id: "ER004", userName: "Diana Miller", limit: "50", requestedAt: "2024-07-25", status: "Rejected", rejectionReason: "Insufficient activity." },
  { id: "ER005", userName: "Ethan Davis", limit: "200", requestedAt: "2024-07-24", status: "Approved" },
];

// --- Edit Request Modal Component (similar to withdraw_requests.tsx) ---
const EditRequestModal = ({
  open,
  onOpenChange,
  request,
  onUpdateRequest,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: ExtendRequest | null;
  onUpdateRequest: (id: string, newStatus: ExtendRequest['status'], reason?: string) => void;
}) => {
  const [newStatus, setNewStatus] = useState<ExtendRequest['status']>('Pending');
  const [reason, setReason] = useState("");

  // Populate the modal's state when a request is selected
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
    // If approving, ensure the reason is cleared.
    const finalReason = newStatus === 'Approved' ? undefined : reason;
    onUpdateRequest(request.id, newStatus, finalReason);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Extend Limit Request</DialogTitle>
          <DialogDescription>
            Manage the request for <span className="font-semibold">{request.userName}</span> for a new limit of <span className="font-semibold">{request.limit}</span>.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            <div className="space-y-2">
                <Label htmlFor="status-select">Status</Label>
                <Select value={newStatus} onValueChange={(value) => setNewStatus(value as ExtendRequest['status'])}>
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

export default function ExtendRequestPage() {
  const [extendRequests, setExtendRequests] = useState<ExtendRequest[]>(sampleExtendRequests);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState<ExtendRequest | null>(null);

  // --- Modal Handling ---
  const handleOpenEditModal = (request: ExtendRequest) => {
    setRequestToEdit(request);
    setIsEditModalOpen(true);
  };
  
  // --- Update Action ---
  const handleUpdateRequest = (id: string, newStatus: ExtendRequest['status'], reason?: string) => {
    setExtendRequests(prev => 
      prev.map(req => 
        req.id === id ? { ...req, status: newStatus, rejectionReason: reason } : req
      )
    );
    
    toast.success(`Request has been updated to "${newStatus}".`);
    setIsEditModalOpen(false);
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
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {extendRequests.map((request, idx) => (
                  <TableRow key={request.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{request.userName}</TableCell>
                    <TableCell>{request.limit}</TableCell>
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
                    <TableCell>
                      {request.status === 'Rejected' && request.rejectionReason && (
                        <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                          {request.rejectionReason}
                        </p>
                      )}
                    </TableCell>
                    <TableCell className="text-center">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleOpenEditModal(request)}
                        disabled={request.status !== 'Pending'}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
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
    </div>
  );
}