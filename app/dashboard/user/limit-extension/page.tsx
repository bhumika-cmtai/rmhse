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
import { selectUser, fetchCurrentUser } from "@/lib/redux/authSlice";
import { AppDispatch, RootState } from "@/lib/store";
import axios from 'axios'; // <-- STEP 1: IMPORT AXIOS

// Status Badge Component (no changes)
const StatusBadge = ({
  status
}: {
  status: string;
}) => {
  const config = {
    pending: { variant: "secondary", icon: <Hourglass className="h-3 w-3" />, label: "Pending" },
    progress: { variant: "secondary", icon: <Loader className="h-3 w-3" />, label: "Processing" },
    approved: { variant: "success", icon: <CheckCircle className="h-3 w-3" />, label: "Approved" },
    rejected: { variant: "destructive", icon: <XCircle className="h-3 w-3" />, label: "Rejected" }
  };
  const { variant, icon, label } = config[status as keyof typeof config] || config.pending;
  return (<Badge variant={variant as any} className="gap-1.5">{icon}{label}</Badge>);
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
    const numericTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    if (isNaN(numericTimestamp)) return "Invalid Date";
    return new Date(numericTimestamp).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Limit Extension Request</DialogTitle>
          <DialogDescription>Requested on {formatDate(request.createdOn)}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2"><Label>Status</Label><div><StatusBadge status={request.status} /></div></div>
          {request.status === "rejected" && (<div className="space-y-2"><Label>Rejection Reason</Label><p className="text-sm font-medium p-3 bg-muted rounded-md border">{request.reason || "No reason provided."}</p></div>)}
        </div>
        <DialogModalFooter className="sm:justify-end"><DialogClose asChild><Button type="button">Close</Button></DialogClose></DialogModalFooter>
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

  useEffect(() => { dispatch(fetchCurrentUser()); }, [dispatch]);
  useEffect(() => { if (user?._id) { dispatch(getExtendsByUserId(user._id)); } }, [dispatch, user?._id]);
  useEffect(() => { if (error) { toast.error(error); } }, [error]);

  const currentLimit = user?.limit || 0; // Default to 0 if no limit
  const hasPending = useMemo(() => extendRequests.some((req) => req.status === "pending"), [extendRequests]);
  const sortedRequests = useMemo(() => [...extendRequests].sort((a, b) => b.createdOn - a.createdOn), [extendRequests]);

  // ===================================================================================
  // STEP 2: UPDATE THE HANDLER FUNCTION WITH THE NEW VALIDATION LOGIC
  // ===================================================================================
  const handleExtendLimit = async () => {
    if (!user?._id) {
      toast.error("User information not found. Please try again.");
      return;
    }

    if (hasPending) {
      toast.info("You already have a pending extension request.");
      return;
    }

    setSubmitting(true);
    try {
      // 1. Fetch the current referral count from the new endpoint.
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/referral-count/${user._id}`);
      
      const referralCount = response.data.data.count;

      // 2. Compare the referral count with the user's current limit.
      if (currentLimit > referralCount) {
        // If the limit is not met, show an error and stop execution.
        toast.error(`Your referral goal (${currentLimit}) is not yet reached. Current referrals: ${referralCount}.`);
        return; // Stop the function here.
      }

      // 3. If the check passes, proceed with dispatching the extend request.
      const result = await dispatch(createExtend({ userId: user._id }));

      if (result) {
        toast.success("Your request to extend limit has been submitted successfully.");
      } else {
        // Use the error message from the rejected action payload if available
        const errorMessage = result.payload as any;
        toast.error(errorMessage?.message || "Failed to submit extension request.");
      }
    } catch (err: any) {
      console.error("Error during limit extension process:", err);
      // Handle potential errors from the axios call
      const apiError = err.response?.data?.message || "Could not verify your referral count.";
      toast.error(apiError);
    } finally {
      // 4. Ensure the submitting state is always reset.
      setSubmitting(false);
    }
  };

  const handleOpenModal = (req: Extend) => {
    setSelectedRequest(req);
    setInfoModalOpen(true);
  };

  const formatDate = (timestamp: string | number) => {
    if (!timestamp) return 'N/A';
    const numericTimestamp = typeof timestamp === 'string' ? parseInt(timestamp, 10) : timestamp;
    if (isNaN(numericTimestamp)) return "Invalid Date";
    return new Date(numericTimestamp).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="mb-8"><h1 className="text-3xl font-bold">My Limit</h1></div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Current Limit</CardTitle>
            <ArrowUpCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{currentLimit}</div>
            <p className="text-xs text-muted-foreground mt-1">This is your current daily work limit.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Extend Your Limit</CardTitle>
            <CardDescription>Request an increase once your referral goal is met.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button className="w-full sm:w-auto gap-2" onClick={handleExtendLimit} disabled={hasPending || submitting}>
              {submitting ? (<><Loader2 className="h-4 w-4 animate-spin" />Submitting...</>) 
              : hasPending ? (<><Hourglass className="h-4 w-4" />Request Pending</>) 
              : (<><ArrowUpCircle className="h-4 w-4" />Request Limit Extension</>)}
            </Button>
            {hasPending && (<p className="text-center text-sm text-muted-foreground mt-4">You already have a pending limit extension request.</p>)}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Extension History</CardTitle>
          <CardDescription>All your limit extension requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead>Date</TableHead><TableHead>Limit</TableHead><TableHead className="text-center">Status</TableHead><TableHead className="text-center">Action</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading && extendRequests.length === 0 ? (
                  <TableRow><TableCell colSpan={4} className="text-center py-8"><div className="flex justify-center items-center gap-2"><Loader2 className="h-6 w-6 animate-spin" /><span>Loading history...</span></div></TableCell></TableRow>
                ) : sortedRequests.length > 0 ? (
                  sortedRequests.map((req) => (
                    <TableRow key={req._id}>
                      <TableCell className="font-medium">{formatDate(req.createdOn)}</TableCell>
                      <TableCell>{req.limit}</TableCell>
                      <TableCell className="text-center"><StatusBadge status={req.status} /></TableCell>
                      <TableCell className="text-center"><Button size="icon" variant="outline" onClick={() => handleOpenModal(req)} title="View Details"><Info className="h-4 w-4" /></Button></TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={4} className="text-center h-24">No extension requests made yet.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <RequestInfoModal open={infoModalOpen} onOpenChange={setInfoModalOpen} request={selectedRequest}/>
    </div>
  );
}