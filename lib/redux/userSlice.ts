import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

export interface User {
  _id?: string;
  name: string;
  email: string;
  phoneNumber: string;
  whatsappNumber?: string;
  city: string;
  role: string;
  password?: string;
  status?: string;
  leaderCode?:string;
  // abhi_aap_kya_karte_hai?:string;
  // work_experience?:string;
  createdOn?: string;
  updatedOn?: string;
  income?: number;
  account_number?: string;
  Ifsc?: string;
  upi_id?: string;
  registeredClientCount?: number
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalUsers: number;
}

export interface UserState {
  data: User[];
  loading: boolean;
  error: string | null;
  selectedUser: User | null;
  pagination: Pagination;
  totalUsersCount: number; // For dashboard count
  totalIncome: number;
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
  totalUsersCount: 0, // Initial value for dashboard count
  totalIncome: 0,
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
  },
}); 

export const { setUsers, setLoading, setError, setSelectedUser, clearSelectedUser, setCurrentPage, setTotalUsersCount,setTotalIncome } = userSlice.actions;

export const fetchUsersCount = () => async (dispatch: Dispatch) => {
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getUsersCount`);
    if (response.data) {
      dispatch(setTotalUsersCount(response.data.data.count));
    } else {
      console.error("Failed to fetch user count:", response.data.message);
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    console.error("Error fetching user count:", message);
  }
};

export const fetchUsers = (params?: { search?: string; status?: string; page?: number, startDate?: string, endDate?: string }) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const query = [];
    if (params?.search) query.push(`searchQuery=${encodeURIComponent(params.search)}`);
    if (params?.status && params.status !== 'all') query.push(`status=${encodeURIComponent(params.status)}`);
    if (params?.page) query.push(`page=${params.page}`);
    // --- MODIFICATION: Add dates to the query string if they exist ---
    if (params?.startDate) query.push(`startDate=${params.startDate}`);
    if (params?.endDate) query.push(`endDate=${params.endDate}`);

    const queryString = query.length ? `?${query.join('&')}` : '';
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getallUsers${queryString}`);
    
    if (response.status === 200) {
      dispatch(setUsers(response.data.data));
      if (params?.page) dispatch(setCurrentPage(params.page));
    } else {
      dispatch(setError(response.data.message));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const fetchUserById = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getUser/${id}`);
        const data: User = response.data;
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

export const addUser = (user: User) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/addUser`, user);
    if (response.status === 201) {
      dispatch(setLoading(false));
      return response.data;
    } else {
      dispatch(setError(response.data.message));
      return null;
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError(message || "Unknown error"));
  }
};

export const addManyUsers = (users: User[]) => async (dispatch: Dispatch) => {
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/addManyUser`, users);
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

export const updateUser = (id: string, user: User) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/updateUser/${id}`, user);
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
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/deleteManyUsers`, { ids });
    if (response.data && response.data.success) {
      return true;
    }
    return false;
  } catch (error: unknown) {
    console.error("Error deleting multiple users:", error);
    return false;
  }
};

export const fetchLeaderCode = (leaderCode: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/users/getLeaderCode/${leaderCode}`);
    
    if (!response.data.data) {
        const errorMsg = response.data.message || "Leader code not found";
        dispatch(setError(errorMsg));
        throw new Error(errorMsg); 
    }
    
    // Success case
    dispatch(setLoading(false));
    return response.data.data; // Return the data on success

  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Unknown error";
    dispatch(setError(message));
    dispatch(setLoading(false));
    throw new Error(message); // Re-throw the error to be caught by the component
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
export default userSlice.reducer;