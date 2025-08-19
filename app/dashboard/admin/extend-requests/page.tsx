// extend-request/page.tsx

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
import { Edit, Info, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { 
  getAllExtends, 
  updateExtend, 
  selectExtends, 
  selectExtendLoading, 
  selectExtendError,
  Extend 
} from "@/lib/redux/extendSlice";
import { AppDispatch, RootState } from "@/lib/store";

// Edit Request Modal Component
const EditRequestModal = ({
  open,
  onOpenChange,
  request,
  onUpdateRequest,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: Extend | null;
  onUpdateRequest: (id: string, newStatus: string, reason?: string) => void;
}) => {
  const [newStatus, setNewStatus] = useState<string>('pending');
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (request) {
      setNewStatus(request.status);
      setReason(request.reason || "");
    }
  }, [request]);

  if (!request) return null;

  const isRejecting = newStatus === 'rejected';
  const isSubmitDisabled = isRejecting && !reason.trim();

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const finalReason = newStatus === 'approved' ? undefined : reason;
      await onUpdateRequest(request._id, newStatus, finalReason);
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update request");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Update Extend Limit Request</DialogTitle>
          <DialogDescription>
            Manage the extension request for user ID <span className="font-semibold">{request.userId?.name || 'N/A'}</span>.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status-select">Status</Label>
            <Select value={newStatus} onValueChange={(value) => setNewStatus(value)}>
              <SelectTrigger id="status-select">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
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
            <Button type="button" variant="outline" disabled={loading}>
              Cancel
            </Button>
          </DialogClose>
          <Button type="button" onClick={handleSubmit} disabled={isSubmitDisabled || loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating...
              </>
            ) : (
              "Update Request"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// Request Info Modal Component
const RequestInfoModal = ({
  open,
  onOpenChange,
  request,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: Extend | null;
}) => {
  if (!request) return null;

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Request Details</DialogTitle>
          <DialogDescription>
            Viewing details for extension request.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>User Name</Label>
            <p className="text-lg font-semibold">{request.userId?.name || 'User not available'}</p>
          </div>
          
          <div className="space-y-2">
            <Label>Status</Label>
            <div>
              <Badge
                variant={
                  request.status === 'approved' ? 'default' :
                  request.status === 'rejected' ? 'destructive' : 'secondary'
                }
              >
                {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
              </Badge>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Requested At</Label>
            <p className="text-sm">{formatDate(request.createdOn)}</p>
          </div>

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

export default function ExtendRequestPage() {
  const dispatch = useDispatch<AppDispatch>();
  const extendRequests = useSelector(selectExtends);
  const loading = useSelector(selectExtendLoading);
  const error = useSelector(selectExtendError);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [requestToEdit, setRequestToEdit] = useState<Extend | null>(null);

  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [requestToShowInfo, setRequestToShowInfo] = useState<Extend | null>(null);

  // Fetch extension requests on component mount
  useEffect(() => {
    dispatch(getAllExtends());
  }, [dispatch]);
  // console.log(extendRequests)
  // Handle error display
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleOpenEditModal = (request: Extend) => {
    setRequestToEdit(request);
    setIsEditModalOpen(true);
  };

  const handleOpenInfoModal = (request: Extend) => {
    setRequestToShowInfo(request);
    setIsInfoModalOpen(true);
  };
  
  const handleUpdateRequest = async (id: string, newStatus: string, reason?: string) => {
    try {
      const result = await dispatch(updateExtend(id, { status: newStatus, reason }) as any);
      if (result) {
        toast.success(`Request has been updated to "${newStatus}".`);
        // Refresh the extension requests list
        dispatch(getAllExtends());
      }
    } catch (error) {
      toast.error("Failed to update request");
    }
  };

  const formatDate = (timestamp: string | number) => {
    if (!timestamp) return 'N/A';
    // Ensure the timestamp is a number before creating a Date
    const numericTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    if (isNaN(numericTimestamp)) {
        return "Invalid Date";
    }
    return new Date(numericTimestamp).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
                  <TableHead>Limit</TableHead>
                  <TableHead>Requested At</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading extension requests...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : extendRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      No extension requests found.
                    </TableCell>
                  </TableRow>
                ) : (
                  extendRequests.map((request, idx) => (
                    <TableRow key={request._id}>
                      <TableCell>{idx + 1}</TableCell>
                      <TableCell className="font-medium">
                        {request.userId ? request.userId.name : 'User not available'}
                      </TableCell>
                      <TableCell>{request.limit}</TableCell>
                      <TableCell>{formatDate(request.createdOn)}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            request.status === 'approved' ? 'default' : 
                            request.status === 'rejected' ? 'destructive' : 'secondary'
                          }
                        >
                          {request.status.charAt(0).toUpperCase() + request.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleOpenEditModal(request)}
                            disabled={(request.status !== 'pending' && request.status !== 'processing') || !request.userId}
                            title="Edit Request"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleOpenInfoModal(request)}
                            title="View Details"
                          >
                            <Info className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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