"use client"
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie';
import { cookies } from 'next/headers';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/lib/store';
import { setUser } from '@/lib/redux/authSlice';

export default function Logout() {
  const dispatch = useDispatch();
  // const {  } = useSelector((state: RootState) => state.auth);

  // Cookies.remove('auth-token',{path:''});
  // cookies().set('auth-token', '', { expires: new Date(0) })
  Cookies.set('auth-token', '')
  dispatch(setUser(null));
  redirect('/');
}       