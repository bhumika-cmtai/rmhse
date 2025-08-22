"use client";
import React, { useState, useEffect, ChangeEvent, FormEvent, useCallback } from "react";
import Link from "next/link";
import Image from "next/image"; // Using Next.js Image for optimization
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
import { Plus, Edit, Trash2, Loader2, Eye, Users as UsersIcon, Upload } from "lucide-react";
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
import { AppDispatch } from "@/lib/store";
import axios from "axios";
import Cookies from "js-cookie";
import { assignRefferer } from "@/lib/userActions";

const protectedUserIds = [ "689196e09a69b409d03f86e8", "689197399a69b409d03f86eb", "68919d7ef1dedfbfd356fecc", "68919e48f1dedfbfd356fed8", "68919eeff1dedfbfd356fedb", "6891a224d7169e1e22af1b29", "6893b75941efc3a7afaf577b", "68940391362687a7140c4c7f", "689404c3362687a7140c4c85", "6894053d362687a7140c4c8a", "689406be6513e46810ca48ae", "689407781df54db8eed4af74", "689407b01df54db8eed4af79", "6894100d347fa8583c039093", "68997ec02c34f4a42de310c7" ];

// --- MODIFICATION: Expanded initial state with all new fields ---
const initialFormState: Omit<User, '_id' | 'createdOn' | 'roleId' | 'joinId' | 'refferedBy' | 'memberId' | 'status'> & { password?: string } = {
  name: "",
  email: "",
  phoneNumber: "",
  password: "",
  fatherName: "",
  emergencyNumber: "",
  permanentAddress: "",
  currentAddress: "",
  gender: "male",
  role: "MEM",
  pancard: "",
  adharFront: "",
  adharBack: "",
  dob: "",
  account_number: "",
  Ifsc: "",
  upi_id: "",
  income: 0,
};

type DownlineUser = { _id: string; name: string; phoneNumber: string; status: string; latestRoleId: string; };

export default function Users() {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);
  const pagination = useSelector(selectPagination);

  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState(initialFormState);
  const [formLoading, setFormLoading] = useState(false);

  // --- MODIFICATION START: State for file handling ---
  const [documentFiles, setDocumentFiles] = useState<{ pancard: File | null; adharFront: File | null; adharBack: File | null; }>({ pancard: null, adharFront: null, adharBack: null });
  const [documentPreviews, setDocumentPreviews] = useState({ pancard: '', adharFront: '', adharBack: '' });
  // --- MODIFICATION END ---

  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const [isDownlineModalOpen, setIsDownlineModalOpen] = useState(false);
  const [downlineUsers, setDownlineUsers] = useState<DownlineUser[]>([]);
  const [downlineLoading, setDownlineLoading] = useState(false);
  const [viewingUser, setViewingUser] = useState<User | null>(null);

  useEffect(() => {
    const params: any = { page: pagination.currentPage, role: roleFilter, status };
    if (debouncedSearch) params.search = debouncedSearch;
    dispatch(fetchUsers(params));
  }, [dispatch, debouncedSearch, status, roleFilter, pagination.currentPage]);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(search), 500);
    return () => clearTimeout(handler);
  }, [search]);

  useEffect(() => { if (error) toast.error(error); }, [error]);

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

  // --- MODIFICATION START: Reset file states when modal opens/closes ---
  const resetFileStates = () => {
    setDocumentFiles({ pancard: null, adharFront: null, adharBack: null });
    setDocumentPreviews({ pancard: '', adharFront: '', adharBack: '' });
  };
  
  const openAddModal = () => {
    setEditUser(null);
    setForm(initialFormState);
    resetFileStates();
    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditUser(user);
    const dobForInput = user.dob ? new Date(user.dob).toISOString().split('T')[0] : '';
    setForm({
      name: user.name ?? '', email: user.email ?? '', phoneNumber: user.phoneNumber ?? '',
      password: '', fatherName: user.fatherName ?? '', emergencyNumber: user.emergencyNumber ?? '',
      currentAddress: user.currentAddress ?? '', permanentAddress: user.permanentAddress ?? '',
      gender: user.gender ?? 'male', role: user.role ?? 'MEM', dob: dobForInput,
      account_number: user.account_number ?? '', Ifsc: user.Ifsc ?? '', upi_id: user.upi_id ?? '', income: user.income ?? 0
    });
    // Set existing document previews from user data
    setDocumentPreviews({
        pancard: user.pancard || '',
        adharFront: user.adharFront || '',
        adharBack: user.adharBack || ''
    });
    // Clear any lingering file selections from a previous modal session
    setDocumentFiles({ pancard: null, adharFront: null, adharBack: null });
    setIsModalOpen(true);
  };
  // --- MODIFICATION END ---
  
  const handleFormChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: name === 'income' ? (value === '' ? 0 : Number(value)) : value }));
  };

  const handleFormSelectChange = (fieldName: string, value: string) => {
    setForm(prev => ({ ...prev, [fieldName]: value as any }));
  };

  // --- MODIFICATION START: File change handler with size validation ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files && files[0]) {
      const file = files[0];
      const maxFileSize = 2 * 1024 * 1024; // 2 MB
      if (file.size > maxFileSize) {
        toast.error("File size cannot exceed 2 MB.");
        e.target.value = '';
        return;
      }
      setDocumentFiles(prev => ({ ...prev, [name]: file }));
      setDocumentPreviews(prev => ({ ...prev, [name]: URL.createObjectURL(file) }));
    }
  };
  // --- MODIFICATION END ---

  // --- MODIFICATION START: Form submission using FormData ---
  const handleFormSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setFormLoading(true);

    const formData = new FormData();

    // Append all text fields from the form state
    Object.entries(form).forEach(([key, value]) => {
        // Don't append password if it's for an edit and is empty
        if (key === 'password' && editUser && !value) return;
        formData.append(key, String(value));
    });

    // Append file fields only if a new file has been selected
    Object.entries(documentFiles).forEach(([key, file]) => {
        if (file) {
            formData.append(key, file);
        }
    });

    try {
      if (editUser?._id) {
        await dispatch(updateUser(editUser._id, formData as any));
        toast.success("User updated successfully!");
      } else {
        let refferedBy = 'ADMIN001';
        switch (form.role) {
            case 'MEM': refferedBy = await assignRefferer('DIV'); break;
            case 'DIV': refferedBy = await assignRefferer('DIST'); break;
            case 'DIST': refferedBy = await assignRefferer('STAT'); break;
            case 'STAT': refferedBy = await assignRefferer('BM'); break;
        }
        formData.append('refferedBy', refferedBy);
        formData.append('status', 'active'); // Default status for new users

        await dispatch(addUser(formData as any));
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
  // --- MODIFICATION END ---

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
      setDownlineUsers(response.data.data);
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
          <Select value={status} onValueChange={handleStatusChange}><SelectTrigger className="w-full sm:w-32"><SelectValue/></SelectTrigger><SelectContent><SelectItem value="all">All Status</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="block">Block</SelectItem></SelectContent></Select>
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
                      <TableCell>{(pagination.currentPage - 1) * 14 + idx + 1}</TableCell>
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

      {/* --- MODIFICATION: Updated Modal with all new fields --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[800px] overflow-y-auto"><DialogHeader><DialogTitle>{editUser ? 'Edit User' : 'Add New User'}</DialogTitle><DialogDescription>{editUser ? 'Update user details.' : 'Fill in details for a new user.'}</DialogDescription></DialogHeader>
          <form onSubmit={handleFormSubmit} className="space-y-4 mt-2 max-h-[80vh] pr-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {/* Personal Details */}
              <div className="space-y-2"><Label htmlFor="name">Name</Label><Input id="name" name="name" value={form.name} onChange={handleFormChange} required /></div>
              <div className="space-y-2"><Label htmlFor="email">Email</Label><Input id="email" name="email" type="email" value={form.email} onChange={handleFormChange} required /></div>
              <div className="space-y-2"><Label htmlFor="phoneNumber">Phone Number</Label><Input id="phoneNumber" name="phoneNumber" value={form.phoneNumber} onChange={handleFormChange} required /></div>
              <div className="space-y-2"><Label htmlFor="fatherName">Father's Name</Label><Input id="fatherName" name="fatherName" value={form.fatherName} onChange={handleFormChange} /></div>
              <div className="space-y-2"><Label htmlFor="dob">Date of Birth</Label><Input id="dob" name="dob" type="date" value={form.dob} onChange={handleFormChange} /></div>
              <div className="space-y-2"><Label htmlFor="gender">Gender</Label><Select name="gender" value={form.gender} onValueChange={(v) => handleFormSelectChange('gender', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="male">Male</SelectItem><SelectItem value="female">Female</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label htmlFor="emergencyNumber">Emergency Number</Label><Input id="emergencyNumber" name="emergencyNumber" value={form.emergencyNumber} onChange={handleFormChange} /></div>
              <div className="space-y-2"><Label htmlFor="role">Role</Label><Select name="role" value={form.role} onValueChange={(v) => handleFormSelectChange('role', v)}><SelectTrigger><SelectValue/></SelectTrigger><SelectContent><SelectItem value="MEM">MEM</SelectItem><SelectItem value="DIV">DIV</SelectItem><SelectItem value="DIST">DIST</SelectItem><SelectItem value="STAT">STAT</SelectItem><SelectItem value="BM">BM</SelectItem></SelectContent></Select></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="currentAddress">Current Address</Label><Textarea id="currentAddress" name="currentAddress" value={form.currentAddress} onChange={handleFormChange} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="permanentAddress">Permanent Address</Label><Textarea id="permanentAddress" name="permanentAddress" value={form.permanentAddress} onChange={handleFormChange} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="password">Password</Label><Input id="password" name="password" type="password" value={form.password} onChange={handleFormChange} placeholder={editUser ? "Leave blank to keep current" : ""} required={!editUser} /></div>

              {/* Bank Details */}
              <div className="md:col-span-2"><hr className="my-2" /><h3 className="font-semibold text-lg">Bank Details</h3></div>
              <div className="space-y-2"><Label htmlFor="account_number">Account Number</Label><Input id="account_number" name="account_number" value={form.account_number} onChange={handleFormChange} /></div>
              <div className="space-y-2"><Label htmlFor="Ifsc">IFSC Code</Label><Input id="Ifsc" name="Ifsc" value={form.Ifsc} onChange={handleFormChange} /></div>
              <div className="space-y-2 md:col-span-2"><Label htmlFor="upi_id">UPI ID</Label><Input id="upi_id" name="upi_id" value={form.upi_id} onChange={handleFormChange} /></div>
              
              {/* Document Uploads */}
              <div className="md:col-span-2"><hr className="my-2" /><h3 className="font-semibold text-lg">Documents</h3></div>
              <div className="space-y-2">
                <Label htmlFor="pancard">PAN Card</Label>
                {documentPreviews.pancard && <Image src={documentPreviews.pancard} alt="PAN Preview" width={200} height={120} className="rounded border object-contain aspect-video" />}
                <Input id="pancard" name="pancard" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adharFront">Aadhaar (Front)</Label>
                {documentPreviews.adharFront && <Image src={documentPreviews.adharFront} alt="Aadhaar Front Preview" width={200} height={120} className="rounded border object-contain aspect-video" />}
                <Input id="adharFront" name="adharFront" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="adharBack">Aadhaar (Back)</Label>
                {documentPreviews.adharBack && <Image src={documentPreviews.adharBack} alt="Aadhaar Back Preview" width={200} height={120} className="rounded border object-contain aspect-video" />}
                <Input id="adharBack" name="adharBack" type="file" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>
            <DialogFooter className="pt-4">
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit" disabled={formLoading}>{formLoading ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Please wait</> : 'Save Changes'}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <DeleteConfirmationModal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} title="Delete User" description={`Are you sure you want to delete "${userToDelete?.name}"? This cannot be undone.`} onConfirm={handleConfirmDelete} isDeleting={deleteLoading} />
      
      <Dialog open={isDownlineModalOpen} onOpenChange={setIsDownlineModalOpen}><DialogContent className="sm:max-w-4xl"><DialogHeader><DialogTitle>Downline for: <span className="text-primary">{viewingUser?.name}</span></DialogTitle><DialogDescription>List of users directly referred by {viewingUser?.name}.</DialogDescription></DialogHeader><div className="mt-4 max-h-[60vh] overflow-y-auto">{downlineLoading ? <div className="flex justify-center items-center py-16"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div> : downlineUsers.length === 0 ? <div className="text-center py-16 text-muted-foreground">This user has no referrals.</div> : <Table><TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead>Latest Role ID</TableHead></TableRow></TableHeader><TableBody>{downlineUsers.map((downlineUser) => (<TableRow key={downlineUser._id}><TableCell className="font-medium">{downlineUser.name}</TableCell><TableCell>{downlineUser.phoneNumber}</TableCell><TableCell><Badge variant={downlineUser.status === 'Block' ? 'destructive' : 'default'}>{downlineUser.status}</Badge></TableCell><TableCell className="font-mono text-xs">{downlineUser.latestRoleId}</TableCell></TableRow>))}</TableBody></Table>}</div><DialogFooter className="pt-4"><DialogClose asChild><Button type="button" variant="outline">Close</Button></DialogClose></DialogFooter></DialogContent></Dialog>
    </div>
  );
}