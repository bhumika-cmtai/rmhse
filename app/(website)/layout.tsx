import Footer from "@/components/(website)/Footer";
import Header from "@/components/(website)/Header";
import { Noto_Sans } from 'next/font/google';
// import {Noto-Sans} from '@next/font'

  const notoSans = Noto_Sans({
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
    <div className={`min-h-screen bg-gradient-to-r from-pink-50  to-sea-green-100/30 font-sans overflow-x-hidden ${notoSans.className}`}>
        <div className="w-full hidden lg:block"></div>
        <Header />
      <div className="flex flex-col">
        <main className="w-full py-20 px-4 ">
          {children}
        </main>
      <Footer />
      </div>
    </div>
  );
}

