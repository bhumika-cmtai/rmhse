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
import { Loader2, User as UserIcon, Landmark, Edit, FileText, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

// --- MOCK DATA SETUP ---
// This user profile includes all fields for the new layout
type UserProfile = {
  name: string;
  email: string;
  phoneNumber: string;
  permanentAddress: string;
  currentAddress: string;
  dob: string;
  gender: 'Male' | 'Female' | 'Other';
  emergencyNumber: string;
  password?: string;
  profileImage?: string;
  role: 'div' | 'dist' | 'stat' | 'bm' | 'superadmin';
  role_id: string[];
  status: 'Active' | 'Block';
  referred_by: string;
  joinedOn: string;
  adharFrontImage: string;
  adharBackImage: string;
  pancard: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
};

const mockUser: UserProfile = {
  name: "Praveen",
  email: "praveen.doe@example.com",
  phoneNumber: "987-654-3210",
  permanentAddress: "123 Heritage Lane, Old Town, Anytown 11001",
  currentAddress: "456 Modern Ave, Apt 7B, New City, Anytown 11002",
  dob: "1995-08-15",
  gender: "Male",
  emergencyNumber: "012-345-6789",
  profileImage: "https://via.placeholder.com/400x250.png?text=admin",
  password: "password123",
  role: 'bm',
  role_id: ['BM001'],
  status: 'Active',
  referred_by: 'BM001',
  joinedOn: new Date(2023, 5, 20).toISOString(),
  adharFrontImage: "https://via.placeholder.com/400x250.png?text=Aadhaar+Front",
  adharBackImage: "https://via.placeholder.com/400x250.png?text=Aadhaar+Back",
  pancard: "https://via.placeholder.com/400x250.png?text=Pancard",
  account_number: "123456789012",
  ifsc_code: "BANK0001234",
  upi_id: "praveen@bankupi",
};
// --- END MOCK DATA ---


// Helper component for text details
const DetailItem = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b items-start">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="text-sm text-gray-900 break-words col-span-2">
        {children || value || '-'}
      </div>
    </div>
);

// Helper component for image documents
const DocumentItem = ({ label, imageUrl, textValue }: { label: string; imageUrl?: string | null, textValue?: string | null }) => (
    <div className="py-3 border-b">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <div className="col-span-2">
                {textValue && <p className="text-sm text-gray-900 font-mono mb-2">{textValue}</p>}
                {imageUrl ? (
                    <a href={imageUrl} target="_blank" rel="noopener noreferrer">
                        <img src={imageUrl} alt={label} className="rounded-lg border object-cover w-full max-w-xs transition-transform hover:scale-105" />
                    </a>
                ) : !textValue ? (
                    <p className="text-sm text-gray-900">-</p>
                ) : null}
            </div>
        </div>
    </div>
);


export default function SettingsPage() {
  const [user, setUser] = useState(mockUser); // Use state to allow for updates
  const isLoading = false;

  const [activeTab, setActiveTab] = useState<'personal' | 'official' | 'documents' | 'bank'>('personal');
  
  const [isPersonalModalOpen, setPersonalModalOpen] = useState(false);
  const [isDocumentModalOpen, setDocumentModalOpen] = useState(false);
  const [isBankModalOpen, setBankModalOpen] = useState(false);

  const [personalData, setPersonalData] = useState({
      name: '', email: '', phoneNumber: '', permanentAddress: '', currentAddress: '',
      dob: '', gender: 'Male' as 'Male' | 'Female' | 'Other', emergencyNumber: '',
      newPassword: '', confirmPassword: ''
  });
  const [documentData, setDocumentData] = useState({ adharFrontImage: '', adharBackImage: '', pancard: '' });
  const [bankData, setBankData] = useState({ account_number: '', ifsc_code: '', upi_id: '' });

  useEffect(() => {
    if (user) {
      setPersonalData({
        name: user.name, email: user.email, phoneNumber: user.phoneNumber,
        permanentAddress: user.permanentAddress, currentAddress: user.currentAddress,
        dob: user.dob, gender: user.gender, emergencyNumber: user.emergencyNumber,
        newPassword: '', confirmPassword: ''
      });
      setDocumentData({
        adharFrontImage: user.adharFrontImage, adharBackImage: user.adharBackImage, pancard: user.pancard
      });
      setBankData({
        account_number: user.account_number, ifsc_code: user.ifsc_code, upi_id: user.upi_id
      });
    }
  }, [user]);

  const handlePersonalUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (personalData.newPassword && personalData.newPassword !== personalData.confirmPassword) {
        toast.error("New passwords do not match.");
        return;
    }
    // Update the main user state to reflect changes instantly on the page
    setUser(prevUser => ({...prevUser, ...personalData}));
    toast.success("Personal details updated successfully!");
    setPersonalModalOpen(false);
  };
  
  const handleDocumentUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUser(prevUser => ({...prevUser, ...documentData}));
    toast.success("Documents updated successfully!");
    setDocumentModalOpen(false);
  };

  const handleBankUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setUser(prevUser => ({...prevUser, ...bankData}));
    toast.success("Bank details updated successfully!");
    setBankModalOpen(false);
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-8">
      <Card className="shadow-md">
        <CardHeader className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="w-24 h-24 border-2 border-primary">
                <AvatarImage src={user.profileImage} alt={user.name} />
                <AvatarFallback className="text-3xl">
                    {user.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <CardTitle className="text-3xl">{user.name}</CardTitle>
                <CardDescription>
                    {user.email} · Role ID: {user.role_id[0]}
                </CardDescription>
                <div className="mt-2">
                    <Badge variant={user.status === "Block" ? "destructive" : "default"}>{user.status}</Badge>
                </div>
            </div>
        </CardHeader>
        <CardContent>
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
                <DetailItem label="Password" value={user.password} />
                <DetailItem label="Phone Number" value={user.phoneNumber} />
                <DetailItem label="Permanent Address" value={user.permanentAddress} />
                <DetailItem label="Current Address" value={user.currentAddress} />
                <DetailItem label="Date of Birth" value={user.dob} />
                <DetailItem label="Gender" value={user.gender} />
                <DetailItem label="Emergency Number" value={user.emergencyNumber} />
                <Dialog open={isPersonalModalOpen} onOpenChange={setPersonalModalOpen}>
                    <DialogTrigger asChild><Button className="mt-6 w-full md:w-auto"><Edit className="mr-2 h-4 w-4" /> Update Personal Details</Button></DialogTrigger>
                    <DialogContent className="max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Update Personal Details</DialogTitle></DialogHeader>
                        <form onSubmit={handlePersonalUpdate} className="space-y-4 pt-4">
                            <Label>Name</Label><Input value={personalData.name} onChange={(e) => setPersonalData({...personalData, name: e.target.value})} />
                            <Label>Email</Label><Input type="email" value={personalData.email} disabled />
                            <Label>Phone Number</Label><Input value={personalData.phoneNumber} onChange={(e) => setPersonalData({...personalData, phoneNumber: e.target.value})} />
                            <Label>Permanent Address</Label><Input value={personalData.permanentAddress} onChange={(e) => setPersonalData({...personalData, permanentAddress: e.target.value})} />
                            <Label>Current Address</Label><Input value={personalData.currentAddress} onChange={(e) => setPersonalData({...personalData, currentAddress: e.target.value})} />
                            <Label>Date of Birth</Label><Input type="date" value={personalData.dob} onChange={(e) => setPersonalData({...personalData, dob: e.target.value})} />
                            <Label>Gender</Label><Select value={personalData.gender} onValueChange={(v: any) => setPersonalData({...personalData, gender: v})}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select>
                            <Label>Emergency Number</Label><Input value={personalData.emergencyNumber} onChange={(e) => setPersonalData({...personalData, emergencyNumber: e.target.value})} />
                            <Label className="font-semibold">Change Password</Label>
                            <Input type="password" placeholder="New Password (leave blank)" value={personalData.newPassword} onChange={(e) => setPersonalData({...personalData, newPassword: e.target.value})} />
                            <Input type="password" placeholder="Confirm New Password" value={personalData.confirmPassword} onChange={(e) => setPersonalData({...personalData, confirmPassword: e.target.value})} />
                            <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
          )}
          
          {activeTab === 'official' && (
              <div>
                <DetailItem label="Role"><span className="capitalize">{user.role}</span></DetailItem>
                <DetailItem label="Primary Role ID" value={user.role_id[0]} />
                <DetailItem label="All Assigned IDs" value={user.role_id.join(', ')} />
                <DetailItem label="Referred By" value={user.referred_by} />
                <DetailItem label="Account Status"><Badge variant={user.status === "Block" ? "destructive" : "default"}>{user.status}</Badge></DetailItem>
                <DetailItem label="Joined On" value={new Date(user.joinedOn).toLocaleString()} />
              </div>
          )}

          {activeTab === 'documents' && (
            <div>
                <DocumentItem label="PAN Card" imageUrl={user.pancard} />
                <DocumentItem label="Aadhaar Card (Front)" imageUrl={user.adharFrontImage} />
                <DocumentItem label="Aadhaar Card (Back)" imageUrl={user.adharBackImage} />
                <Dialog open={isDocumentModalOpen} onOpenChange={setDocumentModalOpen}>
                    <DialogTrigger asChild><Button className="mt-6 w-full md:w-auto"><Edit className="mr-2 h-4 w-4" /> Update Documents</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Update Documents</DialogTitle></DialogHeader>
                        <form onSubmit={handleDocumentUpdate} className="space-y-4 pt-4">
                            <Label>PAN Card</Label><Input value={documentData.pancard} onChange={(e) => setDocumentData({...documentData, pancard: e.target.value})} />
                            <Label>Aadhaar Front Image URL</Label><Input type="text" placeholder="https://..." value={documentData.adharFrontImage} onChange={(e) => setDocumentData({...documentData, adharFrontImage: e.target.value})} />
                            <Label>Aadhaar Back Image URL</Label><Input type="text" placeholder="https://..." value={documentData.adharBackImage} onChange={(e) => setDocumentData({...documentData, adharBackImage: e.target.value})} />
                            <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
          )}

          {activeTab === 'bank' && (
            <div>
                <DetailItem label="Account Number" value={user.account_number} />
                <DetailItem label="IFSC Code" value={user.ifsc_code} />
                <DetailItem label="UPI ID" value={user.upi_id} />
                <Dialog open={isBankModalOpen} onOpenChange={setBankModalOpen}>
                    <DialogTrigger asChild><Button className="mt-6 w-full md:w-auto"><Edit className="mr-2 h-4 w-4" /> Update Bank Details</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Update Bank Details</DialogTitle></DialogHeader>
                        <form onSubmit={handleBankUpdate} className="space-y-4 pt-4">
                            <Label>Account Number</Label><Input value={bankData.account_number} onChange={(e) => setBankData({...bankData, account_number: e.target.value})} />
                            <Label>IFSC Code</Label><Input value={bankData.ifsc_code} onChange={(e) => setBankData({...bankData, ifsc_code: e.target.value})} />
                            <Label>UPI ID</Label><Input value={bankData.upi_id} onChange={(e) => setBankData({...bankData, upi_id: e.target.value})} />
                            <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}</Button></DialogFooter>
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