import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ReduxProvider } from "@/lib/provider";
import MaintenancePage from "./(website)/MaintainancePage";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RMHSE",
  description: "RHMSE is a platform for small businesses to grow their business",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const isLive = process.env.NEXT_PUBLIC_IS_LIVE === "true"; // ✅ check env properly

  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          {isLive ? <MaintenancePage /> : children}
          <Toaster richColors />
        </ReduxProvider>
      </body>
    </html>
  );
}
