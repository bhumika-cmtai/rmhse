"use client";

import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store"; // Adjust path if needed
import {
  fetchAllNotifications,
  addNotification,
  updateNotification,
  deleteNotification,
  selectAllNotifications,
  selectLoading,
  selectError,
  selectPagination,
  Notification
} from "@/lib/redux/notificationSlice"; // Adjust path if needed

// Import all necessary Shadcn Components
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";

const ManageNotificationsPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  // === Redux State Selection ===
  const notifications = useSelector(selectAllNotifications);
  const { currentPage, totalPages } = useSelector(selectPagination);
  const isLoading = useSelector(selectLoading);
  const reduxError = useSelector(selectError);

  // === Component State Management ===

  // For controlling the Create/Edit Dialog
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingNotification, setEditingNotification] = useState<Notification | null>(null);
  
  // For controlling the Delete Alert Dialog
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);

  // Local state for the form fields within this component
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [link, setLink] = useState("");
  const [formError, setFormError] = useState("");

  // === Data Fetching Effect ===
  useEffect(() => {
    dispatch(fetchAllNotifications({ page: currentPage }));
  }, [dispatch, currentPage]);

  // === Effect to Populate Form When Dialog Opens ===
  useEffect(() => {
    // This runs whenever the dialog is opened or the notification to edit changes
    if (isFormOpen) {
      if (editingNotification) {
        // We are editing: pre-fill the form
        setTitle(editingNotification.title);
        setMessage(editingNotification.message);
        setLink(editingNotification.link || "");
      } else {
        // We are creating: reset the form to be blank
        setTitle("");
        setMessage("");
        setLink("");
      }
      setFormError(""); // Always reset form error on open
    }
  }, [isFormOpen, editingNotification]);


  // === Event Handlers ===

  const handleCreate = () => {
    setEditingNotification(null);
    setIsFormOpen(true);
  };

  const handleEdit = (notification: Notification) => {
    setEditingNotification(notification);
    setIsFormOpen(true);
  };

  const handleDelete = (id: string) => {
    setNotificationToDelete(id);
    setIsDeleteAlertOpen(true);
  };

  const confirmDelete = async () => {
    if (notificationToDelete) {
      // Dispatch the delete action and await the result
      const resultAction = await dispatch(deleteNotification(notificationToDelete));
      setNotificationToDelete(null);

      // <-- FIX: Check if the deletion was successful before refetching
      if (resultAction) {
        // Refetch the data for the current page to update the list
        dispatch(fetchAllNotifications({ page: currentPage }));
      }
    }
    setIsDeleteAlertOpen(false);
  };

  const handleFormSubmit = async () => {
    if (!title || !message) {
      setFormError("Title and Message are required.");
      return;
    }

    const notificationData = { title, message, link: link || undefined };

    if (editingNotification && editingNotification._id) {
      // Dispatch update action
     const result = await dispatch(updateNotification( editingNotification._id, notificationData ));
     if(result)
        {
            dispatch(fetchAllNotifications({ page: currentPage }));
     }
    } else {
      // Dispatch create action
      const result = await dispatch(addNotification(notificationData));
      if(result)
        {
            dispatch(fetchAllNotifications({ page: currentPage }));
     }
    }
    setIsFormOpen(false); // Close the dialog on success
  };
  
  // Pagination handlers
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      dispatch(fetchAllNotifications({ page: currentPage + 1 }));
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 1) {
      dispatch(fetchAllNotifications({ page: currentPage - 1 }));
    }
  };

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Manage Notifications</h1>
        <Button onClick={handleCreate}>Create New Notification</Button>
      </div>

      {isLoading && notifications.length === 0 ? (
        <p>Loading notifications...</p>
      ) : reduxError ? (
        <p className="text-red-500">Error: {reduxError}</p>
      ) : (
        <>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[30%]">Title</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead className="w-[15%] text-center">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {notifications.length > 0 ? (
                  notifications.map((notification) => (
                    <TableRow key={notification._id}>
                      <TableCell className="font-medium">{notification.title}</TableCell>
                      <TableCell>{notification.message}</TableCell>
                      <TableCell className="text-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(notification)}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleDelete(notification._id!)}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      No notifications found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Pagination Controls */}
          <div className="flex items-center justify-end space-x-2 py-4">
            <Button variant="outline" size="sm" onClick={handlePrevPage} disabled={currentPage <= 1}>
              Previous
            </Button>
            <span>Page {currentPage} of {totalPages || 1}</span>
            <Button variant="outline" size="sm" onClick={handleNextPage} disabled={currentPage >= totalPages}>
              Next
            </Button>
          </div>
        </>
      )}

      {/* =============================================================== */}
      {/* Integrated Shadcn Dialog for Creating/Editing Notifications */}
      {/* =============================================================== */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>
              {editingNotification ? "Edit Notification" : "Create New Notification"}
            </DialogTitle>
            <DialogDescription>
              Fill in the details for the notification. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="message" className="text-right">
                Message
              </Label>
              <Textarea
                id="message"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="col-span-3"
                rows={4}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right">
                Link
              </Label>
              <Input
                id="link"
                value={link}
                onChange={(e) => setLink(e.target.value)}
                placeholder="/optional/path"
                className="col-span-3"
              />
            </div>
            {formError && <p className="col-span-4 text-red-500 text-sm text-center">{formError}</p>}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsFormOpen(false)}>Cancel</Button>
            <Button onClick={handleFormSubmit}>
              {editingNotification ? "Save Changes" : "Create Notification"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>


      {/* The Alert Dialog for Deletion Confirmation */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the notification.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default ManageNotificationsPage;