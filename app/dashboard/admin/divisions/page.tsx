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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Dialog,
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
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/app/components/ui/delete-confirmation-modal";

// Import the User interface and the static data from the new data.ts file
// NOTE: Adjust the import path based on your project structure.
import { staticUsers, User } from "../data"; 
import Link from "next/link";

// --- Filter for Division Users ---
// This new page will only work with users who have the 'div' role.
const divisionUsers = staticUsers.filter(user => user.role === 'div');

// The initial form state will default the role to 'div' and make it read-only for this page.
const initialFormState: Omit<User, '_id' | 'createdOn'> = {
  name: "",
  email: "",
  phoneNumber: "",
  gender: "Male",
  role: "div", // Default role is 'div'
  role_id: [],
  income: 0,
  status: "Active",
  permanent_add: "",
  current_add: "",
  dob: "",
  emergency_num: "",
  referred_by: ""
};

export default function DivisionsPage() {
  // State is initialized with only the division users.
  const [allDivisions, setAllDivisions] = useState<User[]>(divisionUsers);
  const [displayedDivisions, setDisplayedDivisions] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  const ITEMS_PER_PAGE = 10;

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Filter users based on search and status (role filter is no longer needed)
  useEffect(() => {
    setLoading(true);
    
    const filteredUsers = allDivisions.filter(user => {
        const searchLower = debouncedSearch.toLowerCase();
        const matchesSearch = (
            user.name.toLowerCase().includes(searchLower) ||
            user.email.toLowerCase().includes(searchLower) ||
            user.phoneNumber.includes(searchLower) ||
            user.role_id[0]?.toLowerCase().includes(searchLower)
        );
        const matchesStatus = status === 'all' || user.status === status;
        // No role filter needed as the initial data is already filtered
        return matchesSearch && matchesStatus;
    });

    setTotalPages(Math.ceil(filteredUsers.length / ITEMS_PER_PAGE));
    
    const paginatedUsers = filteredUsers.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);
    setDisplayedDivisions(paginatedUsers);
    
    setLoading(false);
  }, [allDivisions, debouncedSearch, status, page]);


  const handleStatusChange = useCallback((val: string) => {
    setStatus(val);
    setPage(1);
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
      gender: user.gender ?? 'Male',
      role: 'div', // Role is fixed to 'div'
      role_id: user.role_id ?? [],
      income: user.income ?? 0,
      status: user.status ?? 'Active',
      permanent_add: user.permanent_add ?? '',
      current_add: user.current_add ?? '',
      dob: user.dob ? user.dob.split('T')[0] : '',
      emergency_num: user.emergency_num ?? '',
      referred_by: user.referred_by ?? '',
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({...prevForm, [name]: name === 'income' ? (value === '' ? 0 : Number(value)) : value}));
  };
  
  const handleFormSelectChange = (fieldName: string, value: string) => {
    setForm(prevForm => ({ ...prevForm, [fieldName]: value as any }));
  };
  
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));

    try {
      if (editUser && editUser._id) {
        const updatedUser = { ...editUser, ...form };
        const updatedDivisions = allDivisions.map(u => u._id === editUser._id ? updatedUser : u);
        setAllDivisions(updatedDivisions);
        toast.success("Division updated successfully!");
      } else {
        const newUser: User = {
          _id: (staticUsers.length + 1).toString() + new Date().getTime(), // Ensure unique ID across all users
          ...form,
          role_id: [form.role_id[0] || ''], 
          createdOn: new Date().toISOString()
        };
        setAllDivisions(prevUsers => [newUser, ...prevUsers]);
        toast.success("Division added successfully!");
      }
      setIsModalOpen(false);
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
    await new Promise(resolve => setTimeout(resolve, 500));
    
    try {
      setAllDivisions(prev => prev.filter(u => u._id !== userToDelete._id));
      toast.success(`Division "${userToDelete.name}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      if (displayedDivisions.length === 1 && page > 1) setPage(page - 1);
    } finally {
      setDeleteLoading(false);
    }
  };

  const openViewModal = (user: User) => {
    setViewingUser(user);
    setIsViewModalOpen(true);
  };

  const handleStatusToggle = () => {
    setForm(prevForm => ({
        ...prevForm,
        status: prevForm.status === 'Active' ? 'Block' : 'Active'
    }));
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <h1 className="text-4xl font-bold shrink-0">Division List</h1>
        <div className="flex flex-wrap justify-end gap-2 w-full">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-grow sm:flex-grow-0 sm:w-48"/>
          {/* Role filter is removed as this page is only for divisions */}
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-32"><SelectValue/></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Block">Block</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1" onClick={openAddModal}><Plus className="w-4 h-4"/> Add Division</Button>
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
                  <TableHead>Division ID</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Income</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8"><div className="flex justify-center items-center gap-2"><Loader2 className="h-6 w-6 animate-spin" /><span>Loading divisions...</span></div></TableCell></TableRow>
                ) : displayedDivisions.length === 0 ? (
                  <TableRow><TableCell colSpan={8} className="text-center py-8">{debouncedSearch || status !== "all" ? "No divisions found for the current filters." : "No divisions found."}</TableCell></TableRow>
                ) : (
                  displayedDivisions.map((user: User, idx: number) => (
                    <TableRow key={user._id}>
                      <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                      <TableCell><div className="flex items-center gap-3"><Avatar><AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback></Avatar><span className="font-medium">{user.name}</span></div></TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>{user.role_id[0] || '-'}</TableCell>
                      <TableCell><Badge variant={user.status === 'Block' ? "destructive" : "default"}>{user.status}</Badge></TableCell>
                      <TableCell>₹{user.income.toLocaleString()}</TableCell>
                      <TableCell><div className="flex gap-2">
                        {/* CORRECTED LINK STRUCTURE */}
                        <Button asChild size="icon" variant="ghost" title="View">
                            <Link href={`/dashboard/admin/user/${user._id}`}>
                                <Eye className="w-4 h-4 text-blue-600" />
                            </Link>
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => openEditModal(user)} title="Edit"><Edit className="w-4 h-4" /></Button><Button size="icon" variant="ghost" onClick={() => openDeleteModal(user)} title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></Button></div></TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {!loading && totalPages > 1 && (
        <div className="mt-4"><Pagination>
            <PaginationContent>
              <PaginationItem className={page === 1 ? "pointer-events-none opacity-50" : ""}><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }} /></PaginationItem>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (<PaginationItem key={pageNum}><PaginationLink href="#" isActive={page === pageNum} onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }}>{pageNum}</PaginationLink></PaginationItem>))}
              <PaginationItem className={page === totalPages ? "pointer-events-none opacity-50" : ""}><PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }} /></PaginationItem>
            </PaginationContent>
        </Pagination></div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader><DialogTitle>{editUser ? 'Edit Division' : 'Add New Division'}</DialogTitle><DialogDescription>{editUser ? 'Update the details for this division.' : 'Fill in the details for the new division.'}</DialogDescription></DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="name">Name*</Label><Input id="name" name="name" value={form.name} onChange={handleFormChange} required /></div>
              <div className="space-y-2"><Label htmlFor="email">Email*</Label><Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} required/></div>
              <div className="space-y-2"><Label htmlFor="phoneNumber">Phone Number*</Label><Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleFormChange} required /></div>
              <div className="space-y-2"><Label htmlFor="emergency_num">Emergency Number</Label><Input id="emergency_num" name="emergency_num" value={form.emergency_num} onChange={handleFormChange}/></div>
              <div className="space-y-2"><Label htmlFor="dob">Date of Birth</Label><Input id="dob" name="dob" type="date" value={form.dob} onChange={handleFormChange}/></div>
              <div className="space-y-2"><Label htmlFor="gender">Gender</Label><Select value={form.gender} onValueChange={(value) => handleFormSelectChange('gender', value)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Male">Male</SelectItem><SelectItem value="Female">Female</SelectItem><SelectItem value="Other">Other</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="role_id">Division ID*</Label><Input id="role_id" name="role_id" placeholder="e.g., DIV001" value={form.role_id[0] || ''} onChange={(e) => setForm(f => ({...f, role_id: [e.target.value]}))} required /></div>
              <div className="space-y-2"><Label htmlFor="income">Income</Label><Input id="income" name="income" type="number" value={form.income || ''} onChange={handleFormChange}/></div>
              
              {editUser ? (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div><Badge variant={form.status === 'Block' ? 'destructive' : 'default'}>{form.status}</Badge></div>
                </div>
              ) : (
                <div className="space-y-2"><Label htmlFor="status">Status</Label><Select value={form.status} onValueChange={(value) => handleFormSelectChange('status', value)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="Active">Active</SelectItem><SelectItem value="Block">Block</SelectItem></SelectContent></Select></div>
              )}
              
              <div className="space-y-2 md:col-span-2"><Label htmlFor="referred_by">Referred By</Label><Input id="referred_by" name="referred_by" placeholder="Referrer's Role ID" value={form.referred_by} onChange={handleFormChange}/></div>
              <div className="space-y-2"><Label htmlFor="current_add">Current Address</Label><Textarea id="current_add" name="current_add" value={form.current_add} onChange={handleFormChange}/></div>
              <div className="space-y-2"><Label htmlFor="permanent_add">Permanent Address</Label><Textarea id="permanent_add" name="permanent_add" value={form.permanent_add} onChange={handleFormChange}/></div>
            </div>
            
            <DialogFooter className="pt-4">
              {editUser && (
                <Button type="button" variant={form.status === 'Active' ? 'destructive' : 'secondary'} onClick={handleStatusToggle} disabled={formLoading} className="mr-auto">
                  {form.status === 'Active' ? 'Block Division' : 'Activate Division'}
                </Button>
              )}
              <DialogClose asChild><Button type="button" variant="outline" disabled={formLoading}>Cancel</Button></DialogClose>
              <Button type="submit" disabled={formLoading}>{formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}{formLoading ? 'Saving...' : (editUser ? 'Update Division' : 'Add Division')}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader><DialogTitle>Division Details</DialogTitle><DialogDescription>Viewing complete information for {viewingUser?.name}.</DialogDescription></DialogHeader>
          {viewingUser && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 py-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1"><Label className="text-muted-foreground">Name</Label><p className="font-medium">{viewingUser.name}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Email</Label><p className="font-medium">{viewingUser.email}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Phone Number</Label><p className="font-medium">{viewingUser.phoneNumber}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Emergency Number</Label><p className="font-medium">{viewingUser.emergency_num || "-"}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Date of Birth</Label><p className="font-medium">{viewingUser.dob ? new Date(viewingUser.dob).toLocaleDateString() : "-"}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Gender</Label><p className="font-medium">{viewingUser.gender}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Division ID</Label><p className="font-medium">{viewingUser.role_id[0] || "-"}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Role</Label><p className="font-medium capitalize">{viewingUser.role}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Status</Label><p><Badge variant={viewingUser.status === "Block" ? "destructive" : "default"}>{viewingUser.status}</Badge></p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Income</Label><p className="font-medium">₹{viewingUser.income?.toLocaleString() || 0}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Referred By</Label><p className="font-medium">{viewingUser.referred_by || "-"}</p></div>
              <div className="space-y-1"><Label className="text-muted-foreground">Joined On</Label><p className="font-medium">{new Date(viewingUser.createdOn).toLocaleString()}</p></div>
              <div className="space-y-1 sm:col-span-2"><Label className="text-muted-foreground">Current Address</Label><p className="font-medium text-sm">{viewingUser.current_add || "-"}</p></div>
              <div className="space-y-1 sm:col-span-2"><Label className="text-muted-foreground">Permanent Address</Label><p className="font-medium text-sm">{viewingUser.permanent_add || "-"}</p></div>
            </div>
          )}
          <DialogFooter><DialogClose asChild><Button variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>

      <DeleteConfirmationModal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} title="Delete Division" description={`Are you sure you want to delete the division "${userToDelete?.name}"? This action cannot be undone.`} onConfirm={handleConfirmDelete} isDeleting={deleteLoading} confirmButtonText="Delete Division" />
    </div>
  );
}