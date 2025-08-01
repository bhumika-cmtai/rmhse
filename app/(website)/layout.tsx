import Footer from "@/components/(website)/Footer";
import Header from "@/components/(website)/Header";
import { Noto_Sans } from 'next/font/google';
import { Inter } from "next/font/google";
// import {Noto-Sans} from '@next/font'

  const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '700', '900'],
  variable: '--font-noto-sans',
  display: 'swap',
});

export default function Layout({
  children,
}: {
  children: React.ReactNode;
}) {

  return (
    <div className={`min-h-screen font-sans overflow-x-hidden ${inter.className}`}>
        <div className="w-full hidden lg:block"></div>
        <Header />
      <div className="flex flex-col">
        {/* The px-4 class has been removed from the main element */}
        <main className="w-full">
          {children}
        </main>
      <Footer />
      </div>
    </div>
  );
}