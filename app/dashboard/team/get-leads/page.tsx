"use client";

import React, { useState, FormEvent } from "react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { AppDispatch } from "@/lib/store";
import {
  fetchLeadsByTransactionId,
  selectLeads,
  selectLoading,
  selectError,
  updateLead,
  Lead,
} from "@/lib/redux/leadSlice";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

const leadStatuses = [
  "New",
  "RegisterationDone",
  "CallCut",
  "CallNotPickUp",
  "NotInterested",
  "InvalidNumber",
  "Converted",
];

export default function Clients() {
  const dispatch = useDispatch<AppDispatch>();

  // --- Component State ---
  const [transactionId, setTransactionId] = useState("");
  const [searchAttempted, setSearchAttempted] = useState(false);
  
  // --- Modal State ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [newStatus, setNewStatus] = useState("");
  const [reason, setReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // --- Redux State ---
  const leads = useSelector(selectLeads);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  // --- Handlers ---
  const handleGetLeadSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!transactionId.trim()) {
      toast.error("Please enter a transaction ID.");
      return;
    }
    setSearchAttempted(true);
    dispatch(fetchLeadsByTransactionId(transactionId.trim()));
  };

  const handleEditClick = (lead: Lead) => {
    setSelectedLead(lead);
    setNewStatus(lead.status);
    setReason(lead.reason || "");
    setIsModalOpen(true);
  };

  // THE FIX IS HERE: We now build a full payload object.
  const handleStatusUpdate = async () => {
    if (!selectedLead || !newStatus) return;

    setIsUpdating(true);

    // Create a full copy of the lead and then overwrite the changed fields.
    // This ensures we send all required data to the backend.
    const fullLeadPayload: Lead = {
      ...selectedLead, // Spread all original lead data
      status: newStatus, // Overwrite with the new status
      reason: newStatus === "NotInterested" ? reason : "", // Update or clear the reason
    };

    const result = await dispatch(
      updateLead(selectedLead._id!, fullLeadPayload)
    );

    if (result) {
      toast.success("Lead status updated successfully!");
      setIsModalOpen(false);
      dispatch(fetchLeadsByTransactionId(transactionId.trim()));
    } else {
      toast.error("Failed to update lead status.");
    }
    setIsUpdating(false);
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      New: "bg-blue-500",
      RegisterationDone: "bg-teal-500",
      CallCut: "bg-yellow-500",
      CallNotPickUp: "bg-orange-500",
      NotInterested: "bg-red-500",
      InvalidNumber: "bg-gray-600",
      Converted: "bg-green-500",
    };
    return statusColors[status] || "bg-gray-400";
  };

  // --- JSX Rendering ---
  return (
    <div className="w-full mx-auto mt-2 space-y-8">
      {/* Search Card */}
      <Card>
        <CardHeader><CardTitle>Get Leads by Transaction ID</CardTitle></CardHeader>
        <CardContent>
          <form onSubmit={handleGetLeadSubmit} className="flex flex-col sm:flex-row items-center gap-4">
            <Input placeholder="Enter Transaction ID" value={transactionId} onChange={(e) => setTransactionId(e.target.value)} className="w-full sm:flex-1" />
            <Button type="submit" className="w-full sm:w-auto" disabled={loading}>
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get Leads"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results Card */}
      {searchAttempted && (
        <Card>
          <CardHeader><CardTitle>Search Result</CardTitle></CardHeader>
          <CardContent>
            {loading && (
              <div className="flex items-center justify-center p-6 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
                <span className="ml-2">Searching for leads...</span>
              </div>
            )}
            {!loading && error && (
              <p className="text-center p-6 text-destructive">Error: {error}</p>
            )}
            {!loading && !error && leads && leads.length > 0 && (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Transaction ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Phone</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Reason</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {leads.map((lead) => (
                    <TableRow key={lead._id}>
                      <TableCell className="font-mono text-xs">{lead.transactionId}</TableCell>
                      <TableCell className="font-medium">{lead.name}</TableCell>
                      <TableCell>{lead.phoneNumber}</TableCell>
                      <TableCell>{lead.city}</TableCell>
                      <TableCell><Badge className={`${getStatusColor(lead.status)} text-white`}>{lead.status}</Badge></TableCell>
                      <TableCell>{lead.reason || "-"}</TableCell>
                      <TableCell className="text-right"><Button variant="outline" size="sm" onClick={() => handleEditClick(lead)}>Edit Status</Button></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
            {!loading && !error && leads.length === 0 && (
              <p className="text-center p-6 text-muted-foreground">
                No leads found for the provided transaction ID.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Edit Status Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Edit Lead Status</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="status" className="text-right">Status</Label>
              <div className="col-span-3">
                <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger><SelectValue placeholder="Select a status" /></SelectTrigger>
                  <SelectContent>
                    {leadStatuses.map((status) => (<SelectItem key={status} value={status}>{status}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            {newStatus === "NotInterested" && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="reason" className="text-right">Reason</Label>
                <div className="col-span-3">
                  <Input id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason for not interested" />
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="secondary">Cancel</Button></DialogClose>
            <Button type="button" onClick={handleStatusUpdate} disabled={isUpdating}>
              {isUpdating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Save changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}