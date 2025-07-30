// layout.tsx

"use client";

import React, { useState } from "react";
import Header from "@/components/(dashboard)/Header";
import Sidebar from "@/components/(dashboard)/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex bg-slate-50">
      {/* Sidebar is now sticky on its own */}
      <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />

      {/* This container for the right side will manage the scrolling */}
      <div className="flex h-screen flex-1 flex-col overflow-hidden">
        {/* Header will be sticky within this container */}
        <Header title="Dashboard" onMenuClick={toggleSidebar} />
        
        {/* Main content area is now the only scrollable element */}
        <main className="flex-1 overflow-y-auto bg-[var(--background)] p-6">
          {children}
        </main>
      </div>
    </div>
  );
}