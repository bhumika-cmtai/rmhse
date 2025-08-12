"use client";

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertTriangle, PiggyBank } from "lucide-react";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import { RootState } from "@/lib/store"; // Adjust path if needed
import axios from "axios";
import Cookies from "js-cookie";

// MODIFICATION: Update the type to include the new roleId field
type CommissionEntry = {
  amount: number;
  sourceUserName: string;
  sourceUserLatestRoleId: string; // Added this field
};

export default function IncomeHistoryPage() {
  const { user: loggedInUser } = useSelector((state: RootState) => state.auth);

  const [history, setHistory] = useState<CommissionEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalCommission, setTotalCommission] = useState(0);

  useEffect(() => {
    if (loggedInUser?._id) {
      const fetchIncomeHistory = async () => {
        setIsLoading(true);
        try {
          const token = Cookies.get('auth-token');
          if (!token) throw new Error("Authentication token not found.");

          const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/commission-history`,
            { headers: { 'Authorization': `Bearer ${token}` } }
          );
          console.log(response)
          if (response.data ) {
            const fetchedHistory: CommissionEntry[] = response.data.data;
            setHistory(fetchedHistory);
            setTotalCommission(fetchedHistory.reduce((sum, item) => sum + item.amount, 0));
          } else {
            throw new Error(response.data.message || "Failed to fetch income history.");
          }
        } catch (error: any) {
          toast.error(error.response?.data?.message || error.message);
        } finally {
          setIsLoading(false);
        }
      };
      fetchIncomeHistory();
    } else {
      setIsLoading(false);
    }
  }, [loggedInUser]);

  if (isLoading) {
    return <div className="flex justify-center items-center h-80"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

 

  return (
    <div className="w-full mx-auto mt-2 space-y-8">
      <div>
        <h1 className="text-4xl font-bold">Income History</h1>
        <p className="text-muted-foreground">A detailed log of all commissions you have earned.</p>
      </div>
      
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-lg text-green-800">Total Commission Earned</CardTitle>
          <p className="text-4xl font-bold text-green-700 pt-2">₹{totalCommission.toLocaleString()}</p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Commission Log</CardTitle>
          <CardDescription>Each row represents a commission received from a referred user.</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-40">Amount</TableHead>
                  <TableHead>From User</TableHead>
                  {/* MODIFICATION: Add new column header */}
                  <TableHead>Source User Role ID</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.length === 0 ? (
                  <TableRow>
                    {/* MODIFICATION: Adjust colSpan */}
                    <TableCell colSpan={3} className="text-center h-48">
                      <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                        <PiggyBank className="h-10 w-10" />
                        <p>No commission history found.</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  history.map((entry, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <Badge className="text-md bg-green-600 hover:bg-green-700">
                          + ₹{entry.amount.toLocaleString()}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>
                              {entry.sourceUserName?.[0]?.toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{entry.sourceUserName}</span>
                        </div>
                      </TableCell>
                      {/* MODIFICATION: Add new cell to display the role ID */}
                      <TableCell className="font-mono text-xs text-muted-foreground">
                        {entry.sourceUserLatestRoleId}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}