// app/dashboard/board-members/page.tsx

"use client";

import React, { useState, FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2 } from "lucide-react";

// A generic confirmation modal
const ConfirmationModal = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <DialogFooter className="sm:justify-end">
           <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
           <Button type="button" variant="destructive" onClick={onConfirm}>Delete</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


// Define a type for a single board member
type BoardMember = {
  id: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  wallet: string;
  status: boolean; // true for Active, false for Blocked
};

// Form state can omit the id
type BoardMemberForm = Omit<BoardMember, 'id'> & { password?: string };

// Sample data for the board members table
const sampleBoardMembers: BoardMember[] = [
  { id: "BM001", name: "Alakh Chauhan", email: "alakh.c@example.com", phoneNumber: "123-456-7890", gender: "Male", wallet: "1250.75", status: true },
  { id: "BM002", name: "Shri Niwasan", email: "shri.n@example.com", phoneNumber: "234-567-8901", gender: "Male", wallet: "850.00", status: true },
  { id: "BM003", name: "Kailash Kher", email: "kailash.k@example.com", phoneNumber: "345-678-9012", gender: "Female", wallet: "3200.50", status: false },
  { id: "BM004", name: "Maneesha Rawat", email: "maneesha.r@example.com", phoneNumber: "456-789-0123", gender: "Female", wallet: "500.25", status: true },
  { id: "BM005", name: "Asha Chandel", email: "asha.c@example.com", phoneNumber: "567-890-1234", gender: "Female", wallet: "1750.00", status: true },
];

export default function BoardMembersPage() {
  // State for controlling modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  
  // State to hold the member being acted upon
  const [selectedMember, setSelectedMember] = useState<BoardMember | null>(null);

  // State for the add/edit form
  const [form, setForm] = useState<Partial<BoardMemberForm>>({});

  // --- Modal Handling & Form Initialization ---
  
  const handleOpenAddModal = () => {
    setForm({ gender: 'Male', status: true }); // Default values
    setIsAddModalOpen(true);
  };
  
  const handleOpenEditModal = (member: BoardMember) => {
    setSelectedMember(member);
    setForm(member);
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (member: BoardMember) => {
    setSelectedMember(member);
    setIsDeleteModalOpen(true);
  };
  
  // --- Action Handlers (for demonstration) ---

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Adding new board member:", form);
    // In a real app, you would dispatch an action to create the member.
    setIsAddModalOpen(false);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    // The 'status' field now comes from the dropdown.
    console.log(`Updating member ${selectedMember?.id}:`, form);
    // In a real app, you would dispatch an update action.
    setIsEditModalOpen(false);
  };
  
  const handleConfirmDelete = () => {
    console.log("Deleting member:", selectedMember?.id);
    // In a real app, you would dispatch a delete action.
    setIsDeleteModalOpen(false);
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Board Members</h1>
        <Button variant="default" size="sm" className="gap-1" onClick={handleOpenAddModal}>
          <Plus className="w-4 h-4" /> Add Board Member
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">S.no.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Phone Number</TableHead>
                  <TableHead>Gender</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleBoardMembers.map((member, idx) => (
                  <TableRow key={member.id}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{member.name}</TableCell>
                    <TableCell>{member.email}</TableCell>
                    <TableCell>{member.phoneNumber}</TableCell>
                    <TableCell>{member.gender}</TableCell>
                    <TableCell>{`₹${member.wallet}`}</TableCell>
                    <TableCell>
                      <Badge variant={member.status ? 'default' : 'destructive'}>
                        {member.status ? 'Active' : 'Blocked'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="mr-2" onClick={() => handleOpenEditModal(member)}>
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleOpenDeleteModal(member)}>
                        <Trash2 className="h-3 w-3 mr-2" />
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <Dialog open={isAddModalOpen || isEditModalOpen} onOpenChange={isEditModalOpen ? setIsEditModalOpen : setIsAddModalOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{isEditModalOpen ? 'Edit Board Member' : 'Add New Board Member'}</DialogTitle>
          </DialogHeader>
          <form onSubmit={isEditModalOpen ? handleEditSubmit : handleAddSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">Name</Label>
              <Input id="name" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className="col-span-3" required/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="email" className="text-right">Email</Label>
              <Input id="email" type="email" value={form.email || ""} onChange={(e) => setForm({ ...form, email: e.target.value })} className="col-span-3" required/>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="phone" className="text-right">Phone</Label>
              <Input id="phone" value={form.phoneNumber || ""} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className="col-span-3" required/>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="gender" className="text-right">Gender</Label>
                <Select value={form.gender} onValueChange={(value: 'Male' | 'Female' | 'Other') => setForm({ ...form, gender: value })}>
                    <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                </Select>
            </div>
             {!isEditModalOpen && (
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="password" className="text-right">Password</Label>
                    <Input id="password" type="password" onChange={(e) => setForm({ ...form, password: e.target.value })} className="col-span-3" required/>
                </div>
            )}
            {isEditModalOpen && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="status" className="text-right">Status</Label>
                <Select
                    value={form.status ? 'active' : 'blocked'}
                    onValueChange={(value: string) => setForm({ ...form, status: value === 'active' })}
                >
                    <SelectTrigger id="status" className="col-span-3">
                        <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="blocked">Blocked</SelectItem>
                    </SelectContent>
                </Select>
              </div>
            )}
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="outline">Cancel</Button></DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Board Member"
        description={`Are you sure you want to delete the member "${selectedMember?.name}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}