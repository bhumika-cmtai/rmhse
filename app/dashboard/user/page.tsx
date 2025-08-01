"use client";

import React, { useMemo } from "react";
import { 
    Users, 
    FileText, 
    Banknote, 
    ShieldCheck, 
    ShieldX, 
    Briefcase,
    CircleDollarSign
} from "lucide-react";
import { 
    AreaChart,
    Area,
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    TooltipProps
} from 'recharts';
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { NameType, ValueType } from "recharts/types/component/DefaultTooltipContent";

// --- Types and Mock Data ---
type WithdrawalRequest = {
    id: string;
    amount: number;
    status: 'approved' | 'rejected' | 'pending';
    date: Date;
    rejectionReason?: string;
};

const mockWithdrawals: WithdrawalRequest[] = [
    { id: 'w1', amount: 250.25, status: 'approved', date: new Date(2024, 4, 20) }, // May
    { id: 'w3', amount: 500.00, status: 'approved', date: new Date(2024, 5, 15) }, // June
    { id: 'w2', amount: 1200.50, status: 'rejected', date: new Date(2024, 6, 2) }, // July
    { id: 'w4', amount: 300.00, status: 'approved', date: new Date(2024, 6, 22) }, // July
    { id: 'w5', amount: 850.00, status: 'approved', date: new Date(2024, 3, 10) }, // April
];

// --- Custom Tooltip Component ---
const CustomTooltip = (props: TooltipProps<ValueType, NameType>) => {
    const { active, label, payload } = props as {
        active?: boolean;
        label?: string;
        payload?: { value: number }[];
    };
    if (active && payload && payload.length) {
      return (
        <div className="rounded-lg border bg-background p-2 shadow-sm">
          <div className="grid grid-cols-2 gap-2">
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">Month</span>
              <span className="font-bold text-muted-foreground">{label}</span>
            </div>
            <div className="flex flex-col space-y-1">
              <span className="text-[0.70rem] uppercase text-muted-foreground">Amount</span>
              <span className="font-bold">₹{payload[0].value?.toLocaleString()}</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
};

// --- Green Area Chart Component ---
const WithdrawalAreaChart = ({ data }: { data: WithdrawalRequest[] }) => {
    const chartData = useMemo(() => {
        const monthlyTotals: { [key: string]: number } = {};
        const sortedData = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());

        sortedData.forEach(item => {
            if (item.status === 'approved') {
                const month = item.date.toLocaleString('default', { month: 'short', year: '2-digit' });
                if (!monthlyTotals[month]) {
                    monthlyTotals[month] = 0;
                }
                monthlyTotals[month] += item.amount;
            }
        });

        return Object.keys(monthlyTotals).map(month => ({
            name: month,
            total: monthlyTotals[month],
        }));
    }, [data]);

    return (
        <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                <defs>
                    {/* Updated gradient with a pleasant green color */}
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(96, 67%, 57%, 1)" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="hsl(142.1 70.6% 49.8%)" stopOpacity={0}/>
                    </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="3 3" vertical={false} strokeOpacity={0.3} />
                <XAxis dataKey="name" stroke="#888888" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `₹${value / 1000}k`} />
                <Tooltip content={<CustomTooltip />} cursor={{ stroke: 'hsl(142.1 70.6% 49.8%)', strokeWidth: 1, strokeDasharray: '3 3' }} />

                <Area 
                    type="monotone" 
                    dataKey="total" 
                    stroke="hsl(142.1 70.6% 49.8%)" // Updated line color
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorTotal)" // Apply the new gradient
                    isAnimationActive={true}
                    animationDuration={750}
                    dot={{ r: 4, strokeWidth: 2, stroke: 'hsl(142.1 70.6% 49.8%)' }}
                    activeDot={{ r: 6, stroke: 'hsl(142.1 70.6% 49.8%)', fill: '#fff' }}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default function Dashboard() {
    // --- Mock Data ---
    const user = {
        income: 340,
        limit: 50,
        status: 'Active' as 'Active' | 'Blocked',
        role: 'Division',
        latestWithdrawal: {
            date: '2024-07-29',
            amount: 150.00,
        }
    };
    const totalUsers = 23;
    const isLoading = false;

    // --- Main Statistics Data ---
    const mainStats = [
        { name: "Total Referred Users", value: totalUsers.toLocaleString(), icon: Users },
        { name: "Total Income", value: user?.income ? `₹${user.income.toLocaleString()}` : "₹0", icon: CircleDollarSign },
        { name: "Total Limits", value: user?.limit ? `${user.limit.toLocaleString()}` : "0", icon: FileText }
    ];

    if (isLoading) {
        return <DashboardLoadingSkeleton />;
    }

    return (
        <div className="space-y-8">
            {/* --- Main Statistics Section --- */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Main Statistics</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {mainStats.map((stat) => (
                        <div key={stat.name} className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium text-muted-foreground">{stat.name}</p>
                                    <p className="mt-2 text-3xl font-semibold">{stat.value}</p>
                                </div>
                                {/* Updated icon background to green */}
                                <div className="rounded-full bg-green-100 p-3 text-green-600"><stat.icon className="h-6 w-6" /></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* --- Additional Info Section --- */}
            <div>
                <h2 className="text-2xl font-semibold mb-4">Additional Info</h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Account Status</p>
                                <div className="mt-2"><Badge variant={user.status === 'Active' ? 'default' : 'destructive'} className="text-base">{user.status}</Badge></div>
                            </div>
                            <div className={`rounded-full p-3 ${user.status === 'Active' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                {user.status === 'Active' ? <ShieldCheck className="h-6 w-6" /> : <ShieldX className="h-6 w-6" />}
                            </div>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Current Role</p>
                                <p className="mt-2 text-xl font-semibold">{user.role}</p>
                            </div>
                            <div className="rounded-full bg-indigo-100 p-3 text-indigo-600"><Briefcase className="h-6 w-6" /></div>
                        </div>
                    </div>
                    <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Latest Withdrawal</p>
                                <p className="mt-2 text-xl font-semibold">₹{user.latestWithdrawal.amount.toFixed(2)}</p>
                                <p className="text-xs text-muted-foreground">on {new Date(user.latestWithdrawal.date).toLocaleDateString()}</p>
                            </div>
                            <div className="rounded-full bg-amber-100 p-3 text-amber-600"><Banknote className="h-6 w-6" /></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- Withdrawal Overview Section --- */}
            <div>
                 <h2 className="text-2xl font-semibold mb-4">Withdrawal Trend</h2>
                 <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
                    <WithdrawalAreaChart data={mockWithdrawals} />
                 </div>
            </div>
        </div>
    );
}

const DashboardLoadingSkeleton = () => {
    return (
        <div className="space-y-8">
            <div>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-lg border bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div><Skeleton className="h-4 w-32" /><Skeleton className="mt-2 h-9 w-24" /></div>
                                <Skeleton className="h-12 w-12 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                         <div key={i} className="rounded-lg border bg-white p-6 shadow-sm">
                            <div className="flex items-center justify-between">
                                <div><Skeleton className="h-4 w-32" /><Skeleton className="mt-2 h-9 w-24" /></div>
                                <Skeleton className="h-12 w-12 rounded-full" />
                            </div>
                        </div>
                    ))}
                </div>
            </div>
            <div>
                <Skeleton className="h-8 w-48 mb-4" />
                <div className="rounded-lg border bg-white p-4 shadow-sm">
                    <Skeleton className="h-[300px] w-full" />
                </div>
            </div>
        </div>
    );
}