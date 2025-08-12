"use client";

import React, { useState, useEffect, ChangeEvent, FormEvent, useCallback } from "react";
import Link from "next/link";
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
import { useDispatch, useSelector } from "react-redux";
import { 
  fetchUsers, 
  addUser,
  updateUser, 
  deleteUser, 
  selectUsers, 
  selectLoading, 
  selectError, 
  selectPagination,
  User 
} from "@/lib/redux/userSlice";
import { AppDispatch, RootState } from "@/lib/store";
import { generateRoleId } from "@/lib/userActions";

// This function remains the same, as it's used for ID generation.



// --- MODIFICATION START ---
// List of user IDs that should not be deleted.
const protectedUserIds = [
  "689196e09a69b409d03f86e8",
  "689197399a69b409d03f86eb",
  "68919d7ef1dedfbfd356fecc",
  "68919e48f1dedfbfd356fed8",
  "68919eeff1dedfbfd356fedb",
  "6891a224d7169e1e22af1b29",
  "6893b75941efc3a7afaf577b",
  "68940391362687a7140c4c7f",
  "689404c3362687a7140c4c85",
  "6894053d362687a7140c4c8a",
  "689406be6513e46810ca48ae",
  "689407781df54db8eed4af74",
  "689407b01df54db8eed4af79",
  "6894100d347fa8583c039093",
];
// --- MODIFICATION END ---

// MODIFIED: Initial form state now defaults the role to 'BM'
const initialFormState: Omit<User, '_id' | 'createdOn'> = {
  name: "",
  email: "",
  phoneNumber: "",
  emergencyNumber: "",
  currentAddress: "",
  permanentAddress: "",
  password: "",
  role: "BM", // Default role is BM
  status: "Active",
  income: 0,
  account_number: "",
  Ifsc: "",
  upi_id: "",
  roleId: [],
};

// MODIFIED: Component renamed to DivUsers
export default function DivUsers() {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const pagination = useSelector(selectPagination);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  // REMOVED: `roleFilter` state is no longer needed.
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<Omit<User, '_id' | 'createdOn'>>(initialFormState);
  const [formLoading, setFormLoading] = useState(false);
  
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // MODIFIED: The role is now hardcoded to 'BM' in the fetchUsers call.
  useEffect(() => {
    const params: any = {
      page: pagination.currentPage,
      role: 'BM', // Always fetch users with the 'BM' role
      status: status,
    };
    
    if (debouncedSearch) params.search = debouncedSearch;
    
    dispatch(fetchUsers(params));
  }, [dispatch, debouncedSearch, status, pagination.currentPage]); // REMOVED: `roleFilter` from dependencies

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleStatusChange = useCallback((val: string) => {
    setStatus(val);
  }, []);
  
  // REMOVED: `handleRoleChange` is no longer needed.

  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > pagination.totalPages) return;
    dispatch({ type: 'users/setCurrentPage', payload: newPage });
  }, [dispatch, pagination.totalPages]);

  const openAddModal = () => {
    setEditUser(null);
    setForm(initialFormState); // This correctly sets the default role to 'BM'
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditUser(user);
    const formState: Omit<User, '_id' | 'createdOn'> = {
      name: user.name ?? '',
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? '',
      emergencyNumber: user.emergencyNumber ?? '',
      currentAddress: user.currentAddress ?? '',
      permanentAddress: user.permanentAddress ?? '',
      password: '',
      role: user.role ?? 'BM', // Ensure role is set, default to BM
      status: user.status ?? 'Active',
      income: user.income ?? 0,
      account_number: user.account_number ?? '',
      Ifsc: user.Ifsc ?? '',
      upi_id: user.upi_id ?? '',
      roleId: user.roleId ?? [],
    };
    setForm(formState);
    setIsModalOpen(true);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prevForm => ({
      ...prevForm, 
      [name]: name === 'income' ? (value === '' ? 0 : Number(value)) : value
    }));
  };
  
  const handleFormSelectChange = (fieldName: string, value: string) => {
    setForm(prevForm => ({ ...prevForm, [fieldName]: value as any }));
  };

  const handleStatusToggle = () => {
    setForm(prevForm => ({
      ...prevForm,
      status: prevForm.status === 'Active' ? 'Block' : 'Active'
    }));
  };

  const refreshData = () => {
    // MODIFIED: Ensure refresh also fetches only 'BM' role
    dispatch(fetchUsers({ page: pagination.currentPage, role: 'BM', status: status, search: debouncedSearch }));
  };
  
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    
    // Ensure the role is always 'BM' upon submission from this page
    let dataToSubmit: User = { ...form, role: 'BM' };

    try {
      if (editUser && editUser._id) {
        // Since this page is for BM users, we assume no role change is intended here.
        // If a new roleId is needed for some other reason, that logic can be added.
        const result = await dispatch(updateUser(editUser._id, dataToSubmit) as any);
        if (result) {
          toast.success("BM User updated successfully!");
          setIsModalOpen(false);
          refreshData();
        }
      } else {
        // --- ADD USER LOGIC ---
        // Generate a roleId as the role is a special one ('BM')
        const newRoleId = generateRoleId('BM')
        dataToSubmit.roleId = [newRoleId];
        
        const result = await dispatch(addUser(dataToSubmit) as any);
        if (result) {
            toast.success("BM User added successfully!");
            setIsModalOpen(false);
            dispatch(fetchUsers({ page: 1, role: 'BM' }));
            dispatch({ type: 'users/setCurrentPage', payload: 1 });
        }
      }
    } catch (error: any) {
        toast.error(error.message || "Failed to save BM user");
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteModal = (user: User) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };
  
  const handleConfirmDelete = async () => {
    if (!userToDelete || !userToDelete._id) return;

    setDeleteLoading(true);
    try {
      const result = await dispatch(deleteUser(userToDelete._id) as any);
      if (result) {
        toast.success(`User "${userToDelete.name}" deleted successfully.`);
        setIsDeleteModalOpen(false);
        setUserToDelete(null);
        refreshData();
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        {/* MODIFIED: Title changed */}
        <h1 className="text-4xl font-bold shrink-0">BM User List</h1>
        <div className="flex flex-wrap justify-end gap-2 w-full">
          <Input 
            placeholder="Search by Name, Role, Phone..." 
            value={search} 
            onChange={(e) => setSearch(e.target.value)} 
            className="flex-grow sm:flex-grow-0 sm:w-48"
          />
          {/* REMOVED: Role filter select dropdown */}
          <Select value={status} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-full sm:w-32">
              <SelectValue/>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Block">Block</SelectItem>
            </SelectContent>
          </Select>
          <Button size="sm" className="gap-1" onClick={openAddModal}>
            <Plus className="w-4 h-4"/> Add BM User
          </Button>
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
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading BM users...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      { "No BM users found." }
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: User, idx: number) => (
                    <TableRow key={user._id}>
                      <TableCell>
                        {(pagination.currentPage - 1) * 15 + idx + 1}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {user.name?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.phoneNumber}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{user.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={user.status === 'Block' ? "destructive" : "default"}>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell>₹{user.income?.toLocaleString() || '0'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button asChild size="icon" variant="ghost" title="View">
                            <Link href={`/dashboard/admin/user/${user._id}`}>
                              <Eye className="w-4 h-4 text-blue-600" />
                            </Link>
                          </Button>
                          <Button 
                            size="icon" 
                            variant="ghost" 
                            onClick={() => openEditModal(user)} 
                            title="Edit"
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          {/* --- MODIFICATION START --- */}
                              {/* The delete button is now disabled if the user's ID is in the protected list */}
                              {(user._id && !protectedUserIds.includes(user._id)) && <Button 
                                size="icon" 
                                variant="ghost" 
                                onClick={() => openDeleteModal(user)} 
                                title="Delete"
                                disabled={user._id ? protectedUserIds.includes(user._id) : false}
                              >
                                <Trash2 className="w-4 h-4 text-red-500" />
                              </Button>}
                              {/* --- MODIFICATION END --- */}
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

      {!loading && pagination.totalPages > 1 && (
        <div className="mt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem className={pagination.currentPage === 1 ? "pointer-events-none opacity-50" : ""}>
                <PaginationPrevious 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    handlePageChange(pagination.currentPage - 1); 
                  }} 
                />
              </PaginationItem>
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
                <PaginationItem key={pageNum}>
                  <PaginationLink 
                    href="#" 
                    isActive={pagination.currentPage === pageNum} 
                    onClick={(e) => { 
                      e.preventDefault(); 
                      handlePageChange(pageNum); 
                    }}
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem className={pagination.currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : ""}>
                <PaginationNext 
                  href="#" 
                  onClick={(e) => { 
                    e.preventDefault(); 
                    handlePageChange(pagination.currentPage + 1); 
                  }} 
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              {editUser ? 'Edit BM User' : 'Add New BM User'}
            </DialogTitle>
            <DialogDescription>
              {editUser ? 'Update the details for this BM user.' : 'Fill in the details for the new BM user.'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name*</Label>
                <Input 
                  id="name" 
                  name="name" 
                  value={form.name} 
                  onChange={handleFormChange} 
                  required 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email*</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={form.email} 
                  onChange={handleFormChange} 
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleFormChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emergencyNumber">Emergency Number</Label>
                <Input id="emergencyNumber" name="emergencyNumber" value={form.emergencyNumber} onChange={handleFormChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currentAddress">Current Address</Label>
                <Textarea id="currentAddress" name="currentAddress" value={form.currentAddress} onChange={handleFormChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="permanentAddress">Permanent Address</Label>
                <Textarea id="permanentAddress" name="permanentAddress" value={form.permanentAddress} onChange={handleFormChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password*</Label>
                <Input 
                  id="password" 
                  name="password" 
                  type="password"
                  value={form.password} 
                  onChange={handleFormChange} 
                  required={!editUser}
                />
              </div>
              {/* MODIFIED: Role selection is now disabled as it's fixed to 'BM' */}
              <div className="space-y-2">
                <Label htmlFor="role">Role*</Label>
                <Select value={form.role} onValueChange={val => handleFormSelectChange('role', val)} disabled>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BM">BM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="income">Income</Label>
                <Input 
                  id="income" 
                  name="income" 
                  type="number" 
                  value={form.income || ''} 
                  onChange={handleFormChange}
                />
              </div>
              
              {editUser ? (
                <div className="space-y-2">
                  <Label>Status</Label>
                  <div>
                    <Badge variant={form.status === 'Block' ? 'destructive' : 'default'}>
                      {form.status}
                    </Badge>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select 
                    value={form.status} 
                    onValueChange={(value) => handleFormSelectChange('status', value)}
                  >
                    <SelectTrigger>
                      <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Active">Active</SelectItem>
                      <SelectItem value="Block">Block</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="account_number">Account Number</Label>
                <Input 
                  id="account_number" 
                  name="account_number" 
                  value={form.account_number} 
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="Ifsc">IFSC Code</Label>
                <Input 
                  id="Ifsc" 
                  name="Ifsc" 
                  value={form.Ifsc} 
                  onChange={handleFormChange}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="upi_id">UPI ID</Label>
                <Input 
                  id="upi_id" 
                  name="upi_id" 
                  value={form.upi_id} 
                  onChange={handleFormChange}
                />
              </div>
            </div>

            <DialogFooter className="pt-4">
              {editUser && (
                <Button 
                  type="button" 
                  variant={form.status === 'Active' ? 'destructive' : 'secondary'} 
                  onClick={handleStatusToggle} 
                  disabled={formLoading} 
                  className="mr-auto"
                >
                  {form.status === 'Active' ? 'Block User' : 'Activate User'}
                </Button>
              )}
              <DialogClose asChild>
                <Button type="button" variant="outline" disabled={formLoading}>
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : null}
                {formLoading ? 'Saving...' : (editUser ? 'Update User' : 'Add User')}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
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