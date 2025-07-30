import { configureStore } from '@reduxjs/toolkit';
import userReducer from './redux/userSlice';
import leadReducer from './redux/leadSlice';
import contactReducer from './redux/contactSlice';
import clientReducer from './redux/clientSlice';
import authReducer from './redux/authSlice';
import linkReducer from './redux/linkSlice'
import applinkReducer from './redux/appLinkSlice'
import linkclickReducer from './redux/linkclickSlice'
import registerationReducer from './redux/registerationSlice'
import joinlinkReducer from './redux/joinlinkSlice'
import countReducer from './redux/countSlice'

export const store = configureStore({
  reducer: {
    users: userReducer,
    leads: leadReducer,
    contacts: contactReducer,
    auth: authReducer,
    clients: clientReducer,
    links: linkReducer,
    applinks: applinkReducer,
    linkclicks: linkclickReducer,
    registerations: registerationReducer,
    joinlink: joinlinkReducer,
    counts: countReducer
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;