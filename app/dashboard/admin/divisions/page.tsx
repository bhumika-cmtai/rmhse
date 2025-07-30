"use client";

import React, { useState, FormEvent } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Plus, Edit, Trash2 } from "lucide-react";

// A more generic confirmation modal that can be used for Deleting, Adding, etc.
const ConfirmationModal = ({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
  confirmButtonText = "Confirm",
  confirmButtonVariant = "default",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmButtonText?: string;
  confirmButtonVariant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
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
           <Button type="button" variant={confirmButtonVariant} onClick={onConfirm}>{confirmButtonText}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};


// Define a type for a single division, now including 'wallet'
type Division = {
  divisionId: string;
  numberOfMembers: number;
  wallet: string;
  updatedAt: string;
};

// Sample data for the divisions table, with 'wallet' and 'updatedAt' fields
const sampleDivisions: Division[] = [
  { divisionId: "DIV01", numberOfMembers: 23, wallet: "340.80", updatedAt: "2024-05-20" },
  { divisionId: "DIV02", numberOfMembers: 15, wallet: "250.50", updatedAt: "2024-06-11" },
  { divisionId: "DIV03", numberOfMembers: 31, wallet: "510.00", updatedAt: "2024-07-01" },
  { divisionId: "DIV04", numberOfMembers: 8,  wallet: "120.25", updatedAt: "2024-07-15" },
  { divisionId: "DIV05", numberOfMembers: 42, wallet: "780.90", updatedAt: "2024-07-28" },
];

export default function Divisions() {
  // State for controlling modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // State to hold the division being acted upon
  const [selectedDivision, setSelectedDivision] = useState<Division | null>(null);

  // State for the form inside the edit modal (wallet and updatedAt are not editable)
  const [form, setForm] = useState<Partial<Omit<Division, 'updatedAt' | 'wallet'>>>({});

  // --- Modal Handling ---

  const handleOpenEditModal = (division: Division) => {
    setSelectedDivision(division);
    setForm({ // Pre-fill the form, excluding non-editable fields
        divisionId: division.divisionId,
        numberOfMembers: division.numberOfMembers
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (division: Division) => {
    setSelectedDivision(division);
    setIsDeleteModalOpen(true);
  };
  
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // --- Action Handlers (for demonstration) ---

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Saving changes for:", selectedDivision?.divisionId, "Data:", form);
    // In a real app, you would dispatch an update action here.
    setIsEditModalOpen(false);
  };
  
  const handleConfirmDelete = () => {
    console.log("Deleting division:", selectedDivision?.divisionId);
    // In a real app, you would dispatch a delete action here.
    setIsDeleteModalOpen(false);
  };

  const handleConfirmAdd = () => {
    console.log(`Confirmed: Creating division ${nextDivisionId}`);
    // In a real app, you would dispatch a create action here.
    setIsAddModalOpen(false);
  };

  // Helper to determine the next division ID for the add modal
  const getNextDivisionId = () => {
      const lastId = sampleDivisions.length > 0 ? sampleDivisions[sampleDivisions.length - 1].divisionId : 'DIV00';
      const lastNumber = parseInt(lastId.replace('DIV', ''), 10);
      return `DIV${(lastNumber + 1).toString().padStart(2, '0')}`;
  };
  
  const nextDivisionId = getNextDivisionId();


  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Divisions</h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="default" size="sm" className="gap-1" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4" /> Add Division
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">S.no.</TableHead>
                  <TableHead>Division ID</TableHead>
                  <TableHead>Number of Members</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleDivisions.map((division, idx) => (
                  <TableRow key={division.divisionId}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{division.divisionId}</TableCell>
                    <TableCell>{division.numberOfMembers}</TableCell>
                    <TableCell>{`₹${division.wallet}`}</TableCell>
                    <TableCell>{division.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="mr-2" onClick={() => handleOpenEditModal(division)}>
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleOpenDeleteModal(division)}>
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

      {/* Edit Division Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Division</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="divisionId" className="text-right">Division ID</Label>
              <Input id="divisionId" value={form.divisionId || ""} className="col-span-3" readOnly />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="numberOfMembers" className="text-right">Members</Label>
              <Input 
                id="numberOfMembers" 
                type="number"
                value={form.numberOfMembers || ""} 
                onChange={(e) => setForm({ ...form, numberOfMembers: Number(e.target.value) })}
                className="col-span-3" 
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Wallet</Label>
              <span className="col-span-3 text-sm font-medium text-muted-foreground">{`₹${selectedDivision?.wallet}`}</span>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Updated At</Label>
              <span className="col-span-3 text-sm text-muted-foreground">{selectedDivision?.updatedAt}</span>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">Cancel</Button>
              </DialogClose>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Add Division Confirmation Modal */}
       <ConfirmationModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Create Division"
        description={`Do you want to create a division ${nextDivisionId}?`}
        onConfirm={handleConfirmAdd}
        confirmButtonText="OK"
        confirmButtonVariant="default"
      />

      {/* Delete Division Confirmation Modal */}
      <ConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete Division"
        description={`Are you sure you want to delete the division "${selectedDivision?.divisionId}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmButtonText="Delete"
        confirmButtonVariant="destructive"
      />
    </div>
  );
}