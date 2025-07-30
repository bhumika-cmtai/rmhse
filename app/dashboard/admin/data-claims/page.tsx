"use client";

import React, { useState, ChangeEvent, useEffect, FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Phone, Trash2, Upload, Download, Loader2, CheckSquare, Square } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import ImportDataClaims from "./importDataClaims";
import { DeleteConfirmationModal } from "@/app/components/ui/delete-confirmation-modal";

import { 
  fetchClients, 
  selectClients, 
  selectLoading, 
  selectPagination, 
  selectCurrentPage, 
  Client, 
  addClient, 
  updateClient, 
  setCurrentPage,
  fetchPortalNames,
   deleteClient, // NEW: Import the deleteClient thunk
   deleteManyClients,
  selectPortalNames,
  distributeCommissionForClient 
} from "@/lib/redux/clientSlice";
import { AppDispatch } from "@/lib/store";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner";

// Define a type for the form state that includes the 'isApproved' field
// For a proper fix, you should add `isApproved?: boolean` to the Client interface in clientSlice.ts
type ClientFormState = Omit<Client, "_id" | "createdOn" | "updatedOn" | "leaderCode"> & {
  isApproved?: boolean;
};

export default function Clients() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors from Redux store
  const clients = useSelector(selectClients);
  const loading = useSelector(selectLoading);
  const pagination = useSelector(selectPagination);
  const currentPage = useSelector(selectCurrentPage);
  const portalNames = useSelector(selectPortalNames);

  // Component State
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [portalFilter, setPortalFilter] = useState("all");
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editClient, setEditClient] = useState<Client | null>(null);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState("all");
  
  const [formLoading, setFormLoading] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  // NEW: State for delete confirmation modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<Client | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // NEW: State for multiple selection
  const [selectedClients, setSelectedClients] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  const [form, setForm] = useState<ClientFormState>({
    name: "",
    email: "",
    phoneNumber: "",
    status: "New",
    ownerName: [],
    ownerNumber: [],
    portalName: "",
    reason: "",
    ekyc_stage: 'not complete ',
    trade_status: 'not done ',
    isApproved: false,
  });
  
  // Fetch portal names on component mount
  useEffect(() => {
    dispatch(fetchPortalNames());
  }, [dispatch]);

  // Debounce search input to avoid excessive API calls
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Main effect to fetch clients when any filter or page changes
  useEffect(() => {
    dispatch(fetchClients({ 
      searchQuery: debouncedSearch, 
      status: statusFilter, 
      portalName: portalFilter,
      page: currentPage 
    }));
  }, [dispatch, debouncedSearch, statusFilter, portalFilter, currentPage]);

  const handleSearchChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    if (currentPage !== 1) {
        dispatch(setCurrentPage(1));
    }
  };

  const handleStatusChange = (value: string) => {
    setStatusFilter(value);
    if (currentPage !== 1) {
        dispatch(setCurrentPage(1));
    }
  };

  const handlePortalChange = (value: string) => {
    setPortalFilter(value);
    if (currentPage !== 1) {
      dispatch(setCurrentPage(1));
    }
  };

  const handlePageChange = (page: number) => {
    if (page > 0 && page <= pagination.totalPages && page !== currentPage) {
      dispatch(setCurrentPage(page));
    }
  };

  const openAddModal = () => {
    setEditClient(null);
    setForm({
      name: "", email: "", phoneNumber: "", status: "New", ownerName: [], ownerNumber: [], portalName: "", reason: "", ekyc_stage: 'notComplete', trade_status: 'notMatched', isApproved: false
    });
    setModalOpen(true);
  };

  const openEditModal = (client: Client) => {
    setEditClient(client);
    setForm({
      name: client.name || "",
      email: client.email || "",
      phoneNumber: client.phoneNumber || "",
      status: client.status || "New",
      ownerName: client.ownerName || [],
      ownerNumber: client.ownerNumber || [],
      // city: client.city || "",
      // age: client.age || 0,
      portalName: client.portalName || "",
      reason: client.reason || "",
      ekyc_stage: client.ekyc_stage || "notComplete",
      trade_status: client.trade_status || 'notMatched',
      isApproved: (client as any).isApproved || false,
    });
    setModalOpen(true);
  };

  const handleFormSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormLoading(true);
    let response;
    if (editClient && editClient._id) {
      response = await dispatch(updateClient(editClient._id, form));
    } else {
      response = await dispatch(addClient(form as Client));
    }
    setFormLoading(false);

    if (response) {
      setModalOpen(false);
      dispatch(fetchClients({ searchQuery: debouncedSearch, status: statusFilter, portalName: portalFilter, page: currentPage }));
    }
  };

  // NEW: Handler to open the delete confirmation dialog
  const openDeleteModal = (client: Client) => {
    setClientToDelete(client);
    setIsDeleteModalOpen(true);
  };

  // NEW: Handler to perform the deletion
  const handleConfirmDelete = async () => {
    if (!clientToDelete?._id) return;

    setIsDeleting(true);
    try {
      const result = await dispatch(deleteClient(clientToDelete._id));
      if (result) {
        toast.success(`Client "${clientToDelete.name}" deleted successfully.`);
        setIsDeleteModalOpen(false);
        // If the deleted item was the last one on the page, go to the previous page
        const newPage = clients.length === 1 && currentPage > 1 ? currentPage - 1 : currentPage;
        dispatch(fetchClients({ searchQuery: debouncedSearch, status: statusFilter, portalName: portalFilter, page: newPage }));
      }
    } finally {
      setIsDeleting(false);
      setClientToDelete(null);
    }
  };

  // NEW: Handler for selecting/deselecting a single client
  const toggleClientSelection = (clientId: string) => {
    setSelectedClients(prev => 
      prev.includes(clientId)
        ? prev.filter(id => id !== clientId)
        : [...prev, clientId]
    );
  };

  // NEW: Handler for selecting/deselecting all clients
  const toggleSelectAll = () => {
    if (selectedClients.length === clients.length) {
      setSelectedClients([]);
    } else {
      setSelectedClients(clients.map(client => client._id || '').filter(Boolean));
    }
  };

  // NEW: Handler for bulk delete action
  const handleBulkDelete = () => {
    if (selectedClients.length === 0) {
      toast.warning("No clients selected for deletion");
      return;
    }
    setIsBulkDeleteModalOpen(true);
  };

  // NEW: Handler to confirm bulk deletion
  const confirmBulkDelete = async () => {
    const result = await dispatch(deleteManyClients(selectedClients));
    if (result) {
      toast.success(`${selectedClients.length} clients would be deleted`);
      setIsBulkDeleteModalOpen(false);
      setSelectedClients([]);
      dispatch(fetchClients({ searchQuery: debouncedSearch, status: statusFilter, portalName: portalFilter, page: currentPage }));
    } else {
      toast.error("Failed to delete clients");
    }
  };


  const handleRemoveOwner = (indexToRemove: number) => {
    const newOwnerNames = (form.ownerName ?? []).filter((_, index) => index !== indexToRemove);
    const newOwnerNumbers = (form.ownerNumber ?? []).filter((_, index) => index !== indexToRemove);

    setForm({
      ...form,
      ownerName: newOwnerNames,
      ownerNumber: newOwnerNumbers,
    });
  };

  const handleApproveClick = async () => {
    if (!editClient?._id || !editClient.portalName) {
        toast.error("Client information is missing.");
        return;
    }

    setIsApproving(true);
    try {
        const result = await dispatch(distributeCommissionForClient({ 
            clientId: editClient._id, 
            portalName: editClient.portalName 
        }));
        
        if (result) {
            toast.success("Payment approved successfully!");
            setForm(prev => ({ ...prev, isApproved: true }));
            dispatch(fetchClients({ searchQuery: debouncedSearch, status: statusFilter, portalName: portalFilter, page: currentPage }));
        } else {
            toast.error("Failed to approve payment. Please try again.");
        }
    } catch (error) {
        console.error("Approval error:", error);
        toast.error("An unexpected error occurred during approval.");
    } finally {
        setIsApproving(false);
    }
  };

  // **** FIXED: Export function now correctly uses the 'clients' variable and 'Client' fields ****
  const handleExport = () => {
    if (!clients || clients.length === 0) {
        toast.warning("There is no data to export.");
        return;
    }
      
    const filteredClients = exportStatus === "all" 
      ? clients 
      : clients.filter(client => client.status === exportStatus);
    
    if (filteredClients.length === 0) {
        toast.warning(`No clients found with the status "${exportStatus}".`);
        return;
    }

    const headers = ["Portal", "Name", "Email", "Phone", "KYC Status", "Trade Status","Owner Name", "Owner Number" ,"Created"];
    const csvContent = [
      headers.join(","),
      ...filteredClients.map(client => [
        `"${client.portalName?.replace(/"/g, '""') || ''}"`,
        `"${client.name.replace(/"/g, '""')}"`,
        `"${client.email?.replace(/"/g, '""') || ''}"`,
        `"${client.phoneNumber}"`,
        `"${getDisplayKycStatus(client.ekyc_stage || '')}"`,
        `"${getDisplayTradeStatus(client.trade_status || '')}"`,
        `"${(client.ownerName || []).join('; ').replace(/"/g, '""')}"`,
         `"${(client.ownerNumber || []).join('; ').replace(/"/g, '""')}"`,
        `"${client.createdOn ? new Date(parseInt(client.createdOn)).toLocaleDateString() : ''}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `clients-${exportStatus.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setExportModalOpen(false);
  };

  // Add mapping functions at the top of the component
  const getDisplayKycStatus = (status: string) => {
    switch (status) {
      case "not complete ":
        return "Not Completed";
      case "complete":
        return "Completed";
      default:
        return status;
    }
  };

  const getDisplayTradeStatus = (status: string) => {
    switch (status) {
      case "not done ":
        return "Not Completed";
      case "done":
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Data Claims</h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Input placeholder="Search by client name..." value={search} onChange={handleSearchChange} className="w-full sm:w-48"/>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="RegisterationDone">Registered</SelectItem>
              <SelectItem value="CallCut">Call Cut</SelectItem>
              <SelectItem value="CallNotPickUp">Not Picked Up</SelectItem>
              <SelectItem value="NotInterested">Not Interested</SelectItem>
              <SelectItem value="InvalidNumber">Invalid Number</SelectItem>
            </SelectContent>
          </Select>
          <Select value={portalFilter} onValueChange={handlePortalChange}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue placeholder="All Portals" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Portals</SelectItem>
              {portalNames.map((name) => (<SelectItem key={name} value={name}>{name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Button variant="default" size="sm" className="gap-1" onClick={openAddModal}><Plus className="w-4 h-4" /> Add Client</Button>
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
            {selectedClients.length === clients.length && clients.length > 0 ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedClients.length > 0 ? `Selected (${selectedClients.length})` : "Select All"}
          </Button>
        </div>
        {selectedClients.length > 0 && (
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
                        {selectedClients.length === clients.length && clients.length > 0 ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-12">S.no.</TableHead>
                  <TableHead>Portal</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>KYC Status</TableHead>
                  <TableHead>Trade Status</TableHead>
                  <TableHead>Owner Names</TableHead>
                  <TableHead>Owner Numbers</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={11} className="text-center py-8">Loading...</TableCell></TableRow>
                ) : clients.length === 0 ? (
                  <TableRow><TableCell colSpan={11} className="text-center py-8">No clients found.</TableCell></TableRow>
                ) : (
                  clients.map((client, idx) => (
                    <TableRow key={client._id}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5" 
                            onClick={() => toggleClientSelection(client._id || '')}
                          >
                            {selectedClients.includes(client._id || '') ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{(currentPage - 1) * 20 + idx + 1}</TableCell>
                      <TableCell>{client.portalName || "-"}</TableCell>
                      <TableCell><div className="font-medium">{client.name}</div></TableCell>
                      <TableCell><div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" /><span className="text-sm">{client.phoneNumber}</span></div></TableCell>
                      <TableCell>{getDisplayKycStatus(client.ekyc_stage || "-")}</TableCell>
                      <TableCell>{getDisplayTradeStatus(client.trade_status || "-")}</TableCell>
                      <TableCell>{client.ownerName?.join(', ') || '-'}</TableCell>
                      <TableCell>{client.ownerNumber?.join(', ') || '-'}</TableCell>
                      <TableCell>{client.createdOn ? new Date(parseInt(client.createdOn)).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <Button size="sm" variant="outline" onClick={() => openEditModal(client)}>
                          <Edit className="h-3 w-3 mr-2" />
                          Edit
                        </Button>
                         <Button size="icon" variant="ghost" className="text-red-600 hover:bg-red-100" onClick={() => openDeleteModal(client)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={modalOpen} onOpenChange={(open) => { if (!open) { setModalOpen(false); setEditClient(null); }}}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editClient ? 'Edit Client' : 'Add Client'}</DialogTitle></DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid grid-cols-2 gap-x-4 gap-y-6 py-4">
            {editClient && (
              <div className="col-span-2 space-y-2">
                <Label>Manage Owners</Label>
                <div className="border rounded-md p-2 space-y-2 max-h-32 overflow-y-auto">
                  {form.ownerName && form.ownerName.length > 0 ? (
                    form.ownerName.map((name, index) => (
                      <div key={index} className="flex items-center justify-between text-sm p-1 rounded-md bg-muted/50">
                        <span>{name} - {(form.ownerNumber?.[index] ?? "")}</span>
                        {!form.isApproved && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6 text-red-500"
                            onClick={() => handleRemoveOwner(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))
                  ) : (<p className="text-sm text-muted-foreground text-center py-2">No owners assigned.</p>)}
                </div>
              </div>
            )}
            <div className="col-span-2 sm:col-span-1 space-y-2"><Label htmlFor="name">Name</Label><Input id="name" placeholder="Client's full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
            <div className="col-span-2 sm:col-span-1 space-y-2"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="client@example.com" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></div>
            <div className="col-span-2 sm:col-span-1 space-y-2"><Label htmlFor="phoneNumber">Phone Number</Label><Input id="phoneNumber" placeholder="10-digit number" value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} required /></div>
            {/* <div className="col-span-2 sm:col-span-1 space-y-2"><Label htmlFor="city">City</Label><Input id="city" placeholder="Client's city" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} /></div> */}
            <div className="col-span-2 sm:col-span-1 space-y-2"><Label htmlFor="portalName">Portal Name</Label><Input id="portalName" placeholder="e.g., Angel-One" value={form.portalName} onChange={(e) => setForm({ ...form, portalName: e.target.value })} /></div>
            {/* <div className="col-span-2 sm:col-span-1 space-y-2"><Label htmlFor="age">Age</Label><Input id="age" type="number" placeholder="Client's age" value={form.age || ''} onChange={(e) => setForm({ ...form, age: Number(e.target.value) || 0 })} /></div> */}
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="ekyc_stage">KYC Status</Label>
              <Select value={form.ekyc_stage} onValueChange={(value) => setForm({ ...form, ekyc_stage: value })}>
                <SelectTrigger id="ekyc_stage">
                  <SelectValue placeholder="Select KYC Status">
                    {form.ekyc_stage ? getDisplayKycStatus(form.ekyc_stage) : "Select KYC Status"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not complete ">Not Completed</SelectItem>
                  <SelectItem value="complete">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 sm:col-span-1 space-y-2">
              <Label htmlFor="trade_status">Trade Status</Label>
              <Select value={form.trade_status} onValueChange={(value) => setForm({ ...form, trade_status: value })}>
                <SelectTrigger id="trade_status">
                  <SelectValue placeholder="Select Trade Status">
                    {form.trade_status ? getDisplayTradeStatus(form.trade_status) : "Select Trade Status"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="not done ">Not Completed</SelectItem>
                  <SelectItem value="done">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 space-y-2"><Label htmlFor="status">Client Status</Label><Select value={form.status} onValueChange={(value: string) => setForm({ ...form, status: value })} ><SelectTrigger id="status"><SelectValue placeholder="Select Status" /></SelectTrigger><SelectContent><SelectItem value="New">New</SelectItem><SelectItem value="RegisterationDone">Registered</SelectItem><SelectItem value="CallCut">Call Cut</SelectItem><SelectItem value="CallNotPickUp">Not Picked Up</SelectItem><SelectItem value="NotInterested">Not Interested</SelectItem><SelectItem value="InvalidNumber">Invalid Number</SelectItem></SelectContent></Select></div>
            {form.status === "NotInterested" && (<div className="col-span-2 space-y-2"><Label htmlFor="reason">Reason for Not Interested</Label><Input id="reason" placeholder="Enter reason" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} /></div>)}
            <DialogFooter className="col-span-2 pt-4 flex-wrap gap-2">
              <DialogClose asChild><Button type="button" variant="outline" disabled={formLoading || isApproving}>Cancel</Button></DialogClose>
              {editClient && (<Button type="button" className="bg-green-600 hover:bg-green-700" onClick={handleApproveClick} disabled={isApproving || formLoading || form.isApproved}>{isApproving ? 'Approving...' : form.isApproved ? 'Approved' : 'Approve Payment'}</Button>)}
              <Button type="submit" disabled={formLoading || isApproving}>{formLoading ? 'Saving...' : (editClient ? 'Update Client' : 'Add Client')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* NEW: Replace the delete dialog with DeleteConfirmationModal */}
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Client"
        description={`Are you sure you want to delete the client record for ${clientToDelete?.name}? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        isDeleting={isDeleting}
        confirmButtonText="Delete Client"
      />
      
      {/* NEW: Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
        title="Delete Multiple Clients"
        description={`Are you sure you want to delete ${selectedClients.length} selected clients? This action cannot be undone.`}
        onConfirm={confirmBulkDelete}
        confirmButtonText="Delete"
        itemCount={selectedClients.length}
      />

      {/* **** FIXED: Correctly calls fetchClients on success **** */}
      <ImportDataClaims open={importModalOpen} onOpenChange={setImportModalOpen} onImportSuccess={() => dispatch(fetchClients({ searchQuery: debouncedSearch, status: statusFilter, portalName: portalFilter, page: currentPage }))} />
      
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader><DialogTitle>Export Clients</DialogTitle><DialogDescription>Choose a status to filter clients for export</DialogDescription></DialogHeader>
          <div className="py-4"><Select value={exportStatus} onValueChange={setExportStatus}><SelectTrigger className="w-full"><SelectValue placeholder="Select Status"/></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="New">New</SelectItem><SelectItem value="RegisterationDone">Registered</SelectItem><SelectItem value="CallCut">Call Cut</SelectItem><SelectItem value="CallNotPickUp">Not Picked Up</SelectItem><SelectItem value="NotInterested">Not Interested</SelectItem><SelectItem value="InvalidNumber">Invalid Number</SelectItem></SelectContent></Select></div>
          <DialogFooter><Button onClick={handleExport}>Export CSV</Button><Button variant="outline" onClick={() => setExportModalOpen(false)}>Cancel</Button></DialogFooter>
        </DialogContent>
      </Dialog>

      {pagination.totalPages > 1 && !loading && (
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