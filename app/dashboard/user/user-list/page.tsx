// app/dashboard/users/page.tsx

"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent } from "@/components/ui/card";
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
import { Loader2 } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationPrevious, PaginationNext } from "@/components/ui/pagination";
import { useSelector, useDispatch } from "react-redux";
import { fetchUsers, selectUsers, selectLoading, User, selectPagination } from "@/lib/redux/userSlice";
import { AppDispatch } from "@/lib/store";

// A display-only component for showing a list of users.

export default function UsersPage() {
  const dispatch = useDispatch<AppDispatch>();
  const users: User[] = useSelector(selectUsers);
  const loading: boolean = useSelector(selectLoading);
  const { totalPages } = useSelector(selectPagination);

  // State for managing the current page
  const [page, setPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  // Fetch users when the page number changes
  useEffect(() => {
    const params = {
      page: page,
      limit: ITEMS_PER_PAGE,
    };
    dispatch(fetchUsers(params));
  }, [dispatch, page]);


  // Handler for changing the page
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setPage(newPage);
    // Optional: Smooth scroll to top when page changes
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [totalPages]);


  return (
    <div className="w-full mx-auto mt-2">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Leader List</h1>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">S. No.</TableHead>
                  <TableHead>Leader Name</TableHead>
                  <TableHead>Leader Number</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Leader Code</TableHead>
                  <TableHead>Joined</TableHead>
                  <TableHead>Total Registrations</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <div className="flex justify-center items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin" />
                        <span>Loading leaders...</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      No leaders found in the system.
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user: User, idx: number) => (
                    <TableRow key={user._id}>
                      <TableCell>{(page - 1) * ITEMS_PER_PAGE + idx + 1}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarFallback>{user.name?.[0]?.toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <span className="font-medium">{user.name}</span>
                        </div>
                      </TableCell>
                      <TableCell>{user.phoneNumber || '-'}</TableCell>
                      <TableCell>
                        <Badge variant={user.status === "Active" ? "default" : "secondary"}>
                          {user.status || 'N/A'}
                        </Badge>
                      </TableCell>
                      <TableCell>{user.leaderCode || '-'}</TableCell>
                      <TableCell>{user.createdOn ? new Date(parseInt(user.createdOn)).toLocaleDateString() : '-'}</TableCell>
                      <TableCell>{user.registeredClientCount}</TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Pagination Component */}
      {totalPages > 1 && !loading && (
        <div className="mt-6">
          <Pagination>
            <PaginationContent>
              <PaginationItem className={page === 1 ? "pointer-events-none opacity-50" : ""}>
                <PaginationPrevious href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page - 1); }} />
              </PaginationItem>
              
              {/* This logic creates a link for each page available from the backend */}
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNum => (
                  <PaginationItem key={pageNum}>
                    <PaginationLink href="#" isActive={page === pageNum} onClick={(e) => { e.preventDefault(); handlePageChange(pageNum); }}>
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
              ))}

              <PaginationItem className={page === totalPages ? "pointer-events-none opacity-50" : ""}>
                <PaginationNext href="#" onClick={(e) => { e.preventDefault(); handlePageChange(page + 1); }} />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}
    </div>
  );
}