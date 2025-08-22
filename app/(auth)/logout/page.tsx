import { redirect } from 'next/navigation';
import Cookies from 'js-cookie';
import { cookies } from 'next/headers';

export default function Logout() {
  Cookies.remove('auth-token');
  // cookies().set('auth-token', '', { expires: new Date(0) })
  redirect('/');
}       