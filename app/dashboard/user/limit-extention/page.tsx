"use client";

import React, { useMemo, useState } from "react";
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
  Info
} from "lucide-react";
import { toast } from "sonner";

// --- Types ---
type LimitExtensionRequest = {
  id: string;
  date: Date;
  status: "pending" | "approved" | "rejected";
  rejectionReason?: string;
};

// --- Mock Data ---
const mockExtensions: LimitExtensionRequest[] = [
  {
    id: "le3",
    date: new Date(2024, 6, 18),
    status: "approved"
  },
  {
    id: "le2",
    date: new Date(2024, 5, 25),
    status: "rejected",
    rejectionReason:
      "You must use at least 80% of your current limit before requesting an extension."
  },
  {
    id: "le1",
    date: new Date(2024, 4, 10),
    status: "approved"
  }
];

// --- Status Badge ---
const StatusBadge = ({
  status
}: {
  status: LimitExtensionRequest["status"];
}) => {
  const config = {
    pending: {
      variant: "default",
      icon: <Hourglass className="h-3 w-3" />,
      label: "Pending"
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

  const { variant, icon, label } = config[status];

  return (
    <Badge variant={variant as any} className="gap-1.5">
      {icon}
      {label}
    </Badge>
  );
};

// --- Info Modal ---
const RequestInfoModal = ({
  open,
  onOpenChange,
  request
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  request: LimitExtensionRequest | null;
}) => {
  if (!request) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Limit Extension Request</DialogTitle>
          <DialogDescription>
            Requested on {request.date.toLocaleDateString()}
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
                {request.rejectionReason || "No reason provided."}
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

// --- Main Component ---
export default function LimitExtensionPage() {
  const [currentLimit, setCurrentLimit] = useState<number>(25);
  const [requests, setRequests] = useState<LimitExtensionRequest[]>(
    mockExtensions
  );

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] =
    useState<LimitExtensionRequest | null>(null);

  const hasPending = useMemo(
    () => requests.some((req) => req.status === "pending"),
    [requests]
  );

  const sortedRequests = useMemo(
    () => [...requests].sort((a, b) => b.date.getTime() - a.date.getTime()),
    [requests]
  );

  const handleExtendLimit = () => {
    if (hasPending) {
      toast.error("You already have a pending extension request.");
      return;
    }

    const newRequest: LimitExtensionRequest = {
      id: `le${Date.now()}`,
      date: new Date(),
      status: "pending"
    };

    setRequests([newRequest, ...requests]);
    toast.success("Your request to extend limit has been submitted.");
  };

  const handleOpenModal = (req: LimitExtensionRequest) => {
    setSelectedRequest(req);
    setInfoModalOpen(true);
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Limit</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
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
              disabled={hasPending}
            >
              {hasPending ? (
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

      <Card>
        <CardHeader>
          <CardTitle>Extension History</CardTitle>
          <CardDescription>All your limit extension requests.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead className="text-center">Limit Status</TableHead>
                <TableHead className="text-center">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedRequests.length > 0 ? (
                sortedRequests.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell className="font-medium">
                      {req.date.toLocaleDateString()}
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
        </CardContent>
      </Card>

      <RequestInfoModal
        open={infoModalOpen}
        onOpenChange={setInfoModalOpen}
        request={selectedRequest}
      />
    </div>
  );
}
