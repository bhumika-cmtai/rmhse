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
import { fetchCurrentUser, User } from "@/lib/redux/authSlice";
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

type DownlineUser = {
  _id: string;
  name: string;
  phoneNumber: string;
  status: string;
  latestRoleId: string;
};

type NewUserForm = {
  name: string;
  email: string;
  phoneNumber: string;
  password: string;
  refferedBy: string;
};

const initialFormState: NewUserForm = {
  name: "",
  email: "",
  phoneNumber: "",
  password: "",
  refferedBy: "",
};

const SPECIAL_ADMIN_USER_ID = '68919eeff1dedfbfd356fedb';

export default function MyReferralsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const { user: loggedInUser, isLoading: isAuthLoading } = useSelector((state: RootState) => state.auth);

  const [downline, setDownline] = useState<DownlineUser[]>([]);
  const [isDataLoading, setIsDataLoading] = useState(true);
  
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [isLimitLoading, setIsLimitLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form, setForm] = useState<NewUserForm>(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  
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

   const checkReferralLimit = useCallback(async (user: User) => {
    if (!user._id || user._id === SPECIAL_ADMIN_USER_ID) {
      setIsLimitLoading(false);
      return;
    }
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
        setHasReachedLimit(true);
    } finally {
        setIsLimitLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!loggedInUser) {
      dispatch(fetchCurrentUser());
    } else if (loggedInUser._id) {
      fetchMyDownline(loggedInUser._id);
      checkReferralLimit(loggedInUser);
    }
  }, [loggedInUser, dispatch, fetchMyDownline, checkReferralLimit]);

  // ===== CHANGE 1: useEffect ko update kiya gaya hai =====
  // Ab yeh sirf special user ke liye hi form pre-fill karega.
  useEffect(() => {
    // Modal band hone par form ko reset karein
    if (!isModalOpen) {
        setForm(initialFormState);
        return;
    }

    // Modal khulne par, check karein ki kya user special hai
    if (loggedInUser?._id === SPECIAL_ADMIN_USER_ID) {
      setForm(prev => ({ ...initialFormState, refferedBy: 'BM005' }));
    } else {
      // Normal users ke liye form khaali rahega
      setForm(initialFormState);
    }
  }, [isModalOpen, loggedInUser]);

  const getAddButtonConfig = () => {
    if(!loggedInUser) return null;
    
    if (loggedInUser._id === SPECIAL_ADMIN_USER_ID) {
      return { label: 'Add STAT', role: 'STAT' };
    }

    switch (loggedInUser?.role) {
      case 'DIST':
      case 'STAT':
      case 'DIV':
        return { label: 'Add MEM', role: 'MEM' };
      
      case 'BM':
      default:
        return null;
    }
  };
  const buttonConfig = getAddButtonConfig();

  const openAddModal = () => setIsModalOpen(true);
  
  const handleFormChange = (e: ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);

    const isSpecialUser = loggedInUser?._id === SPECIAL_ADMIN_USER_ID;

    if (hasReachedLimit && !isSpecialUser) {
        toast.error("You have reached your referral limit.");
        setFormLoading(false);
        setIsModalOpen(false);
        return;
    }

    if (!buttonConfig) {
      toast.error("Your account is not configured to add users.");
      setFormLoading(false);
      return;
    }
    
    const token = Cookies.get('auth-token');
    if (!token) {
      toast.error("Authentication failed. Please log in again.");
      setFormLoading(false);
      return;
    }
    
    const payload = { ...form, role: buttonConfig.role };

    try {
      let endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/addUser`;
      
      if (isSpecialUser) {
        endpoint = `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/addUserByAdmin`;
      }
      
      const response = await axios.post(endpoint, payload, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      // console.log(response)
      toast.success(`User (${buttonConfig.role}) added successfully!`);
      setIsModalOpen(false);
      if(loggedInUser) {
        fetchMyDownline(loggedInUser._id!);
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.errorMessage || error.response?.data?.message || "Failed to add user.";
      toast.error(errorMessage);
    } finally {
      setFormLoading(false);
    }
  };
  
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
          {buttonConfig && (
            <Button onClick={openAddModal} disabled={hasReachedLimit && loggedInUser._id !== SPECIAL_ADMIN_USER_ID}>
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
                <Input id="name" name="name" value={form.name} placeholder="John Doe" onChange={handleFormChange} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" name="email" type="email" value={form.email} placeholder="email@gmail.com" onChange={handleFormChange} required />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} placeholder="99XXXXXXX" onChange={handleFormChange} required />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="refferedBy">Referred By (Role ID)</Label>
              {/* ===== CHANGE 2: Input component ka 'value' prop update kiya gaya hai ===== */}
              {/* Ab iska value hamesha form state se aayega */}
              <Input 
                id="refferedBy" 
                name="refferedBy" 
                value={form.refferedBy} 
                onChange={handleFormChange} 
                required 
                disabled={loggedInUser?._id === SPECIAL_ADMIN_USER_ID}
                placeholder="Enter Referrer Role ID"
              />
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