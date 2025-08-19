import { createSlice, Dispatch, PayloadAction } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import Cookies from 'js-cookie';

// 1. STATE INTERFACES: Define the shape of the data for each dashboard

export interface AdminDashboardCounts {
  totalUsers: number;
  totalBM: number;
  totalDIV: number;
  totalDIST: number;
  totalSTAT: number;
  totalMember: number;
  overallTotalIncome: number; // The sum of ALL users' income
  adminIncome: number; // The "Trust Account"
  totalWithdrawalRequests: number;
  totalExtendRequests: number;
}

export interface UserDashboardCounts {
  referredUsersCount: number;
  personalIncome: number;
  referralLimit: number;
}

// The main state for this slice
export interface CountState {
  adminDashboard: AdminDashboardCounts;
  userDashboard: UserDashboardCounts;
  loading: boolean;
  error: string | null;
}

// 2. INITIAL STATE: Set default values
const initialState: CountState = {
  adminDashboard: {
    totalUsers: 0,
    totalBM: 0,
    totalDIV: 0,
    totalDIST: 0,
    totalSTAT: 0,
    totalMember: 0,
    overallTotalIncome: 0,
    adminIncome: 0,
    totalWithdrawalRequests: 0,
    totalExtendRequests: 0,
  },
  userDashboard: {
    referredUsersCount: 0,
    personalIncome: 0,
    referralLimit: 0,
  },
  loading: false,
  error: null,
};

// 3. SLICE CREATION: Define reducers to update the state
const countSlice = createSlice({
  name: "counts",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.loading = false;
    },
    setAdminDashboardCounts: (state, action: PayloadAction<Partial<AdminDashboardCounts>>) => {
      state.adminDashboard = { ...state.adminDashboard, ...action.payload };
      state.loading = false;
    },
    setUserDashboardCounts: (state, action: PayloadAction<Partial<UserDashboardCounts>>) => {
      state.userDashboard = { ...state.userDashboard, ...action.payload };
      state.loading = false;
    },
  },
});

export const {
  setLoading,
  setError,
  setAdminDashboardCounts,
  setUserDashboardCounts,
} = countSlice.actions;

// 4. THUNKS (ASYNC ACTIONS): Functions to fetch data from your API

/**
 * Fetches all necessary counts for the Admin Dashboard in a single, parallel operation.
 * @param adminId The ID of the admin user to fetch their specific income ("Trust Account").
 */
export const fetchAdminDashboardCounts = (adminId: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const api = process.env.NEXT_PUBLIC_API_BASE_URL;
    
    // Fire all API requests at once for maximum speed
    const [
      usersRes, bmRes, divRes, distRes, statRes, memRes, 
      totalIncomeRes, withdrawalRes, extendRes, adminIncomeRes
    ] = await Promise.all([
      axios.get(`${api}/counts/fetchTotalUsers`),
      axios.get(`${api}/counts/fetchTotalBM`),
      axios.get(`${api}/counts/fetchTotalDIV`),
      axios.get(`${api}/counts/fetchTotalDIST`),
      axios.get(`${api}/counts/fetchTotalSTAT`),
      axios.get(`${api}/counts/fetchTotalMEM`),
      axios.get(`${api}/counts/fetchTotalIncome`),
      axios.get(`${api}/counts/fetchTotalWithdrawalRequests`),
      axios.get(`${api}/counts/fetchTotalExtendRequest`),
      axios.get(`${api}/counts/fetchTotalIncomeByUserId/${adminId}`), // Fetch admin's income
    ]);

    const counts: AdminDashboardCounts = {
      totalUsers: usersRes.data.data.count,
      totalBM: bmRes.data.data.count,
      totalDIV: divRes.data.data.count,
      totalDIST: distRes.data.data.count,
      totalSTAT: statRes.data.data.count,
      totalMember: memRes.data.data.count,
      overallTotalIncome: totalIncomeRes.data.data.totalIncome,
      adminIncome: adminIncomeRes.data.data.totalIncome,
      totalWithdrawalRequests: withdrawalRes.data.data.count,
      totalExtendRequests: extendRes.data.data.count,
    };

    dispatch(setAdminDashboardCounts(counts));

  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch dashboard statistics.";
    dispatch(setError(message));
  }
};

/**
 * Fetches all necessary counts for the regular User Dashboard.
 * @param userId The ID of the logged-in user.
 */
export const fetchUserDashboardCounts = (userId: string) => async (dispatch: Dispatch) => {
    dispatch(setLoading(true));
    try {
        const api = process.env.NEXT_PUBLIC_API_BASE_URL;
        const token = Cookies.get('auth-token'); // Needed for the protected referral count route

        const [incomeRes, limitRes, referralRes] = await Promise.all([
            axios.get(`${api}/counts/fetchTotalIncomeByUserId/${userId}`),
            axios.get(`${api}/counts/fetchTotalLimitsByUserId/${userId}`),
            axios.get(`${api}/users/referral-count/${userId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            }),
        ]);

        const userCounts: UserDashboardCounts = {
            personalIncome: incomeRes.data.data.totalIncome,
            referralLimit: limitRes.data.data.totalLimit,
            referredUsersCount: referralRes.data.data.count,
        };

        dispatch(setUserDashboardCounts(userCounts));
        // console.log(userCounts)

    } catch (error: any) {
        const message = error.response?.data?.message || "Failed to fetch user dashboard data.";
        dispatch(setError(message));
    }
};

// 5. SELECTORS: Provide easy access to the state data from components
export const selectAdminDashboardCounts = (state: RootState) => state.counts.adminDashboard;
export const selectUserDashboardCounts = (state: RootState) => state.counts.userDashboard;
export const selectCountsLoading = (state: RootState) => state.counts.loading;
export const selectCountsError = (state: RootState) => state.counts.error;

// Derived Selector: Calculates the net income of all non-admin users
export const selectNetUserIncome = (state: RootState) => {
    const { overallTotalIncome, adminIncome } = state.counts.adminDashboard;
    return overallTotalIncome - adminIncome;
};

export default countSlice.reducer;