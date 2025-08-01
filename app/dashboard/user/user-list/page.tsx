"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trash2, Loader2 } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/app/components/ui/delete-confirmation-modal";
import { staticUsers, User } from "../../admin/data";

// Helper function to check if a user is protected from deletion
const isProtectedUser = (userId: string): boolean => {
  const numericId = parseInt(userId, 10);
  // Check if the ID is a number and falls within the protected range 1-17
  return !isNaN(numericId) && numericId >= 1 && numericId <= 17;
};

export default function Users() {
  const [allUsers, setAllUsers] = useState<User[]>(staticUsers);
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const ITEMS_PER_PAGE = 10;

  // Debounce search input to avoid re-fetching on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1); // Reset to first page on new search
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Main effect for filtering and pagination
  useEffect(() => {
    setLoading(true);
    const filteredUsers = allUsers.filter(user => {
      const searchLower = debouncedSearch.toLowerCase();
      const matchesSearch = (
          user.name.toLowerCase().includes(searchLower) ||
          user.email.toLowerCase().includes(searchLower) ||
          user.phoneNumber.includes(searchLower) ||
          user.role_id[0]?.toLowerCase().includes(searchLower)
      );
      const matchesStatus = status === 'all' || user.status === status;
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
    setTotalPages(Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
    const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    setDisplayedUsers(paginatedUsers);
    setLoading(false);
  }, [allUsers, debouncedSearch, status, roleFilter, page]);

  // --- Filter and Pagination Handlers ---
  const handleStatusChange = useCallback((val: string) => {
    setStatus(val);
    setPage(1);
  }, []);
  
  const handleRoleChange = useCallback((val: string) => {
    setRoleFilter(val);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [totalPages]);

  // --- Delete Handlers ---
  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    if (isProtectedUser(userToDelete._id)) {
        toast.error("This user cannot be deleted.");
        setIsDeleteModalOpen(false);
        return;
    }

    setDeleteLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API call
    try {
      setAllUsers(prev => prev.filter(u => u._id !== userToDelete._id));
      toast.success(`User "${userToDelete.name}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      // If the last item on a page is deleted, go back one page
      if (displayedUsers.length === 1 && page > 1) {
        setPage(page - 1);
      }
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <h1 className="text-4xl font-bold shrink-0">User List</h1>
        <div className="flex flex-wrap justify-end gap-2 w-full">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-grow sm:flex-grow-0 sm:w-48"/>
          <Select value={roleFilter} onValueChange={handleRoleChange}>
            <SelectTrigger className="w-full sm:w-40"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="div">Division</SelectItem>
              <SelectItem value="dist">District</SelectItem>
              <SelectItem value="stat">State</SelectItem>
              <SelectItem value="bm">Board Member</SelectItem>
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-32"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Block">Block</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S. No.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone No.</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Income</TableHead>
                  {/* <TableHead>Actions</TableHead> */}
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8"><div className="flex justify-center items-center gap-2"><Loader2 className="h-6 w-6 animate-spin" /><span>Loading users...</span></div></TableCell></TableRow>
                ) : displayedUsers.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">{debouncedSearch || status !== "all" || roleFilter !== "all" ? "No users found for the current filters." : "No users found."}</TableCell></TableRow>
                ) : (
                  displayedUsers.map((user: User, idx: number) => {
                    const protectedUser = isProtectedUser(user._id);
                    return (
                      <TableRow key={user._id}>
                        <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                        <TableCell><div className="flex items-center gap-3"><Avatar><AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback></Avatar><span className="font-medium">{user.name}</span></div></TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell>{user.role_id[0] || '-'}</TableCell>
                        <TableCell><Badge variant={user.status === 'Block' ? "destructive" : "default"}>{user.status}</Badge></TableCell>
                        <TableCell>₹{user.income.toLocaleString()}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            {!protectedUser &&
                              <Button 
                                  size="icon" 
                                  variant="ghost" 
                                  onClick={() => openDeleteModal(user)} 
                                  title="Delete"
                              >
                                  <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>
                            }
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {!loading && totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem className={page === 1 ? "pointer-events-none opacity-50" : ""}>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }} />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                <PaginationItem key={pageNum}>
                  <PaginationLink href="#" isActive={page === pageNum} onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }}>{pageNum}</PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem className={page === totalPages ? "pointer-events-none opacity-50" : ""}>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
      
      <DeleteConfirmationModal 
        open={isDeleteModalOpen} 
        onOpenChange={setIsDeleteModalOpen} 
        title="Delete User" 
        description={`Are you sure you want to delete the user "${userToDelete?.name}"? This action cannot be undone.`} 
        onConfirm={handleConfirmDelete} 
        isDeleting={deleteLoading} 
        confirmButtonText="Delete User" 
      />
    </div>
  );
}