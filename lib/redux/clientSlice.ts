import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { fetchCommissionByPortal } from "./linkSlice"; 

export interface Client {
  _id?: string;
  name: string;
  email?: string;
  phoneNumber: string;
  ownerName?: string[]; 
  ownerNumber?: string[];
  // city?: string;
  // age?: number;
  status: string;
  portalName?: string;
  ekyc_stage?: string;
  trade_status?: string;
  reason?: string;
  // leaderCode?: string;
  createdOn?: string;
  updatedOn?: string;
  isApproved?: boolean;
}

export interface GroupedClients {
  portalName: string | null; // portalName can be null
  clients: Client[];
}


export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalClients: number;
}

interface ClientState {
  data: Client[];
  loading: boolean;
  error: string | null;
  selectedClient: Client | null;
  pagination: Pagination;
  portalNames: string[];
  clientsByOwner: GroupedClients[];
}

const initialState: ClientState = {
  data: [],
  loading: false,
  error: null,
  selectedClient: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalClients: 0,
  },
  portalNames: [],
  clientsByOwner: []
  };  

const clientSlice = createSlice({
  name: "clients",
  initialState,
  reducers: {
    setClients: (state, action) => {
      state.data = action.payload.clients;
      state.pagination.totalClients = action.payload.totalClients;
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
    setSelectedClient: (state, action) => {
      state.selectedClient = action.payload;
    },
    clearSelectedClient: (state) => {
      state.selectedClient = null;
    },
    setPortalNames: (state, action) => { // <-- NEW: Reducer to set portal names
      state.portalNames = action.payload;
    },
    setClientsByOwner: (state, action) => {
      state.clientsByOwner = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
}); 

export const { setClients, setLoading, setError, setSelectedClient, clearSelectedClient, setPagination, setCurrentPage,setPortalNames,setClientsByOwner } = clientSlice.actions;

export const fetchClients = (params: { 
  searchQuery?: string; 
  status?: string; 
  portalName?: string; // <-- ADD THIS
  page?: number; 
}) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', String(params.page));
    if (params.status && params.status !== 'all') queryParams.append('status', params.status);
    if (params.searchQuery) queryParams.append('searchQuery', params.searchQuery);
    // MODIFIED: Add portalName to the query if it exists
    if (params.portalName && params.portalName !== 'all') { // <-- ADD THIS BLOCK
      queryParams.append('portalName', params.portalName);
    }

    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/getAllClient?${queryParams.toString()}`);

    if (response.data && response.data.data) {
      dispatch(setClients(response.data.data));
    } else {
      dispatch(setError(response.data.message || "Failed to fetch clients"));
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Unknown error occurred";
    dispatch(setError(message));
  }
};



export const fetchClientById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/getClient/${id}`);
    const data: Client = response.data;
    if (response.status === 200) {
      dispatch(setSelectedClient(data));    
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const addClient = (client: Client) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/addClient`, client);
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

export const updateClient = (id: string, clientData: Partial<Client>) => async (dispatch: Dispatch) => {
  // The service only needs the fields to update, not the whole object
  dispatch(setLoading(true));
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/updateClient/${id}`, clientData);
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

export const deleteClient = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/deleteClient/${id}`);
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

export const deleteManyClients = (ids: string[]) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/deleteManyClients`, { data: { ids } });
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
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/getPortalNames`);
    if (response.data && response.data.data) {
      dispatch(setPortalNames(response.data.data));
    }
  } catch (error: any) {
    console.log("Failed to fetch portal names:", error.message);
    // Optionally dispatch an error action
  }
};

export const fetchClientsByOwner = (phoneNumber: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/getClientsByOwner/${phoneNumber}`);
    if (response.data && response.data.data) {
      console.log(response.data)
      dispatch(setClientsByOwner(response.data.data));
    } else {
      dispatch(setError(response.data.message || "Failed to fetch owner's clients"));
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Unknown error occurred";
    dispatch(setError(message));
  }
}

export const distributeCommissionForClient = (params: { clientId: string; portalName: string; }) => 
  async (dispatch: Dispatch) => {
    const { clientId, portalName } = params;

    try {
      // Step 1: Fetch the commission amount. This will throw an error if it fails.
      const commission = await fetchCommissionByPortal(portalName);
      
      // Step 2: If step 1 succeeds, call the distribution API.
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/${clientId}/distribute-commission`,
        { commission } // Send commission in the request body
      );

      if (response.data) {
        // On success, we just return the data. The component will know it succeeded
        // because no error was dispatched.
        return response.data;
      } else {
        // Handle cases where the API returns a non-200 status without throwing
        const message = response.data.message || "Failed to distribute commission.";
        dispatch(setError(message));
        return null;
      }
    } catch (error: any) {
      // This single catch block handles errors from BOTH fetchCommissionByPortal AND the axios.post call.
      const message = error.message || "An unexpected error occurred while distributing the commission.";
      dispatch(setError(message));
      return null;
    }
};

export const addManyClients = (clients: Client[]) => async (dispatch: Dispatch) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/clients/addManyClient`, clients);
    if (response.status === 201) {
      return response.data;
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};


export const selectClients = (state: RootState) => state.clients.data;
export const selectClientById = (state: RootState) => state.clients.selectedClient;
export const selectLoading = (state: RootState) => state.clients.loading;
export const selectError = (state: RootState) => state.clients.error;
export const selectPagination = (state: RootState) => state.clients.pagination;
export const selectCurrentPage = (state: RootState) => state.clients.pagination.currentPage;
export const selectTotalPages = (state: RootState) => state.clients.pagination.totalPages;
export const selectTotalClients = (state: RootState) => state.clients.pagination.totalClients;
export const selectPortalNames = (state: RootState) => state.clients.portalNames
export const selectClientsByOwner = (state: RootState) => state.clients.clientsByOwner;

export default clientSlice.reducer;