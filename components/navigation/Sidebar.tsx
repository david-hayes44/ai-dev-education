"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  Code,
  Server,
  CheckSquare,
  Menu,
  X,
  ChevronRight,
  Globe,
  MessageSquare,
  Puzzle,
  PanelLeft,
  PanelRight
} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  subitems?: { label: string; href: string }[];
};

const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "Chat Playground",
    href: "/chat",
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    label: "AI-Dev Concepts",
    href: "/concepts",
    icon: <BookOpen className="h-5 w-5" />,
  },
  {
    label: "MCP Guides",
    href: "/mcp",
    icon: <Code className="h-5 w-5" />,
    subitems: [
      { label: "What are MCPs", href: "/mcp/what-are-mcps" },
      { label: "Core Components", href: "/mcp/core-components" },
      { label: "Implementation Examples", href: "/mcp/examples" },
    ],
  },
  {
    label: "Integration",
    href: "/integration",
    icon: <Puzzle className="h-5 w-5" />,
  },
  {
    label: "Building MCP Servers",
    href: "/building-servers",
    icon: <Server className="h-5 w-5" />,
  },
  {
    label: "Best Practices",
    href: "/best-practices",
    icon: <CheckSquare className="h-5 w-5" />,
  },
  {
    label: "Browser Automation",
    href: "/browser-automation",
    icon: <Globe className="h-5 w-5" />,
  },
];

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Handle screen resize to detect mobile
  useEffect(() => {
    const handleResize = () => {
      setIsMobileOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      {/* Mobile Menu Button with improved styling */}
      <div className="fixed left-4 top-4 z-50 block md:hidden">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="rounded-md bg-white p-2 text-gray-800 shadow-md transition-colors duration-200 hover:bg-gray-100 dark:bg-gray-800 dark:text-white dark:hover:bg-gray-700"
          aria-label={isMobileOpen ? "Close menu" : "Open menu"}
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Sidebar with improved animation */}
      <AnimatePresence>
        {isMobileOpen && (
          <motion.div 
            className="fixed inset-0 z-40 bg-black/50 md:hidden"
            onClick={() => setIsMobileOpen(false)}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div 
              className="absolute left-0 top-0 h-full w-64 bg-white p-4 dark:bg-gray-900"
              onClick={(e) => e.stopPropagation()}
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ 
                type: "spring", 
                stiffness: 300,
                damping: 30 
              }}
            >
              <div className="flex justify-between">
                <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500">AI-Dev Platform</h2>
                <button 
                  onClick={() => setIsMobileOpen(false)}
                  className="rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <div className="mt-8">
                <ul className="space-y-2">
                  {navItems.map((item) => (
                    <li key={item.href}>
                      <Link
                        href={item.href}
                        className={cn(
                          "flex items-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200",
                          pathname === item.href && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                        )}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <div className="mr-3">{item.icon}</div>
                        <span>{item.label}</span>
                      </Link>
                      
                      {item.subitems && item.subitems.length > 0 && (
                        <ul className="ml-6 mt-2 space-y-1">
                          {item.subitems.map((subitem) => (
                            <li key={subitem.href}>
                              <Link
                                href={subitem.href}
                                className={cn(
                                  "flex items-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200",
                                  pathname === subitem.href && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                )}
                                onClick={() => setIsMobileOpen(false)}
                              >
                                <ChevronRight className="mr-2 h-3 w-3" />
                                <span>{subitem.label}</span>
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar with improved toggle button */}
      <motion.div
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-screen bg-white shadow-md dark:bg-gray-900 md:block",
          className
        )}
        initial={isCollapsed ? "collapsed" : "expanded"}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={{
          expanded: { width: 240 },
          collapsed: { width: 70 },
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300,
          damping: 30
        }}
      >
        {/* Persistent toggle button */}
        <button 
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 z-10"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? 
            <ChevronRight className="h-3 w-3" /> : 
            <ChevronRight className="h-3 w-3 rotate-180" />
          }
        </button>

        <div className="flex h-14 items-center justify-center py-4 relative">
          <motion.div
            initial={isCollapsed ? "collapsed" : "expanded"}
            animate={isCollapsed ? "collapsed" : "expanded"}
            variants={{
              expanded: { opacity: 1, x: 0 },
              collapsed: { opacity: 0, x: -20 },
            }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500"
          >
            AI-Dev Platform
          </motion.div>
          <motion.div
            initial={isCollapsed ? "collapsed" : "expanded"}
            animate={isCollapsed ? "collapsed" : "expanded"}
            variants={{
              expanded: { opacity: 0 },
              collapsed: { opacity: 1 },
            }}
            transition={{ duration: 0.2 }}
            className="absolute left-0 right-0 mx-auto w-full text-center text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-500 via-purple-500 to-orange-500"
          >
            AI
          </motion.div>
        </div>

        <div className="mt-8 px-2">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200",
                    pathname === item.href && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  )}
                  title={item.label}
                >
                  <div className="mr-3">{item.icon}</div>
                  <motion.span
                    initial={isCollapsed ? "collapsed" : "expanded"}
                    animate={isCollapsed ? "collapsed" : "expanded"}
                    variants={{
                      expanded: { 
                        opacity: 1, 
                        width: "auto",
                        display: "inline-block" 
                      },
                      collapsed: { 
                        opacity: 0, 
                        width: 0,
                        display: "none",
                        transition: { 
                          display: { delay: 0.1 } 
                        } 
                      },
                    }}
                    transition={{ duration: 0.2 }}
                  >
                    {item.label}
                  </motion.span>
                </Link>
                
                <AnimatePresence>
                  {!isCollapsed && item.subitems && item.subitems.length > 0 && (
                    <motion.ul
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.2 }}
                      className="ml-6 mt-2 space-y-1 overflow-hidden"
                    >
                      {item.subitems.map((subitem) => (
                        <li key={subitem.href}>
                          <Link
                            href={subitem.href}
                            className={cn(
                              "flex items-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200",
                              pathname === subitem.href && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            )}
                          >
                            <ChevronRight className="mr-2 h-3 w-3" />
                            <span>{subitem.label}</span>
                          </Link>
                        </li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </>
  );
} 