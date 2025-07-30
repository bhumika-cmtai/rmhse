"use client";

import React, { useState, ChangeEvent, useEffect, FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Upload, Edit, Trash2, Mail, Phone, Download, Loader2, CheckSquare, Square } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { fetchLeads, selectLeads, selectLoading, selectPagination, selectCurrentPage, Lead, addLead, updateLead, deleteLead as deleteLeadAction, deleteManyLeads } from "@/lib/redux/leadSlice";
import { AppDispatch } from "@/lib/store";
import { useSelector, useDispatch } from "react-redux";
import ImportLeads from "./importLeads";
import { Label } from "@/components/ui/label";
import { DeleteConfirmationModal } from "@/app/components/ui/delete-confirmation-modal";
import { toast } from "sonner";
import axios from "axios";


// Define the initial state for our expanded form, matching the Lead interface
const initialFormState: Omit<Lead, "_id" | "createdOn" | "updatedOn"> = {
  name: "",
  email: "",
  phoneNumber: "",
  transactionId: "",
  city: "",
  age: "",
  gender: "",
  status: "New",
};

export default function Leads() {
  const dispatch = useDispatch<AppDispatch>();
  const leads = useSelector(selectLeads);
  const loading = useSelector(selectLoading);
  const pagination = useSelector(selectPagination);
  const currentPage = useSelector(selectCurrentPage);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editLead, setEditLead] = useState<Lead | null>(null);
  const [form, setForm] = useState(initialFormState);
  
  const [deleteLead, setDeleteLead] = useState<Lead | null>(null);
  const [formLoading, setFormLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState("all");

  // NEW: State for multiple selection
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch leads when filters or page change
  useEffect(() => {
    dispatch(fetchLeads({ search: debouncedSearch, status: statusFilter === 'all' ? undefined : statusFilter, page: currentPage }));
  }, [dispatch, debouncedSearch, statusFilter, currentPage]);

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= pagination.totalPages) {
      dispatch(fetchLeads({ search: debouncedSearch, status: statusFilter === 'all' ? undefined : statusFilter, page }));
    }
  };
  
  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    handlePageChange(1); // Reset to page 1 on new filter
  };

  const openAddModal = () => {
    setEditLead(null);
    setForm(initialFormState);
    setModalOpen(true);
  };

  const openEditModal = (lead: Lead) => {
    setEditLead(lead);
    setForm({
      name: lead.name ?? '',
      email: lead.email ?? '',
      phoneNumber: lead.phoneNumber ?? '',
      transactionId: lead.transactionId ?? '',
      city: lead.city ?? '',
      age: lead.age ? lead.age : '', // Format date for input
      gender: lead.gender ?? '',
      status: lead.status ?? 'New',
    });
    setModalOpen(true);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };
  
  const handleFormSelectChange = (fieldName: string, value: string) => {
    setForm({ ...form, [fieldName]: value });
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    let response;
    if (editLead && editLead._id) {
      response = await dispatch(updateLead(editLead._id, { ...editLead, ...form }));
    } else {
      response = await dispatch(addLead(form as Lead));
    }
    setFormLoading(false);

    if (response) {
      setModalOpen(false);
      dispatch(fetchLeads({ search: debouncedSearch, status: statusFilter === 'all' ? undefined : statusFilter, page: currentPage }));
    }
  };

  // NEW: Handler for selecting/deselecting a single lead
  const toggleLeadSelection = (leadId: string) => {
    setSelectedLeads(prev => 
      prev.includes(leadId)
        ? prev.filter(id => id !== leadId)
        : [...prev, leadId]
    );
  };

  // NEW: Handler for selecting/deselecting all leads
  const toggleSelectAll = () => {
    if (selectedLeads.length === leads.length) {
      setSelectedLeads([]);
    } else {
      setSelectedLeads(leads.map(lead => lead._id || '').filter(Boolean));
    }
  };

  // NEW: Handler for bulk delete action
  const handleBulkDelete = () => {
    if (selectedLeads.length === 0) {
      toast.warning("No leads selected for deletion");
      return;
    }
    setIsBulkDeleteModalOpen(true);
  };

  // NEW: Handler to confirm bulk deletion
  const confirmBulkDelete = async () => {
    const result = await dispatch(deleteManyLeads(selectedLeads));
    if (result) {
      toast.success(`${selectedLeads.length} leads would be deleted`);
      setIsBulkDeleteModalOpen(false);
      setSelectedLeads([]);
    } else {
      toast.error("Failed to delete leads");
    }
  };

  const handleDelete = async () => {
    if (!deleteLead?._id) return;
    setDeleteLoading(true);
    await dispatch(deleteLeadAction(deleteLead._id));
    setDeleteLoading(false);
    setDeleteLead(null);
    setIsDeleteModalOpen(false);
    const newPage = leads.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
    dispatch(fetchLeads({ search: debouncedSearch, status: statusFilter === 'all' ? undefined : statusFilter, page: newPage }));
  };

  const openDeleteModal = (lead: Lead) => {
    setDeleteLead(lead);
    setIsDeleteModalOpen(true);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "New": return "bg-blue-500";
      case "RegisterationDone": return "bg-green-500";
      case "NotInterested": return "bg-orange-400";
      case "CallCut": return "bg-red-500";
      case "CallNotPickUp": return "bg-yellow-500";
      case "InvalidNumber": return "bg-gray-400";
      default: return "bg-gray-500";
    }
  };
  
  const handleExport = async () => {
    // Fetch all leads matching current filters (not just current page)
    let allLeads: Lead[] = [];
    try {
      const params: any = {
        search: debouncedSearch,
        page: 1,
        limit: 10000 // Large limit to get all
      };
      if (exportStatus !== "all") {
        params.status = exportStatus;
      }
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/getAllLeads`, { params });
      allLeads = response.data?.data?.leads || [];
    } catch (err) {
      toast.error("Failed to fetch all leads for export.");
      return;
    }

    if (!allLeads || allLeads.length === 0) {
      toast.warning("No leads found to export.");
      return;
    }

    const headers = ["Name", "Email", "Phone", "Status", "Age", "TransactionId", "Gender", "Created"];
    const csvContent = [
      headers.join(","),
      ...allLeads.map(lead => [
        `"${lead.name.replace(/"/g, '""')}"`,
        `"${lead.email.replace(/"/g, '""')}"`,
        `"${lead.phoneNumber}"`,
        `"${lead.status}"`,
        `"${lead.age}"`,
        `"${lead.transactionId}"`,
        `"${lead.gender}"`,
        `"${lead.createdOn ? new Date(lead.createdOn).toLocaleDateString() : ''}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" }); // Add BOM for Excel compatibility
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads-${exportStatus.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setExportModalOpen(false);
  };

  return (
    <div className="w-full mx-auto mt-2 ">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Leads List</h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Input placeholder="Search leads..." value={search} onChange={(e) => setSearch(e.target.value)} className="w-full sm:w-48"/>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="RegisterationDone">Registration Done</SelectItem>
              <SelectItem value="CallCut">Call Cut</SelectItem>
              <SelectItem value="CallNotPickUp">Call Not Picked Up</SelectItem>
              <SelectItem value="NotInterested">Not Interested</SelectItem>
              <SelectItem value="InvalidNumber">Invalid Number</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="default" size="sm" className="gap-1" onClick={openAddModal}><Plus className="w-4 h-4"/> Add Lead</Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setImportModalOpen(true)}><Upload className="w-4 h-4"/> Import</Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={() => setExportModalOpen(true)}><Download className="w-4 h-4"/> Export</Button>
        </div>
      </div>

      {/* NEW: Bulk Actions Bar */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="flex items-center gap-1.5" 
            onClick={toggleSelectAll}
          >
            {selectedLeads.length === leads.length && leads.length > 0 ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedLeads.length > 0 ? `Selected (${selectedLeads.length})` : "Select All"}
          </Button>
        </div>
        {selectedLeads.length > 0 && (
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
                        {selectedLeads.length === leads.length && leads.length > 0 ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-12">S. No.</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Lead Name</TableHead>
                  <TableHead>Transaction Id</TableHead>
                  <TableHead>Contact Info</TableHead>
                  <TableHead>Age</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>City</TableHead>
                  <TableHead>Status</TableHead>
                  {/* <TableHead>Remark</TableHead> */}
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading && leads.length === 0 ? (
                  <TableRow><TableCell colSpan={11} className="text-center py-8"><Loader2 className="h-6 w-6 animate-spin mx-auto"/></TableCell></TableRow>
                ) : leads.length === 0 ? (
                  <TableRow><TableCell colSpan={11} className="text-center py-8">No leads found.</TableCell></TableRow>
                ) : (
                  leads.map((lead, idx) => (
                    <TableRow key={lead._id}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5" 
                            onClick={() => toggleLeadSelection(lead._id || '')}
                          >
                            {selectedLeads.includes(lead._id || '') ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{(currentPage - 1) * 20 + idx + 1}</TableCell>
                      <TableCell>{lead.createdOn ? new Date(parseInt(lead.createdOn)).toLocaleDateString() : '-'}</TableCell>
                      <TableCell><div className="font-medium">{lead.name}</div></TableCell>
                      <TableCell><div className="font-medium">{lead.transactionId || "-"}</div></TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-gray-500" /><span className="text-sm">{lead.email || '-'}</span></div>
                          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" /><span className="text-sm">{lead.phoneNumber}</span></div>
                        </div>
                      </TableCell>
                      <TableCell>{lead?.age || "-"}</TableCell>
                      <TableCell>{lead?.gender || "-"}</TableCell>
                      <TableCell><div className="font-medium">{lead.city || '-'}</div></TableCell>
                      <TableCell><Badge className={`${getStatusColor(lead.status)} text-white`}>{lead.status}</Badge></TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button size="icon" variant="ghost" onClick={() => openEditModal(lead)} title="Edit"><Edit className="w-4 h-4" /></Button>
                          <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => openDeleteModal(lead)} title="Delete"><Trash2 className="w-4 h-4" /></Button>
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

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader><DialogTitle>{editLead ? 'Edit Lead' : 'Add New Lead'}</DialogTitle></DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="name">Name*</Label><Input id="name" name="name" value={form.name} onChange={handleFormChange} required /></div>
              <div className="space-y-2"><Label htmlFor="phoneNumber">Phone Number*</Label><Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleFormChange} required /></div>
              {/* <div className="space-y-2"><Label htmlFor="portal_name">Portal Name*</Label><Input id="portal_name" name="portal_name" value={form.portal_name} onChange={handleFormChange} required /></div> */}
              <div className="space-y-2"><Label htmlFor="email">Email*</Label><Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} required/></div>
              <div className="space-y-2"><Label htmlFor="transactionId">Transaction Id</Label><Input id="transactionId" name="transactionId" type="text" value={form.transactionId} onChange={handleFormChange}/></div>
              <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" name="city" value={form.city} onChange={handleFormChange} /></div>
              <div className="space-y-2"><Label htmlFor="age">Age</Label><Input id="age" name="age" value={form.age} onChange={handleFormChange} /></div>
              <div className="space-y-2"><Label htmlFor="gender">Gender</Label><Select value={form.gender} onValueChange={(value) => handleFormSelectChange('gender', value)}><SelectTrigger><SelectValue placeholder="Select Gender"/></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={form.status} onValueChange={(value) => handleFormSelectChange('status', value)}><SelectTrigger><SelectValue placeholder="Select Status"/></SelectTrigger><SelectContent><SelectItem value="New">New</SelectItem><SelectItem value="RegisterationDone">Registration Done</SelectItem><SelectItem value="CallCut">Call Cut</SelectItem><SelectItem value="CallNotPickUp">Call Not Picked Up</SelectItem><SelectItem value="NotInterested">Not Interested</SelectItem><SelectItem value="InvalidNumber">Invalid Number</SelectItem></SelectContent></Select></div>
              {/* <div className="space-y-2 md:col-span-2"><Label htmlFor="message">Remark / Message</Label><textarea id="message" name="message" className="w-full min-h-[100px] p-3 rounded-md border border-input bg-background text-sm" placeholder="Add a note..." value={form.message} onChange={handleFormChange}/></div> */}
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={formLoading}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                {formLoading ? 'Saving...' : (editLead ? 'Update Lead' : 'Add Lead')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* NEW: Replace the delete dialog with DeleteConfirmationModal */}
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Lead"
        description={`Are you sure you want to delete the lead for ${deleteLead?.name}? This action cannot be undone.`}
        onConfirm={handleDelete}
        isDeleting={deleteLoading}
        confirmButtonText="Delete Lead"
      />
      
      {/* NEW: Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
        title="Delete Multiple Leads"
        description={`Are you sure you want to delete ${selectedLeads.length} selected leads? This action cannot be undone.`}
        onConfirm={confirmBulkDelete}
        confirmButtonText="Delete"
        itemCount={selectedLeads.length}
      />

      <ImportLeads open={importModalOpen} onOpenChange={setImportModalOpen} onImportSuccess={() => dispatch(fetchLeads())} />

      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Export Leads</DialogTitle><DialogDescription>Choose a status to filter leads for export</DialogDescription></DialogHeader>
          <div className="py-4"><Select value={exportStatus} onValueChange={setExportStatus}><SelectTrigger className="w-full"><SelectValue placeholder="Select Status"/></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="New">New</SelectItem><SelectItem value="RegisterationDone">Registration Done</SelectItem><SelectItem value="CallCut">Call Cut</SelectItem><SelectItem value="CallNotPickUp">Call Not Picked Up</SelectItem><SelectItem value="NotInterested">Not Interested</SelectItem><SelectItem value="InvalidNumber">Invalid Number</SelectItem></SelectContent></Select></div>
          <DialogFooter><Button onClick={handleExport}>Export CSV</Button><Button variant="outline" onClick={() => setExportModalOpen(false)}>Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage - 1);
                  }}
                  className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
              
              {/* First page */}
              {currentPage > 3 && (
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(1);
                    }}
                  >
                    1
                  </PaginationLink>
                </PaginationItem>
              )}
              
              {/* Ellipsis if needed */}
              {currentPage > 4 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
              
              {/* Pages around current page */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter(page => page >= Math.max(1, currentPage - 1) && page <= Math.min(pagination.totalPages, currentPage + 1))
                .map(page => (
                  <PaginationItem key={page}>
                    <PaginationLink 
                      href="#" 
                      isActive={currentPage === page}
                      onClick={(e) => {
                        e.preventDefault();
                        handlePageChange(page);
                      }}
                    >
                      {page}
                    </PaginationLink>
                  </PaginationItem>
                ))
              }
              
              {/* Ellipsis if needed */}
              {currentPage < pagination.totalPages - 3 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
              
              {/* Last page */}
              {currentPage < pagination.totalPages - 2 && (
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      handlePageChange(pagination.totalPages);
                    }}
                  >
                    {pagination.totalPages}
                  </PaginationLink>
                </PaginationItem>
              )}
              
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    handlePageChange(currentPage + 1);
                  }}
                  className={currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}