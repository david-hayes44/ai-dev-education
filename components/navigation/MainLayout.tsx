"use client";

import { ReactNode } from "react";
import { Header } from "./Header";
import { Sidebar } from "./Sidebar";
import { cn } from "@/lib/utils";

type MainLayoutProps = {
  children: ReactNode;
  className?: string;
  sidebarClassName?: string;
  headerClassName?: string;
  contentClassName?: string;
};

export function MainLayout({
  children,
  className,
  sidebarClassName,
  headerClassName,
  contentClassName,
}: MainLayoutProps) {
  return (
    <div className={cn("min-h-screen bg-gray-50 dark:bg-gray-950", className)}>
      {/* Sidebar Component */}
      <Sidebar className={sidebarClassName} />

      {/* Main Content Area with Header */}
      <div className="flex min-h-screen flex-col md:pl-[70px]">
        <Header className={headerClassName} />
        
        <main className={cn("flex-1 p-4 md:p-6 lg:p-8", contentClassName)}>
          {children}
        </main>

        {/* Footer - Could be a separate component */}
        <footer className="border-t border-gray-200 py-6 text-center text-sm text-gray-500 dark:border-gray-800 dark:text-gray-400">
          <p>© {new Date().getFullYear()} AI-Dev Education Platform. All rights reserved.</p>
        </footer>
      </div>
    </div>
  );
} 