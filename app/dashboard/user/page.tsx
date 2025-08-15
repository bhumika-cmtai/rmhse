"use client";

import React, { useMemo, useState, useEffect } from "react";
import { 
    Users, 
    FileText, 
    Banknote, 
    Briefcase,
    ArrowUpCircle, 
    Loader2,
    ClipboardCopy // <-- NEW ICON for Join ID
} from "lucide-react";
import { 
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, TooltipProps 
} from 'recharts';
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

// --- Custom Tooltip Component (No changes) ---
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

// --- CommissionBarChart Component (No changes) ---
const CommissionBarChart = ({ data }: { data: CommissionHistory[] }) => {
    const chartData = useMemo(() => {
        const totalsByUser: { [key: string]: number } = {};
        data.forEach(item => {
            const userName = item.sourceUserName || "Unknown User";
            if (!totalsByUser[userName]) { totalsByUser[userName] = 0; }
            totalsByUser[userName] += item.amount;
        });
        return Object.keys(totalsByUser)
            .map(userName => ({ name: userName, total: totalsByUser[userName] }))
            .sort((a, b) => b.total - a.total);
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

// --- Loading Skeleton (No changes) ---
const DashboardLoadingSkeleton = () => { 
    return (
        <div className="space-y-8 animate-pulse">
            <div><Skeleton className="h-8 w-48 mb-4" /><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => (<div key={i} className="rounded-lg border bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><Skeleton className="h-4 w-32" /><Skeleton className="mt-2 h-9 w-24" /></div><Skeleton className="h-12 w-12 rounded-full" /></div></div>))}</div></div>
            <div><Skeleton className="h-8 w-48 mb-4" /><div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((i) => (<div key={i} className="rounded-lg border bg-white p-6 shadow-sm"><div className="flex items-center justify-between"><div><Skeleton className="h-4 w-32" /><Skeleton className="mt-2 h-9 w-24" /></div><Skeleton className="h-12 w-12 rounded-full" /></div></div>))}</div></div>
            <div><Skeleton className="h-8 w-48 mb-4" /><div className="rounded-lg border bg-white p-4 shadow-sm"><Skeleton className="h-[300px] w-full" /></div></div>
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
        if (!user) { dispatch(fetchCurrentUser()); }
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

    const handleUpgrade = async () => {
        if (!user) {
          toast.error("Cannot upgrade: User data is not loaded.");
          return;
        }

        // --- Role-based Validation Logic ---
        if (user.role === 'MEM') {
            const hasBankDetails = user.account_number && user.Ifsc;
            const hasPanCard = !!user.pancard;
            if (!hasBankDetails && !hasPanCard) {
                toast.error("Please add your PAN Card or Bank Details before upgrading.", {
                    description: "You can add your details in the Settings page.",
                    duration: 5000,
                });
                return; // Stop the upgrade
            }
        } else {
            // For roles DIV, DIST, etc.
            const referralCount = userStats.referredUsersCount;
            const referralLimit = userStats.referralLimit;
            // console.log("---referralCount---", referralCount)
            // console.log("---referralLimit---", referralLimit)
            if (referralCount < referralLimit) {
                toast.error("You cannot upgrade yet.", {
                    description: `Your referral goal of ${referralLimit} is not met. You currently have ${referralCount} referrals.`,
                    duration: 5000,
                });
                return; // Stop the upgrade
            }
        }

        // --- If validation passes, proceed with the upgrade ---
        setIsUpgrading(true);
        const toastId = toast.loading("Upgrading your role, please wait...");
        try {
            const resultAction = await dispatch(upgradeUserRole());
            
            // Check if the action was fulfilled and has a payload
            if (resultAction) {
                toast.success(`Congratulations! You've been upgraded to ${resultAction.payload.role}.`, { id: toastId });
            } else {
                // Handle rejected case
                const errorMessage = (resultAction.payload as any)?.message || "Upgrade failed. Please contact support.";
                toast.error(errorMessage, { id: toastId });
            }
        } catch (error) {
            toast.error("An unexpected error occurred during the upgrade.", { id: toastId });
        } finally {
            setIsUpgrading(false);
        }
    };
    // --- STEP 1: REMOVE UNNECESSARY LOGIC ---
    // const largestCommission = useMemo(() => ...); // This line has been removed.

    const isLoading = (isAuthLoading || isCountsLoading) && !user;

    if (isLoading) { return <DashboardLoadingSkeleton />; }
    if (!user) { return <div className="text-center p-12">Could not load user data. Please try refreshing.</div>; }
    
    if (user.role === 'MEM') {
         return (
            <div className="flex items-center justify-center rounded-lg border bg-card text-card-foreground shadow-sm p-12 min-h-[400px]">
                <div className="text-center space-y-4">
                    <Briefcase className="mx-auto h-12 w-12 text-muted-foreground" />
                    <h2 className="text-2xl font-semibold">Unlock Your Earning Potential</h2>
                    <p className="text-muted-foreground max-w-md">Upgrade your account to DIV to access detailed statistics, withdrawal trends, and start building your referral network.</p>
                    <Button size="lg" variant="default" className="mt-4" onClick={handleUpgrade} disabled={isUpgrading}>
                        {isUpgrading ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <ArrowUpCircle className="mr-2 h-5 w-5" />}
                        {isUpgrading ? 'Upgrading...' : upgradeDetails.buttonText}
                    </Button>
                </div>
            </div>
        );
    }

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
                    {mainStats.map((stat) => (<Card key={stat.name}><CardHeader className="flex flex-row items-center justify-between pb-2"><CardTitle className="text-sm font-medium">{stat.name}</CardTitle><stat.icon className="h-4 w-4 text-muted-foreground" /></CardHeader><CardContent><div className="text-2xl font-bold">{stat.value}</div></CardContent></Card>))}
                </div>
            </div>

            <div>
                <h2 className="text-2xl font-semibold mb-4">Account Info</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Account Status</CardTitle></CardHeader><CardContent><Badge variant={user.status.toLowerCase() === 'active' ? 'default' : 'destructive'} className="text-base">{user.status}</Badge></CardContent></Card>
                    <Card><CardHeader className="pb-2"><CardTitle className="text-sm">Current Role</CardTitle></CardHeader><CardContent><p className="text-xl font-semibold">{user.role}</p></CardContent></Card>
                    
                    {/* =================================================================================== */}
                    {/* STEP 2: REPLACE THE CARD WITH THE JOIN ID CARD                                    */}
                    {/* =================================================================================== */}
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-sm font-medium">My Join ID</CardTitle>
                            <ClipboardCopy className="h-4 w-4 text-muted-foreground" />
                        </CardHeader>
                        <CardContent>
                            <p className="text-xl font-semibold">{user.joinId || 'Not Assigned'}</p>
                            <p className="text-xs text-muted-foreground">Use this ID for login.</p>
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