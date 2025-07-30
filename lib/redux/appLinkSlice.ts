// src/lib/redux/applinkSlice.ts

import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import { toast } from "sonner";

// Interface for a single AppLink object based on your Mongoose model
export interface AppLink {
  _id: string;
  appName: string;
  password?: string; // Password can be optional in some contexts
  link: string;
  createdAt?: string;
  updatedAt?: string;
}

// Interface for the state managed by this slice
interface AppLinkState {
  appLinks: AppLink[];
  isLoading: boolean;
  error: string | null;
}

const initialState: AppLinkState = {
  appLinks: [],
  isLoading: false,
  error: null,
};

const applinkSlice = createSlice({
  name: "applinks",
  initialState,
  reducers: {
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    setAppLinks: (state, action) => {
      state.appLinks = action.payload;
      state.isLoading = false;
      state.error = null;
    },
    updateAppLinkSuccess: (state, action) => {
      const index = state.appLinks.findIndex(link => link._id === action.payload._id);
      if (index !== -1) {
        // Replace the old link with the updated one from the server
        state.appLinks[index] = action.payload;
      }
      state.isLoading = false;
    },
  },
});

export const {
  setIsLoading,
  setError,
  setAppLinks,
  updateAppLinkSuccess,
} = applinkSlice.actions;

// --- ASYNC THUNKS (API ACTIONS) ---

// GET /v1/applink/all
export const fetchAllAppLinks = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/applink/all`);
    console.log(response.data.data)
    dispatch(setAppLinks(response.data.data));
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to fetch app links.";
    dispatch(setError(message));
    toast.error(message);
  }
};

// PATCH /v1/applink/:id
export const updateAppLink = (id: string, data: Partial<Omit<AppLink, '_id'>>) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  try {
    const response = await axios.patch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/applink/${id}`, data);
    dispatch(updateAppLinkSuccess(response.data.data));
    toast.success("App link updated successfully!");
    return response.data; // Return for component-level feedback (e.g., closing a modal)
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to update app link.";
    dispatch(setError(message));
    toast.error(message);
    return null;
  }
};

// verify the password of the app and get the link access
export const verifyCredentialsAndGetLink = (credentials: { appName: string; password: string; }) => 
  async (dispatch: Dispatch): Promise<string | null> => {
    
    dispatch(setIsLoading(true));
    dispatch(setError(null)); // Clear previous errors before a new attempt

    try {
        const response = await axios.post(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/applink/get-link`,
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
export const selectAllAppLinks = (state: RootState) => state.applinks.appLinks;
export const selectAppLinksLoading = (state: RootState) => state.applinks.isLoading;
export const selectAppLinksError = (state: RootState) => state.applinks.error;

export default applinkSlice.reducer;