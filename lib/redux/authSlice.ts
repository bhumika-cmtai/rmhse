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
  profileImage?: string;
  fatherName? : string;
  role: string;
  roleId?: string[];
  joinId? :string;
  status: string;
  createdOn: string;
  updatedOn: string;
  memberId?: string;
  refferedBy: string;
  signupStep?: string;
  // leaderCode?: string;
  // work_experience?: string;
  // abhi_aap_kya_karte_hai?: string;
  // bio?: string;
  // age?: number;
  account_number?: string;
  Ifsc?: string;
  upi_id?: string;
  income?: number;
  permanentAddress?: string;
  currentAddress?: string;
  dob?: string;
  gender?: string;
  emergencyNumber?: string;
  pancard?: string;
  adharFront?: string;
  adharBack?: string;
  limit?: number;
  //session
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  usersCount: number;
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
  usersCount: 0,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setUser: (state, action) => {
      // console.log("setUser reducer called with payload:", action.payload);
      state.user = action.payload;
      state.isAuthenticated = !!action.payload;
      state.isLoading = false;
      state.error = null;
      // console.log("Updated state:", { user: state.user, isAuthenticated: state.isAuthenticated });
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
    setUsersCount: (state, action) => {
      state.usersCount = action.payload;
    },
  },
});

export const { setUser, setIsLoading, setError, logoutUser, setUsersCount } = authSlice.actions;

// --- MODIFICATION START ---
// Updated login thunk to accept `rememberMe` and set the cookie directly.
export const login = ({ joinId, password, rememberMe }: { joinId: string; password: string; rememberMe: boolean }) => async (dispatch: Dispatch) => {
  // --- MODIFICATION END ---
    dispatch(setIsLoading(true));
    dispatch(setError(null));
    try {
      // --- MODIFICATION START ---
      // Send `joinId` in the request body
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/login`, { joinId, password });
      // --- MODIFICATION END ---
      
      if (response.data) {
        const { user, token } = response.data.data;
        
        if (user.status !== 'active') {
          const errorMessage = "Your account is currently blocked or inactive. Please contact support.";
          dispatch(setError(errorMessage));
          return null;
        }
  
        // Cookie logic remains the same
        const cookieOptions: Cookies.CookieAttributes = { sameSite: 'lax' };
        if (rememberMe) {
          cookieOptions.expires = 30; 
        }
        
        Cookies.set('auth-token', token, cookieOptions);
        dispatch(setUser(user));
        return user;
      } else {
        const errorMessage = response.data?.errorMessage || "Login failed.";
        dispatch(setError(errorMessage));
        return null;
      }
    } catch (error: any) {
      // console.log(error.response?.data?.errorMessage)
      const message = error.response?.data?.errorMessage || error.response?.data?.message || error.message || "An unknown error occurred.";
      dispatch(setError(message));
      return null;
    } 
  };
  

// NEW: Signup thunk
export const signup = (userData: { name: string; email: string; password: string; phoneNumber: string; dob?: string;fatherName?: string ;status?: string;}) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  dispatch(setError(null));
  // console.log()
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/auth/signup`, userData);
    if (response.data) {
      // console.log(response.data)
      const { user, token, redirect } = response.data.data;
      
      // Set the cookie
      const cookieOptions: Cookies.CookieAttributes = {
        sameSite: 'lax',
        expires: 30, // 30 days for signup
      };
      
      Cookies.set('auth-token', token, cookieOptions);
      dispatch(setUser(user));
      // console.log(user)
      // return user;
      return { redirect: redirect || '/upload-details' , responseUser: user};

    }
    else {
      const errorMessage = response.data?.errorMessage || "Failed to signup. Try again.";
      
      dispatch(setError(errorMessage ));
      return null;
    }
  } catch (error: any) {
    const message = error.response?.data?.errorMessage || error.errorMessage || "An unknown error occurred.";
    // console.log(error)
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
export const updateUserProfile = (formData: FormData) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  const token = Cookies.get('auth-token');
  try {
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/update-profile`, 
      formData, // <-- Send the FormData object directly
      {
        headers: { 
          'Authorization': `Bearer ${token}`,
          // DO NOT set 'Content-Type': 'multipart/form-data'. 
          // Axios and the browser will do this automatically for FormData.
        },
        withCredentials: true
      }
    );
    dispatch(setUser(response.data.data)); // Update user state with fresh data
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to update profile.";
    dispatch(setError(message));
    return null;
  }
};
// 4. NEW THUNK: Update user's profile details (No changes needed here)
export const updateUserDetails = (profileData: Partial<User>) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  const token = Cookies.get('auth-token');
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/update-details`, profileData, {
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

export const updateUser = (id: string, userData: Partial<User>) => async (dispatch: Dispatch) => {
  // 1. Set loading state to true
  // dispatch(setLoading(true));
  
  // 2. Get the authentication token from cookies for the protected admin route
  // const token = Cookies.get('auth-token');
  // if (!token) {
  //   const message = "Authentication failed. Please log in again.";
  //   dispatch(setError(message));
  //   return null;
  // }

  try {
    // 3. Make the API call to the admin update endpoint
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/update-user/${id}`, 
      userData
    );

    // 4. On success, dispatch an action to update the user in the Redux state
    //    and let the reducer handle setting loading to false.
    // dispatch(updateUserInList(response.data.data)); // Assumes the updated user is in `response.data.data`
    
    return response.data;

  } catch (error: any) {
    // 5. On failure, dispatch an error action
    const message = error.response?.data?.message || "Failed to update user.";
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

// NEW: Update user's documents
export const updateDocuments = (documentData: { pancard?: string; adharFront?: string; adharBack?: string }) => async (dispatch: Dispatch) => {
  dispatch(setIsLoading(true));
  const token = Cookies.get('auth-token');
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/update-document`, documentData, {
      headers: { 'Authorization': `Bearer ${token}` },
      withCredentials: true
    });
    dispatch(setUser(response.data.data)); // Update user state with fresh data
    return response.data;
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to update documents.";
    dispatch(setError(message));
    return null;
  }
};

// NEW: Get users count
export const getUsersCount = () => async (dispatch: Dispatch) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getUsersCount`);
    if (response.data && response.data.data) {
      dispatch(setUsersCount(response.data.data.count));
    }
  } catch (error: any) {
    console.error("Error fetching users count:", error);
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


// =================================================================
// NEW THUNK: Upgrade User's Role
// =================================================================
export const upgradeUserRole = () => async (dispatch: Dispatch) => {
  // Use the main auth loading state, but you could create a specific one
  dispatch(setIsLoading(true)); 
  const token = Cookies.get('auth-token');

  if (!token) {
    dispatch(setError("Authentication required to upgrade role."));
    return null;
  }

  try {
    // This backend endpoint needs to be created.
    // It should identify the user by the token and handle the upgrade logic internally.
    const response = await axios.put(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/upgrade-role`, 
      {}, // No body needed; user is identified by token
      {
        headers: { 'Authorization': `Bearer ${token}` }
      }
    );

    // If the upgrade is successful, the backend returns the updated user object.
    if (response.data ) {
      // Dispatch setUser to update the user state everywhere in the app.
      dispatch(setUser(response.data.data)); 
      // The setUser action automatically sets isLoading to false.
      return response.data.data; // Return the updated user for toast messages, etc.
    } else {
       throw new Error(response.data.message || "An unknown error occurred during upgrade.");
    }
  } catch (error: any) {
    const message = error.response?.data?.message || "Failed to upgrade role.";
    dispatch(setError(message)); // setError will set isLoading to false
    return null;
  }
};


// Selectors (No changes needed)
export const selectUser = (state: RootState) => state.auth.user;
export const selectIsAuthenticated = (state: RootState) => state.auth.isAuthenticated;
export const selectIsLoading = (state: RootState) => state.auth.isLoading;
export const selectError = (state: RootState) => state.auth.error;
export const selectUsersCount = (state: RootState) => state.auth.usersCount;

export default authSlice.reducer;