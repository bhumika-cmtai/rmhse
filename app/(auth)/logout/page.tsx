"use client"
import { redirect } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Logout() {

  Cookies.remove('auth-token',{path:''});
  // cookies().set('auth-token', '', { expires: new Date(0) })
  // Cookies.set('auth-token', '')
  // dispatch(setUser(null));
  redirect('/');
}       