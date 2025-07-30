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


// Define a type for a single district, including 'wallet'
type District = {
  districtId: string;
  numberOfMembers: number;
  wallet: string;
  updatedAt: string;
};

// Sample data for the districts table, with 'wallet' and 'updatedAt' fields
const sampleDistricts: District[] = [
  { districtId: "DIST01", numberOfMembers: 18, wallet: "180.70", updatedAt: "2024-04-10" },
  { districtId: "DIST02", numberOfMembers: 25, wallet: "265.00", updatedAt: "2024-05-15" },
  { districtId: "DIST03", numberOfMembers: 12, wallet: "110.40", updatedAt: "2024-06-21" },
  { districtId: "DIST04", numberOfMembers: 33, wallet: "450.60", updatedAt: "2024-07-02" },
  { districtId: "DIST05", numberOfMembers: 28, wallet: "390.10", updatedAt: "2024-07-30" },
];

export default function Districts() {
  // State for controlling modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  
  // State to hold the district being acted upon
  const [selectedDistrict, setSelectedDistrict] = useState<District | null>(null);

  // State for the form inside the edit modal (wallet and updatedAt are not editable)
  const [form, setForm] = useState<Partial<Omit<District, 'updatedAt' | 'wallet'>>>({});

  // --- Modal Handling ---

  const handleOpenEditModal = (district: District) => {
    setSelectedDistrict(district);
    setForm({ // Pre-fill the form, excluding non-editable fields
        districtId: district.districtId,
        numberOfMembers: district.numberOfMembers
    });
    setIsEditModalOpen(true);
  };

  const handleOpenDeleteModal = (district: District) => {
    setSelectedDistrict(district);
    setIsDeleteModalOpen(true);
  };
  
  const handleOpenAddModal = () => {
    setIsAddModalOpen(true);
  };

  // --- Action Handlers (for demonstration) ---

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    console.log("Saving changes for:", selectedDistrict?.districtId, "Data:", form);
    // In a real app, you would dispatch an update action here.
    setIsEditModalOpen(false);
  };
  
  const handleConfirmDelete = () => {
    console.log("Deleting district:", selectedDistrict?.districtId);
    // In a real app, you would dispatch a delete action here.
    setIsDeleteModalOpen(false);
  };

  const handleConfirmAdd = () => {
    console.log(`Confirmed: Creating district ${nextDistrictId}`);
    // In a real app, you would dispatch a create action here.
    setIsAddModalOpen(false);
  };

  // Helper to determine the next district ID for the add modal
  const getNextDistrictId = () => {
      const lastId = sampleDistricts.length > 0 ? sampleDistricts[sampleDistricts.length - 1].districtId : 'DIST00';
      const lastNumber = parseInt(lastId.replace('DIST', ''), 10);
      return `DIST${(lastNumber + 1).toString().padStart(2, '0')}`;
  };
  
  const nextDistrictId = getNextDistrictId();


  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">Districts</h1>
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <Button variant="default" size="sm" className="gap-1" onClick={handleOpenAddModal}>
            <Plus className="w-4 h-4" /> Add District
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
                  <TableHead>District ID</TableHead>
                  <TableHead>Number of Members</TableHead>
                  <TableHead>Wallet</TableHead>
                  <TableHead>Updated At</TableHead>
                  <TableHead className="text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sampleDistricts.map((district, idx) => (
                  <TableRow key={district.districtId}>
                    <TableCell>{idx + 1}</TableCell>
                    <TableCell className="font-medium">{district.districtId}</TableCell>
                    <TableCell>{district.numberOfMembers}</TableCell>
                    <TableCell>{`₹${district.wallet}`}</TableCell>
                    <TableCell>{district.updatedAt}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" className="mr-2" onClick={() => handleOpenEditModal(district)}>
                        <Edit className="h-3 w-3 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="destructive" onClick={() => handleOpenDeleteModal(district)}>
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

      {/* Edit District Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit District</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="districtId" className="text-right">District ID</Label>
              <Input id="districtId" value={form.districtId || ""} className="col-span-3" readOnly />
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
              <span className="col-span-3 text-sm font-medium text-muted-foreground">{`₹${selectedDistrict?.wallet}`}</span>
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label className="text-right">Updated At</Label>
              <span className="col-span-3 text-sm text-muted-foreground">{selectedDistrict?.updatedAt}</span>
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
      
      {/* Add District Confirmation Modal */}
       <ConfirmationModal
        open={isAddModalOpen}
        onOpenChange={setIsAddModalOpen}
        title="Create District"
        description={`Do you want to create a district ${nextDistrictId}?`}
        onConfirm={handleConfirmAdd}
        confirmButtonText="OK"
        confirmButtonVariant="default"
      />

      {/* Delete District Confirmation Modal */}
      <ConfirmationModal
        open={isDeleteModalOpen}
        onOpenChange={setIsDeleteModalOpen}
        title="Delete District"
        description={`Are you sure you want to delete the district "${selectedDistrict?.districtId}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        confirmButtonText="Delete"
        confirmButtonVariant="destructive"
      />
    </div>
  );
}