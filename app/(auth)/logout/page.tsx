import { redirect } from 'next/navigation';
import Cookies from 'js-cookie';

export default function Logout() {
  Cookies.remove('auth-token');
  redirect('/login');
}       