"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";

type NavItem = {
  label: string;
  href: string;
  subitems?: { label: string; href: string }[];
};

const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
  },
  {
    label: "AI-Dev Concepts",
    href: "/concepts",
  },
  {
    label: "MCP Guides",
    href: "/mcp",
    subitems: [
      { label: "What are MCPs", href: "/mcp/what-are-mcps" },
      { label: "Core Components", href: "/mcp/core-components" },
      { label: "Implementation Examples", href: "/mcp/examples" },
    ],
  },
  {
    label: "Integration",
    href: "/integration",
  },
  {
    label: "Building MCP Servers",
    href: "/building-servers",
  },
  {
    label: "Best Practices",
    href: "/best-practices",
  },
];

type HeaderProps = {
  className?: string;
};

export function Header({ className }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close mobile menu on path change
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-20 w-full bg-white transition-all duration-200 dark:bg-gray-900",
        isScrolled ? "shadow-md" : "",
        className
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 md:px-6">
        {/* Left part (Logo/Title) */}
        <div className="flex items-center">
          <Link href="/" className="text-xl font-bold md:text-2xl">
            AI-Dev Education Platform
          </Link>
        </div>

        {/* Middle part (Desktop Navigation) */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const hasSubItems = item.subitems && item.subitems.length > 0;

              return (
                <li
                  key={item.href}
                  className={cn(
                    "relative group",
                    isActive ? "text-blue-600 dark:text-blue-400" : ""
                  )}
                >
                  <Link
                    href={item.href}
                    className={cn(
                      "flex items-center py-2 text-sm transition-colors hover:text-blue-600 dark:hover:text-blue-400",
                      isActive ? "font-medium" : ""
                    )}
                  >
                    {item.label}
                    {hasSubItems && (
                      <ChevronDown className="ml-1 h-4 w-4 transition-transform group-hover:rotate-180" />
                    )}
                  </Link>

                  {hasSubItems && (
                    <div className="absolute left-0 top-full z-50 mt-1 hidden w-48 rounded-md border bg-white p-2 shadow-lg group-hover:block dark:border-gray-700 dark:bg-gray-800">
                      {item.subitems?.map((subitem) => (
                        <Link
                          key={subitem.href}
                          href={subitem.href}
                          className={cn(
                            "block rounded-md px-3 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-700",
                            pathname === subitem.href
                              ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                              : ""
                          )}
                        >
                          {subitem.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Right part (Theme Toggle & Mobile Menu Button) */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-50"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </button>

          {/* Mobile menu button - only visible on mobile */}
          <button
            className="flex h-9 w-9 items-center justify-center rounded-full md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle mobile menu"
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="border-t border-gray-200 bg-white px-4 py-2 dark:border-gray-700 dark:bg-gray-900 md:hidden">
          <ul className="space-y-1 py-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const hasSubItems = item.subitems && item.subitems.length > 0;

              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      "block rounded-md px-3 py-2 text-sm",
                      isActive
                        ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                        : "hover:bg-gray-100 dark:hover:bg-gray-800"
                    )}
                  >
                    {item.label}
                  </Link>

                  {hasSubItems && (
                    <ul className="ml-4 space-y-1 pt-1">
                      {item.subitems?.map((subitem) => (
                        <li key={subitem.href}>
                          <Link
                            href={subitem.href}
                            className={cn(
                              "block rounded-md px-3 py-2 text-sm",
                              pathname === subitem.href
                                ? "bg-blue-50 font-medium text-blue-600 dark:bg-blue-900/20 dark:text-blue-400"
                                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                            )}
                          >
                            {subitem.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </header>
  );
} 