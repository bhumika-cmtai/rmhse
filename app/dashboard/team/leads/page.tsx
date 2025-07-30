// app/page.tsx

"use client"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { 
  fetchCurrentUser, 
  selectUser, 
  selectIsLoading as selectAuthLoading // Renamed to avoid conflict
} from '@/lib/redux/authSlice';
import { 
  fetchClientsByOwner, 
  selectClientsByOwner,
  selectLoading as selectClientLoading, // Renamed to avoid conflict
  selectError as selectClientError,
} from '@/lib/redux/clientSlice';
import { AppDispatch } from "@/lib/store";
import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

export default function ClientDashboard() {
  const dispatch = useDispatch<AppDispatch>();

  // Selectors for both auth and client slices
  const user = useSelector(selectUser);
  const authLoading = useSelector(selectAuthLoading);
  const clientData = useSelector(selectClientsByOwner);
  const clientLoading = useSelector(selectClientLoading);
  const clientError = useSelector(selectClientError);

  // Effect to fetch the current user
  useEffect(() => {
    if (!user) {
      dispatch(fetchCurrentUser());
    }
  }, [dispatch]); // Remove user from dependencies since we check it inside

  // Effect to fetch the user's clients *after* the user's phoneNumber is available
  useEffect(() => {
    // Only run if we have a user with a phone number
    if (user?.phoneNumber) {
      dispatch(fetchClientsByOwner(user.phoneNumber));
    }
  }, [dispatch, user?.phoneNumber]); // Only depend on phoneNumber

  // Handle loading state
  if (authLoading || clientLoading) {
    return (
      <main className="bg-white min-h-screen p-4 sm:p-8 flex justify-center items-center">
        <p className="text-lg">Loading your data...</p>
      </main>
    );
  }

  // Handle error state
  if (clientError) {
     return (
      <main className="bg-white min-h-screen p-4 sm:p-8 flex justify-center items-center">
        <p className="text-lg text-red-500">Error: {clientError}</p>
      </main>
    );
  }
  
  // Handle case where user has no claimed data
  if (clientData.length === 0) {
      return (
        <main className="bg-white min-h-screen p-4 sm:p-8">
            <div className="max-w-4xl mx-auto flex flex-col gap-8">
                <h1 className="text-2xl font-bold">Your Data Claims</h1>
                <p>You have not claimed any data yet.</p>
            </div>
        </main>
      );
  }


  return (
    <main className="bg-white min-h-screen p-4 sm:p-8">
      <div className="max-w-4xl mx-auto flex flex-col gap-8">
        <h1 className="text-2xl font-bold">Your Data Claims</h1>

        {/* Dynamically render cards based on the fetched data */}
        {clientData.map((group, groupIndex) => (
          <Card key={groupIndex}>
            <CardHeader className="bg-slate-50 rounded-t-lg flex justify-between items-center p-4">
              <CardTitle className="text-lg font-semibold text-black">
                {/* Use a fallback for null portalName and show the count */}
                {group.portalName || "Uncategorized"} ({group.clients.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[100px]">S.N</TableHead>
                    <TableHead>Client Name</TableHead>
                    <TableHead>Owner Name</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {group.clients.map((client, clientIndex) => (
                    <TableRow key={client._id}>
                      <TableCell className="font-medium">{clientIndex + 1}</TableCell>
                      <TableCell>{client.name}</TableCell>
                      {/* ownerName is an array, so we join it to a string */}
                      <TableCell>{client.ownerName?.join(', ')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}