"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableHeader,
  TableBody,
  TableHead,
  TableRow,
  TableCell,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download, Loader2, ChevronDown } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch, RootState } from "@/lib/store";
import { fetchUsers, selectUsers, selectLoading, selectError, User } from "@/lib/redux/userSlice";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";

const months = [
  { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
  { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
  { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
  { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

type DownlineUser = {
  _id: string;
  name: string;
  phoneNumber: string;
  status: string;
  latestRoleId: string;
  income: number;
};

export default function ReportPage() {
  const dispatch = useDispatch<AppDispatch>();
  const users = useSelector(selectUsers);
  const loading = useSelector(selectLoading);
  const error = useSelector(selectError);

  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  const [expandedUserId, setExpandedUserId] = useState<string | null>(null);
  const [referralData, setReferralData] = useState<DownlineUser[]>([]);
  const [referralLoading, setReferralLoading] = useState(false);
  
  // --- NEW STATE FOR PDF DOWNLOAD ---
  const [isDownloading, setIsDownloading] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers({ month: selectedMonth, year: selectedYear, limit: 1000 }));
  }, [dispatch, selectedYear, selectedMonth]);
  
  const handleToggleReferrals = async (userId: string) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      return;
    }
    setExpandedUserId(userId);
    setReferralLoading(true);
    setReferralData([]);
    try {
      const token = Cookies.get('auth-token');
      if (!token) throw new Error("Authentication session has expired.");
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/downline/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setReferralData(response.data?.data || []);
    } catch (error: any) {
      toast.error(error.response?.data?.message || error.message);
    } finally {
      setReferralLoading(false);
    }
  };

  // --- NEW ADVANCED PDF DOWNLOAD HANDLER ---
  const handleDownloadDetailedPDF = async () => {
    setIsDownloading(true);
    toast.info("Preparing detailed report... This might take a moment.", { duration: 10000 });

    try {
      const token = Cookies.get('auth-token');
      if (!token) throw new Error("Authentication required.");

      // Step 1: Fetch all referral data in parallel
      const referralPromises = users.map(user =>
        axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/downline/${user._id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        }).then(res => ({ userId: user._id, referrals: res.data?.data || [] }))
          .catch(() => ({ userId: user._id, referrals: [] })) // Handle failed requests gracefully
      );
      
      const allReferralsData = await Promise.all(referralPromises);
      const referralsMap = new Map(allReferralsData.map(item => [item.userId, item.referrals]));

      // Step 2: Generate the PDF
      const doc = new jsPDF();
      doc.text(`Detailed User Report - ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`, 14, 15);
      
      let currentY = 20; // Track the Y position on the page

      users.forEach((user, index) => {
        // Add a page break if there isn't enough space for the next entry
        if (currentY > 250) {
          doc.addPage();
          currentY = 20;
        }

        // Main user table
        const mainTableColumn = ["S.no.", "Name", "Phone", "Role", "Latest Role ID", "Income"];
        const latestRoleId = user.roleId && user.roleId.length > 0 ? user.roleId[user.roleId.length - 1] : 'N/A';
        const userRow = [[
          index + 1,
          user.name ?? 'N/A',
          user.phoneNumber ?? 'N/A',
          user.role?.toUpperCase() ?? 'N/A',
          latestRoleId,
          `₹${user.income?.toLocaleString() ?? '0'}`
        ]];
        
        autoTable(doc, {
          head: [mainTableColumn],
          body: userRow,
          startY: currentY,
          theme: 'striped'
        });

        currentY = (doc as any).lastAutoTable.finalY; // Update Y position

        // Sub-table for referrals
        const userReferrals = referralsMap.get(user._id);
        if (userReferrals && userReferrals.length > 0) {
          const subTableColumn = ["Referred User", "Phone", "Status", "Role ID", "Income"];
          const subTableRows = userReferrals.map((ref: DownlineUser) => [
            ref.name,
            ref.phoneNumber,
            ref.status,
            ref.latestRoleId,
            `₹${ref.income?.toLocaleString() ?? '0'}`
          ]);

          autoTable(doc, {
            head: [subTableColumn],
            body: subTableRows,
            startY: currentY + 2,
            margin: { left: 14 },
            theme: 'grid',
            headStyles: { fillColor: [241, 245, 249] , textColor: [0, 0, 0]}
          });

          currentY = (doc as any).lastAutoTable.finalY; // Update Y position again
        } else {
            doc.text("No users referred.", 14, currentY + 7);
            currentY += 10;
        }
        
        currentY += 5; // Add spacing between user blocks
      });

      doc.save(`detailed_user_report_${selectedYear}_${selectedMonth}.pdf`);
      toast.success("Report downloaded successfully!");

    } catch (error: any) {
      toast.error(error.message || "Failed to generate detailed report.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold tracking-tight">User Reports</h1>
        <div className="flex items-center gap-2">
          <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-[120px]"><SelectValue /></SelectTrigger>
            <SelectContent>{years.map(year => <SelectItem key={year} value={String(year)}>{year}</SelectItem>)}</SelectContent>
          </Select>
          <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
            <SelectTrigger className="w-[150px]"><SelectValue /></SelectTrigger>
            <SelectContent>{months.map(month => <SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>)}</SelectContent>
          </Select>
          <Button onClick={handleDownloadDetailedPDF} disabled={users.length === 0 || loading || isDownloading}>
            {isDownloading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
            {isDownloading ? "Preparing..." : "Download"}
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-2 sm:p-4">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S.no.</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Latest Role ID</TableHead>
                  <TableHead>Income</TableHead>
                  <TableHead className="text-center">View Referrals</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow><TableCell colSpan={7} className="h-20 text-center"><Loader2 className="h-6 w-6 animate-spin mx-auto" /></TableCell></TableRow>
                ) : error ? (
                  <TableRow><TableCell colSpan={7} className="h-20 text-center text-red-500">{error}</TableCell></TableRow>
                ) : users.length > 0 ? (
                  users.map((user, idx) => (
                    <React.Fragment key={user._id}>
                      <TableRow>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.phoneNumber ?? 'N/A'}</TableCell>
                        <TableCell>{user.role ? user.role.toUpperCase() : 'N/A'}</TableCell>
                        <TableCell>{user.roleId && user.roleId.length > 0 ? user.roleId[user.roleId.length - 1] : 'N/A'}</TableCell>
                        <TableCell>{typeof user.income === 'number' ? `₹${user.income.toLocaleString()}`: 'N/A'}</TableCell>
                        <TableCell className="text-center">
                          <Button size="icon" variant="ghost" onClick={() => handleToggleReferrals(user._id!)}>
                            <ChevronDown className={`h-5 w-5 transition-transform ${expandedUserId === user._id ? 'rotate-180' : ''}`} />
                          </Button>
                        </TableCell>
                      </TableRow>
                      
                      {expandedUserId === user._id && (
                        <TableRow className="bg-muted/50 hover:bg-muted/50">
                          <TableCell colSpan={7} className="p-0">
                            <div className="p-4">
                              <h4 className="font-semibold text-md mb-2">Users Referred by {user.name}</h4>
                              {referralLoading ? (
                                <div className="flex items-center justify-center py-4 gap-2"><Loader2 className="h-5 w-5 animate-spin" /><span>Loading...</span></div>
                              ) : referralData.length > 0 ? (
                                <Table>
                                  <TableHeader>
                                    <TableRow><TableHead>Name</TableHead><TableHead>Phone</TableHead><TableHead>Status</TableHead><TableHead>Role ID</TableHead><TableHead>Income</TableHead></TableRow>
                                  </TableHeader>
                                  <TableBody>
                                    {referralData.map(refUser => (
                                      <TableRow key={refUser._id}>
                                        <TableCell>{refUser.name}</TableCell>
                                        <TableCell>{refUser.phoneNumber}</TableCell>
                                        <TableCell><Badge variant={refUser.status === 'Block' ? 'destructive' : 'default'}>{refUser.status}</Badge></TableCell>
                                        <TableCell className="font-mono text-xs">{refUser.latestRoleId}</TableCell>
                                        <TableCell>{`₹${refUser.income?.toLocaleString() ?? '0'}`}</TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              ) : (
                                <div className="text-center py-4 text-muted-foreground">This user has no referrals.</div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} className="h-20 text-center text-muted-foreground">No users found.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}