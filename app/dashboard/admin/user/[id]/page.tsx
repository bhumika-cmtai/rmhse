"use client"; // This directive MUST be at the very top of the file.

import React, { useState, useEffect } from "react";
import Link from 'next/link';
import { useDispatch, useSelector } from "react-redux";
import { fetchUserById, clearSelectedUser, selectUserById, selectLoading, selectError } from "@/lib/redux/userSlice"; // Adjust path as necessary
import { RootState } from "@/lib/store"; // Adjust path as necessary

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, User as UserIcon, FileText, Landmark, Loader2, KeyRound } from "lucide-react";

// The User interface should match the one in your slice
interface User {
    _id?: string;
    name?: string;
    email?: string;
    phoneNumber?: string;
    profileImage?: string; // Assuming these properties exist
    role?: string;
    role_id?: string[];
    status?: string;
    emergency_num?: string;
    dob?: string;
    gender?: string;
    current_add?: string;
    permanent_add?: string;
    referred_by?: string;
    createdOn: string;
    pancard?: string;
    adharFrontImage?: string;
    adharBackImage?: string;
    account_number?: string;
    Ifsc?: string;
    upi_id?: string;
    income?: number;
}


// Helper component for text details
const DetailItem = ({ label, value, children }: { label: string; value?: string | number | null; children?: React.ReactNode }) => (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 py-3 border-b items-start">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <div className="text-sm text-gray-900 break-words col-span-2">
        {children || value || '-'}
      </div>
    </div>
);

// Helper component for displaying image documents
const DocumentItem = ({ label, imageUrl, textValue }: { label: string; imageUrl?: string | null; textValue?: string | null }) => (
    <div className="py-3 border-b">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 items-start">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <div className="col-span-2">
                {textValue && <p className="text-sm text-gray-900 mb-2 font-mono">{textValue}</p>}
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


// The main export is a single Client Component.
export default function UserProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const [activeTab, setActiveTab] = useState<'personal' | 'official' | 'documents' | 'bank'>('personal');
  
  // --- Redux Integration ---
  const dispatch = useDispatch();
  const user = useSelector((state: RootState) => selectUserById(state));
  const loading = useSelector((state: RootState) => selectLoading(state));
  const error = useSelector((state: RootState) => selectError(state));
  // --- End Redux Integration ---

  // Resolve the server-side params promise
  const resolvedParams = React.use(params);
  // console.log("user", user)
  useEffect(() => {
    if (resolvedParams.id) {
      // Dispatch the action to fetch the user by their ID
      dispatch(fetchUserById(resolvedParams.id) as any);
    }
    console.log(user, "user")
    // Cleanup function: runs when the component unmounts
    return () => {
      // Clear the selected user from the store to avoid showing stale data
      dispatch(clearSelectedUser());
    };
  }, [dispatch, resolvedParams.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
        <p className="ml-2">Loading user details...</p>
      </div>
    );
  }

  // Handle both error state and the case where the user is not found
  if (error || !user) {
    return (
      <div className="text-center h-screen flex flex-col justify-center items-center">
        <h1 className="text-2xl font-bold mb-4">{error ? "An Error Occurred" : "User Not Found"}</h1>
        <p className="text-muted-foreground mb-6">{error || "The user you are looking for does not exist."}</p>
        <Link href="/dashboard/admin/users" passHref>
            <Button variant="outline"><ArrowLeft className="mr-2 h-4 w-4"/>Back to User List</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 mb-8">
      <div className="mb-6">
        <Button
          variant="outline"
          className="gap-2"
          type="button"
          onClick={() => window.history.back()}
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Previous Page
        </Button>
      </div>
      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start gap-4">
            <Avatar className="w-24 h-24 border-2 border-primary">
                <AvatarImage src={user.profileImage} alt={user.name || ''} />
                <AvatarFallback className="text-3xl">
                    {user.name ? user.name.split(' ').map(n => n[0]).join('') : ''}
                </AvatarFallback>
            </Avatar>
            <div className="flex-1">
                <CardTitle className="text-3xl">{user.name}</CardTitle>
                <CardDescription>
                    {user.email} · Role ID: {user.roleId?.[user.roleId.length - 1] || 'N/A'}
                </CardDescription>
                <div className="mt-2">
                    <Badge variant={user.status === "Block" ? "destructive" : "default"}>{user.status}</Badge>
                </div>
            </div>
        </CardHeader>
        <CardContent>
          {/* Tab Navigation Buttons */}
          <div className="flex border-b mb-6 overflow-x-auto">
            <button onClick={() => setActiveTab('personal')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'personal' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}>
              <UserIcon size={16} /> Personal
            </button>
            <button onClick={() => setActiveTab('official')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'official' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}>
                <KeyRound size={16} /> Official
            </button>
            <button onClick={() => setActiveTab('documents')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'documents' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}>
              <FileText size={16} /> Documents
            </button>
            <button onClick={() => setActiveTab('bank')} className={`flex items-center gap-2 py-3 px-4 text-sm font-medium transition-colors shrink-0 ${activeTab === 'bank' ? 'border-b-2 border-primary text-primary' : 'text-gray-500 hover:text-primary'}`}>
              <Landmark size={16} /> Bank Details
            </button>
          </div>

          {/* Conditionally Rendered Tab Content */}
          <div>
            {activeTab === 'personal' && (
              <div>
                <DetailItem label="Full Name" value={user.name} />
                <DetailItem label="Email" value={user.email} />
                <DetailItem label="Password" value="••••••••" />
                <DetailItem label="Phone Number" value={user.phoneNumber} />
                <DetailItem label="Emergency Number" value={user.emergencyNumber} />
                <DetailItem label="Date of Birth" value={user.dob ? new Date(user.dob).toLocaleDateString() : "-"} />
                <DetailItem label="Gender" value={user.gender} />
                <DetailItem label="Current Address" value={user.currentAddress} />
                <DetailItem label="Permanent Address" value={user.permanentAddress} />
              </div>
            )}

            {activeTab === 'official' && (
              <div>
                <DetailItem label="Role"><span className="capitalize">{user.role}</span></DetailItem>
                <DetailItem label="Primary Role ID" value={user.roleId?.[0]} />
                <DetailItem label="All Assigned Role IDs" value={user.roleId?.join(', ')} />
                <DetailItem label="Referred By" value={user.refferedBy} />
                <DetailItem label="Status"><Badge variant={user.status === "Block" ? "destructive" : "default"}>{user.status}</Badge></DetailItem>
                <DetailItem label="Joined On" value={user.createdOn ? new Date(user.createdOn).toLocaleString() : "-"} />
              </div>
            )}
            
            {activeTab === 'documents' && (
              <div>
                <DocumentItem label="PAN Card" imageUrl={user.pancard}/>
                <DocumentItem label="Aadhaar Card (Front)" imageUrl={user.adharFront} />
                <DocumentItem label="Aadhaar Card (Back)" imageUrl={user.adharBack} />
              </div>
            )}

            {activeTab === 'bank' && (
              <div>
                <DetailItem label="Account Number" value={user.account_number} />
                <DetailItem label="IFSC Code" value={user.Ifsc} />
                <DetailItem label="UPI ID" value={user.upi_id} />
                <DetailItem label="Income" value={`₹${user.income?.toLocaleString() || 0}`} />
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}