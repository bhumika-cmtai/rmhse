import { createSlice, Dispatch } from "@reduxjs/toolkit";
import axios from "axios";
import { RootState } from "../store";

export interface CountStats {
  leads: number;
  clients: number;
  users: number;
  linkClicks: number;
  appLinks: number;
  contacts: number;
  joinLinks: number;
  restartDates: number;
  registrations: number;
  userStats: {
    admin: number;
    regularUsers: number;
  };
  leadStats: {
    new: number;
    registered: number;
    notInterested: number;
  };
  clientStats: {
    approved: number;
    pending: number;
  };
}

export interface CountState {
  data: CountStats;
  loading: boolean;
  error: string | null;
}

const initialState: CountState = {
  data: {
    leads: 0,
    clients: 0,
    users: 0,
    linkClicks: 0,
    appLinks: 0,
    contacts: 0,
    joinLinks: 0,
    restartDates: 0,
    registrations: 0,
    userStats: {
      admin: 0,
      regularUsers: 0
    },
    leadStats: {
      new: 0,
      registered: 0,
      notInterested: 0
    },
    clientStats: {
      approved: 0,
      pending: 0
    }
  },
  loading: false,
  error: null,
};

const countSlice = createSlice({
  name: "counts",
  initialState,
  reducers: {
    setCount: (state, action) => {
      state.data = action.payload;
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
  },
});

export const {
  setCount,
  setLoading,
  setError,
} = countSlice.actions;

export const fetchCount = () => async (dispatch: Dispatch) => {
  dispatch(setLoading(true));
  try {
    const response = await axios.get(`${process.env.NEXT_PUBLIC_API_BASE_URL}/count/admin-stats`);
    if (response.data && response.data.success) {
      dispatch(setCount(response.data.data));
    } else {
      dispatch(setError("Failed to fetch stats: " + (response.data?.message || "Unknown error")));
    }
  } catch (error: unknown) {
    const message = typeof error === "object" && error && "message" in error ? (error as { message?: string }).message : String(error);
    dispatch(setError("Error fetching stats: " + message));
  }
};

export const selectCount = (state: RootState) => state.counts.data;
export const selectCountLoading = (state: RootState) => state.counts.loading;
export const selectCountError = (state: RootState) => state.counts.error;

export default countSlice.reducer;