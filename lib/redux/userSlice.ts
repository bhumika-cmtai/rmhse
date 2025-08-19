import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios, { AxiosError } from "axios";
import { RootState } from "../store";
import Cookies from 'js-cookie';

export interface userIdInterface {
  name: string,
  _id: string
}

export interface User {
  _id?: string;
  name?: string;
  email?: string;
  password?: string; // Should generally not be sent to the client
  phoneNumber?: string;
  emergencyNumber?: string;
  permanentAddress?: string;
  currentAddress?: string;
  gender?: string;
  joinId? :string;
  roleId?: string[];
  signupStep?:string;
  withdrawRequest?: string[];
  extendRequest?: string[];
  limit?: number;
  role?: string;
  fatherName?: string;
  adharFront?: string; // URL to the image
  adharBack?: string;  // URL to the image
  pancard?: string;    // URL to the image
  refferedBy?: string;
  memberId?: string;
  status?: string;
  createdOn?: string; // This is a timestamp string, e.g., "1754374692923"
  updatedOn?: string;
  income?: number;
  dob?: string;
  account_number?: string;
  Ifsc?: string; // Note the capitalization from the schema
  upi_id?: string;
  // This field was in your component, adding it here for consistency.
  profileImage?: string; 
}
// --- END OF UPDATED INTERFACE ---

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
}

export interface CommissionHistory {
  amount: number;
  sourceUserName: string;
  sourceUserLatestRoleId: string;
}


export interface UserState {
  data: User[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
  pagination: Pagination;
  totalUsersCount: number;
  totalIncome: number;
  commissionHistory: CommissionHistory[];
}

const initialState: UserState = {
  data: [],
  loading: false,
  error: null,
  selectedUser: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
  },
  totalUsersCount: 0,
  totalIncome: 0,
  commissionHistory: [],
};




const userSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    setUsers: (state, action) => {
      state.data = action.payload.users;
      state.pagination.totalPages = action.payload.totalPages;
      state.pagination.totalUsers = action.payload.totalUsers;
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
    setSelectedUser: (state, action) => {
      state.selectedUser = action.payload;
    },
    clearSelectedUser: (state) => {
      state.selectedUser = null;
    },
    setTotalUsersCount: (state, action) => {
      state.totalUsersCount = action.payload;
    },
    setTotalIncome: (state, action) => {
      state.totalIncome = action.payload;
    },
    setCommissionHistory: (state, action) => {
      state.commissionHistory = action.payload;
      state.loading = false;
      state.error = null;
    },
  },
}); 

export const { setUsers, setLoading, setError, setSelectedUser, clearSelectedUser, setCurrentPage, setTotalUsersCount,setTotalIncome, setCommissionHistory } = userSlice.actions;

export const fetchUsersCount = () => async (dispatch: Dispatch) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getUsersCount`);
    if (response.data && response.data.data) {
      dispatch(setTotalUsersCount(response.data.data.count));
    } else {
      console.error("Failed to fetch user count:", response.data.message);
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    console.error("Error fetching user count:", message);
  }
};

export const fetchUsers = (params?: { 
  search?: string; 
  status?: string; 
  page?: number; 
  role?: string;
  month?: number; 
  year?: number; 
  limit?: number;
}) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const query = [];
    if (params?.search) query.push(`searchQuery=${encodeURIComponent(params.search)}`);
    if (params?.status && params.status !== 'all') query.push(`status=${encodeURIComponent(params.status)}`);
    if (params?.page) query.push(`page=${params.page}`);
    // MODIFIED: Add role to the query string if it exists and is not 'all'
    if (params?.role && params.role !== 'all') query.push(`role=${encodeURIComponent(params.role)}`);
    if (params?.month) query.push(`month=${params.month}`);
    if (params?.year) query.push(`year=${params.year}`);

    const queryString = query.length ? `?${query.join('&')}` : '';
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getAllUsers${queryString}`);
    
    if (response.status === 200) {
      dispatch(setUsers(response.data.data));
    } else {
      dispatch(setError(response.data.message || "Failed to fetch users"));
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    const message = (axiosError.response?.data as any)?.message || axiosError.message || "Unknown error occurred";
    dispatch(setError(message));
  }
};

export const fetchUserById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getUser/${id}`);
        const data: User = response.data.data;
    if (response.status === 200) {
      dispatch(setSelectedUser(data));    
      dispatch(setLoading(false)); 
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const addUser = (formData: FormData) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    // Axios will automatically set the correct headers for FormData
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/addUser`, formData);
    if (response.data) {
      // console.log(response.data);
      dispatch(setLoading(false));
      return response.data;
    } else {
      dispatch(setError(response.data.message));
      return null;
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError; // More specific error typing
    const message = (axiosError.response?.data as any)?.message || axiosError.message || "Unknown error occurred";
    dispatch(setError(message));
    // It's good practice to re-throw or return a rejected promise for the component to catch
    throw new Error(message);
  }
};

export const updateUser = (id: string, formData: FormData) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    // Axios will automatically set the correct headers for FormData
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/updateUser/${id}`, formData);
    if (response.data) {
      // console.log(response.data);
      dispatch(setLoading(false));
      return response.data;
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const axiosError = error as AxiosError; // More specific error typing
    const message = (axiosError.response?.data as any)?.message || axiosError.message || "Unknown error occurred";
    dispatch(setError(message));
    // It's good practice to re-throw or return a rejected promise for the component to catch
    throw new Error(message); 
  }
};


export const deleteUser = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/deleteUser/${id}`);
    if (response.status === 200) {
      dispatch(setLoading(false));
      return response.data;   
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

// New action to delete multiple users
export const deleteManyUsers = (ids: string[]) => async (dispatch: Dispatch) => {
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/deleteManyUsers`, { data: { ids } });
    if (response.data && response.data.success) {
      return true;
    }
    return false;
  } catch (error: unknown) {
    console.error("Error deleting multiple users:", error);
    return false;
  }
};

export const getCommissionHistory = (userId: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    // Get the auth token from cookies to authorize the request
    // const token = Cookies.get('auth-token'); 
    // if (!token) {
    //     throw new Error("Authentication token not found. Please log in again.");
    // }
      // console.log(token)
    // The backend route is /commission-history/:userId
    const response = await axios.get(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/users/commission-history/${userId}`,
      // { headers: { 'Authorization': `Bearer ${token}` } } // Pass the token in the header
    );
    // console.log(response)

    // Assuming the API returns a structure like { success: true, data: [...] }
    if (response.data) {
      // console.log(response.data)
      dispatch(setCommissionHistory(response.data.data));
    } else {
      dispatch(setError(response.data.message || 'Failed to fetch commission history'));
    }
  } catch (error) {
    const axiosError = error as AxiosError;
    const message = (axiosError.response?.data as any)?.message || axiosError.message || "An unknown error occurred";
    dispatch(setError(message));
  }
};


export const fetchTotalIncome = () => async (dispatch: Dispatch) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getTotalIncome`);
    // Assuming the API returns a structure like { data: { totalIncome: 50000 } }
    if (response.data && response.data.data) {
      dispatch(setTotalIncome(response.data.data.totalIncome));
    } else {
      console.error("Failed to fetch total income:", response.data.message);
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    console.error("Error fetching total income:", message);
  }
};




export const selectUsers = (state: RootState) => state.users.data;
export const selectUserById = (state: RootState) => state.users.selectedUser;
export const selectLoading = (state: RootState) => state.users.loading;
export const selectError = (state: RootState) => state.users.error;
export const selectPagination = (state: RootState) => state.users.pagination;
export const selectCurrentPage = (state: RootState) => state.users.pagination.currentPage;
export const selectTotalPages = (state: RootState) => state.users.pagination.totalPages;
export const selectTotalUsers = (state: RootState) => state.users.pagination.totalUsers;
export const selectTotalUsersCount = (state: RootState) => state.users.totalUsersCount;
export const selectTotalIncome = (state: RootState) => state.users.totalIncome;

export const selectCommissionHistory = (state: RootState) => state.users.commissionHistory;
// export const 
export default userSlice.reducer;