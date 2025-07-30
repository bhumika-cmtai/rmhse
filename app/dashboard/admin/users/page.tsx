"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent, useCallback } from "react";
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
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, Loader2, Eye } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers, selectUsers, selectLoading, User, selectPagination, addUser, updateUser, deleteUser as deleteUserAction } from "@/lib/redux/userSlice";
import { AppDispatch } from "@/lib/store";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/app/components/ui/delete-confirmation-modal";

// Define the initial state for the user form
const initialFormState: Omit<User, 'role' | '_id' | 'password' | 'createdOn' | 'updatedOn' | 'registeredClientCount' > = {
  name: "",
  email: "",
  phoneNumber: "",
  whatsappNumber: "",
  city: "",
  status: "New",
  leaderCode: "",
  income: 0
};

export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const users: User[] = useSelector(selectUsers);
  const loading: boolean = useSelector(selectLoading);
  const { totalPages } = useSelector(selectPagination);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const ITEMS_PER_PAGE = 15;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Fetch users when filters or page change
  useEffect(() => {
    const params: any = {
      search: debouncedSearch,
      status: status === "all" ? undefined : status,
      page: page,
      limit: ITEMS_PER_PAGE
    };
    dispatch(fetchUsers(params));
  }, [dispatch, debouncedSearch, status, page]);

  const handleStatusChange = useCallback((val: string) => {
    setStatus(val);
    setPage(1); // Reset to page 1 on filter change
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [totalPages]);

  const openAddModal = () => {
    setEditUser(null);
    setForm(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditUser(user);
    setForm({
      name: user.name ?? '',
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? '',
      whatsappNumber: user.whatsappNumber ?? '',
      city: user.city ?? '',
      status: user.status ?? 'New',
      leaderCode: user.leaderCode ?? '',
      income: user.income ?? 0
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({...prevForm, [name]: name === 'income' ? (value === '' ? 0 : Number(value)) : value}));
  };
  
  const handleFormSelectChange = (fieldName: string, value: string) => {
    setForm({ ...form, [fieldName]: value });
  };
  
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      let response;
      if (editUser && editUser._id) {
        const updatedUserPayload = { ...editUser, ...form, income: Number(form.income) || 0 };
        response = await dispatch(updateUser(editUser._id, updatedUserPayload));
      } else {
        const newUserPayload: User = {
          ...form,
          income: Number(form.income) || 0,
          role: "user",
          password: "password123", // NOTE: Password should be handled more securely
        };
        response = await dispatch(addUser(newUserPayload));
      }

      if (response) {
        setIsModalOpen(false);
        dispatch(fetchUsers({ search: debouncedSearch, status, page: page }));
        toast.success(editUser ? "Leader updated successfully!" : "Leader added successfully!");
      }
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete?._id) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteUserAction(userToDelete._id));
      toast.success(`Leader "${userToDelete.name}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      
      const newPage = users.length === 1 && page > 1 ? page - 1 : page;
      dispatch(fetchUsers({ search: debouncedSearch, status, page: newPage }));

    } finally {
      setDeleteLoading(false);
    }
  };

  const openViewModal = (user: User) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <h1 className="text-4xl font-bold shrink-0">User List</h1>
        <div className="flex flex-wrap justify-end gap-2 w-full">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-grow sm:flex-grow-0 sm:w-48"/>
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-32"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1" onClick={openAddModal}><Plus className="w-4 h-4"/> Add Leader</Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S. No.</TableHead>
                  <TableHead>Leader Name</TableHead>
                  <TableHead>Leader Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Leader Code</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Total Registrations</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8"><div className="flex justify-center items-center gap-2"><Loader2 className="h-6 w-6 animate-spin" /><span>Loading leaders...</span></div></TableCell></TableRow>
                ) : users.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">{debouncedSearch || status !== "all" ? "No leaders found for the current filters." : "No leaders found in the system."}</TableCell></TableRow>
                ) : (
                  users.map((user: User, idx: number) => (
                    <TableRow key={user._id}>
                      <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                      <TableCell><div className="flex items-center gap-3"><Avatar><AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback></Avatar><span className="font-medium">{user.name}</span></div></TableCell>
                      <TableCell>{user.phoneNumber || '-'}</TableCell>
                      <TableCell><Badge variant={user.status === "Active" ? "default" : "secondary"}>{user.status || 'N/A'}</Badge></TableCell>
                      <TableCell>{user.leaderCode || '-'}</TableCell>
                      <TableCell>{user.createdOn ? new Date(parseInt(user.createdOn)).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{user.registeredClientCount}</TableCell>
                      <TableCell><div className="flex gap-2"><Button size="icon" variant="ghost" onClick={() => openViewModal(user)} title="View"><Eye className="w-4 h-4 text-blue-600" /></Button><Button size="icon" variant="ghost" onClick={() => openEditModal(user)} title="Edit"><Edit className="w-4 h-4" /></Button><Button size="icon" variant="ghost" onClick={() => openDeleteModal(user)} title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></Button></div></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination component */}
      {!loading && totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem className={page === 1 ? "pointer-events-none opacity-50" : ""}>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }} />
              </PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink href="#" isActive={page === pageNum} onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }}>
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
              ))}
              <PaginationItem className={page === totalPages ? "pointer-events-none opacity-50" : ""}>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editUser ? 'Edit Leader' : 'Add New Leader'}</DialogTitle>
            <DialogDescription>
              {editUser ? 'Update the details for this leader.' : 'Fill in the details for the new leader.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto pr-2">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="name">Name*</Label><Input id="name" name="name" value={form.name} onChange={handleFormChange} required /></div>
              <div className="space-y-2"><Label htmlFor="email">Email*</Label><Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} required/></div>
              <div className="space-y-2"><Label htmlFor="phoneNumber">Phone Number*</Label><Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleFormChange} required /></div>
              <div className="space-y-2"><Label htmlFor="whatsappNumber">WhatsApp Number</Label><Input id="whatsappNumber" name="whatsappNumber" value={form.whatsappNumber} onChange={handleFormChange}/></div>
              <div className="space-y-2"><Label htmlFor="city">City</Label><Input id="city" name="city" value={form.city} onChange={handleFormChange}/></div>
              <div className="space-y-2"><Label htmlFor="income">Income</Label><Input id="income" name="income" type="number" value={form.income || ''} onChange={handleFormChange}/></div>
              <div className="space-y-2"><Label htmlFor="leaderCode">Leader Code</Label><Input id="leaderCode" name="leaderCode" value={form.leaderCode} onChange={handleFormChange}/></div>
              <div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={form.status} onValueChange={(value) => handleFormSelectChange('status', value)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="New">New</SelectItem><SelectItem value="Active">Active</SelectItem><SelectItem value="Inactive">Inactive</SelectItem></SelectContent></Select></div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline" disabled={formLoading}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={formLoading}>{formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}{formLoading ? 'Saving...' : (editUser ? 'Update Leader' : 'Add Leader')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* View Details Dialog */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Leader Details</DialogTitle>
            <DialogDescription>
              Viewing the complete information for {viewingUser?.name}.
            </DialogDescription>
          </DialogHeader>
          {viewingUser && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1"><Label className="text-muted-foreground">Name</Label><p className="font-medium">{viewingUser.name}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Email</Label><p className="font-medium">{viewingUser.email}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Phone Number</Label><p className="font-medium">{viewingUser.phoneNumber}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">WhatsApp Number</Label><p className="font-medium">{viewingUser.whatsappNumber || "-"}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">City</Label><p className="font-medium">{viewingUser.city || "-"}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Status</Label><p><Badge variant={viewingUser.status === "Active" ? "default" : "secondary"}>{viewingUser.status || 'N/A'}</Badge></p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Leader Code</Label><p className="font-medium">{viewingUser.leaderCode || "-"}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Income</Label><p className="font-medium">₹{viewingUser.income?.toLocaleString() || 0}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Account Number</Label><p className="font-medium">{viewingUser.account_number || '-'}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">IFSC</Label><p className="font-medium">{viewingUser.Ifsc || '-'}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">UPI ID</Label><p className="font-medium">{viewingUser.upi_id || '-'}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Joined On</Label><p className="font-medium">{viewingUser.createdOn ? new Date(parseInt(viewingUser.createdOn)).toLocaleString() : '-'}</p></div>
            </div>
          )}
          <DialogFooter>
            <DialogClose asChild><Button variant="outline">Close</Button></DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Leader"
        description={`Are you sure you want to delete the leader "${userToDelete?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        isDeleting={deleteLoading}
        confirmButtonText="Delete Leader"
      />
    </div>
  );
}