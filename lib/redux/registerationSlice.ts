// lib/redux/registerationSlice.ts

import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

// Interface based on your registerationModel.js
export interface Registeration {
  _id?: string;
  name: string;
  email?: string;
  phoneNumber: string;
  leaderCode: string;
  status: string;
  reason?: string;
  createdOn?: string;
  updatedOn?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRegisterations: number;
}

interface RegisterationState {
  data: Registeration[];
  loading: boolean;
  error: string | null;
  selectedRegisteration: Registeration | null;
  pagination: Pagination;
}

const initialState: RegisterationState = {
  data: [],
  loading: false,
  error: null,
  selectedRegisteration: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalRegisterations: 0,
  },
};  

const registerationSlice = createSlice({
  name: "registerations",
  initialState,
  reducers: {
    setRegisterations: (state, action) => {
      state.data = action.payload.registers || [];
      state.pagination.totalRegisterations = action.payload.totalRegisters || 0;
      state.pagination.totalPages = action.payload.totalPages || 1;
      state.pagination.currentPage = action.payload.currentPage || 1;
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
    setSelectedRegisteration: (state, action) => {
      state.selectedRegisteration = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
}); 

export const { 
  setRegisterations, 
  setLoading, 
  setError, 
  setSelectedRegisteration, 
} = registerationSlice.actions;

// Type for creating a new registration, omitting server-generated fields
type NewRegisterationData = Omit<Registeration, '_id' | 'status' | 'reason' | 'createdOn' | 'updatedOn'>;

// --- Async Thunks for Registrations API ---

// Fetches a paginated and filtered list of registrations
export const fetchRegisterations = (params: { 
  name?: string; 
  phoneNumber?: string;
  leaderCode?: string;
  status?: string; 
  page?: number; 
  limit?: number;
}) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', String(params.page));
    if (params.limit) queryParams.append('limit', String(params.limit));
    if (params.name) queryParams.append('name', params.name);
    if (params.phoneNumber) queryParams.append('phoneNumber', params.phoneNumber);
    if (params.leaderCode) queryParams.append('leaderCode', params.leaderCode);
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);

    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/registers/getAllRegister?${queryParams.toString()}`);

    if (response.data && response.data.data) {
      dispatch(setRegisterations(response.data.data));
    } else {
      dispatch(setError(response.data.message || "Failed to fetch registrations."));
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Unknown error occurred";
    dispatch(setError(message));
  }
};

// Creates a new registration
export const createRegisteration = (registerData: NewRegisterationData) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/registers/addRegister`, registerData);
    dispatch(setLoading(false));
    return response.data; // The component can handle success/error based on the returned data
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Couldn't register";
    dispatch(setError(message));
    return null;
  }
};

export const deleteManyRegisterations = (ids: string[]) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/registers/deleteManyRegisters`, { data: { ids } });
    dispatch(setLoading(false));
    if (response.status === 200) {
      return response.data;
    } else {
      dispatch(setError(response.data.message));
      return null;
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
    return null;
  }
};  

// Fetches a single registration by its ID
export const fetchRegisterationById = (id: string) => async (dispatch: Dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/registers/getRegister/${id}`);
        if (response.data && response.data.data) {
            dispatch(setSelectedRegisteration(response.data.data));
        } else {
            dispatch(setError(response.data.message || `Registration with ID ${id} not found.`));
        }
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Unknown error occurred";
        dispatch(setError(message));
    }
};

// Updates an existing registration
export const updateRegisteration = (id: string, registerData: Partial<Registeration>) => async (dispatch: Dispatch) => {
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/registers/updateRegister/${id}`, registerData);
    // Let the component handle success and refetch if needed
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Unknown error";
    dispatch(setError(message));
    return null;
  }
};

// Deletes a registration by its ID
export const deleteRegisteration = (id: string) => async (dispatch: Dispatch) => {
    try {
        const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/registers/deleteRegister/${id}`);
        // The component that calls this should handle the success, e.g., by re-fetching the list.
        return response.data;
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Unknown error";
        dispatch(setError(message));
        return null;
    }
};

// Gets the total count of all registrations
export const getRegisterationsCount = () => async (dispatch: Dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/registers/getRegistersCount`);
        dispatch(setLoading(false));
        if (response.data && response.data.data) {
            return response.data.data.count as number;
        }
        dispatch(setError(response.data.message || "Failed to fetch count."));
        return null;
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Unknown error occurred";
        dispatch(setError(message));
        return null;
    }
};

// Gets the count of registrations within a specific date range
export const getRegisterationsCountByDate = (dateRange: { startDate: string; endDate: string }) => async (dispatch: Dispatch) => {
    dispatch(setLoading(true));
    try {
        const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/registers/getRegistersCountByDate`, dateRange);
        dispatch(setLoading(false));
        if (response.data && response.data.data) {
            return response.data.data.count as number;
        }
        dispatch(setError(response.data.message || "Failed to fetch count by date range."));
        return null;
    } catch (error: any) {
        const message = error.response?.data?.message || error.message || "Unknown error occurred";
        dispatch(setError(message));
        return null;
    }
};

// --- Selectors ---
export const selectRegisterations = (state: RootState) => state.registerations.data;
export const selectRegisterationLoading = (state: RootState) => state.registerations.loading;
export const selectRegisterationError = (state: RootState) => state.registerations.error;
export const selectRegisterationPagination = (state: RootState) => state.registerations.pagination;
export const selectSelectedRegisteration = (state: RootState) => state.registerations.selectedRegisteration;


export default registerationSlice.reducer;