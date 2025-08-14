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
import { Plus, Edit, Trash2, Loader2, Eye, Users as UsersIcon } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { DeleteConfirmationModal } from "@/app/components/ui/delete-confirmation-modal"; // Adjust path if needed
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
} from "@/lib/redux/userSlice"; // Adjust path if needed
import {updateUserProfile} from "@/lib/redux/authSlice"
import { AppDispatch } from "@/lib/store"; // Adjust path if needed
import axios from "axios";
import Cookies from "js-cookie";
import { assignRefferer, generateRoleId } from "@/lib/userActions";

// Add dob to the User type in your slice if it's not already there
// For example: export interface User { ...; dob?: string; }

// List of user IDs that should be protected from deletion
const protectedUserIds = [
  "689196e09a69b409d03f86e8", "689197399a69b409d03f86eb", "68919d7ef1dedfbfd356fecc",
  "68919e48f1dedfbfd356fed8", "68919eeff1dedfbfd356fedb", "6891a224d7169e1e22af1b29",
  "6893b75941efc3a7afaf577b", "68940391362687a7140c4c7f", "689404c3362687a7140c4c85",
  "6894053d362687a7140c4c8a", "689406be6513e46810ca48ae", "689407781df54db8eed4af74",
  "689407b01df54db8eed4af79", "6894100d347fa8583c039093", "68997ec02c34f4a42de310c7"
];

// Initial state for the add/edit form, including dob
const initialFormState: Omit<User, '_id' | 'createdOn'> = {
  name: "", email: "", phoneNumber: "", emergencyNumber: "", currentAddress: "",
  permanentAddress: "", password: "", role: "user", status: "Active", income: 0,
  account_number: "", Ifsc: "", upi_id: "", roleId: [], dob: "", // Added dob
};

// Type definition for the data received from the downline endpoint
type DownlineUser = {
  _id: string;
  name: string;
  phoneNumber: string;
  status: string;
  latestRoleId: string;
};

export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const pagination = useSelector(selectPagination);

  // State for filters and search
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  // State for the Add/Edit modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<Omit<User, '_id' | 'createdOn'>>(initialFormState);
  const [formLoading, setFormLoading] = useState(false);

  // State for the Delete modal
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // State for the Downline modal
  const [isDownlineModalOpen, setIsDownlineModalOpen] = useState(false);
  const [downlineUsers, setDownlineUsers] = useState<DownlineUser[]>([]);
  const [downlineLoading, setDownlineLoading] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  // Fetch users when filters or page change
  useEffect(() => {
    const params: any = { page: pagination.currentPage, role: roleFilter, status };
    if (debouncedSearch) params.search = debouncedSearch;
    dispatch(fetchUsers(params));

  }, [dispatch, debouncedSearch, status, roleFilter, pagination.currentPage]);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  // Show toast on API errors
  useEffect(() => {
    if (error) toast.error(error);
  }, [error]);

  const handleStatusChange = useCallback((val: string) => setStatus(val), []);
  const handleRoleChange = useCallback((val: string) => setRoleFilter(val), []);
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      dispatch({ type: 'users/setCurrentPage', payload: newPage });
    }
  }, [dispatch, pagination.totalPages]);

  const refreshData = useCallback(() => {
    dispatch(fetchUsers({ page: pagination.currentPage, role: roleFilter, status, search: debouncedSearch }));
  }, [dispatch, pagination.currentPage, roleFilter, status, debouncedSearch]);

  const openAddModal = () => {
    setEditUser(null);
    setForm(initialFormState);
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditUser(user);
    // Format date for input type="date"
    const dobForInput = user.dob ? new Date(user.dob).toISOString().split('T')[0] : '';
    setForm({
      name: user.name ?? '', email: user.email ?? '', phoneNumber: user.phoneNumber ?? '',
      emergencyNumber: user.emergencyNumber ?? '', currentAddress: user.currentAddress ?? '',
      permanentAddress: user.permanentAddress ?? '', password: '', role: user.role ?? 'user',
      status: user.status ?? 'active', income: user.income ?? 0, account_number: user.account_number ?? '',
      Ifsc: user.Ifsc ?? '', upi_id: user.upi_id ?? '', roleId: user.roleId ?? [],
      dob: dobForInput, // Use formatted date
    });
    setIsModalOpen(true);
  };

  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'income' ? (value === '' ? 0 : Number(value)) : value }));
  };

  const handleFormSelectChange = (fieldName: string, value: string) => {
    setForm(prev => ({ ...prev, [fieldName]: value as any }));
  };

  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      if (editUser?._id) {
        await dispatch(updateUser(editUser._id, form) as any);
        
        toast.success("User updated successfully!");
      } else {
        // --- Add New User Logic (with new referral assignment) ---
        let refferedBy = 'ADMIN001'; // Default for top-level roles

        // Assign referrer based on the role being created
        switch (form.role) {
            case 'MEM':
                refferedBy = await assignRefferer('DIV');
                break;
            case 'DIV':
                refferedBy = await assignRefferer('DIST');
                break;
            case 'DIST':
                refferedBy = await assignRefferer('STAT');
                break;
            case 'STAT':
                refferedBy = await assignRefferer('BM')
            //  BM fall through to the default 'admin123'
        }

        // Generate the new user's first roleId
        // const newRoleId = generateRoleId(form.role!);

        // Construct the final payload for the new user
        const payload = {
          ...form,
          refferedBy,
        };
        
        await dispatch(addUser(payload));
        toast.success("User added successfully!");
      }
      
      setIsModalOpen(false);
      refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to save user");
    } finally {
      setFormLoading(false);
    }
  };

  const openDeleteModal = (user: User) => {
    if (user._id && protectedUserIds.includes(user._id)) {
      toast.warning("This user is protected and cannot be deleted.");
      return;
    }
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete?._id) return;
    setDeleteLoading(true);
    try {
      await dispatch(deleteUser(userToDelete._id) as any).unwrap();
      toast.success(`User "${userToDelete.name}" deleted successfully.`);
      setIsDeleteModalOpen(false);
      setUserToDelete(null);
      refreshData();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete user");
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleViewDownline = async (user: User) => {
    // const referrerId = await assignRefferer("DIV");
    // console.log(referrerId)
    if (!user._id) return;
    setViewingUser(user);
    setIsDownlineModalOpen(true);
    setDownlineLoading(true);
    setDownlineUsers([]);
    try {
      const token = Cookies.get('auth-token');
      if (!token) throw new Error("Authentication session has expired.");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/downline/${user._id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.data) {
        setDownlineUsers(response.data.data);
      } else {
        throw new Error(response.data.message || "Failed to fetch downline.");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setDownlineLoading(false);
    }
  };

  
  

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
        <h1 className="text-4xl font-bold shrink-0">User List</h1>
        <div className="flex flex-wrap justify-end gap-2 w-full">
          <Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="flex-grow sm:flex-grow-0 sm:w-48"/>
          <Select value={roleFilter} onValueChange={handleRoleChange}><SelectTrigger className="w-full sm:w-40"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Roles</SelectItem><SelectItem value="MEM">MEMBER</SelectItem><SelectItem value="DIV">DIV</SelectItem><SelectItem value="DIST">DIST</SelectItem><SelectItem value="STAT">STAT</SelectItem><SelectItem value="BM">BM</SelectItem></SelectContent></Select>
          <Select value={status} onValueChange={handleStatusChange}><SelectTrigger className="w-full sm:w-32"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="Block">Block</SelectItem></SelectContent></Select>
          <Button size="sm" className="gap-1" onClick={openAddModal}><Plus className="w-4 h-4"/> Add User</Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader><TableRow><TableHead className="w-16">S.No.</TableHead><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Phone</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Income</TableHead><TableHead>Actions</TableHead></TableRow></TableHeader>
              <TableBody>
                {loading ? <TableRow><TableCell colSpan={8} className="text-center py-8"><div className="flex justify-center items-center gap-2"><Loader2 className="h-6 w-6 animate-spin" /><span>Loading...</span></div></TableCell></TableRow> :
                 users.length === 0 ? <TableRow><TableCell colSpan={8} className="text-center py-8">No users found.</TableCell></TableRow> :
                 users.map((user, idx) => (
                    <TableRow key={user._id}>
                      <TableCell>{(pagination.currentPage - 1) * 15 + idx + 1}</TableCell>
                      <TableCell><div className="flex items-center gap-3"><Avatar><AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback></Avatar><span className="font-medium">{user.name}</span></div></TableCell>
                      <TableCell>{user.email}</TableCell><TableCell>{user.phoneNumber}</TableCell>
                      <TableCell><Badge variant="outline">{user.role}</Badge></TableCell>
                      <TableCell><Badge variant={user.status === 'Block' ? "destructive" : "default"}>{user.status}</Badge></TableCell>
                      <TableCell>₹{user.income?.toLocaleString() || '0'}</TableCell>
                      <TableCell><div className="flex gap-1">
                        <Button asChild size="icon" variant="ghost" title="View Details"><Link href={`/dashboard/admin/user/${user._id}`}><Eye className="w-4 h-4 text-blue-600" /></Link></Button>
                        <Button size="icon" variant="ghost" onClick={() => handleViewDownline(user)} title="View Downline"><UsersIcon className="w-4 h-4 text-green-600" /></Button>
                        <Button size="icon" variant="ghost" onClick={() => openEditModal(user)} title="Edit"><Edit className="w-4 h-4" /></Button>
                        {user._id && !protectedUserIds.includes(user._id) && <Button size="icon" variant="ghost" onClick={() => openDeleteModal(user)} title="Delete"><Trash2 className="w-4 h-4 text-red-500" /></Button>}
                      </div></TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {!loading && pagination.totalPages > 1 && <div className="mt-4"><Pagination><PaginationContent>
        <PaginationItem><PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(pagination.currentPage - 1); }} className={pagination.currentPage === 1 ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(pageNum => (
          <PaginationItem key={pageNum}><PaginationLink href="#" isActive={pagination.currentPage === pageNum} onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }}>{pageNum}</PaginationLink></PaginationItem>
        ))}
        <PaginationItem><PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(pagination.currentPage + 1); }} className={pagination.currentPage === pagination.totalPages ? "pointer-events-none opacity-50" : ""} /></PaginationItem>
      </PaginationContent></Pagination></div>}

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px]"><DialogHeader><DialogTitle>{editUser ? 'Edit User' : 'Add New User'}</DialogTitle><DialogDescription>{editUser ? 'Update user details.' : 'Fill in details for a new user.'}</DialogDescription></DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 mt-2 max-h-[70vh] overflow-y-auto pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input id="name" name="name" value={form.name} onChange={handleFormChange} placeholder="Full Name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} placeholder="example@email.com" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phoneNumber">Phone Number</Label>
                <Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleFormChange} placeholder="10-digit mobile number" required />
              </div>
               <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <Input id="dob" name="dob" type="date" value={form.dob} onChange={handleFormChange} />
              </div>
               <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Select name="role" value={form.role} onValueChange={(value) => handleFormSelectChange('role', value)}>
                  <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="user">User</SelectItem>
                    <SelectItem value="DIV">DIV</SelectItem>
                    <SelectItem value="DIST">DIST</SelectItem>
                    <SelectItem value="STAT">STAT</SelectItem>
                    <SelectItem value="BM">BM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select name="status" value={form.status} onValueChange={(value) => handleFormSelectChange('status', value)}>
                  <SelectTrigger><SelectValue placeholder="Select status" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Active">Active</SelectItem>
                    <SelectItem value="Block">Block</SelectItem>
                  </SelectContent>
                </Select>
              </div>
               <div className="space-y-2 md:col-span-2">
                <Label htmlFor="currentAddress">Current Address</Label>
                <Textarea id="currentAddress" name="currentAddress" value={form.currentAddress} onChange={handleFormChange} placeholder="Enter current address" />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="permanentAddress">Permanent Address</Label>
                <Textarea id="permanentAddress" name="permanentAddress" value={form.permanentAddress} onChange={handleFormChange} placeholder="Enter permanent address" />
              </div>
              <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" name="password" type="password" value={form.password} onChange={handleFormChange} placeholder={editUser ? "Leave blank to keep current password" : "Create a password"} required={!editUser} />
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit" disabled={formLoading}>
                {formLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <DeleteConfirmationModal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} title="Delete User" description={`Are you sure you want to delete "${userToDelete?.name}"? This cannot be undone.`} onConfirm={handleConfirmDelete} isDeleting={deleteLoading} />
      
      <Dialog open={isDownlineModalOpen} onOpenChange={setIsDownlineModalOpen}>
        <DialogContent className="sm:max-w-4xl"><DialogHeader><DialogTitle>Downline for: <span className="text-primary">{viewingUser?.name}</span></DialogTitle><DialogDescription>List of users directly referred by {viewingUser?.name}.</DialogDescription></DialogHeader>
          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            {downlineLoading ? <div className="flex justify-center items-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> :
             downlineUsers.length === 0 ? <div className="text-center py-16 text-muted-foreground">This user has no referrals.</div> :
             <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead>Latest Role ID</TableHead></TableRow></TableHeader>
              <TableBody>
                {downlineUsers.map((downlineUser) => (
                  <TableRow key={downlineUser._id}>
                    <TableCell className="font-medium">{downlineUser.name}</TableCell><TableCell>{downlineUser.phoneNumber}</TableCell>
                    <TableCell><Badge variant={downlineUser.status === 'Block' ? 'destructive' : 'default'}>{downlineUser.status}</Badge></TableCell>
                    <TableCell className="font-mono text-xs">{downlineUser.latestRoleId}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>}
          </div>
          <DialogFooter className="pt-4"><DialogClose asChild><Button type="button" variant="outline">Close</Button></DialogClose></DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}