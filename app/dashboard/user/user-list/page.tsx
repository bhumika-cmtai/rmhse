"use client";

import React, { useState, useEffect, useCallback, ChangeEvent, FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, Plus } from "lucide-react";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { fetchCurrentUser, User } from "@/lib/redux/authSlice"; // Import User type from authSlice
import { AppDispatch, RootState } from "@/lib/store";
import axios from "axios";
import Cookies from "js-cookie";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { generateRoleId } from "@/lib/userActions";

// Type for the downline user data
type DownlineUser = {
  _id: string;
  name: string;
  phoneNumber: string;
  status: string;
  latestRoleId: string;
};

// Type for the new user form state
type NewUserForm = {
  name: string;
  email: string;
  phoneNumber: string;
  permanentAddress: string;
  currentAddress: string;
  password: string;
};

const initialFormState: NewUserForm = {
  name: "",
  email: "",
  phoneNumber: "",
  permanentAddress: "",
  currentAddress: "",
  password: "",
};

export default function MyReferralsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user: loggedInUser, isLoading: isAuthLoading } = useSelector((state: RootState) => state.auth);

  const [downline, setDownline] = useState<DownlineUser[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  // --- NEW STATE TO TRACK IF USER HAS REACHED THEIR LIMIT ---
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [isLimitLoading, setIsLimitLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<NewUserForm>(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  
  
  // --- FUNCTION TO FETCH THE DOWNLINE DATA ---
  const fetchMyDownline = useCallback(async (userId: string) => {
    setIsDataLoading(true);
    try {
      const token = Cookies.get('auth-token');
      if (!token) throw new Error("Authentication session has expired.");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/downline/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setDownline(response.data?.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setIsDataLoading(false);
    }
  }, []);

   // --- NEW FUNCTION TO CHECK REFERRAL COUNT ---
   const checkReferralLimit = useCallback(async (user: User) => {
    if (!user._id) return;
    setIsLimitLoading(true);
    try {
        const token = Cookies.get('auth-token');
        if (!token) throw new Error("Authentication failed.");

        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/referral-count/${user._id}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        
        const count = response.data.data.count as number;
        const limit = user.limit || 25;
        
        setHasReachedLimit(count >= limit);

    } catch (error: any) {
        toast.error("Could not verify referral capacity.");
        setHasReachedLimit(true); // Default to true on error to be safe
    } finally {
        setIsLimitLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loggedInUser) {
      dispatch(fetchCurrentUser());
    } else if (loggedInUser._id) {
      fetchMyDownline(loggedInUser._id);
      checkReferralLimit(loggedInUser); // Check limit when user is loaded
    }
  }, [loggedInUser, dispatch, fetchMyDownline, checkReferralLimit]);


  // --- CONFIG FOR THE "ADD USER" BUTTON ---
  // console.log(loggedInUser)
  const getAddButtonConfig = () => {
    if(!loggedInUser) return null
    if (loggedInUser.role === 'BM') {
      if (loggedInUser._id === '68919eeff1dedfbfd356fedb') {
        return { label: 'Add STAT', role: 'STAT' }; // Allow only this specific BM to add a STAT
      }
      return null; // Any other BM will not see the button
    }
    switch (loggedInUser?.role) {
      case 'DIST': return { label: 'Add DIV', role: 'DIV' };
      case 'STAT': return { label: 'Add DIST', role: 'DIST' };
      case 'BM': return { label: 'Add STAT', role: 'STAT' };
      default: return null; // Button won't be shown
    }
  };
  const buttonConfig = getAddButtonConfig();

  // --- HANDLERS FOR THE DIALOG AND FORM ---
  const openAddModal = () => setIsModalOpen(true);
  
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // --- MODIFIED FORM SUBMISSION HANDLER ---
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);

    // Re-check the limit right before submission as a final validation
    await checkReferralLimit(loggedInUser!);
    if (hasReachedLimit) {
        toast.error("You have reached your referral limit and cannot add new users.");
        setFormLoading(false);
        setIsModalOpen(false); // Close the modal
        return;
    }

    if (!buttonConfig || !loggedInUser?.roleId?.length) {
      toast.error("Cannot add user: Your account is not configured correctly.");
      setFormLoading(false);
      return;
    }
    
    const token = Cookies.get('auth-token');
    if (!token) {
      toast.error("Authentication failed. Please log in again.");
      setFormLoading(false);
      return;
    }

    const referredBy = loggedInUser.roleId[loggedInUser.roleId.length - 1];
    const newRoleId = generateRoleId(buttonConfig.role);

    const payload = { ...form, role: buttonConfig.role, roleId: [newRoleId], refferedBy: referredBy };

    try {
      await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/addUser`, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      toast.success("User added successfully!");
      setIsModalOpen(false);
      setForm(initialFormState);
      fetchMyDownline(loggedInUser._id!); // Refresh the referrals list
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to add user.");
    } finally {
      setFormLoading(false);
    }
  };

  // Show a single loading spinner for initial auth check and limit check
  if (isAuthLoading || isLimitLoading) {
    return <div className="flex justify-center items-center h-80"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!loggedInUser) {
    return (
      <div className="flex flex-col items-center justify-center h-80 text-center text-red-600 bg-red-50 p-8">
        <AlertTriangle className="h-10 w-10 mb-4" />
        <h2 className="text-xl font-semibold">Authentication Error</h2>
        <p>Could not retrieve your data. Please try logging in again.</p>
      </div>
    );
  }

  return (
    <>
      <div className="w-full mx-auto mt-2">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">My Referrals</h1>
          {/* Conditional "Add User" button */}
          {buttonConfig && (
            <Button onClick={openAddModal}>
              <Plus className="w-4 h-4 mr-2" /> {buttonConfig.label}
            </Button>
          )}
        </div>
        
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">S.No.</TableHead><TableHead>Name</TableHead>
                    <TableHead>Phone Number</TableHead><TableHead>Status</TableHead>
                    <TableHead>Current Role ID</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isDataLoading ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-16"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                  ) : downline.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="text-center py-16 text-muted-foreground">You have not referred any users yet.</TableCell></TableRow>
                  ) : (
                    downline.map((user, idx) => (
                      <TableRow key={user._id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Avatar><AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback></Avatar>
                            <span className="font-medium">{user.name}</span>
                          </div>
                        </TableCell>
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell><Badge variant={user.status === 'Block' ? "destructive" : "default"}>{user.status}</Badge></TableCell>
                        <TableCell className="font-mono text-xs">{user.latestRoleId}</TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* --- ADD USER DIALOG --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add New {buttonConfig?.role}</DialogTitle>
            <DialogDescription>Fill in the details for the new user. They will be registered under your referral.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" value={form.name} onChange={handleFormChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleFormChange} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="currentAddress">Current Address</Label>
              <Textarea id="currentAddress" name="currentAddress" value={form.currentAddress} onChange={handleFormChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="permanentAddress">Permanent Address</Label>
              <Textarea id="permanentAddress" name="permanentAddress" value={form.permanentAddress} onChange={handleFormChange} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" value={form.password} onChange={handleFormChange} required />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={formLoading}>
                {formLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {formLoading ? "Saving..." : "Save User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}