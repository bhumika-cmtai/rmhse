// app/dashboard/settings/page.tsx

"use client";
import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import { 
  fetchCurrentUser, 
  selectUser, 
  selectIsLoading as selectAuthLoading, 
  updateUserProfile, 
  selectError as selectAuthError,
  setError as setAuthError
} from '@/lib/redux/authSlice';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, User, Edit } from 'lucide-react';
import { toast } from 'sonner';

const DetailItem = ({ label, value }: { label: string; value?: string | number | null }) => (
  <div className="flex justify-between items-center py-3 border-b last:border-b-0">
    <p className="text-sm font-medium text-gray-500">{label}</p>
    <p className="text-sm text-gray-900 break-all">{value || '-'}</p>
  </div>
);

const SettingsPage = () => {
  const dispatch = useDispatch<AppDispatch>();
  
  // Auth State
  const user = useSelector(selectUser);
  const isAuthLoading = useSelector(selectAuthLoading);
  const authError = useSelector(selectAuthError);

  // Profile Modal State
  const [profileData, setProfileData] = useState({ name: '', whatsappNumber: '', city: '', bio: '', newPassword: '', confirmPassword: '' });
  const [isProfileModalOpen, setProfileModalOpen] = useState(false);

  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (authError) {
      toast.error(authError);
      dispatch(setAuthError(null));
    }
  }, [authError, dispatch]);

  useEffect(() => {
    if (user) {
      setProfileData({ name: user.name || '', whatsappNumber: user.whatsappNumber || '', city: user.city || '', bio: user.bio || '', newPassword: '', confirmPassword: '' });
    }
  }, [user]);

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const dataToUpdate: { [key: string]: any } = { 
      name: profileData.name, 
      whatsappNumber: profileData.whatsappNumber, 
      city: profileData.city, 
      bio: profileData.bio 
    };

    if (profileData.newPassword) {
      if (profileData.newPassword !== profileData.confirmPassword) {
        toast.error("New passwords do not match.");
        return;
      }
      dataToUpdate.password = profileData.newPassword;
    }

    const result = await dispatch(updateUserProfile(dataToUpdate));
    if (result) {
      toast.success("Profile updated successfully!");
      setProfileModalOpen(false);
    }
  };

  if (isAuthLoading && !user) {
    return <div className="flex items-center justify-center h-screen"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!user) {
    return <div className="flex items-center justify-center h-screen"><p>Could not load user data. Please try logging in again.</p></div>;
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-50 min-h-screen">
      <Card className="max-w-4xl mx-auto shadow-md">
        <CardHeader className="text-center md:text-left">
          <CardTitle className="text-3xl font-bold">Account Settings</CardTitle>
          <CardDescription>View and manage your personal details.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex border-b mb-6">
            <button className={`flex items-center gap-2 py-3 px-4 text-sm font-medium border-b-2 border-primary text-primary`}>
              <User size={16} /> Profile Details
            </button>
          </div>

          <div>
            <DetailItem label="Full Name" value={user.name} />
            <DetailItem label="Email" value={user.email} />
            <DetailItem label="Role" value={user.role} />
            <DetailItem label="WhatsApp Number" value={user.whatsappNumber} />
            <DetailItem label="City" value={user.city} />
            <DetailItem label="Bio" value={user.bio} />
            <Dialog open={isProfileModalOpen} onOpenChange={setProfileModalOpen}>
              <DialogTrigger asChild>
                <Button className="mt-6 w-full md:w-auto">
                  <Edit className="mr-2 h-4 w-4" /> Update Profile
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Update Profile Details</DialogTitle></DialogHeader>
                <form onSubmit={handleProfileUpdate} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input id="name" value={profileData.name} onChange={(e) => setProfileData({ ...profileData, name: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="whatsapp">WhatsApp Number</Label>
                    <Input id="whatsapp" value={profileData.whatsappNumber} onChange={(e) => setProfileData({ ...profileData, whatsappNumber: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">City</Label>
                    <Input id="city" value={profileData.city} onChange={(e) => setProfileData({ ...profileData, city: e.target.value })} />
                  </div>
                   <div className="space-y-2">
                    <Label htmlFor="bio">Bio</Label>
                    <Input id="bio" value={profileData.bio} onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" placeholder="Leave blank to keep current" value={profileData.newPassword} onChange={(e) => setProfileData({ ...profileData, newPassword: e.target.value })} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" placeholder="Confirm new password" value={profileData.confirmPassword} onChange={(e) => setProfileData({ ...profileData, confirmPassword: e.target.value })} />
                  </div>
                  <DialogFooter>
                    <Button type="submit" disabled={isAuthLoading}>
                      {isAuthLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Save Changes"}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsPage;