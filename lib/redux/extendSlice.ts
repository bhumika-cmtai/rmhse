import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

export interface userIdInterface {
  name: string,
  _id: string
}
export interface Extend {
  _id: string;
  userId: userIdInterface;
  status: 'pending'| 'processing' | 'approved' | 'rejected';
  reason?: string;
  limit: string;
  createdOn: number;
  updatedOn: number;
}

export interface ExtendState {
  data: Extend[];
  loading: boolean;
  error: string | null;
  selectedExtend: Extend | null;
}

const initialState: ExtendState = {
  data: [],
  loading: false,
  error: null,
  selectedExtend: null,
};

const extendSlice = createSlice({
  name: "extends",
  initialState,
  reducers: {
    setExtends: (state, action) => {
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
    setSelectedExtend: (state, action) => {
      state.selectedExtend = action.payload;
    },
    clearSelectedExtend: (state) => {
      state.selectedExtend = null;
    },
    addExtend: (state, action) => {
      state.data.unshift(action.payload);
      state.loading = false;
      state.error = null;
    },
    updateExtendInState: (state, action) => {
      const index = state.data.findIndex(e => e._id === action.payload._id);
      if (index !== -1) {
        state.data[index] = action.payload;
      }
      state.loading = false;
      state.error = null;
    },
  },
});

export const { 
  setExtends, 
  setLoading, 
  setError, 
  setSelectedExtend, 
  clearSelectedExtend,
  addExtend,
  updateExtendInState
} = extendSlice.actions;

// Create extension request
export const createExtend = (extendData: { userId: string }) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/extends/createExtend`, extendData);
    if (response.status === 201) {
      dispatch(addExtend(response.data.data));
      return response.data;
    } else {
      dispatch(setError(response.data.message));
      return null;
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to create extension request";
    dispatch(setError(message));
    return null;
  }
};

// Get all extension requests
export const getAllExtends = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/extends/getAllExtends`);
    if (response.status === 200) {
      dispatch(setExtends(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to fetch extension requests";
    dispatch(setError(message));
  }
};

// Update extension request
export const updateExtend = (id: string, updateData: { status: string; reason?: string }) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/extends/updateExtend/${id}`, updateData);
    if (response.status === 200) {
      dispatch(updateExtendInState(response.data.data));
      return response.data;
    } else {
      dispatch(setError(response.data.message));
      return null;
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to update extension request";
    dispatch(setError(message));
    return null;
  }
};

// Get extension requests by user ID
export const getExtendsByUserId = (userId: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/extends/getExtendsByUserId/${userId}`);
    if (response.status === 200) {
      dispatch(setExtends(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to fetch user extension requests";
    dispatch(setError(message));
  }
};

// Get extension request by ID
export const getExtendById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/extends/getExtendById/${id}`);
    if (response.status === 200) {
      dispatch(setSelectedExtend(response.data.data));
      dispatch(setLoading(false));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Failed to fetch extension request";
    dispatch(setError(message));
  }
};

// Selectors
export const selectExtends = (state: RootState) => state.extends.data;
export const selectExtendById = (state: RootState) => state.extends.selectedExtend;
export const selectExtendLoading = (state: RootState) => state.extends.loading;
export const selectExtendError = (state: RootState) => state.extends.error;

export default extendSlice.reducer; 