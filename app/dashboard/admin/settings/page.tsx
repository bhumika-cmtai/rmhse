"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, User as UserIcon, Landmark, Edit, FileText, KeyRound, Upload, Download } from 'lucide-react';
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
import { CustomAvatar } from '@/components/ui/CustomAvatar';
import Image from 'next/image';

// ===================================================================================
// 1. DEDICATED PRINT STYLESHEET COMPONENT
// This CSS hides everything on the page except for the ID card when printing.
// ===================================================================================
const PrintStyles = () => (
  <style jsx global>{`
    @media print {
      body * {
        visibility: hidden !important;
      }
      #printable-icard, #printable-icard * {
        visibility: visible !important;
      }
      #printable-icard {
        position: absolute !important;
        left: 0 !important;
        top: 0 !important;
        width: 100% !important;
        height: 100vh !important;
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .no-print {
        display: none !important;
      }
      body {
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
        background-color: white !important;
        margin: 0;
      }
      .print-card-shadow {
         box-shadow: none !important;
         border: 1px solid #e5e7eb;
      }
    }
  `}</style>
);

interface ICardProps {
  user: User & { fatherName?: string; profileImage?: string; };
}

// ===================================================================================
// 2. REWRITTEN ICARD COMPONENT (VISUAL ONLY)
// This component renders the card using JSX and Tailwind. No jsPDF logic.
// ===================================================================================
const ICard = ({ user }: ICardProps) => {
  const formatDate = (dateInput: string | number | undefined) => {
    if (!dateInput) return 'N/A';
    const date = new Date(isNaN(Number(dateInput)) ? dateInput : Number(dateInput));
    return date.toLocaleDateString('en-GB');
  };

  const roleIdArray = (user as any).roleId || [];
  const latestRoleId = roleIdArray.length > 0 ? roleIdArray[roleIdArray.length - 1] : 'N/A';

  return (
    <div className="relative shadow-lg rounded-lg w-[350px] h-[550px] font-sans flex flex-col items-center p-6 overflow-hidden border border-gray-200 bg-white print-card-shadow">
      {/* Background Blobs */}
      <div className="absolute w-48 h-48 rounded-full -top-16 -left-24 bg-emerald-100/50"></div>
      <div className="absolute w-64 h-64 rounded-full -top-10 -right-28 bg-emerald-100/50"></div>
      {/* <div className="absolute w-72 h-72 rounded-full -bottom-24 -right-20 bg-emerald-100/50"></div> */}
      <div className="absolute w-56 h-56 rounded-full -bottom-16 -left-24 bg-emerald-100/50"></div>
      
      <div className="text-center z-10">
        <h1 className="text-3xl font-bold text-blue-violet-600">RMHSE TRUST</h1>
        <p className="text-sm font-semibold text-blue-violet-600">राष्ट्रीय मानव हम सब एक</p>
      </div>

      <div className="mt-8 z-10 p-1 rounded-full bg-white">
        <div className="p-1 border-2 rounded-full border-green-400">
          <CustomAvatar src={user.profileImage} fallbackText={user.name} />
        </div>
      </div>

      <div className="text-center mt-4 z-10">
        <h2 className="text-2xl font-extrabold text-gray-800">{user.name || 'YOUR NAME'}</h2>
        <p className="text-sm font-semibold text-gray-500">{user.role || 'JOB POSITION'}</p>
      </div>

      <div className="text-center mt-2 w-full text-sm z-10 space-y-2 pl-4 text-gray-900">
        <div className="flex"><span className="font-bold w-28">Name</span><span className="font-bold mr-2">:</span><span>{user.name || 'XXXXXXXX'}</span></div>
        <div className="flex"><span className="font-bold w-28">Father Name</span><span className="font-bold mr-2">:</span><span>{user.fatherName || 'XXXXXXXXXX'}</span></div>
        <div className="flex"><span className="font-bold w-28">D.O.B</span><span className="font-bold mr-2">:</span><span>{formatDate(user.dob)}</span></div>
        <div className="flex"><span className="font-bold w-28">Join ID</span><span className="font-bold mr-2">:</span><span>{user.joinId || 'N/A'}</span></div>
        <div className="flex"><span className="font-bold w-28">Joining</span><span className="font-bold mr-2">:</span><span>{formatDate(user.createdOn)}</span></div>
        <div className="flex"><span className="font-bold w-28">Post</span><span className="font-bold mr-2">:</span><span className="break-all">{latestRoleId}</span></div>
      </div>

      {/* ========================================================================= */}
      {/* STEP 2 & 3: REPLACE THE SIGNATURE TEXT WITH LAYERED IMAGES              */}
      {/* ========================================================================= */}
      <div className="mt-auto w-full pr-4 z-10 relative h-24">
        {/* Stamp Image (Bottom Layer) */}
        <Image
          src="/stamp.jpg"
          alt="Official Stamp"
          width={30}
          height={30}
          className="absolute -bottom-0 right-13  opacity-90 z-20"
        />
        {/* Signature Image (Top Layer) */}
        <Image
          src="/signature.jpg"
          alt="Signature"
          width={56}
          height={20}
          className="absolute -bottom-6 right-0 -z-20 "
        />
      </div>
    </div>
  );
};


// Helper components for the main page content
const DetailItem = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => ( <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b items-start"><p className="text-sm font-medium text-gray-500">{label}</p><div className="text-sm text-gray-900 break-words col-span-2">{children || value || '-'}</div></div>);
const DocumentItem = ({ label, imageUrl }: { label:string; imageUrl?: string | null }) => ( <div className="py-3 border-b"><div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start"><p className="text-sm font-medium text-gray-500">{label}</p><div className="col-span-2">{imageUrl ? (<a href={imageUrl} target="_blank" rel="noopener noreferrer"><img src={imageUrl} alt={label} className="rounded-lg border object-cover w-full max-w-xs transition-transform hover:scale-105" /></a>) : (<p className="text-sm text-gray-900">-</p>)}</div></div></div>);


// ===================================================================================
// 3. MAIN PAGE COMPONENT
// This now uses the new printing method.
// ===================================================================================
export default function SettingsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const user = useSelector(selectUser);
  const isLoading = useSelector(selectIsLoading);

  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'official' | 'documents' | 'bank'>('personal');
  const [isPersonalModalOpen, setPersonalModalOpen] = useState(false);
  const [isDocumentModalOpen, setDocumentModalOpen] = useState(false);
  const [isBankModalOpen, setBankModalOpen] = useState(false);
  const [personalData, setPersonalData] = useState({ name: '', email: '', phoneNumber: '', permanentAddress: '', currentAddress: '', dob: '', gender: 'Male' as 'Male' | 'Female' | 'Other', emergencyNumber: '', newPassword: '', confirmPassword: '', fatherName: '' });
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [profileImagePreview, setProfileImagePreview] = useState<string>('');
  const [documentFiles, setDocumentFiles] = useState<{ pancard: File | null; adharFront: File | null; adharBack: File | null; }>({ pancard: null, adharFront: null, adharBack: null });
  const [documentPreviews, setDocumentPreviews] = useState({ pancard: '', adharFront: '', adharBack: '' });
  const [bankData, setBankData] = useState({ account_number: '', Ifsc: '', upi_id: '' });

  useEffect(() => { if (!user) dispatch(fetchCurrentUser()); }, [dispatch, user]);
  useEffect(() => {
    if (user) {
      setPersonalData({ name: user.name || '', email: user.email || '', phoneNumber: user.phoneNumber || '', permanentAddress: user.permanentAddress || '', currentAddress: user.currentAddress || '', dob: user.dob ? user.dob.split('T')[0] : '', gender: (user.gender as 'Male' | 'Female' | 'Other') || 'Male', emergencyNumber: user.emergencyNumber || '', newPassword: '', confirmPassword: '', fatherName: (user as any).fatherName || '' });
      setProfileImagePreview((user as any).profileImage || '');
      setDocumentPreviews({ pancard: user.pancard || '', adharFront: user.adharFront || '', adharBack: user.adharBack || '' });
      setBankData({ account_number: user.account_number || '', Ifsc: user.Ifsc || '', upi_id: user.upi_id || '' });
    }
  }, [user]);

  const handleProfileImageChange = (e: React.ChangeEvent<HTMLInputElement>) => { if (e.target.files && e.target.files[0]) { setProfileImageFile(e.target.files[0]); setProfileImagePreview(URL.createObjectURL(e.target.files[0])); } };
  const handleDocumentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { name, files } = e.target; if (files && files[0]) { setDocumentFiles(prev => ({ ...prev, [name]: files[0] })); setDocumentPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(files[0]) })); } };
  
  // All handler functions (handlePersonalUpdate, handleDocumentUpdate, etc.) remain unchanged
  const handlePersonalUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (personalData.newPassword && personalData.newPassword !== personalData.confirmPassword) {
      toast.error("New passwords do not match.");
      return;
    }
    setIsUpdating(true);
    const formData = new FormData();
    Object.entries(personalData).forEach(([key, value]) => {
      if (key !== 'confirmPassword' && value) formData.append(key, value);
    });
    if (profileImageFile) formData.append('profileImage', profileImageFile);
    try {
      const action = await dispatch(updateUserProfile(formData));
      if (!action) {
        throw new Error((action.payload as any)?.message || "Failed to update details.");
      }
      toast.success("Personal details updated successfully!");
      setPersonalModalOpen(false);
      setProfileImageFile(null);
    } catch (error: any) {
      toast.error(error.message);
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
      toast.info("No new documents selected.");
      setIsUpdating(false);
      return;
    }
    try {
      const action = await dispatch(updateDocuments(formData as any));
      if (!action) {
        throw new Error( "Failed to update documents.");
      }
      toast.success("Documents updated successfully!");
      setDocumentModalOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
        setIsUpdating(false);
    }
  };

  const handleBankUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      const action = await dispatch(updateBankDetails(bankData));
      if (!action) {
          throw new Error("Failed to update bank details.");
      }
      toast.success("Bank details updated successfully!");
      setBankModalOpen(false);
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading && !user) return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  if (!user) return <div className="p-4 text-center mt-20">User not found. Please try logging in again.</div>;

  return (
    <>
      <PrintStyles />
      
      <div className="w-full max-w-4xl mx-auto p-4 sm:p-0 mt-8 mb-8 flex flex-col gap-4 no-print">
        <Card className="shadow-md">
            <CardContent className="p-6">
                <div className="flex flex-col items-center justify-center gap-8">
                    <ICard user={user as any} />
                    <div className="flex flex-col items-center gap-4 mt-6 md:mt-0">
                        <p className="text-center font-semibold text-lg">Your Official I-Card</p>
                        <Button onClick={() => window.print()} size="lg">
                            <Download className="mr-2 h-5 w-5" /> Download PDF
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
        <Card className="shadow-md">
            <CardContent className="p-4 sm:p-6">
                <div className="flex border-b mb-6 overflow-x-auto">
                    <button onClick={() => setActiveTab('personal')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'personal' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}><UserIcon size={16} /> Personal</button>
                    <button onClick={() => setActiveTab('official')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'official' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}><KeyRound size={16} /> Official</button>
                    <button onClick={() => setActiveTab('documents')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'documents' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}><FileText size={16} /> Documents</button>
                    <button onClick={() => setActiveTab('bank')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'bank' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}><Landmark size={16} /> Bank Details</button>
                </div>
                {/* All tab content is unchanged and will be hidden on print */}
                {activeTab === 'personal' && (
                    <div>
                        <DetailItem label="Full Name" value={user.name} />
                        <DetailItem label="Father's Name" value={(user as any).fatherName} />
                        <DetailItem label="Email" value={user.email} />
                        <DetailItem label="Phone Number" value={user.phoneNumber} />
                        <DetailItem label="Permanent Address" value={user.permanentAddress} />
                        <DetailItem label="Current Address" value={user.currentAddress} />
                        <DetailItem label="Date of Birth" value={user.dob ? new Date(user.dob).toLocaleDateString() : '-'} />
                        <DetailItem label="Gender" value={user.gender} />
                        <DetailItem label="Emergency Number" value={user.emergencyNumber} />
                        <Dialog open={isPersonalModalOpen} onOpenChange={setPersonalModalOpen}><DialogTrigger asChild><Button className="mt-6 w-full md:w-auto"><Edit className="mr-2 h-4 w-4" /> Update Personal Details</Button></DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Update Personal Details</DialogTitle></DialogHeader><form onSubmit={handlePersonalUpdate} className="space-y-4 pt-4"><div className="flex flex-col items-center space-y-2"><Label htmlFor="profileImage-upload">Profile Image</Label><Avatar className="w-24 h-24 border-2"><AvatarImage src={profileImagePreview} /><AvatarFallback>{user.name.charAt(0)}</AvatarFallback></Avatar><Input id="profileImage-upload" name="profileImage" type="file" accept="image/*" onChange={handleProfileImageChange} className="text-xs"/></div><Label>Name</Label><Input value={personalData.name} onChange={(e) => setPersonalData({...personalData, name: e.target.value})} /><Label>Father's Name</Label><Input value={personalData.fatherName} onChange={(e) => setPersonalData({...personalData, fatherName: e.target.value})} /><Label>Email</Label><Input type="email" value={personalData.email} disabled /><Label>Phone Number</Label><Input value={personalData.phoneNumber} onChange={(e) => setPersonalData({...personalData, phoneNumber: e.target.value})} /><Label>Permanent Address</Label><Input value={personalData.permanentAddress} onChange={(e) => setPersonalData({...personalData, permanentAddress: e.target.value})} /><Label>Current Address</Label><Input value={personalData.currentAddress} onChange={(e) => setPersonalData({...personalData, currentAddress: e.target.value})} /><Label>Date of Birth</Label><Input type="date" value={personalData.dob} onChange={(e) => setPersonalData({...personalData, dob: e.target.value})} /><Label>Gender</Label><Select value={personalData.gender} onValueChange={(v: any) => setPersonalData({...personalData, gender: v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select><Label>Emergency Number</Label><Input value={personalData.emergencyNumber} onChange={(e) => setPersonalData({...personalData, emergencyNumber: e.target.value})} /><Label className="font-semibold pt-2 block">Change Password</Label><Input type="password" placeholder="New Password (leave blank to keep current)" value={personalData.newPassword} onChange={(e) => setPersonalData({...personalData, newPassword: e.target.value})} /><Input type="password" placeholder="Confirm New Password" value={personalData.confirmPassword} onChange={(e) => setPersonalData({...personalData, confirmPassword: e.target.value})} /><DialogFooter><Button type="submit" disabled={isUpdating}>{isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}</Button></DialogFooter></form></DialogContent></Dialog>
                    </div>
                )}
                {activeTab === 'official' && (<div><DetailItem label="Role"><span className="capitalize">{user.role}</span></DetailItem><DetailItem label="Latest Role ID" value={(user as any).roleId?.length > 0 ? (user as any).roleId.slice(-1) : 'N/A'} /><DetailItem label="All Assigned IDs" value={(user as any).roleId?.join(', ')} /><DetailItem label="Account Status"><Badge variant={user.status === "Block" ? "destructive" : "default"}>{user.status}</Badge></DetailItem><DetailItem label="Joined On" value={user.createdOn ? new Date(parseInt(user.createdOn)).toLocaleString() : '-'} /></div>)}
                {activeTab === 'documents' && (<div><DocumentItem label="PAN Card" imageUrl={user.pancard} /><DocumentItem label="Aadhaar Card (Front)" imageUrl={user.adharFront} /><DocumentItem label="Aadhaar Card (Back)" imageUrl={user.adharBack} /><Dialog open={isDocumentModalOpen} onOpenChange={setDocumentModalOpen}><DialogTrigger asChild><Button className="mt-6 w-full md:w-auto"><Edit className="mr-2 h-4 w-4" /> Update Documents</Button></DialogTrigger><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>Update Documents</DialogTitle></DialogHeader><form onSubmit={handleDocumentUpdate} className="space-y-6 pt-4"><div className="space-y-2"><Label htmlFor="pancard-upload">PAN Card</Label>{documentPreviews.pancard && <img src={documentPreviews.pancard} alt="PAN Preview" className="rounded-lg border object-cover w-full max-w-xs" /> }<Input id="pancard-upload" name="pancard" type="file" accept="image/*" onChange={handleDocumentFileChange} className="mt-2" /></div><div className="space-y-2"><Label htmlFor="adharFront-upload">Aadhaar Card (Front)</Label>{documentPreviews.adharFront && <img src={documentPreviews.adharFront} alt="Aadhaar Front Preview" className="rounded-lg border object-cover w-full max-w-xs" /> }<Input id="adharFront-upload" name="adharFront" type="file" accept="image/*" onChange={handleDocumentFileChange} className="mt-2" /></div><div className="space-y-2"><Label htmlFor="adharBack-upload">Aadhaar Card (Back)</Label>{documentPreviews.adharBack && <img src={documentPreviews.adharBack} alt="Aadhaar Back Preview" className="rounded-lg border object-cover w-full max-w-xs" /> }<Input id="adharBack-upload" name="adharBack" type="file" accept="image/*" onChange={handleDocumentFileChange} className="mt-2" /></div><DialogFooter><Button type="submit" disabled={isUpdating}>{isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <><Upload className="mr-2 h-4 w-4" /> Upload & Save</>}</Button></DialogFooter></form></DialogContent></Dialog></div>)}
                {activeTab === 'bank' && (<div><DetailItem label="Account Number" value={user.account_number} /><DetailItem label="IFSC Code" value={user.Ifsc} /><DetailItem label="UPI ID" value={user.upi_id} /><Dialog open={isBankModalOpen} onOpenChange={setBankModalOpen}><DialogTrigger asChild><Button className="mt-6 w-full md:w-auto"><Edit className="mr-2 h-4 w-4" /> Update Bank Details</Button></DialogTrigger><DialogContent><DialogHeader><DialogTitle>Update Bank Details</DialogTitle></DialogHeader><form onSubmit={handleBankUpdate} className="space-y-4 pt-4"><Label>Account Number</Label><Input value={bankData.account_number} onChange={(e) => setBankData({...bankData, account_number: e.target.value})} /><Label>IFSC Code</Label><Input value={bankData.Ifsc} onChange={(e) => setBankData({...bankData, Ifsc: e.target.value})} /><Label>UPI ID</Label><Input value={bankData.upi_id} onChange={(e) => setBankData({...bankData, upi_id: e.target.value})} /><DialogFooter><Button type="submit" disabled={isUpdating}>{isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}</Button></DialogFooter></form></DialogContent></Dialog></div>)}
            </CardContent>
        </Card>
      </div>

      {/* This hidden div will ONLY be visible during printing */}
      <div id="printable-icard" className="hidden">
        <ICard user={user as any} />
      </div>
    </>
  );
};