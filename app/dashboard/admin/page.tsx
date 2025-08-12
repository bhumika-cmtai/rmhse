"use client"
import React, { useEffect } from "react";
import { Users, UserCheck, TrendingUp, Briefcase, FileText, Banknote, HelpCircle, ArrowRightLeft } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import { useRouter } from 'next/navigation';
import { AppDispatch, RootState } from '@/lib/store';
import { fetchCurrentUser, selectIsAuthenticated, selectIsLoading } from '@/lib/redux/authSlice';
import { 
    fetchAdminDashboardCounts, 
    selectAdminDashboardCounts,
    selectNetUserIncome,
    selectCountsLoading 
} from "@/lib/redux/countSlice";

export default function Dashboard() {
    const dispatch = useDispatch<AppDispatch>();
    const counts = useSelector(selectAdminDashboardCounts);
    const netUserIncome = useSelector(selectNetUserIncome);
    // Select the necessary data and loading state from the Redux store
    const { user: loggedInUser } = useSelector((state: RootState) => state.auth);
    const router = useRouter();
    const isAuthenticated = useSelector(selectIsAuthenticated);
    const isLoading = useSelector(selectIsLoading);

    useEffect(() => {
        // This is the crucial part: fetch user data on mount.
        // The slice will handle the case where there is no token.
        dispatch(fetchCurrentUser());
      }, [dispatch]);
    
      // This effect handles redirection if the user is not authenticated after the check.
      useEffect(() => {
        // If loading is finished and the user is still not authenticated, redirect to login.
        if (!isLoading && !isAuthenticated) {
          router.replace('/login');
        }
      }, [isLoading, isAuthenticated, router]);

      useEffect(() => {
        // This will now work because the DashboardLayout ensures loggedInUser is populated first.
        if (loggedInUser && loggedInUser._id && loggedInUser.role === 'admin') {
            dispatch(fetchAdminDashboardCounts(loggedInUser._id));
        }
    }, [dispatch, loggedInUser]);

    const formatCurrency = (value: number) => {
        return (value ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' });
    };
    
    // Updated stats mapping to the new slice state
    const mainStats = [
        {
            name: "Total Users",
            value: isLoading ? "..." : (counts.totalUsers ?? 0).toLocaleString(),
            icon: Users,
            color: "bg-blue-100 text-blue-600",
        },
        {
            name: "Total BM",
            value: isLoading ? "..." : (counts.totalBM ?? 0).toLocaleString(),
            icon: Briefcase,
            color: "bg-green-100 text-green-600",
        },
        {
            name: "Trust Account (Admin Income)",
            value: isLoading ? "..." : formatCurrency(counts.adminIncome),
            icon: Banknote,
            color: "bg-purple-100 text-purple-600",
        },
        {
            name: "Users' Net Income",
            value: isLoading ? "..." : formatCurrency(netUserIncome),
            icon: TrendingUp,
            color: "bg-yellow-100 text-yellow-600",
        },
    ];

    const roleStats = [
        {
            name: "Total Divisions (DIV)",
            value: isLoading ? "..." : (counts.totalDIV ?? 0).toLocaleString(),
            icon: UserCheck,
            color: "bg-pink-100 text-pink-600",
        },
        {
            name: "Total Districts (DIST)",
            value: isLoading ? "..." : (counts.totalDIST ?? 0).toLocaleString(),
            icon: UserCheck,
            color: "bg-indigo-100 text-indigo-600",
        },
        {
            name: "Total States (STAT)",
            value: isLoading ? "..." : (counts.totalSTAT ?? 0).toLocaleString(),
            icon: UserCheck,
            color: "bg-cyan-100 text-cyan-600",
        },
         {
            name: "Total Members (MEM)",
            value: isLoading ? "..." : (counts.totalMember ?? 0).toLocaleString(),
            icon: UserCheck,
            color: "bg-teal-100 text-teal-600",
        },
    ];

    const requestStats = [
        {
            name: "Withdrawal Requests",
            value: isLoading ? "..." : (counts.totalWithdrawalRequests ?? 0).toLocaleString(),
            icon: ArrowRightLeft,
            color: "bg-orange-100 text-orange-600",
        },
        {
            name: "Extend Requests",
            value: isLoading ? "..." : (counts.totalExtendRequests ?? 0).toLocaleString(),
            icon: HelpCircle,
            color: "bg-lime-100 text-lime-600",
        }
    ];

    // Helper function to render a stats group
    const renderStatsGroup = (title: string, stats: any[], cols = 4) => (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
            <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols}`}>
                {stats.map((stat) => (
                    <div
                        key={stat.name}
                        className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                                <p className="mt-2 text-3xl font-semibold text-slate-900">
                                    {stat.value}
                                </p>
                            </div>
                            <div className={`rounded-full p-3 ${stat.color}`}>
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-8 py-4">
            {renderStatsGroup("Main Statistics", mainStats)}
            {renderStatsGroup("User Roles Breakdown", roleStats)}
            {renderStatsGroup("System Requests", requestStats, 2)}
        </div>
    );
}