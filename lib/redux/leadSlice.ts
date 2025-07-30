import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

export interface Lead {
  _id?: string;
  name: string;
  email: string;
  transactionId?: string;
  phoneNumber: string;
  city: string;
  age: string;
  gender?: string;
  status: string;
  reason? :string;
  createdOn?: string;
  updatedOn?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalLeads: number;
}

export interface LeadState {
  data: Lead[];
  loading: boolean;
  error: string | null;
  selectedLead: Lead | null;
  pagination: Pagination;
  totalLeadsCount: number; // For dashboard count
}

const initialState: LeadState = {
  data: [],
  loading: false,
  error: null,
  selectedLead: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalLeads: 0,
  },
  totalLeadsCount: 0, // Initial value for dashboard count
};

const leadSlice = createSlice({
  name: "leads",
  initialState,
  reducers: {
    setLeads: (state, action) => {
      state.data = action.payload.leads;
      state.pagination.totalLeads = action.payload.totalLeads;
      state.pagination.totalPages = action.payload.totalPages;
      state.pagination.currentPage = action.payload.currentPage;
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
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.pagination.currentPage = action.payload;
    },
    setSelectedLead: (state, action) => {
      state.selectedLead = action.payload;
      state.loading = false; 
    },
    clearSelectedLead: (state) => {
      state.selectedLead = null;
    },
    setTotalLeadsCount: (state, action) => {
      state.totalLeadsCount = action.payload;
    },
  },
});

export const {
  setLeads,
  setLoading,
  setError,
  setSelectedLead,
  clearSelectedLead,
  setPagination,
  setCurrentPage,
  setTotalLeadsCount,
} = leadSlice.actions;

export const fetchLeadsCount = () => async (dispatch: Dispatch) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/getLeadsCount`);
    if (response.data) {
      dispatch(setTotalLeadsCount(response.data.data.count));
    } else {
      console.log("Failed to fetch leads count:", response.data.message);
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    console.log("Error fetching leads count:", message);
  }
};

// Updated to handle filtering, search, and pagination
export const fetchLeads = (params?: { search?: string; status?: string; page?: number }) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const query = [];
    if (params?.search) query.push(`searchQuery=${encodeURIComponent(params.search)}`);
    if (params?.status && params.status !== 'all') {
      query.push(`status=${encodeURIComponent(params.status)}`);
    }
    if (params?.page) query.push(`page=${params.page}`);
    const queryString = query.length ? `?${query.join("&")}` : "";

    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/getAllLeads${queryString}`);
    
    if (response.status === 200) {
      console.log(response)
      dispatch(setLeads(response.data.data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchLeadById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/getLead/${id}`);
    const data: Lead = response.data;
    if (response.status === 200) {
      dispatch(setSelectedLead(data));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// Updated to handle loading state and return value
export const addLead = (lead: Lead) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/addLead`, lead);
    dispatch(setLoading(false));
    if (response.status === 201) {
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

export const addManyLeads = (leads: Lead[]) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/addManyLead`, leads);
    dispatch(setLoading(false));  
    if (response.status === 201) {
      // console.log(response.data)
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


// Updated to handle loading state and return value
export const updateLead = (id: string, lead: Lead) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/updateLead/${id}`, lead);
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

// Updated to handle loading state and return value
export const deleteLead = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/deleteLead/${id}`);
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

export const deleteManyLeads = (ids: string[]) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/deleteManyLeads`, { data: { ids } });
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



// New thunk to fetch a lead by transactionId
export const fetchLeadsByTransactionId = (transactionId: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/leads/getLeadByTransactionId/${transactionId}`);
    
    if (response.status === 200) {
      // The backend returns { data: [Lead, Lead, ...] } or { data: [] }
      const leadsArray: Lead[] = response.data.data;

      // We will now use the `setLeads` reducer to update the main data list.
      // This treats the action as a "search" and updates the UI accordingly.
      dispatch(setLeads({
        leads: leadsArray,
        totalLeads: leadsArray.length,
        totalPages: 1, // Since this is a direct search, it's a single page of results
        currentPage: 1,
      }));

    } else {
      dispatch(setError(response.data.message || 'Failed to fetch leads by transaction ID'));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const selectLeads = (state: RootState) => state.leads.data;
export const selectLeadById = (state: RootState) => state.leads.selectedLead;
export const selectLoading = (state: RootState) => state.leads.loading;
export const selectError = (state: RootState) => state.leads.error;
export const selectPagination = (state: RootState) => state.leads.pagination;
export const selectCurrentPage = (state: RootState) => state.leads.pagination.currentPage;
export const selectTotalPages = (state: RootState) => state.leads.pagination.totalPages;
export const selectTotalLeads = (state: RootState) => state.leads.pagination.totalLeads;
export const selectTotalLeadsCount = (state: RootState) => state.leads.totalLeadsCount;

export default leadSlice.reducer;