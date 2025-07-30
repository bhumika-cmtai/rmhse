"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Phone, Loader2, Hash, Trash2, Download, CheckSquare, Square, Search } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";

import {
  fetchRegisterations,
  updateRegisteration,
  deleteRegisteration,
  selectRegisterations,
  selectRegisterationLoading,
  selectRegisterationPagination,
  Registeration,
  deleteManyRegisterations,
} from "@/lib/redux/registerationSlice";
import { AppDispatch } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { DeleteConfirmationModal } from "@/app/components/ui/delete-confirmation-modal";

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

export default function RegistrationsPage() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors for Redux state
  const registrations = useSelector(selectRegisterations);
  const { currentPage, totalPages, totalRegisterations } = useSelector(selectRegisterationPagination);
  const isListLoading = useSelector(selectRegisterationLoading);

  // State for search boxes and filters
  const [nameSearch, setNameSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [codeSearch, setCodeSearch] = useState("");
  
  // Debounce each search input
  const debouncedName = useDebounce(nameSearch, 500);
  const debouncedPhone = useDebounce(phoneSearch, 500);
  const debouncedCode = useDebounce(codeSearch, 500);

  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  
  // State for the update modal
  const [editRegisteration, setEditRegisteration] = useState<Registeration | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [reason, setReason] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  
  // State for the delete confirmation dialog
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [registerationToDelete, setRegisterationToDelete] = useState<Registeration | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // State for the export modal
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState("all");

  // NEW: State for multiple selection
  const [selectedRegisterations, setSelectedRegisterations] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // NEW: State to store filtered registrations for date range
  const [filteredRegistrations, setFilteredRegistrations] = useState<Registeration[]>([]);
  // Flag to determine if we're showing filtered results
  const [isDateFiltered, setIsDateFiltered] = useState(false);
  // Date range filter state
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateRangeCount, setDateRangeCount] = useState<number | null>(null);
  const [isCountLoading, setIsCountLoading] = useState<boolean>(false);
  const [countError, setCountError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 15;

  // Main effect to fetch data when page or any filter changes
  useEffect(() => {
    const params = { 
      page: 1,
      name: debouncedName,
      phoneNumber: debouncedPhone,
      leaderCode: debouncedCode,
      status: statusFilter === "all" ? undefined : statusFilter,
      limit: 10000 // Always use large limit to get all records
    };

    dispatch(fetchRegisterations(params));
  }, [dispatch, debouncedName, debouncedPhone, debouncedCode, statusFilter]);

  // Effect to reset to page 1 when a new search or filter is applied
  useEffect(() => {
    if (debouncedName || debouncedPhone || debouncedCode || statusFilter !== "all") {
      setPage(1);
    }
  }, [debouncedName, debouncedPhone, debouncedCode, statusFilter]);

  const openUpdateModal = (registeration: Registeration) => {
    setEditRegisteration(registeration);
    setNewStatus(registeration.status || "New");
    setReason(registeration.reason || "");
    setModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!editRegisteration || !editRegisteration._id || !newStatus) return;
    setIsUpdating(true);

    const updateData: { status: string; reason?: string } = { status: newStatus };
    if (newStatus === 'NotInterested') {
      updateData.reason = reason;
    } else {
      updateData.reason = ''; // Clear reason if status changes
    }

    try {
      await dispatch(updateRegisteration(editRegisteration._id, updateData));
      toast.success("Registration status updated successfully!");
      // Refetch with current filters
      dispatch(fetchRegisterations({ page, name: debouncedName, phoneNumber: debouncedPhone, leaderCode: debouncedCode, status: statusFilter, limit: ITEMS_PER_PAGE }));
      setModalOpen(false);
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Delete Logic
  const openDeleteModal = (registeration: Registeration) => {
    setRegisterationToDelete(registeration);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!registerationToDelete?._id) return;
    setIsDeleting(true);
    try {
      await dispatch(deleteRegisteration(registerationToDelete._id));
      toast.success("Registration deleted successfully.");
      
      const newPage = registrations.length === 1 && page > 1 ? page - 1 : page;
      if (newPage !== page) {
        setPage(newPage);
      } else {
        // Refetch with current filters
        dispatch(fetchRegisterations({ page, name: debouncedName, phoneNumber: debouncedPhone, leaderCode: debouncedCode, status: statusFilter, limit: ITEMS_PER_PAGE }));
      }
      setDeleteConfirmOpen(false);
    } catch (error) {
      toast.error("Failed to delete registration.");
    } finally {
      setIsDeleting(false);
      setRegisterationToDelete(null);
    }
  };

  // Update the date range search to filter on frontend
  const handleDateRangeSearch = () => {
    if (!startDate || !endDate) {
      toast.warning("Please select both start and end dates");
      return;
    }

    setIsCountLoading(true);
    setCountError(null);
    setDateRangeCount(null);

    try {
      // Convert selected dates to timestamps (start of day and end of day)
      const startTimestamp = new Date(startDate).setHours(0, 0, 0, 0);
      const endTimestamp = new Date(endDate).setHours(23, 59, 59, 999);

      // Filter registrations on the frontend
      const filtered = registrations.filter(reg => {
        if (!reg.createdOn) return false;
        const regTimestamp = parseInt(reg.createdOn);
        return regTimestamp >= startTimestamp && regTimestamp <= endTimestamp;
      });

      setFilteredRegistrations(filtered);
      setDateRangeCount(filtered.length);
      setIsDateFiltered(true);
      
      if (filtered.length === 0) {
        toast.info("No registrations found in selected date range");
      } else {
        toast.success(`Found ${filtered.length} registrations in selected date range`);
      }

    } catch (error: any) {
      console.error('Date range filter error:', error);
      setCountError("Failed to filter registrations by date range");
      toast.error("Failed to process date range filter");
    } finally {
      setIsCountLoading(false);
    }
  };

  // Update the export function to use frontend filtering for dates
  const handleExport = async () => {
    try {
      // Get all registrations first
      const params: any = {
        limit: 10000,
        page: 1
      };

      if (exportStatus !== "all") {
        params.status = exportStatus;
      }

      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/registers/getAllRegister`, { params });
      let allRegs: Registeration[] = response.data?.data?.registers || [];

      // Apply date filter if active
      if (isDateFiltered && startDate && endDate) {
        const startTimestamp = new Date(startDate).setHours(0, 0, 0, 0);
        const endTimestamp = new Date(endDate).setHours(23, 59, 59, 999);
        
        allRegs = allRegs.filter(reg => {
          if (!reg.createdOn) return false;
          const regTimestamp = parseInt(reg.createdOn);
          return regTimestamp >= startTimestamp && regTimestamp <= endTimestamp;
        });
      }

      if (!allRegs || allRegs.length === 0) {
        toast.warning("No registrations found to export.");
        return;
      }

      toast.success(`Found ${allRegs.length} registrations to export.`);

      const headers = ["Name", "Phone Number", "Leader Code", "Status", "Created On", "Remark"];
      const csvContent = [
        headers.join(","),
        ...allRegs.map((reg: Registeration) => [
          `"${(reg.name || '').replace(/"/g, '""')}"`,
          `"${(reg.phoneNumber || '').replace(/"/g, '""')}"`,
          `"${reg.leaderCode || 'N/A'}"`,
          `"${reg.status || 'N/A'}"`,
          `"${reg.createdOn ? new Date(parseInt(reg.createdOn)).toLocaleString() : 'N/A'}"`,
          `"${(reg.reason || '').replace(/"/g, '""')}"`
        ].join(","))
      ].join("\n");
      
      const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `registrations-${exportStatus.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setExportModalOpen(false);
      toast.success(`Successfully exported ${allRegs.length} registrations.`);
    } catch (err) {
      console.error('Export error:', err);
      toast.error("Failed to export registrations data. Please try again.");
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'New': 'bg-blue-500',
      'RegisterationDone': 'bg-teal-500',
      'CallCut': 'bg-yellow-500',
      'CallNotPickUp': 'bg-orange-500',
      'NotInterested': 'bg-red-500',
      'InvalidNumber': 'bg-gray-500',
    };
    return statusColors[status] || "bg-gray-400";
  };

  // NEW: Handler for selecting/deselecting a single registration
  const toggleRegisterationSelection = (registerationId: string) => {
    setSelectedRegisterations(prev => 
      prev.includes(registerationId)
        ? prev.filter(id => id !== registerationId)
        : [...prev, registerationId]
    );
  };

  // Clear filters function
  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setDateRangeCount(null);
    setFilteredRegistrations([]);
    setIsDateFiltered(false);
  };

  // The data to display in the table (either filtered or all)
  const displayedRegistrations = isDateFiltered ? filteredRegistrations : registrations;
  
  // Calculate pagination
  const totalItems = displayedRegistrations.length;
  const totalPaginatedPages = Math.ceil(totalItems / ITEMS_PER_PAGE);
  
  // Get current page's data
  const currentPageData = displayedRegistrations.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

  // When filter is active and page changes, scroll to top
  useEffect(() => {
    if (isDateFiltered) {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  }, [page, isDateFiltered]);

  // NEW: Handler for selecting/deselecting all registrations
  const toggleSelectAll = () => {
    if (selectedRegisterations.length === displayedRegistrations.length) {
      setSelectedRegisterations([]);
    } else {
      setSelectedRegisterations(displayedRegistrations.map(reg => reg._id || '').filter(Boolean));
    }
  };

  // NEW: Handler for bulk delete action
  const handleBulkDelete = () => {
    if (selectedRegisterations.length === 0) {
      toast.warning("No registrations selected for deletion");
      return;
    }
    setIsBulkDeleteModalOpen(true);
  };

  // NEW: Handler to confirm bulk deletion
  const confirmBulkDelete = async  () => {
    const result = await dispatch(deleteManyRegisterations(selectedRegisterations));
    if (result) {
      toast.success(`${selectedRegisterations.length} registrations would be deleted`);
      setIsBulkDeleteModalOpen(false);
      setSelectedRegisterations([]);
    } else {
      toast.error("Failed to delete registrations");
    }
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">
          Registrations ({isDateFiltered ? dateRangeCount : totalItems})
        </h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Input placeholder="Search by Name..." value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} className="w-full sm:w-auto md:w-40"/>
          <Input placeholder="Search by Phone..." value={phoneSearch} onChange={(e) => setPhoneSearch(e.target.value)} className="w-full sm:w-auto md:w-40"/>
          <Input placeholder="Search by Code..." value={codeSearch} onChange={(e) => setCodeSearch(e.target.value)} className="w-full sm:w-auto md:w-40"/>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-auto md:w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
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

            {/* NEW: Date Range Filter */}
            <div className="flex flex-wrap justify-center items-end gap-2 p-4 border rounded-lg bg-slate-50 mb-6">
        <div className="space-y-1">
          <Label htmlFor="start-date" className="text-sm font-medium">Start Date</Label>
          <Input 
            id="start-date" 
            type="date" 
            value={startDate} 
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="end-date" className="text-sm font-medium">End Date</Label>
          <Input 
            id="end-date" 
            type="date" 
            value={endDate} 
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>
        <Button 
          onClick={handleDateRangeSearch} 
          disabled={isCountLoading} 
          className="gap-1"
        >
          <Search className="w-4 h-4"/>
          {isCountLoading ? 'Searching...' : 'Search Dates'}
        </Button>
        {isDateFiltered && (
          <Button 
            variant="outline" 
            onClick={clearDateFilter} 
            className="gap-1"
          >
            Clear Filter
          </Button>
        )}
      </div>
      <div className="mb-4 h-6">
        {countError && <p className="text-red-500 font-medium">{countError}</p>}
        {dateRangeCount !== null && (
          <p className="text-lg font-semibold text-primary">
            Total Registrations Found: {dateRangeCount}
          </p>
        )}
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
            {selectedRegisterations.length === displayedRegistrations.length && displayedRegistrations.length > 0 ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedRegisterations.length > 0 ? `Selected (${selectedRegisterations.length})` : "Select All"}
          </Button>
        </div>
        {selectedRegisterations.length > 0 && (
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
                        {selectedRegisterations.length === displayedRegistrations.length && displayedRegistrations.length > 0 ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Leader Code</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Remark</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isListLoading && (!currentPageData || currentPageData.length === 0) ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8"><div className="flex justify-center items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /><span>Loading...</span></div></TableCell></TableRow>
                ) : !currentPageData || currentPageData.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8">No registrations found.</TableCell></TableRow>
                ) : (
                  currentPageData.map((register, idx) => (
                    <TableRow key={register._id}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5" 
                            onClick={() => toggleRegisterationSelection(register._id || '')}
                          >
                            {selectedRegisterations.includes(register._id || '') ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                      <TableCell><div className="font-medium">{register.name}</div></TableCell>
                      <TableCell><div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" /><span className="text-sm">{register.phoneNumber}</span></div></TableCell>
                      <TableCell><div className="flex items-center gap-2 font-mono text-sm"><Hash className="w-3 h-3 text-gray-500"/>{register.leaderCode || 'N/A'}</div></TableCell>
                      <TableCell><Badge className={`${getStatusColor(register.status)} text-white`}>{register.status}</Badge></TableCell>
                      <TableCell>{register.createdOn ? new Date(parseInt(register.createdOn)).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>
                        <div className="max-w-[200px] truncate text-sm text-gray-600" title={register.reason || ''}>
                            {register.status === 'NotInterested' && register.reason ? register.reason : '-'}
                        </div>
                      </TableCell>
                     <TableCell className="text-right">
                           <div className="flex gap-2 justify-end">
                             <Button variant="outline" size="sm" onClick={() => openUpdateModal(register)}>Update Status</Button>
                             <Button size="icon" variant="ghost" className="text-red-500 hover:text-red-600" onClick={() => openDeleteModal(register)} title="Delete">
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
      
      {totalPaginatedPages > 1 && (
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
              {Array.from({ length: totalPaginatedPages }, (_, i) => i + 1)
                .filter(pageNum => pageNum >= Math.max(1, page - 1) && pageNum <= Math.min(totalPaginatedPages, page + 1))
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
              {page < totalPaginatedPages - 3 && (
                <PaginationItem>
                  <span className="px-2">...</span>
                </PaginationItem>
              )}
              
              {/* Last page */}
              {page < totalPaginatedPages - 2 && (
                <PaginationItem>
                  <PaginationLink 
                    href="#" 
                    onClick={(e) => {
                      e.preventDefault();
                      setPage(totalPaginatedPages);
                    }}
                  >
                    {totalPaginatedPages}
                  </PaginationLink>
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setPage(Math.min(totalPaginatedPages, page + 1));
                  }}
                  className={page >= totalPaginatedPages || isListLoading ? "pointer-events-none opacity-50" : ""}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Update Status Dialog */}
      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Update Status for {editRegisteration?.name}</DialogTitle></DialogHeader>
          <div className="py-4 space-y-4">
            <div>
              <Label htmlFor="status-select">Status</Label>
              <Select value={newStatus} onValueChange={setNewStatus} disabled={isUpdating}>
                <SelectTrigger id="status-select" className="w-full"><SelectValue placeholder="Select Status" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="New">New</SelectItem>
                  <SelectItem value="RegisterationDone">Registered</SelectItem>
                  <SelectItem value="CallCut">Call Cut</SelectItem>
                  <SelectItem value="CallNotPickUp">Not Picked Up</SelectItem>
                  <SelectItem value="NotInterested">Not Interested</SelectItem>
                  <SelectItem value="InvalidNumber">Invalid Number</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {newStatus === 'NotInterested' && (
              <div className="space-y-2">
                <Label htmlFor="reason">Reason for "Not Interested"</Label>
                <Textarea 
                  id="reason" 
                  placeholder="e.g., Already has an account, not the right time..." 
                  value={reason} 
                  onChange={(e) => setReason(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={isUpdating}>Cancel</Button></DialogClose>
            <Button type="button" onClick={handleStatusUpdate} disabled={isUpdating || (newStatus === editRegisteration?.status && reason === (editRegisteration.reason || ''))}>
              {isUpdating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : ('Save Changes')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* NEW: Replace the delete dialog with DeleteConfirmationModal */}
      <DeleteConfirmationModal
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Registration"
        description={`Are you sure you want to permanently delete the registration for ${registerationToDelete?.name}? This action cannot be undone.`}
        onConfirm={handleDeleteConfirm}
        isDeleting={isDeleting}
        confirmButtonText="Delete Registration"
      />
      
      {/* NEW: Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
        title="Delete Multiple Registrations"
        description={`Are you sure you want to delete ${selectedRegisterations.length} selected registrations? This action cannot be undone.`}
        onConfirm={confirmBulkDelete}
        confirmButtonText="Delete"
        itemCount={selectedRegisterations.length}
      />

      {/* Export Dialog */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Registrations</DialogTitle>
            <DialogDescription>
              Choose a status to filter registrations for export, or export all.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={exportStatus} onValueChange={setExportStatus}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select Status" />
              </SelectTrigger>
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
          </div>
          <DialogFooter>
            <Button onClick={handleExport}>Export CSV</Button>
            <Button variant="outline" onClick={() => setExportModalOpen(false)}>
              Cancel
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}