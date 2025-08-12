"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter as DialogModalFooter,
  DialogClose
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  ArrowUpCircle,
  Hourglass,
  CheckCircle,
  XCircle,
  Info,
  Loader2,
  Loader
} from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { 
  createExtend, 
  getExtendsByUserId, 
  selectExtends, 
  selectExtendLoading, 
  selectExtendError,
  Extend 
} from "@/lib/redux/extendSlice";
// Assuming fetchCurrentUser is in your authSlice
import { selectUser, fetchCurrentUser } from "@/lib/redux/authSlice";
import { AppDispatch, RootState } from "@/lib/store";

// Status Badge Component (no changes)
const StatusBadge = ({
  status
}: {
  status: string;
}) => {
  const config = {
    pending: {
      variant: "secondary", // Changed for better visual distinction
      icon: <Hourglass className="h-3 w-3" />,
      label: "Pending"
    },
    progress: {
      variant: "secondary", // Changed for better visual distinction
      icon: <Loader className="h-3 w-3" />,
      label: "Processing"
    },
    approved: {
      variant: "success",
      icon: <CheckCircle className="h-3 w-3" />,
      label: "Approved"
    },
    rejected: {
      variant: "destructive",
      icon: <XCircle className="h-3 w-3" />,
      label: "Rejected"
    }
  };

  const { variant, icon, label } = config[status as keyof typeof config] || config.pending;

  return (
    <Badge variant={variant as any} className="gap-1.5">
      {icon}
      {label}
    </Badge>
  );
};

// Info Modal Component (no changes)
const RequestInfoModal = ({
  open,
  onOpenChange,
  request
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: Extend | null;
}) => {
  if (!request) return null;

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
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Limit Extension Request</DialogTitle>
          <DialogDescription>
            Requested on {formatDate(request.createdOn)}
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label>Status</Label>
            <div>
              <StatusBadge status={request.status} />
            </div>
          </div>

          {request.status === "rejected" && (
            <div className="space-y-2">
              <Label>Rejection Reason</Label>
              <p className="text-sm font-medium p-3 bg-muted rounded-md border">
                {request.reason || "No reason provided."}
              </p>
            </div>
          )}
        </div>
        <DialogModalFooter className="sm:justify-end">
          <DialogClose asChild>
            <Button type="button">Close</Button>
          </DialogClose>
        </DialogModalFooter>
      </DialogContent>
    </Dialog>
  );
};

// Main Component
export default function LimitExtensionPage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const extendRequests = useSelector(selectExtends);
  const loading = useSelector(selectExtendLoading);
  const error = useSelector(selectExtendError);
  
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<Extend | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // 1. Fetch current user data on component mount (as requested)
  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  // 2. Fetch user's extension requests when user ID is available
  useEffect(() => {
    if (user?._id) {
      dispatch(getExtendsByUserId(user._id));
    }
  }, [dispatch, user?._id]);

  // Handle Redux errors
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);
  console.log(user)
  console.log(extendRequests)
  const currentLimit = user?.limit || '-';
  const hasPending = useMemo(
    () => extendRequests.some((req) => req.status === "pending"),
    [extendRequests]
  );

  const sortedRequests = useMemo(
    () => [...extendRequests].sort((a, b) => b.createdOn - a.createdOn),
    [extendRequests]
  );

  // 3. Handle limit extension request submission (as requested)
  const handleExtendLimit = async () => {
    if (!user?._id) {
      toast.error("User not found. Please log in again.");
      return;
    }

    if (hasPending) {
      toast.error("You already have a pending extension request.");
      return;
    }

    setSubmitting(true);
    try {
      // Dispatch the createExtend action
      const result = await dispatch(createExtend({ userId: user._id }) as any);
      if (result) {
        toast.success("Your request to extend limit has been submitted.");
        // No need to manually refresh; the addExtend reducer already updated the state
      }
    } catch (error) {
      // Error is handled by the slice, but a local toast is also fine
      toast.error("Failed to create extension request");
    } finally {
      setSubmitting(false);
    }
  };

  const handleOpenModal = (req: Extend) => {
    setSelectedRequest(req);
    setInfoModalOpen(true);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Limit</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Current Limit Card */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Limit</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{currentLimit}</div>
            <p className="text-xs text-muted-foreground mt-1">
              This is your current daily work limit.
            </p>
          </CardContent>
        </Card>

        {/* Extend Limit Card */}
        <Card>
          <CardHeader>
            <CardTitle>Extend Your Limit</CardTitle>
            <CardDescription>
              Your current limit is {currentLimit}. Want to increase it?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button
              className="w-full sm:w-auto gap-2"
              onClick={handleExtendLimit}
              disabled={hasPending || submitting}
            >
              {submitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Submitting...
                </>
              ) : hasPending ? (
                <>
                  <Hourglass className="h-4 w-4" />
                  Request Pending
                </>
              ) : (
                <>
                  <ArrowUpCircle className="h-4 w-4" />
                  Extend Limit
                </>
              )}
            </Button>
            {hasPending && (
              <p className="text-center text-sm text-muted-foreground mt-4">
                You already have a pending limit extension request.
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Extension History Card */}
      <Card>
        <CardHeader>
          <CardTitle>Extension History</CardTitle>
          <CardDescription>All your limit extension requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Limit</TableHead>
                  <TableHead className="text-center">Status</TableHead>
                  <TableHead className="text-center">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && extendRequests.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-8">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading extension history...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : sortedRequests.length > 0 ? (
                  sortedRequests.map((req) => (
                    <TableRow key={req._id}>
                      <TableCell className="font-medium">
                        {formatDate(req.createdOn)}
                      </TableCell>
                      <TableCell className="">
                        {req.limit}
                      </TableCell>
                      <TableCell className="text-center">
                        <StatusBadge status={req.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          size="icon"
                          variant="outline"
                          onClick={() => handleOpenModal(req)}
                          title="View Details"
                        >
                          <Info className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center h-24">
                      No extension requests made yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Info Modal */}
      <RequestInfoModal
        open={infoModalOpen}
        onOpenChange={setInfoModalOpen}
        request={selectedRequest}
      />
    </div>
  );
}