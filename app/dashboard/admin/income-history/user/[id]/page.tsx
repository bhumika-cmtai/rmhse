'use client';

import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'next/navigation';
import { AppDispatch,RootState } from '@/lib/store';
import {
    getCommissionHistory,
    fetchUserById,
    selectCommissionHistory,
    selectUserById,
    selectLoading,
    selectError
} from '@/lib/redux/userSlice'; // Adjust path
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const IncomeHistoryPage = () => {
    const dispatch: AppDispatch = useDispatch();
    const params = useParams();
    const userId = params.id as string;
    // Select state from Redux
    const incomeHistory = useSelector((state: RootState) => selectCommissionHistory(state));
    const user = useSelector((state: RootState) => selectUserById(state));
    const loading = useSelector((state: RootState) => selectLoading(state));
    const error = useSelector((state: RootState) => selectError(state));
    
    useEffect(() => {
        
        if (userId && typeof userId === 'string') {
            console.log(userId)
            // Fetch both the user's details and their commission history
            dispatch(fetchUserById(userId));
            dispatch(getCommissionHistory(userId));
        }
    }, [dispatch, userId]);

    if (loading) return <p className="text-center mt-8">Loading income history...</p>;
    if (error) return <p className="text-center mt-8 text-red-500">Error: {error}</p>;

    return (
        <div className="container mx-auto px-4 sm:px-8">
            
            <div className="py-8">
                <div className='flex justify-between'>
                    {user && (
                        <div>
                            <h2 className="text-2xl font-semibold leading-tight">Income History for {user.name}</h2>
                            <p className="text-gray-600">User ID: {user._id}</p>
                        </div>
                    )}
                <Button
                    variant="outline"
                    className="gap-2"
                    type="button"
                    onClick={() => window.history.back()}
                    >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Previous Page
                </Button>
                </div>
                <div className="-mx-4 sm:-mx-8 px-4 sm:px-8 py-4 overflow-x-auto">
                    <div className="inline-block min-w-full shadow-md rounded-lg overflow-hidden">
                        <table className="min-w-full leading-normal">
                            <thead>
                                <tr>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        Amount
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        From User
                                    </th>
                                    <th className="px-5 py-3 border-b-2 border-gray-200 bg-gray-100 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                                        From User's Role ID
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {incomeHistory.length > 0 ? (
                                    incomeHistory.map((record, index) => (
                                        <tr key={index}>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <p className=" whitespace-no-wrap font-bold text-green-600">
                                                    ₹{record.amount? record.amount.toFixed(2): "-"}
                                                </p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <p className="text-gray-900 whitespace-no-wrap">{record.sourceUserName}</p>
                                            </td>
                                            <td className="px-5 py-5 border-b border-gray-200 bg-white text-sm">
                                                <p className="text-gray-900 whitespace-no-wrap">{record.sourceUserLatestRoleId}</p>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={3} className="text-center py-10">No income history found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IncomeHistoryPage;