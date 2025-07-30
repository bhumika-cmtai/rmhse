"use client"
import React, { useEffect } from "react";
import { Users, FileText, Contact, TrendingUp, Link, Calendar, RefreshCw, UserCheck, AlertCircle, Clock, CheckCircle } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { fetchUsersCount, fetchTotalIncome, selectTotalIncome } from "@/lib/redux/userSlice";
import { AppDispatch } from "@/lib/store";
import { fetchCount, selectCount, selectCountLoading } from "@/lib/redux/countSlice";

export default function Dashboard() {
    const dispatch = useDispatch<AppDispatch>();
    const count = useSelector(selectCount);
    const countLoading = useSelector(selectCountLoading);
    const totalIncome = useSelector(selectTotalIncome);

    useEffect(() => {
        dispatch(fetchUsersCount());
        dispatch(fetchCount());
        dispatch(fetchTotalIncome());
    }, [dispatch]);

    const mainStats = [
        {
            name: "Total Leaders",
            value: countLoading ? "..." : (count.users ?? 0).toLocaleString(),
            icon: Users,
            color: "bg-blue-100 text-blue-600",
        },
        {
            name: "Total Leads",
            value: countLoading ? "..." : (count.leads ?? 0).toLocaleString(),
            icon: FileText,
            color: "bg-green-100 text-green-600",
        },
        {
            name: "Total Clients",
            value: countLoading ? "..." : (count.clients ?? 0).toLocaleString(),
            icon: UserCheck,
            color: "bg-purple-100 text-purple-600",
        },
        {
            name: "Employee Income",
            value: (totalIncome ?? 0).toLocaleString('en-IN', { style: 'currency', currency: 'INR' }),
            icon: TrendingUp,
            color: "bg-yellow-100 text-yellow-600",
        },
    ];

    const secondaryStats = [
        {
            name: "Link Clicks",
            value: countLoading ? "..." : (count.linkClicks ?? 0).toLocaleString(),
            icon: Link,
            color: "bg-pink-100 text-pink-600",
        },
        {
            name: "App Links",
            value: countLoading ? "..." : (count.appLinks ?? 0).toLocaleString(),
            icon: Link,
            color: "bg-indigo-100 text-indigo-600",
        },
        {
            name: "Contacts",
            value: countLoading ? "..." : (count.contacts ?? 0).toLocaleString(),
            icon: Contact,
            color: "bg-cyan-100 text-cyan-600",
        },
        {
            name: "Join Links",
            value: countLoading ? "..." : (count.joinLinks ?? 0).toLocaleString(),
            icon: Link,
            color: "bg-teal-100 text-teal-600",
        },
    ];

    const additionalStats = [
        {
            name: "Restart Dates",
            value: countLoading ? "..." : (count.restartDates ?? 0).toLocaleString(),
            icon: Calendar,
            color: "bg-orange-100 text-orange-600",
        },
        {
            name: "Registrations",
            value: countLoading ? "..." : (count.registrations ?? 0).toLocaleString(),
            icon: RefreshCw,
            color: "bg-lime-100 text-lime-600",
        }
    ];

    const userDetailStats = [
        {
            name: "Admin Users",
            value: countLoading ? "..." : (count.userStats?.admin ?? 0).toLocaleString(),
            icon: Users,
            color: "bg-amber-100 text-amber-600",
        },
        {
            name: "Regular Users",
            value: countLoading ? "..." : (count.userStats?.regularUsers ?? 0).toLocaleString(),
            icon: Users,
            color: "bg-sky-100 text-sky-600",
        }
    ];

    const leadStats = [
        {
            name: "New Leads",
            value: countLoading ? "..." : (count.leadStats?.new ?? 0).toLocaleString(),
            icon: FileText,
            color: "bg-blue-100 text-blue-600",
        },
        {
            name: "Registered Leads",
            value: countLoading ? "..." : (count.leadStats?.registered ?? 0).toLocaleString(),
            icon: CheckCircle,
            color: "bg-green-100 text-green-600",
        },
        {
            name: "Not Interested",
            value: countLoading ? "..." : (count.leadStats?.notInterested ?? 0).toLocaleString(),
            icon: AlertCircle,
            color: "bg-red-100 text-red-600",
        }
    ];

    const clientStats = [
        {
            name: "Approved Clients",
            value: countLoading ? "..." : (count.clientStats?.approved ?? 0).toLocaleString(),
            icon: CheckCircle,
            color: "bg-green-100 text-green-600",
        },
        {
            name: "Pending Clients",
            value: countLoading ? "..." : (count.clientStats?.pending ?? 0).toLocaleString(),
            icon: Clock,
            color: "bg-yellow-100 text-yellow-600",
        }
    ];

    // Helper function to render a stats group
    const renderStatsGroup = (title: string, stats: any[], cols = 4) => (
        <div className="space-y-4">
            <h2 className="text-xl font-semibold">{title}</h2>
            <div className={`grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-${cols}`}>
                {stats.map((stat: any) => (
                    <div
                        key={stat.name}
                        className="rounded-lg border bg-white p-6 shadow-sm"
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
            {renderStatsGroup("Additional Statistics", secondaryStats)}
            {renderStatsGroup("Detailed Statistics", additionalStats, 2)}
            {renderStatsGroup("User Statistics", userDetailStats, 2)}
            {renderStatsGroup("Lead Statistics", leadStats, 3)}
            {renderStatsGroup("Client Statistics", clientStats, 2)}
        </div>
    );
}