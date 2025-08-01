"use client";

import React, { useState, useEffect } from 'react';
// This component assumes you have Redux setup, but for demonstration, it will use a mock user.
// import { useDispatch, useSelector } from 'react-redux';
// import { AppDispatch } from '@/lib/store';
// import { fetchCurrentUser, selectUser, ... } from '@/lib/redux/authSlice';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, User, Landmark, Edit, FileText } from 'lucide-react';
import { toast } from 'sonner';

// --- MOCK DATA SETUP ---
// Define the new comprehensive user type
type UserProfile = {
  name: string;
  email: string;
  phoneNumber: string;
  permanentAddress: string;
  currentAddress: string;
  dob: string; // Date of Birth
  gender: 'Male' | 'Female' | 'Other';
  emergencyNumber: string;
  adharFrontImage: string; // URL
  adharBackImage: string; // URL
  pancard: string;
  account_number: string;
  ifsc_code: string;
  upi_id: string;
};

// Create a mock user for demonstration purposes
const mockUser: UserProfile = {
  name: "Alex Doe",
  email: "alex.doe@example.com",
  phoneNumber: "987-654-3210",
  permanentAddress: "123 Heritage Lane, Old Town, Anytown 11001",
  currentAddress: "456 Modern Ave, Apt 7B, New City, Anytown 11002",
  dob: "1995-08-15",
  gender: "Male",
  emergencyNumber: "012-345-6789",
  adharFrontImage: "https://via.placeholder.com/300x180.png?text=Aadhaar+Front",
  adharBackImage: "https://via.placeholder.com/300x180.png?text=Aadhaar+Back",
  pancard: "ABCDE1234F",
  account_number: "123456789012",
  ifsc_code: "BANK0001234",
  upi_id: "alex.doe@bankupi",
};
// --- END MOCK DATA ---


// Helper component to display details neatly
const DetailItem = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="grid grid-cols-3 gap-4 py-3 border-b">
    <p className="text-sm font-medium text-gray-500 col-span-1">{label}</p>
    <p className="text-sm text-gray-900 break-words col-span-2">{value || '-'}</p>
  </div>
);

// Helper component for displaying image documents
const DocumentItem = ({ label, imageUrl }: { label: string; imageUrl?: string | null }) => (
    <div className="py-3 border-b">
        <p className="text-sm font-medium text-gray-500 mb-2">{label}</p>
        {imageUrl ? (
            <img src={imageUrl} alt={label} className="rounded-lg border object-cover max-w-xs" />
        ) : (
            <p className="text-sm text-gray-900">-</p>
        )}
    </div>
);


const SettingsPage = () => {
  // const dispatch = useDispatch<AppDispatch>();
  // const user = useSelector(selectUser); // In a real app, you'd use this
  const user = mockUser; // For demonstration, we use the mock user
  const isLoading = false; // Mock loading state

  const [activeTab, setActiveTab] = useState<'personal' | 'documents' | 'bank'>('personal');
  
  // State for each modal
  const [isPersonalModalOpen, setPersonalModalOpen] = useState(false);
  const [isDocumentModalOpen, setDocumentModalOpen] = useState(false);
  const [isBankModalOpen, setBankModalOpen] = useState(false);

  // State for each form
  const [personalData, setPersonalData] = useState({
      name: '', email: '', phoneNumber: '', permanentAddress: '', currentAddress: '',
      dob: '', gender: 'Male' as 'Male' | 'Female' | 'Other', emergencyNumber: '',
      currentPassword: '', newPassword: '', confirmPassword: ''
  });
  const [documentData, setDocumentData] = useState({ adharFrontImage: '', adharBackImage: '', pancard: '' });
  const [bankData, setBankData] = useState({ account_number: '', ifsc_code: '', upi_id: '' });

  // Populate forms when user data is available
  useEffect(() => {
    if (user) {
      setPersonalData({
        name: user.name, email: user.email, phoneNumber: user.phoneNumber,
        permanentAddress: user.permanentAddress, currentAddress: user.currentAddress,
        dob: user.dob, gender: user.gender, emergencyNumber: user.emergencyNumber,
        currentPassword: '', newPassword: '', confirmPassword: ''
      });
      setDocumentData({
        adharFrontImage: user.adharFrontImage, adharBackImage: user.adharBackImage, pancard: user.pancard
      });
      setBankData({
        account_number: user.account_number, ifsc_code: user.ifsc_code, upi_id: user.upi_id
      });
    }
  }, [user]);

  // --- FORM SUBMISSION HANDLERS (DEMO) ---
  const handlePersonalUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToUpdate: { [key: string]: any } = { /* ... build payload securely ... */ };
    console.log("Updating Personal Details with:", personalData);
    toast.success("Personal details updated successfully!");
    setPersonalModalOpen(false);
    // In a real app: await dispatch(updatePersonalDetails(dataToUpdate));
  };
  
  const handleDocumentUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating Documents with:", documentData);
    toast.success("Documents updated successfully!");
    setDocumentModalOpen(false);
    // In a real app: await dispatch(updateDocumentDetails(documentData));
  };

  const handleBankUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Updating Bank Details with:", bankData);
    toast.success("Bank details updated successfully!");
    setBankModalOpen(false);
    // In a real app: await dispatch(updateBankDetails(bankData));
  };

  if (!user) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className=" mx-auto   min-h-screen">
      <Card className=" mx-auto shadow-md">
        <CardHeader className="text-center md:text-left">
          <CardTitle className="text-3xl font-bold">Account Settings</CardTitle>
          <CardDescription>View and manage your personal, document, and financial details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex border-b mb-6 overflow-x-auto">
            <button onClick={() => setActiveTab('personal')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'personal' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}><User size={16} /> Personal</button>
            <button onClick={() => setActiveTab('documents')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'documents' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}><FileText size={16} /> Documents</button>
            <button onClick={() => setActiveTab('bank')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'bank' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}><Landmark size={16} /> Bank Details</button>
          </div>

          {/* Personal Details Tab */}
          {activeTab === 'personal' && (
             <div>
                <DetailItem label="Full Name" value={user.name} />
                <DetailItem label="Email" value={user.email} />
                <DetailItem label="Phone Number" value={user.phoneNumber} />
                <DetailItem label="Permanent Address" value={user.permanentAddress} />
                <DetailItem label="Current Address" value={user.currentAddress} />
                <DetailItem label="Date of Birth" value={user.dob} />
                <DetailItem label="Gender" value={user.gender} />
                <DetailItem label="Emergency Number" value={user.emergencyNumber} />
                <DetailItem label="Password" value="1234" />
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
                            <Input type="password" placeholder="New Password (leave blank to keep current)" value={personalData.newPassword} onChange={(e) => setPersonalData({...personalData, newPassword: e.target.value})} />
                            <Input type="password" placeholder="Confirm New Password" value={personalData.confirmPassword} onChange={(e) => setPersonalData({...personalData, confirmPassword: e.target.value})} />
                            <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
          )}
          
          {/* Documents Tab */}
          {activeTab === 'documents' && (
            <div>
                <DetailItem label="PAN Card Number" value={user.pancard} />
                <DocumentItem label="Aadhaar Card (Front)" imageUrl={user.adharFrontImage} />
                <DocumentItem label="Aadhaar Card (Back)" imageUrl={user.adharBackImage} />
                <Dialog open={isDocumentModalOpen} onOpenChange={setDocumentModalOpen}>
                    <DialogTrigger asChild><Button className="mt-6 w-full md:w-auto"><Edit className="mr-2 h-4 w-4" /> Update Documents</Button></DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Update Documents</DialogTitle></DialogHeader>
                        <form onSubmit={handleDocumentUpdate} className="space-y-4 pt-4">
                            <Label>PAN Card Number</Label><Input value={documentData.pancard} onChange={(e) => setDocumentData({...documentData, pancard: e.target.value})} />
                            <Label>Aadhaar Front Image URL</Label><Input type="text" placeholder="https://..." value={documentData.adharFrontImage} onChange={(e) => setDocumentData({...documentData, adharFrontImage: e.target.value})} />
                            <Label>Aadhaar Back Image URL</Label><Input type="text" placeholder="https://..." value={documentData.adharBackImage} onChange={(e) => setDocumentData({...documentData, adharBackImage: e.target.value})} />
                            <DialogFooter><Button type="submit" disabled={isLoading}>{isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
          )}

          {/* Bank Details Tab */}
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

export default SettingsPage;