"use client";

import React, { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useDispatch, useSelector } from 'react-redux';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Upload } from 'lucide-react';
import { toast } from 'sonner';

import { AppDispatch } from '@/lib/store';
import {
  fetchCurrentUser,
  updateDocuments,
  selectUser,
} from '@/lib/redux/authSlice';

export default function UploadDocumentsPage() {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  const user = useSelector(selectUser);

  // --- LOGIC COPIED DIRECTLY FROM YOUR SettingsPage.tsx ---
  const [isUpdating, setIsUpdating] = useState(false); // Local loading state
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

  // Fetch current user if not already in state (e.g., on page refresh)
  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  // Handle file selection and create local previews with size validation
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const maxFileSize = 2 * 1024 * 1024; // 2 MB

      if (file.size > maxFileSize) {
        toast.error("File size should not exceed 2 MB.");
        e.target.value = ''; // Clear the input
        return;
      }

      setDocumentFiles(prev => ({ ...prev, [name]: file }));
      setDocumentPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };

  // --- YOUR EXACT FUNCTION, ADAPTED FOR THIS PAGE ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // We add this validation because for the initial upload, all documents are required.
    if (!documentFiles.pancard || !documentFiles.adharFront || !documentFiles.adharBack) {
        toast.error("Please upload all three documents to proceed.");
        return;
    }

    setIsUpdating(true); // Start local loading state

    const formData = new FormData();
    if (documentFiles.pancard) formData.append('pancard', documentFiles.pancard);
    if (documentFiles.adharFront) formData.append('adharFront', documentFiles.adharFront);
    if (documentFiles.adharBack) formData.append('adharBack', documentFiles.adharBack);

    // This check is good practice, although the validation above already covers it.
    if (Array.from(formData.keys()).length > 0) {
      // Dispatch and await the result, just like in your settings page
      const result = await dispatch(updateDocuments(formData as any)); 
      
      if (result.payload) { // Check if the result has a payload, indicating success
          toast.success("Documents uploaded successfully!");
          // **THE ONLY CHANGE:** Instead of closing a modal, we redirect the user.
          router.push('/dashboard/user');
      } else {
          // This else block will catch errors returned from the thunk
          toast.error("Failed to update documents. Please try again.");
      }
    } else {
      // This case is unlikely to be hit due to the validation above
      toast.info("No documents were selected for upload.");
    }

    console.log(user)
    setIsUpdating(false); // Stop local loading state
  };
  // --- END OF FUNCTION ADAPTATION ---
  

  return (
 <div className="flex items-center justify-center min-h-screen bg-yellow-100 px-4 py-8">
       <Card className="w-full max-w-lg p-8 space-y-8 bg-gradient-to-br from-yellow-200/40 to-green-200/75 rounded-[20px] shadow-lg">
         <CardHeader className="text-center p-0">
           <CardTitle className="text-4xl font-bold text-pink-500">Complete Your Profile</CardTitle>
           <CardDescription className="text-gray-800 pt-2">
             Upload your documents to finalize your account setup.
           </CardDescription>
         </CardHeader>
        <CardContent>
          {/* The form's onSubmit now calls our adapted handleSubmit function */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* PAN Card Section */}
            <div className="space-y-2">
              <Label htmlFor="pancard" className="font-semibold">PAN Card</Label>
              {documentPreviews.pancard && (
                <div className="mt-2"><img src={documentPreviews.pancard} alt="PAN Preview" className="rounded-lg border object-contain h-48 w-auto bg-slate-50" /></div>
              )}
              <Input id="pancard" name="pancard" type="file" accept="image/*" 
              className="w-full bg-white border-[1px] border-black rounded-[12px] focus:outline-none focus:ring-2 focus:ring-purple-400 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              onChange={handleFileChange} required />
            </div>

            {/* Aadhaar Front Section */}
            <div className="space-y-2">
              <Label htmlFor="adharFront" className="font-semibold">Aadhaar Card (Front)</Label>
               {documentPreviews.adharFront && (
                <div className="mt-2"><img src={documentPreviews.adharFront} alt="Aadhaar Front Preview" className="rounded-lg border object-contain h-48 w-auto bg-slate-50" /></div>
              )}
              <Input id="adharFront" name="adharFront" type="file" accept="image/*" 
              className="w-full bg-white border-[1px] border-black rounded-[12px] focus:outline-none focus:ring-2 focus:ring-purple-400 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              onChange={handleFileChange} required />
            </div>

            {/* Aadhaar Back Section */}
            <div className="space-y-2">
              <Label htmlFor="adharBack" className="font-semibold">Aadhaar Card (Back)</Label>
              {documentPreviews.adharBack && (
                <div className="mt-2"><img src={documentPreviews.adharBack} alt="Aadhaar Back Preview" className="rounded-lg border object-contain h-48 w-auto bg-slate-50" /></div>
              )}
              <Input id="adharBack" name="adharBack" type="file" accept="image/*" 
              className="w-full bg-white border-[1px] border-black rounded-[12px] focus:outline-none focus:ring-2 focus:ring-purple-400 transition file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-pink-50 file:text-pink-700 hover:file:bg-pink-100"
              style={{ boxShadow: '0 4px 4px 0 rgba(0, 0, 0, 0.25)' }}
              onChange={handleFileChange} required />
            </div>

            {/* The button is now disabled based on the local isUpdating state */}
            <Button type="submit" className="w-full py-5 text-md" disabled={isUpdating}>
              {isUpdating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Upload and Finish
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}