"use client";

import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch } from '@/lib/store';
import {
  fetchAllLinks,
  createPortalLink,
  updatePortalLink,
  deletePortalLink, // **** NEW: Import delete action ****
  selectAllLinks,
  selectLinksLoading,
  PortalLink,
} from '@/lib/redux/linkSlice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Edit, Save, X, Trash2 } from 'lucide-react'; // **** NEW: Import Trash2 icon ****

// **** NEW: Import AlertDialog components ****
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"


export default function PortalLinksPage() {
  const dispatch = useDispatch<AppDispatch>();
  const links = useSelector(selectAllLinks);
  const isLoading = useSelector(selectLinksLoading);

  const [newPortalName, setNewPortalName] = useState('');
  const [newLink, setNewLink] = useState('');
  const [newCommission, setNewCommission] = useState('');

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingPortalNameValue, setEditingPortalNameValue] = useState(''); // **** NEW ****
  const [editingLinkValue, setEditingLinkValue] = useState('');
  const [editingCommissionValue, setEditingCommissionValue] = useState('');

  // **** NEW: State for delete confirmation ****
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchAllLinks());
  }, [dispatch]);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPortalName || !newLink || !newCommission) return;

    const result = await dispatch(createPortalLink({
      portalName: newPortalName,
      link: newLink,
      commission: newCommission
    }));
    if (result) {
      setNewPortalName('');
      setNewLink('');
      setNewCommission('');
    }
  };

  const handleEditClick = (link: PortalLink) => {
    setEditingId(link._id);
    setEditingPortalNameValue(link.portalName); // **** NEW ****
    setEditingLinkValue(link.link);
    setEditingCommissionValue(link.commission || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingPortalNameValue(''); // **** NEW ****
    setEditingLinkValue('');
    setEditingCommissionValue('');
  };

  const handleUpdateSubmit = async () => {
    if (!editingId) return;
    const result = await dispatch(updatePortalLink(editingId, {
      portalName: editingPortalNameValue, // **** NEW ****
      link: editingLinkValue,
      commission: editingCommissionValue
    }));
    if (result) {
      handleCancelEdit();
    }
  };

  // **** NEW: Handler to open delete confirmation dialog ****
  const handleDeleteClick = (id: string) => {
    setDeletingId(id);
    setIsDeleteDialogOpen(true);
  };

  // **** NEW: Handler to confirm and execute deletion ****
  const handleConfirmDelete = async () => {
    if (!deletingId) return;
    await dispatch(deletePortalLink(deletingId));
    setIsDeleteDialogOpen(false);
    setDeletingId(null);
  };

  return (
    <div className="container mx-auto py-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Left Column: Create Form */}
        <div className="md:col-span-1">
          {/* ... Create form remains the same ... */}
          <Card>
            <CardHeader><CardTitle>Create New Portal Link</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="space-y-2"><Label htmlFor="portalName">Portal Name</Label><Input id="portalName" placeholder="e.g., phonepe" value={newPortalName} onChange={(e) => setNewPortalName(e.target.value)} disabled={isLoading} required /></div>
                <div className="space-y-2"><Label htmlFor="link">Link URL</Label><Input id="link" type="url" placeholder="e.g., https://phonepe.com" value={newLink} onChange={(e) => setNewLink(e.target.value)} disabled={isLoading} required /></div>
                <div className="space-y-2"><Label htmlFor="commission">Commission</Label><Input id="commission" type="text" placeholder="e.g. Rs. 100" required value={newCommission} onChange={(e) => setNewCommission(e.target.value)} disabled={isLoading} /></div>
                <Button type="submit" className="w-full" disabled={isLoading}>{isLoading ? 'Saving...' : 'Create Link'}</Button>
              </form>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: List of Existing Links */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader><CardTitle>Existing Portal Links</CardTitle></CardHeader>
            <CardContent>
              {isLoading && links.length === 0 ? ( <p>Loading...</p> ) : 
               links.length === 0 ? ( <p>No portal links found. Create one to get started.</p> ) : (
                <div className="space-y-2">
                  {links.map((link) => (
                    <div key={link._id}>
                      {editingId === link._id ? (
                        // --- EDITING VIEW ---
                        <div className="flex flex-col gap-3 rounded-md border p-4 bg-muted/50">
                          {/* **** NEW: Edit Portal Name Input **** */}
                          <div className='space-y-2'>
                            <Label htmlFor={`edit-portal-${link._id}`}>Portal Name</Label>
                            <Input id={`edit-portal-${link._id}`} value={editingPortalNameValue} onChange={(e) => setEditingPortalNameValue(e.target.value)} placeholder="Enter portal name"/>
                          </div>
                          <div className='space-y-2'>
                            <Label htmlFor={`edit-link-${link._id}`}>Link URL</Label>
                            <Input id={`edit-link-${link._id}`} value={editingLinkValue} onChange={(e) => setEditingLinkValue(e.target.value)} placeholder="Enter new link URL" />
                          </div>
                          <div className='space-y-2'>
                            <Label htmlFor={`edit-commission-${link._id}`}>Commission</Label>
                            <Input id={`edit-commission-${link._id}`} value={editingCommissionValue} onChange={(e) => setEditingCommissionValue(e.target.value)} placeholder="e.g., 5% or Rs. 10" />
                          </div>
                          <div className="flex items-center justify-end gap-2 mt-2">
                            <Button size="sm" variant="outline" onClick={handleUpdateSubmit} disabled={isLoading}><Save className="h-4 w-4 mr-2" />{isLoading ? 'Saving...' : 'Save'}</Button>
                            <Button size="sm" variant="ghost" onClick={handleCancelEdit}><X className="h-4 w-4 mr-2" />Cancel</Button>
                          </div>
                        </div>
                      ) : (
                        // --- DISPLAY VIEW ---
                        <div className="flex items-center justify-between border-b py-3 group">
                          <div>
                            <p className="text-sm font-medium text-muted-foreground">{link.portalName}</p>
                            <p className="text-sm font-semibold">{link.link}</p>
                            {link.commission && (<p className="text-sm text-green-600 dark:text-green-400 mt-1">Commission: {link.commission}</p>)}
                          </div>
                          {/* **** UPDATED: Action buttons container **** */}
                          <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Button size="icon" variant="ghost" onClick={() => handleEditClick(link)} aria-label={`Edit ${link.portalName}`}><Edit className="h-4 w-4" /></Button>
                            <Button size="icon" variant="ghost" onClick={() => handleDeleteClick(link._id)} className="text-red-500 hover:text-red-600" aria-label={`Delete ${link.portalName}`}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* **** NEW: Delete Confirmation Dialog **** */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the portal link.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingId(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={isLoading}>
              {isLoading ? "Deleting..." : "Continue"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}