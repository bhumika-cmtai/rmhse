"use client";

import React, { useState, ChangeEvent, useEffect, FormEvent } from "react";
import axios from "axios";
import { toast } from "sonner";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Edit, Phone, Clock, AlertCircle, Loader2, UserPlus, ShieldCheck, ShieldAlert, Info } from "lucide-react";
import { 
  updateClient,
  Client, 
  fetchPortalNames,
  selectPortalNames
} from "@/lib/redux/clientSlice";
import { fetchSession, GlobalSession } from "@/lib/redux/authSlice";
import { AppDispatch } from "@/lib/store";
import { useSelector, useDispatch } from "react-redux";

// Helper function for time comparison
const isCurrentTimeInSession = (session: GlobalSession | null): boolean => {
  if (!session?.sessionStartDate || !session.sessionStartTime || !session.sessionEndDate || !session.sessionEndTime) {
    return false;
  }
  const now = new Date();
  const startDateTime = new Date(`${session.sessionStartDate.split('T')[0]}T${session.sessionStartTime}:00`);
  const endDateTime = new Date(`${session.sessionEndDate.split('T')[0]}T${session.sessionEndTime}:00`);
  return now >= startDateTime && now <= endDateTime;
};

// Add mapping functions at the top of the component
const getDisplayKycStatus = (status: string) => {
  switch (status) {
    case "not complete ":
      return "Not Completed";
    case "complete":
      return "Completed";
    default:
      return status;
  }
};

const getDisplayTradeStatus = (status: string) => {
  switch (status) {
    case "not done ":
      return "Not Completed";
    case "done":
      return "Completed";
    default:
      return status;
  }
};

export default function Clients() {
  const dispatch = useDispatch<AppDispatch>();

  // --- Redux State ---
  const portalNames = useSelector(selectPortalNames);

  // --- Single Client Search State ---
  const [singleSearchNumber, setSingleSearchNumber] = useState("");
  const [singleSearchPortal, setSingleSearchPortal] = useState("");
  const [singleClientResult, setSingleClientResult] = useState<Client | null>(null);
  const [isSingleClientLoading, setIsSingleClientLoading] = useState(false);
  const [singleClientError, setSingleClientError] = useState<string | null>(null);
  
  // --- Global Session State ---
  const [globalSession, setGlobalSession] = useState<GlobalSession | null>(null);
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [isSessionCheckLoading, setIsSessionCheckLoading] = useState(true);

  // --- Edit Modal State ---
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [formStatus, setFormStatus] = useState("New");
  const [formReason, setFormReason] = useState("");
  
  // --- Add Owner State ---
  const [newOwnerName, setNewOwnerName] = useState("");
  const [newOwnerNumber, setNewOwnerNumber] = useState("");
  const [isAddOwnerLoading, setIsAddOwnerLoading] = useState(false);

  // --- Fetch Initial Data (Portals & Session) on Mount ---
  useEffect(() => {
    dispatch(fetchPortalNames());
    const checkSession = async () => {
      setIsSessionCheckLoading(true);
      try {
        const session: GlobalSession | null = await dispatch(fetchSession());
        setGlobalSession(session);
        setIsSessionActive(isCurrentTimeInSession(session));
      } catch (error) {
        console.error("Failed to fetch global session:", error);
        setIsSessionActive(false);
      } finally {
        setIsSessionCheckLoading(false);
      }
    };
    checkSession();
  }, [dispatch]);

  // --- Handler for Single Client Search ---
  const handleGetClientSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!singleSearchNumber || !singleSearchPortal) {
      setSingleClientError("Please select a portal and enter a client number.");
      return;
    }
    setIsSingleClientLoading(true);
    setSingleClientResult(null);
    setSingleClientError(null);
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/getAllClient?portalName=${singleSearchPortal}&phoneNumber=${singleSearchNumber}`);
      const results = response.data.data.clients;
      if (results && results.length > 0) {
        setSingleClientResult(results[0]);
      } else {
        setSingleClientError("No client found with that combination of portal and phone number.");
      }
    } catch (error) {
      console.error("Failed to fetch single client:", error);
      setSingleClientError("An error occurred while searching for the client.");
    } finally {
      setIsSingleClientLoading(false);
    }
  };

  // --- Handler for adding a new owner directly on the card ---
  const handleAddOwnerSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!singleClientResult) return;

    // Update the condition to match API values
    if (singleClientResult.ekyc_stage !== 'complete' && singleClientResult.trade_status !== 'done') {
      return;
    }
    if (singleClientResult.ownerNumber?.includes(newOwnerNumber.trim())) {
      toast.warning("This phone number has already claimed this client.");
      return;
    }
    if (!newOwnerName.trim() || !newOwnerNumber.trim()) return;
    
    setIsAddOwnerLoading(true);
    const updatePayload = {
      ownerName: [...(singleClientResult.ownerName || []), newOwnerName],
      ownerNumber: [...(singleClientResult.ownerNumber || []), newOwnerNumber],
    };
    if (!singleClientResult._id) {
      toast.error("Client ID is missing. Cannot update owner data.");
      setIsAddOwnerLoading(false);
      return;
    }
    const responseWrapper = await dispatch(updateClient(singleClientResult._id, updatePayload));
    
    if (responseWrapper?.data) {
      toast.success("Owner data has been saved successfully!");
      setSingleClientResult(null);
      setSingleSearchNumber("");
      setNewOwnerName("");
      setNewOwnerNumber("");
    } else {
      toast.error("Failed to save owner data. Please try again.");
    }

    setIsAddOwnerLoading(false);
  };
  
  // --- Opens the modal for editing status ---
  const openEditModal = (client: Client) => {
    setEditClient(client);
    setFormStatus(client.status);
    setFormReason(client.reason || "");
    setModalOpen(true);
  };

  // --- Handles the submission from the status edit modal ---
  // const handleStatusFormSubmit = async (e: FormEvent) => {
  //   e.preventDefault();
  //   if (!editClient?._id) return;
  //   setFormLoading(true);
    
  //   const updatePayload: Partial<Client> = { status: formStatus };
  //   if (formStatus === "NotInterested") { updatePayload.reason = formReason; }
  //   else if (editClient.status === "NotInterested") { updatePayload.reason = ""; }
    
  //   const responseWrapper = await dispatch(updateClient(editClient._id, updatePayload));
  //   setFormLoading(false);

  //   if (responseWrapper?.data) {
  //     toast.success("Client status updated successfully!");
  //     setModalOpen(false);
  //     if (singleClientResult?._id === editClient._id) {
  //       setSingleClientResult(responseWrapper.data);
  //     }
  //   }
  // };
  
  // const getStatusColor = (status: string) => {
  //   const statusColors: { [key: string]: string } = {
  //       'New': 'bg-blue-500',
  //       'RegisterationDone': 'bg-teal-500',
  //       'CallCut': 'bg-yellow-500',
  //       'CallNotPickUp': 'bg-orange-500',
  //       'NotInterested': 'bg-red-500',
  //       'InvalidNumber': 'bg-gray-600',
  //   };
  //   return statusColors[status] || 'bg-gray-400';
  // };

  return (
    <div className="w-full mx-auto mt-2 space-y-8">
      <Card>
        <CardHeader><CardTitle>Get Client Details</CardTitle></CardHeader>
        <CardContent>
          <div className={`p-3 mb-4 rounded-md text-sm flex items-center gap-2 ${isSessionCheckLoading ? 'bg-blue-50 text-blue-800' : isSessionActive ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
            {isSessionCheckLoading ? (<><Clock className="w-4 h-4 animate-spin"/> Checking session...</>) : isSessionActive ? (<><Clock className="w-4 h-4"/> Session is active. You can claim clients.</>) : (<><AlertCircle className="w-4 h-4"/> Session is not active. Client claiming is disabled.</>)}
          </div>
          <form onSubmit={handleGetClientSubmit} className="flex flex-col sm:flex-row items-center gap-4">
            <Select onValueChange={setSingleSearchPortal} value={singleSearchPortal}>
              <SelectTrigger className="w-full sm:flex-1" disabled={!isSessionActive}><SelectValue placeholder="Select Portal" /></SelectTrigger>
              <SelectContent>
                {portalNames.length === 0 && <div className="p-2 text-sm text-muted-foreground">Loading portals...</div>}
                {portalNames.map(name => (<SelectItem key={name} value={name}>{name}</SelectItem>))}
              </SelectContent>
            </Select>
            <Input placeholder="Enter Client Mobile Number" value={singleSearchNumber} onChange={(e: ChangeEvent<HTMLInputElement>) => setSingleSearchNumber(e.target.value)} className="w-full sm:flex-1" disabled={!isSessionActive}/>
            <Button type="submit" className="w-full sm:w-auto" disabled={!isSessionActive || isSingleClientLoading || isSessionCheckLoading || !singleSearchPortal || !singleSearchNumber}>
              {isSingleClientLoading ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Search'}
            </Button>
          </form>
          {singleClientError && <p className="text-center mt-4 text-red-500">{singleClientError}</p>}
        </CardContent>
      </Card>

      {singleClientResult && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>{singleClientResult.portalName}</CardTitle>
            {/* <Button variant="outline" size="sm" onClick={() => openEditModal(singleClientResult)}><Edit className="w-4 h-4 mr-2" />Edit Status</Button> */}
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 text-sm">
                <div><p className="text-muted-foreground">Client Name</p><p className="font-medium text-base">{singleClientResult.name}</p></div>
                <div><p className="text-muted-foreground">Phone Number</p><p className="font-medium text-base">{singleClientResult.phoneNumber}</p></div>
                {/* <div><p className="text-muted-foreground">Status</p><Badge className={`${getStatusColor(singleClientResult.status || "")} text-white`}>{singleClientResult.status}</Badge></div> */}
                <div>
                  <p className="text-muted-foreground">E-KYC Status</p>
                  <div className="flex items-center gap-2 font-medium">
                    {singleClientResult.ekyc_stage === 'complete' ? 
                      <ShieldCheck className="w-4 h-4 text-green-500" /> : 
                      <ShieldAlert className="w-4 h-4 text-orange-500" />}
                    <span>{getDisplayKycStatus(singleClientResult.ekyc_stage || "")}</span>
                  </div>
                </div>
                <div className="md:col-span-2">
                  <p className="text-muted-foreground">Trade Status</p>
                  <div className="flex items-center gap-2 font-medium">
                    {singleClientResult.trade_status === 'done' ? 
                      <ShieldCheck className="w-4 h-4 text-green-500" /> : 
                      <ShieldAlert className="w-4 h-4 text-orange-500" />}
                    <span>{getDisplayTradeStatus(singleClientResult.trade_status || "")}</span>
                  </div>
                </div>
                <div className="md:col-span-2"><p className="text-muted-foreground">Current Owner(s)</p>{(singleClientResult.ownerName && singleClientResult.ownerName.length > 0) ? (<ul className="list-disc list-inside mt-1 font-medium">{singleClientResult.ownerName.map((name, i) => <li key={i}>{name} - {singleClientResult.ownerNumber?.[i] || 'N/A'}</li>)}</ul>) : (<p className="text-muted-foreground italic mt-1">No owners have claimed this client yet.</p>)}</div>
            </div>
            {(() => {
                const canClaim = singleClientResult.ekyc_stage === 'complete' || singleClientResult.trade_status === 'done';
                const isAlreadyOwner = newOwnerNumber.trim() ? singleClientResult.ownerNumber?.includes(newOwnerNumber.trim()) : false;

                return (
                    <div className="border-t pt-6">
                        <h3 className="font-semibold text-lg flex items-center gap-2 mb-4"><UserPlus className="w-5 h-5" />Claim This Client</h3>
                        
                        {!canClaim && (<div className="p-3 mb-4 rounded-md text-sm flex items-center gap-2 bg-yellow-50 text-yellow-800 border border-yellow-200"><AlertCircle className="w-4 h-4" /><span>Client must have a 'Completed' KYC or 'Completed' Trade status to be claimed.</span></div>)}
                        
                        {isAlreadyOwner && (
                            <div className="p-3 mb-4 rounded-md text-sm flex items-center gap-2 bg-blue-50 text-blue-800 border border-blue-200">
                                <Info className="w-4 h-4" />
                                <span>This phone number has already claimed this client.</span>
                            </div>
                        )}

                        <form onSubmit={handleAddOwnerSubmit} className="space-y-3">
                            <Input placeholder="Your Name" value={newOwnerName} onChange={e => setNewOwnerName(e.target.value)} required disabled={!canClaim || isAlreadyOwner || isAddOwnerLoading} />
                            <Input placeholder="Your Phone Number" value={newOwnerNumber} onChange={e => setNewOwnerNumber(e.target.value)} required disabled={!canClaim || isAlreadyOwner || isAddOwnerLoading}/>
                            <Button type="submit" className="w-full" disabled={!canClaim || isAlreadyOwner || isAddOwnerLoading || !newOwnerName || !newOwnerNumber}>
                                {isAddOwnerLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                Add Me as Owner
                            </Button>
                        </form>
                    </div>
                );
            })()}
          </CardContent>
        </Card>
      )}

      {/* <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Edit Client Status</DialogTitle></DialogHeader>
          <form onSubmit={handleStatusFormSubmit} className="space-y-4 pt-4">
            <Select value={formStatus} onValueChange={setFormStatus}>
              <SelectTrigger><SelectValue placeholder="Select Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="RegisterationDone">Registration Done</SelectItem>
                <SelectItem value="CallCut">Call Cut</SelectItem>
                <SelectItem value="CallNotPickUp">Call Not Picked Up</SelectItem>
                <SelectItem value="NotInterested">Not Interested</SelectItem>
                <SelectItem value="InvalidNumber">Invalid Number</SelectItem>
              </SelectContent>
            </Select>
            {formStatus === 'NotInterested' && (
              <Input placeholder="Reason for not being interested" value={formReason} onChange={(e) => setFormReason(e.target.value)}/>
            )}
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)} disabled={formLoading}>Cancel</Button>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : null}
                {formLoading ? 'Saving...' : 'Update Status'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog> */}
    </div>
  );
}