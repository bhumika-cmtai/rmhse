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


// Define a type for a single state, including 'wallet'
type State = {
  stateId: string;
  numberOfMembers: number;
  wallet: string;
  updatedAt: string;
};

// Sample data for the states table, with 'wallet' and 'updatedAt' fields
const sampleStates: State[] = [
  { stateId: "ST01", numberOfMembers: 150, wallet: "1500.50", updatedAt: "2024-01-20" },
  { stateId: "ST02", numberOfMembers: 220, wallet: "2850.00", updatedAt: "2024-02-18" },
  { stateId: "ST03", numberOfMembers: 80,  wallet: "950.75",  updatedAt: "2024-03-25" },
  { stateId: "ST04", numberOfMembers: 310, wallet: "4200.20", updatedAt: "2024-05-30" },
  { stateId: "ST05", numberOfMembers: 175, wallet: "1980.00", updatedAt: "2024-07-22" },
];

export default function States() {
  // State for controlling modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // State to hold the state being acted upon
  const [selectedState, setSelectedState] = useState<State | null>(null);

  // State for the form inside the edit modal (wallet and updatedAt are not editable)
  const [form, setForm] = useState<Partial<Omit<State, 'updatedAt' | 'wallet'>>>({});

  // --- Modal Handling ---

  const handleOpenEditModal = (state: State) => {
    setSelectedState(state);
    setForm({ // Pre-fill the form, excluding non-editable fields
        stateId: state.stateId,
        numberOfMembers: state.numberOfMembers
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (state: State) => {
    setSelectedState(state);
    setIsDeleteModalOpen(true);
  };
  
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // --- Action Handlers (for demonstration) ---

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Saving changes for:", selectedState?.stateId, "Data:", form);
    // In a real app, you would dispatch an update action here.
    setIsEditModalOpen(false);
  };
  
  const handleConfirmDelete = () => {
    console.log("Deleting state:", selectedState?.stateId);
    // In a real app, you would dispatch a delete action here.
    setIsDeleteModalOpen(false);
  };

  const handleConfirmAdd = () => {
    console.log(`Confirmed: Creating state ${nextStateId}`);
    // In a real app, you would dispatch a create action here.
    setIsAddModalOpen(false);
  };

  // Helper to determine the next state ID for the add modal
  const getNextStateId = () => {
      const lastId = sampleStates.length > 0 ? sampleStates[sampleStates.length - 1].stateId : 'ST00';
      const lastNumber = parseInt(lastId.replace('ST', ''), 10);
      return `ST${(lastNumber + 1).toString().padStart(2, '0')}`;
  };
  
  const nextStateId = getNextStateId();


  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">States</h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="default" size="sm" className="gap-1" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4" /> Add State
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
                  <TableHead>State ID</TableHead>
                  <TableHead>Number of Members</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleStates.map((state, idx) => (
                  <TableRow key={state.stateId}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{state.stateId}</TableCell>
                    <TableCell>{state.numberOfMembers}</TableCell>
                    <TableCell>{`₹${state.wallet}`}</TableCell>
                    <TableCell>{state.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="mr-2" onClick={() => handleOpenEditModal(state)}>
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleOpenDeleteModal(state)}>
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

      {/* Edit State Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit State</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="stateId" className="text-right">State ID</Label>
              <Input id="stateId" value={form.stateId || ""} className="col-span-3" readOnly />
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
              <span className="col-span-3 text-sm font-medium text-muted-foreground">{`₹${selectedState?.wallet}`}</span>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Updated At</Label>
              <span className="col-span-3 text-sm text-muted-foreground">{selectedState?.updatedAt}</span>
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
      
      {/* Add State Confirmation Modal */}
       <ConfirmationModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Create State"
        description={`Do you want to create a state ${nextStateId}?`}
        onConfirm={handleConfirmAdd}
        confirmButtonText="OK"
        confirmButtonVariant="default"
      />

      {/* Delete State Confirmation Modal */}
      <ConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete State"
        description={`Are you sure you want to delete the state "${selectedState?.stateId}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmButtonText="Delete"
        confirmButtonVariant="destructive"
      />
    </div>
  );
}