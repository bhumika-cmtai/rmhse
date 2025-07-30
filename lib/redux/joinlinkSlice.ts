// src/lib/redux/joinLink.ts

import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { toast } from "sonner";

// Interface for a single Joinlink object based on your Mongoose model
export interface Joinlink {
  _id: string;
  appName: string;
  link: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface for the state managed by this slice
interface JoinlinkState {
  joinLinks: Joinlink[];
  isLoading: boolean;
  error: string | null;
}

const initialState: JoinlinkState = {
  joinLinks: [],
  isLoading: false,
  error: null,
};

const joinlinkSlice = createSlice({
  name: "joinlinks",
  initialState,
  reducers: {
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setJoinlinks: (state, action) => {
      state.joinLinks = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateJoinlinkSuccess: (state, action) => {
      const index = state.joinLinks.findIndex(link => link._id === action.payload._id);
      if (index !== -1) {
        // Replace the old link with the updated one from the server
        state.joinLinks[index] = action.payload;
      }
      state.isLoading = false;
    },
  },
});

export const {
  setIsLoading,
  setError,
  setJoinlinks,
  updateJoinlinkSuccess,
} = joinlinkSlice.actions;

// --- ASYNC THUNKS (API ACTIONS) ---

/**
 * GET /joinlinks/all
 * Fetches all join links.
 */
export const fetchAllJoinlinks = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/joinlinks/all`);
    dispatch(setJoinlinks(response.data.data));
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch join links.";
    dispatch(setError(message));
    toast.error(message);
  }
};

/**
 * PATCH /joinlinks/:id
 * Updates a specific join link.
 */
export const updateJoinlink = (id: string, data: { link: string }) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    // Corrected URL from '/applink/:id' to '/joinlinks/:id'
    const response = await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/joinlinks/${id}`, data);
    dispatch(updateJoinlinkSuccess(response.data.data));
    toast.success("Join link updated successfully!");
    return response.data; // Return for component-level feedback (e.g., closing a modal)
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to update join link.";
    dispatch(setError(message));
    toast.error(message);
    return null;
  }
};

/**
 * POST /joinlinks/get-link
 * Verifies the appName and gets the link.
 */
export const verifyCredentialsAndGetLink = (credentials: { appName: string }) => 
  async (dispatch: Dispatch): Promise<string | null> => {
    
    dispatch(setIsLoading(true));
    dispatch(setError(null)); // Clear previous errors before a new attempt

    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/joinlinks/get-link`,
            credentials
        );
        
        // On success, return the link to the calling component
        if (response.data && response.data.data.link) {
            toast.success("Credentials verified!");
            return response.data.data.link; 
        } else {
            // Handle cases where the API gives a 200 but the data is malformed
            throw new Error("Link not found in API response.");
        }

    } catch (error: any) {
        const message = error.response?.data?.message || "Invalid credentials or server error.";
        dispatch(setError(message));
        toast.error(message);
        return null; // Signal failure to the calling component
    } finally {
        dispatch(setIsLoading(false)); // Ensure loading is always turned off
    }
};


// --- SELECTORS ---
export const selectAllJoinlinks = (state: RootState) => state.joinlink.joinLinks;
export const selectJoinlinksLoading = (state: RootState) => state.joinlink.isLoading;
export const selectJoinlinksError = (state: RootState) => state.joinlink.error;

export default joinlinkSlice.reducer;