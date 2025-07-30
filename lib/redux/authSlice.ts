import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";
import Cookies from 'js-cookie';

// 1. EXPAND User interface to match your Mongoose schema exactly
export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string; // Should not be stored in frontend state, but good to have in type
  phoneNumber: string;
  whatsappNumber?: string;
  city?: string;
  role: string;
  status: string;
  createdOn: string;
  updatedOn: string;
  leaderCode?: string;
  work_experience?: string;
  abhi_aap_kya_karte_hai?: string;
  bio?: string;
  age?: number;
  account_number?: string;
  Ifsc?: string;
  upi_id?: string;
  income?: number;
  //session
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface GlobalSession {
    _id: string;
    name: string;
    sessionStartDate?: string;
    sessionStartTime?: string;
    sessionEndDate?: string;
    sessionEndTime?: string;
    isActive?: boolean;
    createdAt: string;
    updatedAt: string;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      state.error = null;
    },
    setIsLoading: (state, action) => {
      state.isLoading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.isLoading = false;
    },
    logoutUser: (state) => {
      state.user = null;
      state.isAuthenticated = false;
      state.error = null;
      Cookies.remove('auth-token'); // Also remove the cookie on logout
    },
  },
});

export const { setUser, setIsLoading, setError, logoutUser } = authSlice.actions;

// --- MODIFICATION START ---
// Updated login thunk to accept `rememberMe` and set the cookie directly.
export const login = ({ email, password, rememberMe }: { email: string; password: string; rememberMe: boolean }) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  dispatch(setError(null));
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, { email, password });
    if (response.status === 200 && response.data?.data?.user && response.data?.data?.token) {
      const { user, token } = response.data.data;
    // const x = token ? JSON.parse(decodeURIComponent(token)) : null;
    // console.log(x)
      
      // console.log(user, token)
      // Set the cookie here inside the thunk for reliability
      // 1. Define the base cookie options
      const cookieOptions: Cookies.CookieAttributes = {
        sameSite: 'lax',
        // secure: process.env.NODE_ENV !== 'development' // Optional
      };

      // 2. Conditionally add the 'expires' property ONLY if rememberMe is true
      if (rememberMe) {
        // This now matches your backend's 30-day token expiration
        cookieOptions.expires = 30; 
      }
      
      // If rememberMe is false, 'expires' is NOT added, creating a session cookie
      // that is deleted when the browser closes.

      // 3. Set the cookie with the dynamic options
      Cookies.set('auth-token', token, cookieOptions);
       
      dispatch(setUser(user));
      return user; // Return the user object on success
    } else {
      const errorMessage = response.data?.errorMessage || "Login failed.";
      dispatch(setError(errorMessage));
      return null;
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "An unknown error occurred.";
    dispatch(setError(message));
    return null;
  } 
};
// --- MODIFICATION END ---


// 2. NEW THUNK: Fetch current user's full details (No changes needed here)
export const fetchCurrentUser = () => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  const token = Cookies.get('auth-token');
  // console.log(token)
  if (!token) {
    dispatch(setError("Authentication token not found. Please log in."));
    // We set isLoading to false via the setError reducer
    return;
  }
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/me`, {
  headers: {
    'Authorization': `Bearer ${token}`,
  },
  withCredentials: true,
});

    dispatch(setUser(response.data.data));
  } catch (error: any) {
    const message = error.response?.data?.message || "Could not fetch user details.";
    dispatch(setError(message));
    if(error.response?.status === 401) { // If token is invalid/expired
        dispatch(logoutUser());
    }
  }
};

// 3. NEW THUNK: Update user's profile details (No changes needed here)
export const updateUserProfile = (profileData: Partial<User>) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  const token = Cookies.get('auth-token');
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/update-profile`, profileData, {
       headers: { 'Authorization': `Bearer ${token}` },
       withCredentials: true
    });
    dispatch(setUser(response.data.data)); // Update user state with fresh data from backend
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to update profile.";
    dispatch(setError(message));
    return null;
  }
};

// 4. NEW THUNK: Update user's bank details (No changes needed here)
export const updateBankDetails = (bankData: Partial<User>) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  const token = Cookies.get('auth-token');
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/update-bank`, bankData, {
      headers: { 'Authorization': `Bearer ${token}` },withCredentials:true
    });

    dispatch(setUser(response.data.data)); // Update user state with fresh data
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to update bank details.";
    dispatch(setError(message));
    return null;
  }
};

// 5. Update user's session details
// NOTE: This assumes you have a backend endpoint at PUT /users/update-session
export const updateSessionDetails = (sessionData: Partial<GlobalSession>) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  const token = Cookies.get('auth-token');
  try {
    // The endpoint is now `/global-session`
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/session`, 
      sessionData, 
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );
    // console.log(response.data)

    // IMPORTANT: We NO LONGER dispatch `setUser`. The session is not part of the user object.
    // Instead, we just stop the loading indicator and return the data.
    dispatch(setIsLoading(false));

    // Return the updated session data so the component can use it.
    return response.data.data;

  } catch (error: any) {
    // The error handling remains the same. setError will set isLoading to false.
    const message = error.response?.data?.message || "Failed to update session details.";
    dispatch(setError(message));
    return null;
  }
};

// FETCH SESSION
export const fetchSession = () => async (dispatch: Dispatch) => {
    dispatch(setIsLoading(true));
    const token = Cookies.get('auth-token');
    try {
        const response = await axios.get(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/session`, 
            {
                headers: { 'Authorization': `Bearer ${token}` }
            }
        );
        
        // Stop loading and return the fetched data.
        dispatch(setIsLoading(false));
        // console.log(response.data)
        return response.data.data; // This will be the session object or null

    } catch (error: any) {
        const message = error.response?.data?.message || "Could not fetch session details.";
        dispatch(setError(message));
        return null;
    }
};

export const loginLeader = ({ password }: { password: string }) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  dispatch(setError(null)); // Clear any previous errors

  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login/leader`, { password });

    dispatch(setIsLoading(false)); // Manually set loading to false on success.
    return true; 

    // Set cookie for session management
    // Cookies.set('user-token', token, {
    //   expires: 7, // Set a 7-day expiry for the leader token
    //   sameSite: 'lax',
    // });
    
    // Set the user in the Redux state
    // dispatch(setUser(user));
    
    // Return the user object on success to signal completion to the component
    // return user; 

  } catch (error: any) {
    // Extract the error message from the API response if available
    const message = error.response?.data?.message || error.message || "An unknown error occurred.";
    dispatch(setError(message));
    return null; // Return null on failure
  } 
};



// Selectors (No changes needed)
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectError = (state: RootState) => state.auth.error;

export default authSlice.reducer;