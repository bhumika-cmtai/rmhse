import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

export interface userIdInterface {
  name: string,
  _id: string
}
export interface Withdrawal {
  _id: string;
  userId: userIdInterface;
  amount: number;
  status: 'pending'| 'processing' | 'approved' | 'rejected';
  reason?: string;
  createdOn: number;
  updatedOn: number;
}

export interface WithdrawalState {
  data: Withdrawal[];
  loading: boolean;
  error: string | null;
  selectedWithdrawal: Withdrawal | null;
}

const initialState: WithdrawalState = {
  data: [],
  loading: false,
  error: null,
  selectedWithdrawal: null,
};

const withdrawalSlice = createSlice({
  name: "withdrawals",
  initialState,
  reducers: {
    setWithdrawals: (state, action) => {
      state.data = action.payload;
      state.loading = false;
      state.error = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    setSelectedWithdrawal: (state, action) => {
      state.selectedWithdrawal = action.payload;
    },
    clearSelectedWithdrawal: (state) => {
      state.selectedWithdrawal = null;
    },
    addWithdrawal: (state, action) => {
      state.data.unshift(action.payload);
      state.loading = false;
      state.error = null;
    },
    updateWithdrawalInState: (state, action) => {
      const index = state.data.findIndex(w => w._id === action.payload._id);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
  },
});

export const { 
  setWithdrawals, 
  setLoading, 
  setError, 
  setSelectedWithdrawal, 
  clearSelectedWithdrawal,
  addWithdrawal,
  updateWithdrawalInState
} = withdrawalSlice.actions;

// Create withdrawal
export const createWithdrawal = (withdrawalData: { userId: string; amount: number }) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/withdrawals/createWithdrawal`, withdrawalData);
    if (response.status === 201) {
      dispatch(addWithdrawal(response.data.data));
      return response.data;
    } else {
      dispatch(setError(response.data.message));
      return null;
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to create withdrawal";
    dispatch(setError(message));
    return null;
  }
};

// Get all withdrawals
export const getAllWithdrawals = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/withdrawals/getAllWithdrawals`);
    if (response.status === 200) {
      dispatch(setWithdrawals(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to fetch withdrawals";
    dispatch(setError(message));
  }
};

// Update withdrawal
export const updateWithdrawal = (id: string, updateData: { status: string; reason?: string }) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/withdrawals/updateWithdrawal/${id}`, updateData);
    if (response.status === 200) {
      dispatch(updateWithdrawalInState(response.data.data));
      return response.data;
    } else {
      dispatch(setError(response.data.message));
      return null;
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to update withdrawal";
    dispatch(setError(message));
    return null;
  }
};

// Get withdrawals by user ID
export const getWithdrawalsByUserId = (userId: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/withdrawals/getWithdrawalsByUserId/${userId}`);
    if (response.status === 200) {
      dispatch(setWithdrawals(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to fetch user withdrawals";
    dispatch(setError(message));
  }
};

// Get withdrawal by ID
export const getWithdrawalById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/withdrawals/getWithdrawalById/${id}`);
    if (response.status === 200) {
      dispatch(setSelectedWithdrawal(response.data.data));
      dispatch(setLoading(false));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to fetch withdrawal";
    dispatch(setError(message));
  }
};

// Selectors
export const selectWithdrawals = (state: RootState) => state.withdrawals.data;
export const selectWithdrawalById = (state: RootState) => state.withdrawals.selectedWithdrawal;
export const selectWithdrawalLoading = (state: RootState) => state.withdrawals.loading;
export const selectWithdrawalError = (state: RootState) => state.withdrawals.error;

export default withdrawalSlice.reducer; 