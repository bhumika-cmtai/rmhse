"use client";
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Phone, Mail, Loader2, Download, Trash2, CheckSquare, Square } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";
import {
  fetchContacts,
  updateContact,
  deleteContact,
  selectContacts,
  deleteManyContacts,
  selectLoading,
  selectPagination,
  Contact, // Assuming Contact type now includes `reason?: string`
} from "@/lib/redux/contactSlice";
import { AppDispatch } from "@/lib/store";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DeleteConfirmationModal } from "@/app/components/ui/delete-confirmation-modal";
import axios from "axios"; // Added axios import

// Debounce hook for search functionality
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}

export default function Contacts() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors for Redux state
  const contacts = useSelector(selectContacts);
  const { currentPage, totalPages, totalContacts } = useSelector(selectPagination);
  const isListLoading = useSelector(selectLoading);

  // Local state for UI interactions
  const [search, setSearch] = useState("");
  const debouncedSearch = useDebounce(search, 500);
  const [page, setPage] = useState(1);
  
  // State for the update modal
  const [editContact, setEditContact] = useState<Contact | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [reason, setReason] = useState(""); // State for the 'NotInterested' reason
  const [isUpdating, setIsUpdating] = useState(false);
  
  // State for delete confirmation modal
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSingleDeleteModalOpen, setIsSingleDeleteModalOpen] = useState(false);

  // State for the export modal
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState("all");

  // New state for multiple selection
  const [selectedContacts, setSelectedContacts] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const ITEMS_PER_PAGE = 15;

  // Fetch contacts when page or search query changes
  useEffect(() => {
    dispatch(fetchContacts({ page, searchQuery: debouncedSearch, limit: ITEMS_PER_PAGE }));
  }, [dispatch, page, debouncedSearch]);

  // Reset to page 1 when a new search is performed
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch]);

  // Handler to open the update modal
  const openUpdateModal = (contact: Contact) => {
    setEditContact(contact);
    setNewStatus(contact.status || "New");
    setReason(contact.reason || ""); // Initialize reason state
    setModalOpen(true);
  };

  // Handler to submit the status update
  const handleStatusUpdate = async () => {
    if (!editContact || !editContact._id || !newStatus) return;
    if (newStatus === 'NotInterested' && !reason.trim()) {
        toast.error("A reason is required when status is 'Not Interested'.");
        return;
    }

    setIsUpdating(true);
    try {
      const payload: { status: string; reason?: string } = { status: newStatus };
      if (newStatus === 'NotInterested') {
        payload.reason = reason;
      } else {
        // Ensure reason is cleared if status is not 'NotInterested'
        payload.reason = ''; 
      }
      
      await dispatch(updateContact(editContact._id, payload));
      
      // Refetch the current page to show updated data
      dispatch(fetchContacts({ page, searchQuery: debouncedSearch, limit: ITEMS_PER_PAGE }));
      setModalOpen(false);
      toast.success("Contact status updated successfully!");
    } catch (error) {
      toast.error("Failed to update contact status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Handler to open the delete confirmation modal
  const openDeleteConfirmation = (contact: Contact) => {
    setContactToDelete(contact);
    setIsSingleDeleteModalOpen(true);
  };

  // Handler to submit the deletion
  const handleDeleteContact = async () => {
    if (!contactToDelete?._id) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteContact(contactToDelete._id));
      toast.success(`Contact for "${contactToDelete.name}" has been deleted.`);
      setContactToDelete(null); // Close the dialog
      setIsSingleDeleteModalOpen(false);

      const newPage = contacts.length === 1 && page > 1 ? page - 1 : page;
      if (newPage !== page) {
        setPage(newPage);
      } else {
        dispatch(fetchContacts({ page, searchQuery: debouncedSearch, limit: ITEMS_PER_PAGE }));
      }
    } catch (error) {
      toast.error("Failed to delete contact.");
    } finally {
      setIsDeleting(false);
    }
  };

  // Function to handle the CSV export
  const handleExport = async () => {
    let allContacts: Contact[] = [];
    try {
      // Fetch all contacts matching current filters (not just current page)
      const params: any = {
        searchQuery: search,
        page: 1,
        limit: 10000 // Large limit to get all
      };
      if (exportStatus !== "all") {
        params.status = exportStatus;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/contacts/getAllContact`, { params });
      allContacts = response.data?.data?.contacts || [];

      if (!allContacts || allContacts.length === 0) {
        toast.warning("No contacts found to export.");
        return;
      }

      toast.success(`Found ${allContacts.length} contacts to export.`);

      const headers = ["Name", "Email", "Phone Number", "Status", "Remark", "Created"];
      const csvContent = [
        headers.join(","),
        ...allContacts.map(contact => [
          `"${(contact.name || '').replace(/"/g, '""')}"`,
          `"${(contact.email || '').replace(/"/g, '""')}"`,
          `"${contact.phoneNumber || ''}"`,
          `"${contact.status || 'N/A'}"`,
          `"${(contact.reason || '').replace(/"/g, '""')}"`,
          `"${contact.createdOn ? new Date(parseInt(contact.createdOn)).toLocaleDateString() : 'N/A'}"`
        ].join(","))
      ].join("\n");
      
      const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" }); // Add BOM for Excel compatibility
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `contacts-${exportStatus.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url); // Clean up the URL object
      
      setExportModalOpen(false);
      toast.success(`Successfully exported ${allContacts.length} contacts.`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error("Failed to export contacts data. Please try again.");
    }
  };

  // Handler for selecting/deselecting a single contact
  const toggleContactSelection = (contactId: string) => {
    setSelectedContacts(prev => 
      prev.includes(contactId)
        ? prev.filter(id => id !== contactId)
        : [...prev, contactId]
    );
  };

  // Handler for selecting/deselecting all contacts
  const toggleSelectAll = () => {
    if (selectedContacts.length === contacts.length) {
      setSelectedContacts([]);
    } else {
      setSelectedContacts(contacts.map(contact => contact._id || '').filter(Boolean));
    }
  };

  // Handler for bulk delete action
  const handleBulkDelete = () => {
    if (selectedContacts.length === 0) {
      toast.warning("No contacts selected for deletion");
      return;
    }
    setIsBulkDeleteModalOpen(true);
  };

  // Handler to confirm bulk deletion
  const confirmBulkDelete = async () => {
    const result = await dispatch(deleteManyContacts(selectedContacts));
    if (result) {
      toast.success(`${selectedContacts.length} contacts would be deleted`);
      setIsBulkDeleteModalOpen(false);
      setSelectedContacts([]);
    } else {
      toast.error("Failed to delete contacts");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-500";
      case "RegisterationDone": return "bg-green-500";
      case "CallCut": return "bg-orange-500";
      case "CallNotPickUp": return "bg-yellow-500";
      case "NotInterested": return "bg-red-500";
      case "InvalidNumber": return "bg-slate-600";
      default: return "bg-gray-400";
    }
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Contacts ({totalContacts})</h1>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full sm:w-80"
          />
          <Button
            variant="outline"
            onClick={() => setExportModalOpen(true)}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Bulk Actions Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1.5" 
            onClick={toggleSelectAll}
          >
            {selectedContacts.length === contacts.length && contacts.length > 0 ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedContacts.length > 0 ? `Selected (${selectedContacts.length})` : "Select All"}
          </Button>
        </div>
        {selectedContacts.length > 0 && (
          <Button 
            variant="destructive" 
            size="sm" 
            className="flex items-center gap-1.5"
            onClick={handleBulkDelete}
          >
            <Trash2 className="h-4 w-4" />
            Delete Selected
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">
                    <div className="flex items-center justify-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-5 w-5" 
                        onClick={toggleSelectAll}
                      >
                        {selectedContacts.length === contacts.length && contacts.length > 0 ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isListLoading && contacts.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8"><div className="flex justify-center items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /><span>Loading contacts...</span></div></TableCell></TableRow>
                ) : contacts.length === 0 ? (
                  <TableRow><TableCell colSpan={7} className="text-center py-8">No contacts found.</TableCell></TableRow>
                ) : (
                  contacts.map((contact, idx) => (
                    <TableRow key={contact._id}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5" 
                            onClick={() => toggleContactSelection(contact._id || '')}
                          >
                            {selectedContacts.includes(contact._id || '') ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                      <TableCell><div className="font-medium">{contact.name}</div></TableCell>
                      <TableCell><div className="flex flex-col gap-1"><div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" /><span className="text-sm">{contact.email}</span></div>{contact.phoneNumber && (<div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" /><span className="text-sm">{contact.phoneNumber}</span></div>)}</div></TableCell>
                      <TableCell><Badge className={`${getStatusColor(contact.status as string)} text-white hover:bg-opacity-80`}>{contact.status}</Badge></TableCell>
                      <TableCell>{contact.reason || '-'}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="sm" onClick={() => openUpdateModal(contact)}>Update Status</Button>
                          <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => openDeleteConfirmation(contact)} title="Delete">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
      
      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(Math.max(1, page - 1));
                  }}
                  className={page <= 1 || isListLoading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {/* First page */}
              {page > 3 && (
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(1);
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {/* Ellipsis if needed */}
              {page > 4 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
              
              {/* Pages around current page */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(pageNum => pageNum >= Math.max(1, page - 1) && pageNum <= Math.min(totalPages, page + 1))
                .map(pageNum => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink 
                      href="#" 
                      isActive={page === pageNum}
                      onClick={(e) => {
                        e.preventDefault();
                        setPage(pageNum);
                      }}
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                ))
              }
              
              {/* Ellipsis if needed */}
              {page < totalPages - 3 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
              
              {/* Last page */}
              {page < totalPages - 2 && (
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(totalPages);
                    }}
                  >
                    {totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(Math.min(totalPages, page + 1));
                  }}
                  className={page >= totalPages || isListLoading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Update Status Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Update Status for {editContact?.name}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <Select value={newStatus} onValueChange={setNewStatus} disabled={isUpdating}>
                <SelectTrigger className="w-full"><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                    <SelectItem value="New">New</SelectItem>
                    <SelectItem value="RegisterationDone">Registration Done</SelectItem>
                    <SelectItem value="CallCut">Call Cut</SelectItem>
                    <SelectItem value="CallNotPickUp">Call Not Pick Up</SelectItem>
                    <SelectItem value="NotInterested">Not Interested</SelectItem>
                    <SelectItem value="InvalidNumber">Invalid Number</SelectItem>
                </SelectContent>
            </Select>
            {newStatus === 'NotInterested' && (
                <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">Reason</label>
                    <Input
                        id="reason"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="Enter reason for not being interested"
                        disabled={isUpdating}
                        className="w-full"
                    />
                </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={isUpdating}>Cancel</Button></DialogClose>
            <Button 
                type="button" 
                onClick={handleStatusUpdate} 
                disabled={isUpdating || (newStatus === editContact?.status && reason === (editContact?.reason || '')) || (newStatus === 'NotInterested' && !reason.trim())}>
                {isUpdating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : ('Save Changes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Single Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={isSingleDeleteModalOpen}
        onOpenChange={setIsSingleDeleteModalOpen}
        title="Delete Contact"
        description={`Are you sure you want to delete the contact for ${contactToDelete?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteContact}
        isDeleting={isDeleting}
        confirmButtonText="Delete Contact"
      />
      
      {/* Export Contacts Dialog */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Contacts</DialogTitle>
            <DialogDescription>Choose a status to filter contacts for export, or export all.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={exportStatus} onValueChange={setExportStatus}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select Status"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="New">New</SelectItem>
                <SelectItem value="RegisterationDone">Registration Done</SelectItem>
                <SelectItem value="CallCut">Call Cut</SelectItem>
                <SelectItem value="CallNotPickUp">Call Not Pick Up</SelectItem>
                <SelectItem value="NotInterested">Not Interested</SelectItem>
                <SelectItem value="InvalidNumber">Invalid Number</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleExport}>Export CSV</Button>
            <Button variant="outline" onClick={() => setExportModalOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
        title="Delete Multiple Contacts"
        description={`Are you sure you want to delete ${selectedContacts.length} selected contacts? This action cannot be undone.`}
        onConfirm={confirmBulkDelete}
        confirmButtonText="Delete"
        itemCount={selectedContacts.length}
      />
    </div>
  );
}