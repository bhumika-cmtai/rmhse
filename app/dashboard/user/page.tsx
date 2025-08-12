"use client";

import React, { useMemo, useState, useEffect } from "react";
import { 
    Users, 
    FileText, 
    Banknote, 
    Briefcase,
    ArrowUpCircle, 
    Loader2
} from "lucide-react";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps 
} from 'recharts'; // <-- UPDATED IMPORTS
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";

import { AppDispatch, RootState } from "@/lib/store";
import { fetchCurrentUser, upgradeUserRole } from "@/lib/redux/authSlice";
import { 
    getCommissionHistory, 
    selectCommissionHistory,
    CommissionHistory
} from "@/lib/redux/userSlice";
import {
    fetchUserDashboardCounts,
    selectUserDashboardCounts,
    selectCountsLoading
} from "@/lib/redux/countSlice";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// --- Custom Tooltip Component (Updated for Bar Chart) ---
const CustomTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const { active, label, payload } = props as { active?: boolean; label?: string; payload?: { value: number }[]; };
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-1 gap-1 text-center">
            <span className="text-[0.70rem] uppercase text-muted-foreground">User</span>
            <span className="font-bold text-muted-foreground">{label}</span>
            <span className="text-[0.70rem] uppercase text-muted-foreground mt-1">Total Commission</span>
            <span className="font-bold">₹{payload[0].value?.toLocaleString()}</span>
          </div>
        </div>
      );
    }
    return null;
};

// --- NEW Bar Chart Component for Commission Sources ---
const CommissionBarChart = ({ data }: { data: CommissionHistory[] }) => {
    const chartData = useMemo(() => {
        const totalsByUser: { [key: string]: number } = {};

        data.forEach(item => {
            const userName = item.sourceUserName || "Unknown User";
            if (!totalsByUser[userName]) {
                totalsByUser[userName] = 0;
            }
            totalsByUser[userName] += item.amount;
        });

        return Object.keys(totalsByUser)
            .map(userName => ({ name: userName, total: totalsByUser[userName] }))
            .sort((a, b) => b.total - a.total); // Sort to show top earners first
    }, [data]);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${Number(value) / 1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(136, 132, 216, 0.1)' }} />
                <Bar dataKey="total" fill="hsl(142.1 70.6% 49.8%)" radius={[4, 4, 0, 0]} isAnimationActive={true} animationDuration={750} />
            </BarChart>
        </ResponsiveContainer>
    );
};

// --- Loading Skeleton (No changes needed) ---
const DashboardLoadingSkeleton = () => { /* ... JSX for skeleton remains the same ... */ 
    return (
        <div className="space-y-8 animate-pulse">
            <div><Skeleton className="h-8 w-48 mb-4" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (<div key={i} className="rounded-lg border bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><Skeleton className="h-4 w-32" /><Skeleton className="mt-2 h-9 w-24" /></div><Skeleton className="h-12 w-12 rounded-full" /></div></div>))}
                </div>
            </div>
             <div><Skeleton className="h-8 w-48 mb-4" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (<div key={i} className="rounded-lg border bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><Skeleton className="h-4 w-32" /><Skeleton className="mt-2 h-9 w-24" /></div><Skeleton className="h-12 w-12 rounded-full" /></div></div>))}
                </div>
            </div>
            <div><Skeleton className="h-8 w-48 mb-4" />
                <div className="rounded-lg border bg-white p-4 shadow-sm"><Skeleton className="h-[300px] w-full" /></div>
            </div>
        </div>
    );
};

// --- Main Dashboard Component ---
export default function Dashboard() {
    const dispatch = useDispatch<AppDispatch>();
    
    const { user, isLoading: isAuthLoading } = useSelector((state: RootState) => state.auth);
    const userStats = useSelector(selectUserDashboardCounts);
    const commissionHistory = useSelector(selectCommissionHistory);
    const isCountsLoading = useSelector(selectCountsLoading);
    
    const [isUpgrading, setIsUpgrading] = useState(false);

    useEffect(() => {
        if (!user) {
            dispatch(fetchCurrentUser());
        }
        if (user?._id) {
            dispatch(fetchUserDashboardCounts(user._id));
            dispatch(getCommissionHistory(user._id));
        }
    }, [dispatch, user]);

    const upgradeDetails = useMemo(() => {
        if (!user) return { possible: false, buttonText: 'Loading...' };
        switch (user.role) {
            case 'MEM': return { possible: true, buttonText: 'Upgrade to DIV' };
            case 'DIV': return { possible: true, buttonText: 'Upgrade to DIST' };
            case 'DIST': return { possible: true, buttonText: 'Upgrade to STAT' };
            default: return { possible: false, buttonText: 'Highest Role Achieved' };
        }
    }, [user?.role]);

    const handleUpgrade = async () => { /* ... handleUpgrade logic remains the same ... */ };
    
    // Calculate the largest single commission earned
    const largestCommission = useMemo(() => 
        [...commissionHistory].sort((a, b) => b.amount - a.amount)[0],
    [commissionHistory]);

    const isLoading = (isAuthLoading || isCountsLoading) && !user;

    if (isLoading) {
        return <DashboardLoadingSkeleton />;
    }

    if (!user) {
        return <div className="text-center p-12">Could not load user data. Please try refreshing.</div>;
    }
    
    if (user.role === 'MEM') { /* ... MEM view remains the same ... */ }

    const mainStats = [
        { name: "Total Referred Users", value: userStats.referredUsersCount.toLocaleString(), icon: Users },
        { name: "Total Income", value: `₹${userStats.personalIncome.toLocaleString()}`, icon: Banknote },
        { name: "Referral Limit", value: userStats.referralLimit.toLocaleString(), icon: FileText }
    ];

    return (
        <div className="space-y-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 className="text-3xl font-bold">User Dashboard</h1>
                <Button variant="outline" onClick={handleUpgrade} disabled={!upgradeDetails.possible || isUpgrading}>
                    {isUpgrading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowUpCircle className="mr-2 h-4 w-4" />}
                    {isUpgrading ? 'Processing...' : upgradeDetails.buttonText}
                </Button>
            </div>
            
            <div>
                <h2 className="text-2xl font-semibold mb-4">Your Statistics</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {mainStats.map((stat) => (
                        <Card key={stat.name}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{stat.name}</CardTitle><stat.icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent></Card>
                    ))}
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4">Account Info</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Account Status</CardTitle></CardHeader><CardContent><Badge variant={user.status.toLowerCase() === 'active' ? 'default' : 'destructive'} className="text-base">{user.status}</Badge></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Current Role</CardTitle></CardHeader><CardContent><p className="text-xl font-semibold">{user.role}</p></CardContent></Card>
                    <Card>
                        <CardHeader className="pb-2"><CardTitle className="text-sm">Largest Commission Earned</CardTitle></CardHeader>
                        <CardContent>
                            {largestCommission ? (
                                <>
                                <p className="text-xl font-semibold">₹{largestCommission.amount.toLocaleString()}</p>
                                <p className="text-xs text-muted-foreground">from {largestCommission.sourceUserName}</p>
                                </>
                            ) : (<p className="text-sm text-muted-foreground">No commissions earned yet.</p>)}
                        </CardContent>
                    </Card>
                </div>
            </div>

            <div>
                 <h2 className="text-2xl font-semibold mb-4">Commission by Source</h2>
                 <Card><CardContent className="pt-6"><CommissionBarChart data={commissionHistory} /></CardContent></Card>
            </div>
        </div>
    );
}