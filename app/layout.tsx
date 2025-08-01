import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { ReduxProvider } from "@/lib/provider";

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
  return (
    <html lang="en">
      <body className={inter.className}>
        <ReduxProvider>
          {children}
          <Toaster richColors />
        </ReduxProvider>
      </body>
    </html>
  );
}