import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

export interface Linkclick {
  _id?: string;
  name: string;
  email?: string;
  phoneNumber: string;
  status: string;
  portalName?: string;
  reason?: string;
  leaderCode?: string;
  createdOn?: string;
  updatedOn?: string;
}


export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalLinkclicks: number;
}

interface LinkclickState {
  data: Linkclick[];
  loading: boolean;
  error: string | null;
  selectedLinkclick: Linkclick | null;
  pagination: Pagination;
  portalNames: string[];
}

const initialState: LinkclickState = {
  data: [],
  loading: false,
  error: null,
  selectedLinkclick: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalLinkclicks: 0,
  },
  portalNames: [],
  };  

const linkclickSlice = createSlice({
  name: "linkclicks",
  initialState,
  reducers: {
    setLinkclicks: (state, action) => {
      state.data = action.payload.linkclicks;
      state.pagination.totalLinkclicks = action.payload.totalLinkclicks;
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
    setSelectedLinkclick: (state, action) => {
      state.selectedLinkclick = action.payload;
    },
    clearSelectedLinkclick: (state) => {
      state.selectedLinkclick = null;
    },
    setPortalNames: (state, action) => { // <-- NEW: Reducer to set portal names
      state.portalNames = action.payload;
    },
  },
}); 

export const { setLinkclicks, setLoading, setError, setSelectedLinkclick, clearSelectedLinkclick, setPagination, setCurrentPage,setPortalNames } = linkclickSlice.actions;

export const fetchLinkclicks = (params: { 
  name?: string; 
  phoneNumber?: string;   // Added
  leaderCode?: string;
  status?: string; 
  portalName?: string;
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
    if (params.portalName && params.portalName !== 'all') {
      queryParams.append('portalName', params.portalName);
    }

    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/linkclicks/getAllLinkclick?${queryParams.toString()}`);

    if (response.data && response.data.data) {
      dispatch(setLinkclicks(response.data.data));
    } else {
      dispatch(setError(response.data.message || "Failed to fetch link clicks"));
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Unknown error occurred";
    dispatch(setError(message));
  }
};



export const fetchLinkclickById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/linkclicks/getLinkclick/${id}`);
    const data: Linkclick = response.data;
    if (response.status === 200) {
      dispatch(setSelectedLinkclick(data));    
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const addLinkclick = (linkclick: Linkclick) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/linkclicks/addLinkclick`, linkclick);
    if (response.status === 201) {
      console.log(response.data)
      return response.data;
    } else {
      dispatch(setError(response.data.message));
      console.log(response.data)
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const updateLinkclick = (id: string, linkclickData: Partial<Linkclick>) => async (dispatch: Dispatch) => {
  // The service only needs the fields to update, not the whole object
  dispatch(setLoading(true));
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/linkclicks/updateLinkclick/${id}`, linkclickData);
    dispatch(setLoading(false)); // Turn off loading after call
    if (response.status === 200) {
      return response.data; // Return data on success
    } else {
      dispatch(setError(response.data.message));
      return null; // Return null on failure
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Unknown error";
    dispatch(setError(message));
    dispatch(setLoading(false));
    return null; // Return null on error
  }
};

export const deleteLinkclick = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/linkclicks/deleteLinkclick/${id}`);
    if (response.status === 200) {
      return response.data;   
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const deleteManyLinkclicks = (ids: string[]) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/linkclicks/deleteManyLinkclicks`, { data: { ids } });
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

export const fetchPortalNames = () => async (dispatch: Dispatch) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/linkclicks/getPortalNames`);
    if (response.data && response.data.data) {
      dispatch(setPortalNames(response.data.data));
    }
  } catch (error: any) {
    console.error("Failed to fetch portal names:", error.message);
    // Optionally dispatch an error action
  }
};

export const selectLinkclicks = (state: RootState) => state.linkclicks.data;
export const selectLinkclickById = (state: RootState) => state.linkclicks.selectedLinkclick;
export const selectLoading = (state: RootState) => state.linkclicks.loading;
export const selectError = (state: RootState) => state.linkclicks.error;
export const selectPagination = (state: RootState) => state.linkclicks.pagination;
export const selectCurrentPage = (state: RootState) => state.linkclicks.pagination.currentPage;
export const selectTotalPages = (state: RootState) => state.linkclicks.pagination.totalPages;
export const selectTotalLinkclicks = (state: RootState) => state.linkclicks.pagination.totalLinkclicks;
export const selectPortalNames = (state: RootState) => state.linkclicks.portalNames

export default linkclickSlice.reducer;