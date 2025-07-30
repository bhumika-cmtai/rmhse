"use client";

import React, { useEffect, useMemo } from "react";
import { Users, FileText } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { AppDispatch } from "@/lib/store";
import { 
    fetchCurrentUser, 
    selectUser, 
    selectIsLoading as selectAuthLoading 
} from "@/lib/redux/authSlice";
import { 
    fetchClientsByOwner, 
    selectClientsByOwner, 
    selectLoading as selectClientLoading 
} from "@/lib/redux/clientSlice";
import { Skeleton } from "@/components/ui/skeleton"; 

export default function Dashboard() {
    const dispatch = useDispatch<AppDispatch>();

    const user = useSelector(selectUser);
    const authLoading = useSelector(selectAuthLoading);
    const clientsByOwner = useSelector(selectClientsByOwner);
    const clientLoading = useSelector(selectClientLoading);

    useEffect(() => {
        if (!user) {
            dispatch(fetchCurrentUser());
        }
    }, [dispatch, user]);

    useEffect(() => {
        if (user?.phoneNumber && clientsByOwner.length === 0) {
            dispatch(fetchClientsByOwner(user.phoneNumber));
        }
    }, [dispatch, user, clientsByOwner.length]); 
    const totalClaims = useMemo(() => {
        if (!clientsByOwner) return 0;
        return clientsByOwner.reduce((accumulator, group) => accumulator + group.clients.length, 0);
    }, [clientsByOwner]);
    
    const stats = [
        {
            name: "Total Income",
            value: user?.income ? `₹${user.income.toLocaleString()}` : "₹0",
            icon: Users,
            trend: "up", 
        },
        {
            name: "Total Data Claims",
            value: totalClaims.toLocaleString(),
            icon: FileText,
            trend: "up",
        },
    ];

    const isLoading = authLoading || (clientLoading && clientsByOwner.length === 0);
    if (isLoading) {
        return <DashboardLoadingSkeleton />;
    }

    return (
        <div className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2"> 
                {stats.map((stat) => (
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
                            <div
                                className={`rounded-full p-3 ${
                                    stat.trend === "up"
                                        ? "bg-green-100 text-green-600"
                                        : "bg-red-100 text-red-600"
                                }`}
                            >
                                <stat.icon className="h-6 w-6" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
            </div>
        </div>
    );
}

const DashboardLoadingSkeleton = () => {
    return (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2">
            {[1, 2].map((i) => (
                <div key={i} className="rounded-lg border bg-white p-6 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="mt-2 h-9 w-24" />
                        </div>
                        <Skeleton className="h-12 w-12 rounded-full" />
                    </div>
                </div>
            ))}
        </div>
    );
}