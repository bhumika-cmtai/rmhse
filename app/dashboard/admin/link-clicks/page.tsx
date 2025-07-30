"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription, // Added for export dialog
  DialogFooter, 
  DialogClose 
} from "@/components/ui/dialog";
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Phone, Loader2, Hash, Download, CheckSquare, Square, Trash2, Search } from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import { toast } from "sonner"; // Added for notifications
import { Label } from "@/components/ui/label";

import {
  fetchLinkclicks,
  updateLinkclick,
  fetchPortalNames,
  selectLinkclicks,
  selectLoading,
  selectPagination,
  Linkclick,
  deleteManyLinkclicks,
} from "@/lib/redux/linkclickSlice";
import { AppDispatch, RootState } from "@/lib/store";
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

export default function LinkclicksPage() {
  const dispatch = useDispatch<AppDispatch>();
  
  // Selectors for Redux state
  const linkclicks = useSelector(selectLinkclicks);
  const { currentPage, totalPages, totalLinkclicks } = useSelector(selectPagination);
  const portalNames = useSelector((state: RootState) => state.linkclicks.portalNames);
  const isListLoading = useSelector(selectLoading);

  // NEW: State to store filtered link clicks for date range
  const [filteredLinkclicks, setFilteredLinkclicks] = useState<Linkclick[]>([]);
  // Flag to determine if we're showing filtered results
  const [isDateFiltered, setIsDateFiltered] = useState(false);
  
  // State for three separate search boxes
  const [nameSearch, setNameSearch] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [codeSearch, setCodeSearch] = useState("");
  
  // Debounce each search input individually
  const debouncedName = useDebounce(nameSearch, 500);
  const debouncedPhone = useDebounce(phoneSearch, 500);
  const debouncedCode = useDebounce(codeSearch, 500);

  // State for filters and pagination
  const [portalFilter, setPortalFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);
  
  // State for the update modal
  const [editLinkclick, setEditLinkclick] = useState<Linkclick | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<string>("");
  const [isUpdating, setIsUpdating] = useState(false);

  // State for the export modal
  const [exportModalOpen, setExportModalOpen] = useState(false);
  const [exportStatus, setExportStatus] = useState("all");

  // NEW: State for multiple selection
  const [selectedLinkclicks, setSelectedLinkclicks] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // NEW: Date range filter state
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [dateRangeCount, setDateRangeCount] = useState<number | null>(null);
  const [isCountLoading, setIsCountLoading] = useState<boolean>(false);
  const [countError, setCountError] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 8; // Match with backend limit

  // Main effect to fetch data when page or any debounced filter changes
  useEffect(() => {
    dispatch(fetchLinkclicks({ 
      page, 
      name: debouncedName,
      phoneNumber: debouncedPhone,
      leaderCode: debouncedCode,
      portalName: portalFilter, 
      status: statusFilter, 
      limit: ITEMS_PER_PAGE 
    }));
  }, [dispatch, page, debouncedName, debouncedPhone, debouncedCode, portalFilter, statusFilter]);
  
  // Effect to fetch portal names once on mount
  useEffect(() => {
    dispatch(fetchPortalNames());
  }, [dispatch]);

  // Effect to reset to page 1 when a new search or filter is applied
  useEffect(() => {
    setPage(1);
  }, [debouncedName, debouncedPhone, debouncedCode, portalFilter, statusFilter]);

  // Modal and Update Logic
  const openUpdateModal = (linkclick: Linkclick) => {
    setEditLinkclick(linkclick);
    setNewStatus(linkclick.status || "inComplete");
    setModalOpen(true);
  };

  const handleStatusUpdate = async () => {
    if (!editLinkclick || !editLinkclick._id || !newStatus) return;
    setIsUpdating(true);
    try {
      await dispatch(updateLinkclick(editLinkclick._id, { status: newStatus }));
      // Refetch the current page to show updated data
      dispatch(fetchLinkclicks({ page, name: debouncedName, phoneNumber: debouncedPhone, leaderCode: debouncedCode, portalName: portalFilter, status: statusFilter, limit: ITEMS_PER_PAGE }));
      setModalOpen(false);
      toast.success("Status updated successfully!");
    } catch (error) {
      toast.error("Failed to update status.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to handle the CSV export
  const handleExport = () => {
    if (!linkclicks || linkclicks.length === 0) {
        toast.warning("There is no link click data to export.");
        return;
    }
      
    const filteredLinkclicks = exportStatus === "all" 
      ? linkclicks 
      : linkclicks.filter(click => click.status === exportStatus);
    
    if (filteredLinkclicks.length === 0) {
        toast.warning(`No link clicks found with the status "${exportStatus}".`);
        return;
    }

    const headers = ["Leader Code", "Name", "Phone Number", "Portal", "Status", "Created On"];
    const csvContent = [
      headers.join(","),
      ...filteredLinkclicks.map(click => [
        `"${click.leaderCode || 'N/A'}"`,
        `"${click.name.replace(/"/g, '""')}"`,
        `"${click.phoneNumber.replace(/"/g, '""')}"`,
        `"${click.portalName || 'N/A'}"`,
        `"${click.status}"`,
        `"${click.createdOn ? new Date(parseInt(click.createdOn)).toISOString() : 'N/A'}"`
      ].join(","))
    ].join("\n");
    
    const blob = new Blob([`\uFEFF${csvContent}`], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `linkclicks-${exportStatus.toLowerCase()}-${new Date().toISOString().split("T")[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    setExportModalOpen(false);
    toast.success("Link click data has been exported.");
  };

  const getStatusColor = (status: string) => {
    const statusColors: { [key: string]: string } = {
      'complete': 'bg-blue-500',
      'inComplete': 'bg-orange-500',
    };
    return statusColors[status] || "bg-gray-400";
  };

  // NEW: Handler for selecting/deselecting a single link click
  const toggleLinkclickSelection = (linkclickId: string) => {
    setSelectedLinkclicks(prev => 
      prev.includes(linkclickId)
        ? prev.filter(id => id !== linkclickId)
        : [...prev, linkclickId]
    );
  };

  // NEW: Handler for selecting/deselecting all link clicks
  const toggleSelectAll = () => {
    if (selectedLinkclicks.length === displayedLinkclicks.length) {
      setSelectedLinkclicks([]);
    } else {
      setSelectedLinkclicks(displayedLinkclicks.map(click => click._id || '').filter(Boolean));
    }
  };

  // NEW: Handler for bulk delete action
  const handleBulkDelete = () => {
    if (selectedLinkclicks.length === 0) {
      toast.warning("No link clicks selected for deletion");
      return;
    }
    setIsBulkDeleteModalOpen(true);
  };

  // NEW: Handler to confirm bulk deletion
  const confirmBulkDelete = async () => {
    const result = await dispatch(deleteManyLinkclicks(selectedLinkclicks));
    if (result) {
      toast.success(`${selectedLinkclicks.length} link clicks would be deleted`);
      setIsBulkDeleteModalOpen(false);
      setSelectedLinkclicks([]);
    } else {
      toast.error("Failed to delete link clicks");
    }
  };

  // NEW: Handler for date range search
  const handleDateRangeSearch = () => {
    if (!startDate || !endDate) {
      toast.warning("Please select both start and end dates");
      return;
    }
    
    setIsCountLoading(true);
    setCountError(null);
    setDateRangeCount(null);
    
    try {
      // Convert selected dates to timestamps for comparison
      const startTimestamp = new Date(startDate).setHours(0, 0, 0, 0);
      const endTimestamp = new Date(endDate).setHours(23, 59, 59, 999); // End of the selected day
      
      // Filter linkclicks by date range
      const filtered = linkclicks.filter(linkclick => {
        if (!linkclick.createdOn) return false;
        
        const clickTimestamp = parseInt(linkclick.createdOn);
        return clickTimestamp >= startTimestamp && clickTimestamp <= endTimestamp;
      });
      
      setFilteredLinkclicks(filtered);
      setDateRangeCount(filtered.length);
      setIsDateFiltered(true);
      toast.success("Date range search completed");
    } catch (error: any) {
      setCountError("Failed to filter link clicks for the selected date range");
      toast.error("Failed to process date range filter");
    } finally {
      setIsCountLoading(false);
    }
  };

  // Clear filters function
  const clearDateFilter = () => {
    setStartDate("");
    setEndDate("");
    setDateRangeCount(null);
    setFilteredLinkclicks([]);
    setIsDateFiltered(false);
  };

  // The data to display in the table (either filtered or all)
  const displayedLinkclicks = isDateFiltered ? filteredLinkclicks : linkclicks;

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Link Clicks ({isDateFiltered ? dateRangeCount : totalLinkclicks})</h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Input placeholder="Search by Name..." value={nameSearch} onChange={(e) => setNameSearch(e.target.value)} className="w-full sm:w-auto md:w-40"/>
          <Input placeholder="Search by Phone..." value={phoneSearch} onChange={(e) => setPhoneSearch(e.target.value)} className="w-full sm:w-auto md:w-40"/>
          <Input placeholder="Search by Code..." value={codeSearch} onChange={(e) => setCodeSearch(e.target.value)} className="w-full sm:w-auto md:w-40"/>
          <Select value={portalFilter} onValueChange={setPortalFilter}>
            <SelectTrigger className="w-full sm:w-auto md:w-40"><SelectValue placeholder="All Portals" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Portals</SelectItem>
              {portalNames.map((name: string) => (<SelectItem key={name} value={name}>{name}</SelectItem>))}
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-auto md:w-40"><SelectValue placeholder="All Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="complete">Complete</SelectItem>
              <SelectItem value="inComplete">InComplete</SelectItem>
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
            Total Link Clicks Found: {dateRangeCount}
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
            {selectedLinkclicks.length === displayedLinkclicks.length && displayedLinkclicks.length > 0 ? (
              <CheckSquare className="h-4 w-4" />
            ) : (
              <Square className="h-4 w-4" />
            )}
            {selectedLinkclicks.length > 0 ? `Selected (${selectedLinkclicks.length})` : "Select All"}
          </Button>
        </div>
        {selectedLinkclicks.length > 0 && (
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
                        {selectedLinkclicks.length === displayedLinkclicks.length && displayedLinkclicks.length > 0 ? (
                          <CheckSquare className="h-4 w-4" />
                        ) : (
                          <Square className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                  </TableHead>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Leader Code</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Portal</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isListLoading && (!displayedLinkclicks || displayedLinkclicks.length === 0) ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8"><div className="flex justify-center items-center gap-2"><Loader2 className="h-5 w-5 animate-spin" /><span>Loading...</span></div></TableCell></TableRow>
                ) : !displayedLinkclicks || displayedLinkclicks.length === 0 ? (
                  <TableRow><TableCell colSpan={9} className="text-center py-8">No link clicks found.</TableCell></TableRow>
                ) : (
                  displayedLinkclicks.map((linkclick, idx) => (
                    <TableRow key={linkclick._id}>
                      <TableCell>
                        <div className="flex items-center justify-center">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-5 w-5" 
                            onClick={() => toggleLinkclickSelection(linkclick._id || '')}
                          >
                            {selectedLinkclicks.includes(linkclick._id || '') ? (
                              <CheckSquare className="h-4 w-4" />
                            ) : (
                              <Square className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </TableCell>
                      <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                      <TableCell><div className="flex items-center gap-2 font-mono text-sm"><Hash className="w-3 h-3 text-gray-500"/>{linkclick.leaderCode || 'N/A'}</div></TableCell>
                      <TableCell><div className="font-medium">{linkclick.name}</div></TableCell>
                      <TableCell><div className="flex items-center gap-2"><Phone className="w-4 h-4 text-gray-500" /><span className="text-sm">{linkclick.phoneNumber}</span></div></TableCell>
                      <TableCell>{linkclick.portalName || 'N/A'}</TableCell>
                      <TableCell><Badge className={`${getStatusColor(linkclick.status)} text-white`}>{linkclick.status}</Badge></TableCell>
                      <TableCell>{linkclick.createdOn ? new Date(parseInt(linkclick.createdOn)).toLocaleDateString() : '-'}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm" onClick={() => openUpdateModal(linkclick)}>Update Status</Button>
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
          <DialogHeader><DialogTitle>Update Status for {editLinkclick?.name}</DialogTitle></DialogHeader>
          <div className="py-4">
            <Select value={newStatus} onValueChange={setNewStatus} disabled={isUpdating}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select Status" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="inComplete">InComplete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <DialogClose asChild><Button type="button" variant="outline" disabled={isUpdating}>Cancel</Button></DialogClose>
            <Button type="button" onClick={handleStatusUpdate} disabled={isUpdating || newStatus === editLinkclick?.status}>{isUpdating ? (<><Loader2 className="mr-2 h-4 w-4 animate-spin" />Saving...</>) : ('Save Changes')}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Export Link Clicks Dialog */}
      <Dialog open={exportModalOpen} onOpenChange={setExportModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Export Link Clicks</DialogTitle>
            <DialogDescription>Choose a status to filter link clicks for export, or export all.</DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Select value={exportStatus} onValueChange={setExportStatus}>
              <SelectTrigger className="w-full"><SelectValue placeholder="Select Status"/></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="complete">Complete</SelectItem>
                <SelectItem value="inComplete">InComplete</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <DialogFooter>
            <Button onClick={handleExport}>Export CSV</Button>
            <Button variant="outline" onClick={() => setExportModalOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* NEW: Bulk Delete Confirmation Modal */}
      <DeleteConfirmationModal
        open={isBulkDeleteModalOpen}
        onOpenChange={setIsBulkDeleteModalOpen}
        title="Delete Multiple Link Clicks"
        description={`Are you sure you want to delete ${selectedLinkclicks.length} selected link clicks? This action cannot be undone.`}
        onConfirm={confirmBulkDelete}
        confirmButtonText="Delete"
        itemCount={selectedLinkclicks.length}
      />
    </div>
  );
}