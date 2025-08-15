"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, FileUp } from 'lucide-react';
import { toast } from 'sonner';

import { AppDispatch, RootState } from '@/lib/store';
import {
  fetchCurrentUser,
  updateUserDetails,
} from '@/lib/redux/authSlice';

export default function UploadDetailsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const { user, isLoading: isAuthLoading } = useSelector((state: RootState) => state.auth);

  const [isUpdating, setIsUpdating] = useState(false);

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

  const [formData, setFormData] = useState({
    currentAddress: '',
    permanentAddress: '',
    emergencyNumber: '',
  });

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- MODIFICATION START ---
  // Updated to include file size validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const maxFileSize = 2 * 1024 * 1024; // 2MB in bytes

      // Check if the selected file exceeds the 2MB limit
      if (file.size > maxFileSize) {
        toast.error("File size cannot be more than 2MB.");
        e.target.value = ''; // Clear the input field to allow re-selection
        return; // Exit the function to prevent setting the oversized file
      }

      // If the file is valid, set the state and preview
      setDocumentFiles(prev => ({ ...prev, [name]: file }));
      setDocumentPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };
  // --- MODIFICATION END ---


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!documentFiles.pancard || !documentFiles.adharFront || !documentFiles.adharBack || !formData.currentAddress || !formData.permanentAddress || !formData.emergencyNumber) {
        toast.error("Please fill out all fields and upload all three documents.");
        return;
    }

    setIsUpdating(true);

    const submissionData = new FormData();
    submissionData.append('currentAddress', formData.currentAddress);
    submissionData.append('permanentAddress', formData.permanentAddress);
    submissionData.append('emergencyNumber', formData.emergencyNumber);

    if (documentFiles.pancard) submissionData.append('pancard', documentFiles.pancard);
    if (documentFiles.adharFront) submissionData.append('adharFront', documentFiles.adharFront);
    if (documentFiles.adharBack) submissionData.append('adharBack', documentFiles.adharBack);

    const result = await dispatch(updateUserDetails(submissionData as any));
    
    if (result) { // Assuming success is indicated by a payload in the result
        toast.success("Details and documents updated successfully!");
        if (user?._id) {
          router.push(`/payment?userId=${user._id}`);
        } else {
          // Fallback or error handling if user ID is not available
          toast.error("Could not retrieve user ID for payment redirection.");
          router.push('/dashboard'); 
        }
    } else {
        const errorMessage = "Failed to update details. Please try again.";
        toast.error(errorMessage);
    }

    setIsUpdating(false);
  };

  const isLoading = isAuthLoading || isUpdating;

  return (
    <div className="flex items-center justify-center min-h-screen bg-yellow-100 px-4 py-8">
      <Card className="w-full max-w-lg p-8 space-y-8 bg-gradient-to-br from-yellow-200/40 to-green-200/75 rounded-[20px] shadow-lg">
        <CardHeader className="text-center p-0">
          <CardTitle className="text-3xl font-bold text-pink-500">Complete Your Registration</CardTitle>
          <CardDescription className="text-gray-800 pt-2">
            Provide your address and upload your documents.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Address and Emergency Number Inputs */}
            <div className="space-y-4">
              <Label htmlFor="currentAddress" className="font-semibold">Current Address</Label>
               <Textarea name="currentAddress" placeholder="Current Address" value={formData.currentAddress} onChange={handleInputChange} required disabled={isLoading} className="w-full p-4 bg-white border-[1px] border-black rounded-[12px]"/>
              <Label htmlFor="permanentAddress" className="font-semibold">Permanent Address</Label>
               <Textarea name="permanentAddress" placeholder="Permanent Address" value={formData.permanentAddress} onChange={handleInputChange} required disabled={isLoading} className="w-full p-4 bg-white border-[1px] border-black rounded-[12px]"/>
              <Label htmlFor="emergencyNumber" className="font-semibold">Emergency Contact Number</Label>
               <Input name="emergencyNumber" type="tel" placeholder="Emergency Contact Number" value={formData.emergencyNumber} onChange={handleInputChange} required disabled={isLoading} className="w-full p-4 bg-white border-[1px] border-black rounded-[12px]"/>
            </div>

            {/* Document Inputs */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="pancard" className="font-semibold text-gray-800">PAN Card</Label>
                {documentPreviews.pancard && <img src={documentPreviews.pancard} alt="PAN Preview" className="mt-2 rounded-lg border h-32 w-auto"/>}
                <Input id="pancard" name="pancard" type="file" onChange={handleFileChange} required disabled={isLoading} accept="image/*" className="w-full bg-white border-[1px] border-black rounded-[12px]"/>
              </div>
              <div>
                <Label htmlFor="adharFront" className="font-semibold text-gray-800">Aadhaar Card (Front)</Label>
                {documentPreviews.adharFront && <img src={documentPreviews.adharFront} alt="Aadhaar Front Preview" className="mt-2 rounded-lg border h-32 w-auto"/>}
                <Input id="adharFront" name="adharFront" type="file" onChange={handleFileChange} required disabled={isLoading} accept="image/*" className="w-full bg-white border-[1px] border-black rounded-[12px]"/>
              </div>
              <div>
                <Label htmlFor="adharBack" className="font-semibold text-gray-800">Aadhaar Card (Back)</Label>
                {documentPreviews.adharBack && <img src={documentPreviews.adharBack} alt="Aadhaar Back Preview" className="mt-2 rounded-lg border h-32 w-auto"/>}
                <Input id="adharBack" name="adharBack" type="file" onChange={handleFileChange} required disabled={isLoading} accept="image/*" className="w-full bg-white border-[1px] border-black rounded-[12px]"/>
              </div>
            </div>

            <Button type="submit" className="w-full py-5 font-semibold" disabled={isLoading}>
              {isLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin"/>Submitting...</> : <><FileUp className="mr-2 h-4 w-4"/>Submit and Finish</>}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}