// src/lib/redux/linkSlice.ts

import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

// Interface for a single portal link object
export interface PortalLink {
  _id: string;
  portalName: string;
  link: string;
  commission?: string; // **** NEW: Added optional commission field ****
}

// Interface for the state managed by this slice
interface LinkState {
  links: PortalLink[];
  isLoading: boolean;
  error: string | null;
}

const initialState: LinkState = {
  links: [],
  isLoading: false,
  error: null,
};

const linkSlice = createSlice({
  name: "links",
  initialState,
  reducers: {
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setLinks: (state, action) => {
      state.links = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    addLinkSuccess: (state, action) => {
      state.links.push(action.payload);
      state.isLoading = false;
    },
    updateLinkSuccess: (state, action) => {
      const index = state.links.findIndex(link => link._id === action.payload._id);
      if (index !== -1) {
        state.links[index] = action.payload;
      }
      state.isLoading = false;
    },
    deleteLinkSuccess: (state, action) => {
      // The payload will be the ID of the deleted link
      state.links = state.links.filter(link => link._id !== action.payload);
      state.isLoading = false;
    },
  },
});

export const {
  setIsLoading,
  setError,
  setLinks,
  addLinkSuccess,
  updateLinkSuccess,
  deleteLinkSuccess
} = linkSlice.actions;

// --- ASYNC THUNKS (API ACTIONS) ---

// Assumes an endpoint exists to get all links, e.g., GET /v1/link/all
export const fetchAllLinks = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/link/all`);
    console.log(response.data.data)
    dispatch(setLinks(response.data.data));
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch portal links.";
    dispatch(setError(message));
  }
};

// POST - /v1/link/add
// **** MODIFIED: Added commission to the data type ****
export const createPortalLink = (data: { portalName: string; link: string; commission?: string }) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/link/add`, data);
    dispatch(addLinkSuccess(response.data.data));
    return response.data; // Return for component-level feedback
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to create portal link.";
    dispatch(setError(message));
    return null;
  }
};

// PATCH - /v1/link/:id
// **** MODIFIED: Added commission to the data type, made fields optional for partial updates ****
export const updatePortalLink = (id: string, data: {portalName?:string, link?: string; commission?: string }) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/link/${id}`, data);
    dispatch(updateLinkSuccess(response.data.data));
    return response.data;
  } catch (error: any)
  {
    const message = error.response?.data?.message || "Failed to update portal link.";
    dispatch(setError(message));
    return null;
  }
};

export const fetchLinkBySlug = (slug: string) => 
  async (dispatch: Dispatch): Promise<PortalLink | null> => {
    
    dispatch(setIsLoading(true));
    dispatch(setError(null));

    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/link/portal/${slug}`
        );
        
        if (response.data && response.data.data) {
            return response.data.data;
        } else {
            throw new Error("Link data not found in API response.");
        }

    } catch (error: any) {
        const message = error.response?.data?.message || `Failed to fetch link for ${slug}.`;
        dispatch(setError(message));
        
        return null;
    } finally {
        dispatch(setIsLoading(false));
    }
};

export const fetchCommissionByPortal = async (portalName: string): Promise<number> => {
    try {
        const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/link/portal/${portalName}/commission`);
        
        if (response.data?.data?.commission) {
            const commissionValue = parseFloat(response.data.data.commission);
            if (!isNaN(commissionValue)) {
                return commissionValue;
            }
        }
        // If we reach here, the commission was missing or not a number
        throw new Error(`No valid commission found for portal: ${portalName}`);
    } catch (error: any) {
        console.error(`Error fetching commission for ${portalName}:`, error);
        // Re-throw a clean, user-friendly error message
        const message = error.response?.data?.message || error.message || `Could not fetch commission for ${portalName}.`;
        throw new Error(message);
    }
};

export const deletePortalLink = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/link/${id}`);
    // Remove the deleted link from state
    // dispatch(setLinks((prevLinks: PortalLink[]) => prevLinks.filter(link => link._id !== id)));
    dispatch(deleteLinkSuccess(id));    
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to delete portal link.";
    dispatch(setError(message));
    return null;
  }
};

// --- SELECTORS ---
export const selectAllLinks = (state: RootState) => state.links.links;
export const selectLinksLoading = (state: RootState) => state.links.isLoading;
export const selectLinksError = (state: RootState) => state.links.error;

export default linkSlice.reducer;