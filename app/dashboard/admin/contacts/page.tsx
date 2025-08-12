"use client";

import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store"; // Adjust path if needed
import {
  fetchContacts,
  updateContact,
  deleteContact,
  selectContacts,
  selectLoading,
  selectError,
  selectPagination,
  Contact,
  setCurrentPage,
} from "@/lib/redux/contactSlice"; // Adjust path if needed

// Import all necessary Shadcn Components
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

// Define the full interface, including message
interface FullContact extends Contact {
    message: string;
}

const ManageContactsPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  // === Redux State Selection ===
  const contacts = useSelector(selectContacts);
  const { currentPage, totalPages } = useSelector(selectPagination);
  const isLoading = useSelector(selectLoading);
  const reduxError = useSelector(selectError);

  // === Component State Management ===
  const [statusFilter, setStatusFilter] = useState<string>("All");
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedContact, setSelectedContact] = useState<FullContact | null>(null);
  
  // Local state for the edit dialog form
  const [newStatus, setNewStatus] = useState<string>("");
  const [reason, setReason] = useState<string>("");

  // === Data Fetching Effect ===
  useEffect(() => {
    dispatch(fetchContacts({ page: currentPage }));
  }, [dispatch, currentPage]);

  // === Client-Side Filtering using useMemo for efficiency ===
  const filteredContacts = useMemo(() => {
    if (statusFilter === "All") {
      return contacts;
    }
    return contacts.filter((contact) => contact.status === statusFilter);
  }, [contacts, statusFilter]);
  
  // === Event Handlers ===
  const handleEditOpen = (contact: FullContact) => {
    setSelectedContact(contact);
    setNewStatus(contact.status || "New"); // Pre-fill with current status
    setReason(contact.reason || "");
    setIsEditDialogOpen(true);
  };

  const handleDeleteOpen = (contact: FullContact) => {
    setSelectedContact(contact);
    setIsDeleteDialogOpen(true);
  };
  
  const confirmDelete = async () => {
    if (selectedContact && selectedContact._id) {
      const result = await dispatch(deleteContact(selectedContact._id));
      if (result) {
        // Refetch the current page to update the list
        dispatch(fetchContacts({ page: currentPage }));
      }
    }
    setIsDeleteDialogOpen(false);
    setSelectedContact(null);
  };

  const handleUpdateStatus = async () => {
    if (selectedContact && selectedContact._id && newStatus) {
        const contactData: Partial<Contact> = {
            status: newStatus,
            reason: reason,
        };
      const result = await dispatch(updateContact(selectedContact._id, contactData));
      if (result) {
        // Refetch to see changes immediately
        dispatch(fetchContacts({ page: currentPage }));
        setIsEditDialogOpen(false);
        setSelectedContact(null);
      }
    }
  };

  const handlePageChange = (newPage: number) => {
    dispatch(setCurrentPage(newPage));
  };
  
  // Helper to get badge color based on status
  const getStatusBadgeVariant = (status?: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-500 hover:bg-blue-500/90';
      case 'Contacted':
        return 'bg-yellow-500 hover:bg-yellow-500/90 text-black';
      case 'Not Interested':
        return 'bg-red-500 hover:bg-red-500/90';
      default:
        return 'bg-gray-500 hover:bg-gray-500/90';
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Contact Inquiries</h1>
        <div className="w-[180px]">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger>
              <SelectValue placeholder="Filter by status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="All">All Statuses</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Not Interested">Not Interested</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading && contacts.length === 0 && <p>Loading contacts...</p>}
      {reduxError && <p className="text-red-500">Error: {reduxError}</p>}

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email / Phone</TableHead>
              <TableHead>Message</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <TableRow key={contact._id}>
                  <TableCell className="font-medium">{contact.name}</TableCell>
                  <TableCell>
                    <div>{contact.email}</div>
                    <div className="text-sm text-gray-500">{contact.phoneNumber}</div>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {(contact as FullContact).message}
                  </TableCell>
                  <TableCell>
                    <Badge className={getStatusBadgeVariant(contact.status)}>{contact.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button variant="ghost" size="sm" onClick={() => handleEditOpen(contact as FullContact)}>Edit</Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDeleteOpen(contact as FullContact)}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="h-24 text-center">
                  No contacts found for the selected filter.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage <= 1}>
          Previous
        </Button>
        <span>Page {currentPage} of {totalPages || 1}</span>
        <Button variant="outline" size="sm" onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage >= totalPages}>
          Next
        </Button>
      </div>

      {/* Edit Status Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact Status</DialogTitle>
            <DialogDescription>Update the status for {selectedContact?.name}.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus}>
                  <SelectTrigger id="status">
                      <SelectValue placeholder="Select a status" />
                  </SelectTrigger>
                  <SelectContent>
                      <SelectItem value="New">New</SelectItem>
                      <SelectItem value="Contacted">Contacted</SelectItem>
                      <SelectItem value="Not Interested">Not Interested</SelectItem>
                  </SelectContent>
              </Select>
            </div>
            {/* {newStatus === 'Not Interested' && (
              <div className="grid gap-2">
                  <Label htmlFor="reason">Reason (Optional)</Label>
                  <Textarea id="reason" value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Enter reason if not interested..."/>
              </div>
            )} */}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleUpdateStatus}>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <AlertDialogContent>
              <AlertDialogHeader>
                  <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                  <AlertDialogDescription>
                      This will permanently delete the contact inquiry from {selectedContact?.name}. This action cannot be undone.
                  </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                  <AlertDialogCancel onClick={() => setSelectedContact(null)}>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
                      Delete
                  </AlertDialogAction>
              </AlertDialogFooter>
          </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageContactsPage;