"use client";
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, User as UserIcon, Landmark, Edit, FileText, KeyRound, Upload, Mail, Phone, ShieldCheck, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '@/lib/store';
import {
  fetchCurrentUser,
  updateUserProfile,
  updateBankDetails,
  updateDocuments,
  selectUser,
  selectIsLoading,
  User,
} from '@/lib/redux/authSlice';

// Helper component for text details in tabs
const DetailItem = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b items-start">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="text-sm text-gray-900 break-words col-span-2">
        {children || value || '-'}
      </div>
    </div>
);

// Helper component for displaying image documents
const DocumentItem = ({ label, imageUrl }: { label:string; imageUrl?: string | null }) => (
    <div className="py-3 border-b">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <div className="col-span-2">
                {imageUrl ? (
                    <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                        <img src={imageUrl} alt={label} className="rounded-lg border object-cover w-full max-w-xs transition-transform hover:scale-105" />
                    </a>
                ) : (
                    <p className="text-sm text-gray-900">-</p>
                )}
            </div>
        </div>
    </div>
);


export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);

  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'official' | 'documents' | 'bank'>('personal');
  
  // Modal visibility states
  const [isPersonalModalOpen, setPersonalModalOpen] = useState(false);
  const [isDocumentModalOpen, setDocumentModalOpen] = useState(false);
  const [isBankModalOpen, setBankModalOpen] = useState(false);

  // State for Personal Details form
  const [personalData, setPersonalData] = useState({
      name: '', email: '', phoneNumber: '', permanentAddress: '', currentAddress: '',
      dob: '', gender: 'Male' as 'Male' | 'Female' | 'Other', emergencyNumber: '',
      newPassword: '', confirmPassword: ''
  });
  
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');

  // State for Document Uploads form
  const [documentFiles, setDocumentFiles] = useState<{
    pancard: File | null;
    adharFront: File | null;
    adharBack: File | null;
  }>({ pancard: null, adharFront: null, adharBack: null });
  const [documentPreviews, setDocumentPreviews] = useState({
    pancard: '',
    adharFront: '',
    adharBack: '',
  });

  // State for Bank Details form
  const [bankData, setBankData] = useState({ account_number: '', Ifsc: '', upi_id: '' });

  // Initial data fetching and population
  useEffect(() => {
    if (!user) {
        dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (user) {
      // Populate personal details form
      setPersonalData({
        name: user.name || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
        permanentAddress: user.permanentAddress || '',
        currentAddress: user.currentAddress || '',
        dob: user.dob ? user.dob.split('T')[0] : '',
        gender: (user.gender as 'Male' | 'Female' | 'Other') || 'Male',
        emergencyNumber: user.emergencyNumber || '',
        newPassword: '', confirmPassword: ''
      });
      // Set initial profile image preview from user data
      setProfileImagePreview((user as any).profileImage || '');

      // Set initial document previews from user data
      setDocumentPreviews({
        pancard: user.pancard || '',
        adharFront: user.adharFront || '',
        adharBack: user.adharBack || '',
      });

      // Populate bank details form
      setBankData({
        account_number: user.account_number || '',
        Ifsc: user.Ifsc || '',
        upi_id: user.upi_id || ''
      });
    }
  }, [user]);

  // Handlers for form inputs
  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setProfileImageFile(file);
      setProfileImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      setDocumentFiles(prev => ({ ...prev, [name]: file }));
      setDocumentPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  // Handlers for form submissions
  const handlePersonalUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (personalData.newPassword && personalData.newPassword !== personalData.confirmPassword) {
        toast.error("New passwords do not match.");
        return;
    }
    setIsUpdating(true);

    // 1. Create a FormData object - this is correct.
    const formData = new FormData();
    
    // 2. Append all text fields.
    Object.entries(personalData).forEach(([key, value]) => {
        // Exclude confirmPassword and only append if there's a value
        if (key !== 'confirmPassword' && value) {
            formData.append(key, value);
        }
    });

    // 3. Append the profile image file if a new one was selected.
    if (profileImageFile) {
        formData.append('profileImage', profileImageFile);
    }

    try {
        // 4. Dispatch the FormData object directly. DO NOT convert it back to a plain object.
        await dispatch(updateUserProfile(formData)); // Use .unwrap() for cleaner promise handling
        
        toast.success("Personal details updated successfully!");
        setPersonalModalOpen(false);
        setProfileImageFile(null); // Reset file after successful upload
    } catch (error: any) {
        toast.error(error.message || "Failed to update details. Please try again.");
    } finally {
        setIsUpdating(false);
    }
  };
  
  const handleDocumentUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);

    const formData = new FormData();
    if (documentFiles.pancard) formData.append('pancard', documentFiles.pancard);
    if (documentFiles.adharFront) formData.append('adharFront', documentFiles.adharFront);
    if (documentFiles.adharBack) formData.append('adharBack', documentFiles.adharBack);

    if (Array.from(formData.keys()).length === 0) {
      toast.info("No new documents were selected for upload.");
      setIsUpdating(false);
      return;
    }
    
    const result = await dispatch(updateDocuments(formData as any));
    if (result) {
        toast.success("Documents updated successfully!");
        setDocumentModalOpen(false);
    } else {
        toast.error("Failed to update documents.");
    }
    setIsUpdating(false);
  };

  const handleBankUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    const result = await dispatch(updateBankDetails(bankData));
     if (result) {
        toast.success("Bank details updated successfully!");
        setBankModalOpen(false);
    } else {
        toast.error("Failed to update bank details.");
    }
    setIsUpdating(false);
  };

  // Loading and error states
  if (isLoading && !user) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }
  
  if (!user) {
     return <div className="p-4 text-center mt-20">User not found. Please try logging in again.</div>
  }

  const roleIdArray = (user as any).roleId || [];
  const latestRoleId = roleIdArray.length > 0 ? roleIdArray[roleIdArray.length - 1] : 'N/A';

  return (
    <div className="w-full max-w-4xl mx-auto p-4 sm:p-0 mt-8 mb-8 flex flex-col gap-4">

        {/* User I-Card Section */}
        <Card className="shadow-md">
            <CardContent className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <Avatar className="w-28 h-28 border-4 border-white shadow-lg">
                    <AvatarImage src={(user as any).profileImage} alt={user.name} />
                    <AvatarFallback className="text-4xl bg-gray-100">
                        {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 w-full">
                    <h2 className="text-3xl font-bold text-center sm:text-left">{user.name}</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3 mt-4 text-sm">
                        <div className="flex items-center gap-2 text-gray-600 truncate"><Mail size={14}/> {user.email}</div>
                        <div className="flex items-center gap-2 text-gray-600"><Phone size={14}/> {user.phoneNumber}</div>
                        <div className="flex items-center gap-2 text-gray-600"><ShieldCheck size={14}/> Role ID: {latestRoleId}</div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <CheckCircle size={14} className={user.status === 'Block' ? 'text-destructive' : 'text-green-500'}/>
                            Status: <Badge variant={user.status === "Block" ? "destructive" : "default"}>{user.status}</Badge>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>

        {/* Main Content Card with Tabs */}
        <Card className="shadow-md">
            <CardContent className="p-4 sm:p-6">
                <div className="flex border-b mb-6 overflow-x-auto">
                    <button onClick={() => setActiveTab('personal')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'personal' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}><UserIcon size={16} /> Personal</button>
                    <button onClick={() => setActiveTab('official')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'official' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}><KeyRound size={16} /> Official</button>
                    <button onClick={() => setActiveTab('documents')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'documents' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}><FileText size={16} /> Documents</button>
                    <button onClick={() => setActiveTab('bank')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'bank' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}><Landmark size={16} /> Bank Details</button>
                </div>

                {activeTab === 'personal' && (
                    <div>
                        <DetailItem label="Full Name" value={user.name} />
                        <DetailItem label="Email" value={user.email} />
                        <DetailItem label="Phone Number" value={user.phoneNumber} />
                        <DetailItem label="Permanent Address" value={user.permanentAddress} />
                        <DetailItem label="Current Address" value={user.currentAddress} />
                        <DetailItem label="Date of Birth" value={user.dob ? new Date(user.dob).toLocaleDateString() : '-'} />
                        <DetailItem label="Gender" value={user.gender} />
                        <DetailItem label="Emergency Number" value={user.emergencyNumber} />
                        <Dialog open={isPersonalModalOpen} onOpenChange={setPersonalModalOpen}>
                            <DialogTrigger asChild><Button className="mt-6 w-full md:w-auto"><Edit className="mr-2 h-4 w-4" /> Update Personal Details</Button></DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto">
                                <DialogHeader><DialogTitle>Update Personal Details</DialogTitle></DialogHeader>
                                <form onSubmit={handlePersonalUpdate} className="space-y-4 pt-4">
                                    <div className="flex flex-col items-center space-y-2">
                                      <Label htmlFor="profileImage-upload">Profile Image</Label>
                                      <Avatar className="w-24 h-24 border-2">
                                        <AvatarImage src={profileImagePreview} />
                                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                                      </Avatar>
                                      <Input id="profileImage-upload" name="profileImage" type="file" accept="image/*" onChange={handleProfileImageChange} className="text-xs"/>
                                    </div>
                                    <Label>Name</Label><Input value={personalData.name} onChange={(e) => setPersonalData({...personalData, name: e.target.value})} />
                                    <Label>Email</Label><Input type="email" value={personalData.email} disabled />
                                    <Label>Phone Number</Label><Input value={personalData.phoneNumber} onChange={(e) => setPersonalData({...personalData, phoneNumber: e.target.value})} />
                                    <Label>Permanent Address</Label><Input value={personalData.permanentAddress} onChange={(e) => setPersonalData({...personalData, permanentAddress: e.target.value})} />
                                    <Label>Current Address</Label><Input value={personalData.currentAddress} onChange={(e) => setPersonalData({...personalData, currentAddress: e.target.value})} />
                                    <Label>Date of Birth</Label><Input type="date" value={personalData.dob} onChange={(e) => setPersonalData({...personalData, dob: e.target.value})} />
                                    <Label>Gender</Label><Select value={personalData.gender} onValueChange={(v: any) => setPersonalData({...personalData, gender: v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select>
                                    <Label>Emergency Number</Label><Input value={personalData.emergencyNumber} onChange={(e) => setPersonalData({...personalData, emergencyNumber: e.target.value})} />
                                    <Label className="font-semibold pt-2 block">Change Password</Label>
                                    <Input type="password" placeholder="New Password (leave blank to keep current)" value={personalData.newPassword} onChange={(e) => setPersonalData({...personalData, newPassword: e.target.value})} />
                                    <Input type="password" placeholder="Confirm New Password" value={personalData.confirmPassword} onChange={(e) => setPersonalData({...personalData, confirmPassword: e.target.value})} />
                                    <DialogFooter><Button type="submit" disabled={isUpdating || isLoading}>{isUpdating || isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}</Button></DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
                
                {activeTab === 'official' && (
                    <div>
                        <DetailItem label="Role"><span className="capitalize">{user.role}</span></DetailItem>
                        <DetailItem label="Latest Role ID" value={latestRoleId} />
                        <DetailItem label="All Assigned IDs" value={roleIdArray.join(', ')} />
                        <DetailItem label="Account Status"><Badge variant={user.status === "Block" ? "destructive" : "default"}>{user.status}</Badge></DetailItem>
                        <DetailItem label="Joined On" value={new Date(parseInt(user.createdOn)).toLocaleString()} />
                    </div>
                )}

                {activeTab === 'documents' && (
                    <div>
                        <DocumentItem label="PAN Card" imageUrl={user.pancard} />
                        <DocumentItem label="Aadhaar Card (Front)" imageUrl={user.adharFront} />
                        <DocumentItem label="Aadhaar Card (Back)" imageUrl={user.adharBack} />
                        <Dialog open={isDocumentModalOpen} onOpenChange={setDocumentModalOpen}>
                            <DialogTrigger asChild><Button className="mt-6 w-full md:w-auto"><Edit className="mr-2 h-4 w-4" /> Update Documents</Button></DialogTrigger>
                            <DialogContent className="max-h-[90vh] overflow-y-auto">
                                <DialogHeader><DialogTitle>Update Documents</DialogTitle></DialogHeader>
                                <form onSubmit={handleDocumentUpdate} className="space-y-6 pt-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="pancard-upload">PAN Card</Label>
                                        {documentPreviews.pancard && <img src={documentPreviews.pancard} alt="PAN Preview" className="rounded-lg border object-cover w-full max-w-xs" />}
                                        <Input id="pancard-upload" name="pancard" type="file" accept="image/*" onChange={handleDocumentFileChange} className="mt-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="adharFront-upload">Aadhaar Card (Front)</Label>
                                        {documentPreviews.adharFront && <img src={documentPreviews.adharFront} alt="Aadhaar Front Preview" className="rounded-lg border object-cover w-full max-w-xs" />}
                                        <Input id="adharFront-upload" name="adharFront" type="file" accept="image/*" onChange={handleDocumentFileChange} className="mt-2" />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="adharBack-upload">Aadhaar Card (Back)</Label>
                                        {documentPreviews.adharBack && <img src={documentPreviews.adharBack} alt="Aadhaar Back Preview" className="rounded-lg border object-cover w-full max-w-xs" />}
                                        <Input id="adharBack-upload" name="adharBack" type="file" accept="image/*" onChange={handleDocumentFileChange} className="mt-2" />
                                    </div>
                                    <DialogFooter><Button type="submit" disabled={isUpdating || isLoading}>{isUpdating || isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Upload className="mr-2 h-4 w-4" /> Upload & Save</>}</Button></DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}

                {activeTab === 'bank' && (
                    <div>
                        <DetailItem label="Account Number" value={user.account_number} />
                        <DetailItem label="IFSC Code" value={user.Ifsc} />
                        <DetailItem label="UPI ID" value={user.upi_id} />
                        <Dialog open={isBankModalOpen} onOpenChange={setBankModalOpen}>
                            <DialogTrigger asChild><Button className="mt-6 w-full md:w-auto"><Edit className="mr-2 h-4 w-4" /> Update Bank Details</Button></DialogTrigger>
                            <DialogContent>
                                <DialogHeader><DialogTitle>Update Bank Details</DialogTitle></DialogHeader>
                                <form onSubmit={handleBankUpdate} className="space-y-4 pt-4">
                                    <Label>Account Number</Label><Input value={bankData.account_number} onChange={(e) => setBankData({...bankData, account_number: e.target.value})} />
                                    <Label>IFSC Code</Label><Input value={bankData.Ifsc} onChange={(e) => setBankData({...bankData, Ifsc: e.target.value})} />
                                    <Label>UPI ID</Label><Input value={bankData.upi_id} onChange={(e) => setBankData({...bankData, upi_id: e.target.value})} />
                                    <DialogFooter><Button type="submit" disabled={isUpdating || isLoading}>{isUpdating || isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}</Button></DialogFooter>
                                </form>
                            </DialogContent>
                        </Dialog>
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
};