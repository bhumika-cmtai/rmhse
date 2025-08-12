import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store"; // Adjust path if needed

// === INTERFACES ===

export interface Notification {
  _id?: string;
  title: string;
  message: string;
  link?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalNotifications: number;
}

interface NotificationState {
  data: Notification[]; // For the list of all notifications
  latestNotification: Notification | null; // For the single latest one
  selectedNotification: Notification | null; // For editing a specific one
  loading: boolean;
  error: string | null;
  pagination: Pagination;
}

// === INITIAL STATE ===

const initialState: NotificationState = {
  data: [],
  latestNotification: null,
  selectedNotification: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    totalNotifications: 0,
  },
};

// === SLICE DEFINITION ===

const notificationSlice = createSlice({
  name: "notifications",
  initialState,
  reducers: {
    setNotifications: (state, action) => {
      state.data = action.payload.docs; // Assuming backend returns { docs: [...] }
      state.pagination.totalNotifications = action.payload.totalDocs;
      state.pagination.totalPages = action.payload.totalPages;
      state.pagination.currentPage = action.payload.page;
      state.loading = false;
      state.error = null;
    },
    setLatestNotification: (state, action) => {
      state.latestNotification = action.payload;
      state.loading = false;
      state.error = null;
    },
    setSelectedNotification: (state, action) => {
      state.selectedNotification = action.payload;
    },
    clearSelectedNotification: (state) => {
      state.selectedNotification = null;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    setError: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
  },
});

export const { 
  setNotifications, 
  setLatestNotification,
  setSelectedNotification,
  clearSelectedNotification,
  setLoading, 
  setError 
} = notificationSlice.actions;

// === ASYNC THUNKS ===

/**
 * Fetches the single most recent notification.
 */
export const fetchLatestNotification = () => async (dispatch: Dispatch) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/latest`);
      if (response.status === 200) {
        dispatch(setLatestNotification(response.data.data));
      } else {
        dispatch(setError(response.data.message || 'Failed to fetch latest notification.'));
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Unknown error";
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
};

/**
 * Fetches a paginated list of all notifications for the admin panel.
 */
export const fetchAllNotifications = ({ page = 1, limit = 10 }: { page?: number; limit?: number }) => 
  async (dispatch: Dispatch) => {
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications`, { params: { page, limit } });
      
      if (response.status === 200) {
        dispatch(setNotifications(response.data.data));
      } else {
        dispatch(setError(response.data.message || 'Failed to fetch notifications.'));
      }
    } catch (error: any) {
      const message = error.response?.data?.message || error.message || "Unknown error";
      dispatch(setError(message));
    } finally {
      dispatch(setLoading(false));
    }
};

/**
 * Adds a new notification.
 */
export const addNotification = (notification: Omit<Notification, '_id'>) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.post(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications`, notification);
    if (response.status === 201) {
      dispatch(setLoading(false));
      return response.data; // Return the created notification data
    } else {
      dispatch(setError(response.data.message || 'An unknown error occurred.'));
      return null;
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Unknown error";
    dispatch(setError(message));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Updates an existing notification.
 */
export const updateNotification = (id: string, notificationData: Partial<Notification>) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.put(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/${id}`, notificationData);
    if (response.status === 200) {
      dispatch(setLoading(false));
      return response.data;
    } else {
      dispatch(setError(response.data.message));
      return null;
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Unknown error";
    dispatch(setError(message));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

/**
 * Deletes a notification by its ID.
 */
export const deleteNotification = (id: string) => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.delete(`${process.env.NEXT_PUBLIC_API_BASE_URL}/notifications/${id}`);
    if (response.status === 200) {
      dispatch(setLoading(false));
      return response.data; // Indicate success
    } else {
      dispatch(setError(response.data.message || 'Failed to delete notification.'));
      return null;
    }
  } catch (error: any) {
    const message = error.response?.data?.message || error.message || "Unknown error";
    dispatch(setError(message));
    return null;
  } finally {
    dispatch(setLoading(false));
  }
};

// === SELECTORS ===

export const selectAllNotifications = (state: RootState) => state.notifications.data;
export const selectLatestNotification = (state: RootState) => state.notifications.latestNotification;
export const selectSelectedNotification = (state: RootState) => state.notifications.selectedNotification;
export const selectLoading = (state: RootState) => state.notifications.loading;
export const selectError = (state: RootState) => state.notifications.error;
export const selectPagination = (state: RootState) => state.notifications.pagination;

export default notificationSlice.reducer;