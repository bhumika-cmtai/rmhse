"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
// import "jspdf-autotable";

// Extend the jsPDF type to include the autoTable method from the plugin
interface jsPDFWithAutoTable extends jsPDF {
  autoTable: (options: any) => jsPDF;
}

// 1. User Interface as requested
export interface User {
  _id: string;
  name: string;
  email: string;
  phoneNumber: string;
  gender: 'Male' | 'Female' | 'Other';
  role: 'div' | 'dist' | 'stat' | 'bm' | 'superadmin';
  role_id: string[];
  income: number;
  status: 'Active' | 'Block';
  createdOn: string; // ISO 8601 format string (e.g., "2023-10-26T10:00:00.000Z")
  permanent_add: string;
  current_add: string;
  dob: string; 
  emergency_num: string;
  referred_by: string;
}

// 2. Sample User Data with different creation dates
const sampleUsers: User[] = [
  { _id: "1", name: "Amit Kumar", email: "amit.k@example.com", phoneNumber: "9876543210", gender: "Male", role: "div", role_id: ["DIV010", "DIST011"], income: 50000, status: "Active", createdOn: "2024-07-15T10:00:00.000Z", permanent_add: "...", current_add: "...", dob: "...", emergency_num: "...", referred_by: "..." },
  { _id: "2", name: "Priya Sharma", email: "priya.s@example.com", phoneNumber: "8765432109", gender: "Female", role: "dist", role_id: ["DIST001"], income: 60000, status: "Active", createdOn: "2024-07-22T11:30:00.000Z", permanent_add: "...", current_add: "...", dob: "...", emergency_num: "...", referred_by: "..." },
  { _id: "3", name: "Rajesh Singh", email: "rajesh.s@example.com", phoneNumber: "7654321098", gender: "Male", role: "bm", role_id: ["BM005", "DIST004", "STAT003"], income: 75000, status: "Active", createdOn: "2024-06-05T09:00:00.000Z", permanent_add: "...", current_add: "...", dob: "...", emergency_num: "...", referred_by: "..." },
  { _id: "4", name: "Sunita Devi", email: "sunita.d@example.com", phoneNumber: "6543210987", gender: "Female", role: "stat", role_id: ["ST001"], income: 80000, status: "Block", createdOn: "2024-06-20T14:00:00.000Z", permanent_add: "...", current_add: "...", dob: "...", emergency_num: "...", referred_by: "..." },
  { _id: "5", name: "Vikram Rathore", email: "vikram.r@example.com", phoneNumber: "5432109876", gender: "Male", role: "superadmin", role_id: ["SA009"], income: 150000, status: "Active", createdOn: "2023-12-10T18:00:00.000Z", permanent_add: "...", current_add: "...", dob: "...", emergency_num: "...", referred_by: "..." },
  { _id: "6", name: "Anjali Verma", email: "anjali.v@example.com", phoneNumber: "9876512345", gender: "Female", role: "div", role_id: ["DIV008"], income: 52000, status: "Active", createdOn: "2023-12-25T12:00:00.000Z", permanent_add: "...", current_add: "...", dob: "...", emergency_num: "...", referred_by: "..." },
];

const months = [
    { value: 1, label: "January" }, { value: 2, label: "February" }, { value: 3, label: "March" },
    { value: 4, label: "April" }, { value: 5, label: "May" }, { value: 6, label: "June" },
    { value: 7, label: "July" }, { value: 8, label: "August" }, { value: 9, label: "September" },
    { value: 10, label: "October" }, { value: 11, label: "November" }, { value: 12, label: "December" }
];

const currentYear = new Date().getFullYear();
const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

export default function ReportPage() {
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth() + 1);

  // 3. Filter logic based on selected month and year
  useEffect(() => {
    const filterUsers = () => {
      const users = sampleUsers.filter(user => {
        const createdOnDate = new Date(user.createdOn);
        return createdOnDate.getFullYear() === selectedYear && (createdOnDate.getMonth() + 1) === selectedMonth;
      });
      setFilteredUsers(users);
    };

    filterUsers();
  }, [selectedYear, selectedMonth]);
  
  // 4. PDF Download Handler
  const handleDownloadPDF = () => {
    // No need to cast to a custom interface anymore
    const doc = new jsPDF();
    
    doc.text(`User Report - ${months.find(m => m.value === selectedMonth)?.label} ${selectedYear}`, 14, 15);

    const tableColumn = ["S.no.", "Name", "Email", "Phone Number", "Gender", "Role", "Role ID", "Income"];
    const tableRows: (string | number)[][] = [];

    filteredUsers.forEach((user, index) => {
      const latestRoleId = user.role_id.length > 0 ? user.role_id[user.role_id.length - 1] : 'N/A';
      const userRow = [
        index + 1,
        user.name,
        user.email,
        user.phoneNumber,
        user.gender,
        user.role.toUpperCase(),
        latestRoleId,
        `₹${user.income.toLocaleString()}`
      ];
      tableRows.push(userRow);
    });

    // 3. Call autoTable as a function, passing the doc instance as the first argument
    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });

    doc.save(`user_report_${selectedYear}_${selectedMonth}.pdf`);
  };

  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
        <h1 className="text-3xl font-bold">User Reports</h1>
        <div className="flex gap-2">
          {/* Year Selector */}
          <Select value={String(selectedYear)} onValueChange={(value) => setSelectedYear(Number(value))}>
            <SelectTrigger className="w-[120px]">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              {years.map(year => (
                <SelectItem key={year} value={String(year)}>{year}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Month Selector */}
          <Select value={String(selectedMonth)} onValueChange={(value) => setSelectedMonth(Number(value))}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Select Month" />
            </SelectTrigger>
            <SelectContent>
              {months.map(month => (
                <SelectItem key={month.value} value={String(month.value)}>{month.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Download Button */}
          <Button onClick={handleDownloadPDF} disabled={filteredUsers.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            Download PDF
          </Button>
        </div>
      </div>

      {/* 5. Preview Table */}
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
                  <TableHead>Role</TableHead>
                  <TableHead>Role ID (Latest)</TableHead>
                  <TableHead>Income</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, idx) => {
                    const latestRoleId = user.role_id.length > 0 ? user.role_id[user.role_id.length - 1] : 'N/A';
                    return (
                      <TableRow key={user._id}>
                        <TableCell>{idx + 1}</TableCell>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.phoneNumber}</TableCell>
                        <TableCell>{user.gender}</TableCell>
                        <TableCell>{user.role.toUpperCase()}</TableCell>
                        <TableCell>{latestRoleId}</TableCell>
                        <TableCell>₹{user.income.toLocaleString()}</TableCell>
                      </TableRow>
                    );
                  })
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center h-24">
                      No users found for the selected month and year.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}