"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import {
  Home,
  BookOpen,
  Code,
  Server,
  CheckSquare,
  Menu,
  X,
  ChevronRight
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
    icon: <Code className="h-5 w-5" />,
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
      {/* Mobile Menu Button */}
      <div className="fixed left-4 top-4 z-50 block md:hidden">
        <button
          onClick={() => setIsMobileOpen(!isMobileOpen)}
          className="rounded-md bg-white p-2 text-gray-800 shadow-md dark:bg-gray-800 dark:text-white"
        >
          {isMobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Sidebar */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsMobileOpen(false)}
        >
          <div 
            className="absolute left-0 top-0 h-full w-64 bg-white p-4 dark:bg-gray-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between">
              <h2 className="text-xl font-bold">AI-Dev Platform</h2>
              <button onClick={() => setIsMobileOpen(false)}>
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
                        "flex items-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800",
                        pathname === item.href && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                      )}
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
                                "flex items-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800",
                                pathname === subitem.href && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                              )}
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
          </div>
        </div>
      )}

      {/* Desktop Sidebar */}
      <motion.div
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-screen bg-white shadow-md transition-all duration-300 dark:bg-gray-900 md:block",
          className
        )}
        initial={isCollapsed ? "collapsed" : "expanded"}
        animate={isCollapsed ? "collapsed" : "expanded"}
        variants={{
          expanded: { width: 240 },
          collapsed: { width: 70 },
        }}
        transition={{ duration: 0.3 }}
        onMouseEnter={() => setIsCollapsed(false)}
        onMouseLeave={() => setIsCollapsed(true)}
      >
        <div className="flex h-14 items-center justify-center py-4">
          <motion.div
            initial={isCollapsed ? "collapsed" : "expanded"}
            animate={isCollapsed ? "collapsed" : "expanded"}
            variants={{
              expanded: { opacity: 1 },
              collapsed: { opacity: 0 },
            }}
            className="overflow-hidden text-xl font-bold"
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
            className="absolute left-0 right-0 mx-auto w-full text-center text-xl font-bold"
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
                    "flex items-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800",
                    pathname === item.href && "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                  )}
                >
                  <div className="mr-3">{item.icon}</div>
                  <motion.span
                    initial={isCollapsed ? "collapsed" : "expanded"}
                    animate={isCollapsed ? "collapsed" : "expanded"}
                    variants={{
                      expanded: { opacity: 1, display: "inline-block" },
                      collapsed: { 
                        opacity: 0, 
                        display: "none",
                        transition: { 
                          display: { delay: 0.2 } 
                        } 
                      },
                    }}
                  >
                    {item.label}
                  </motion.span>
                </Link>
                
                {!isCollapsed && item.subitems && item.subitems.length > 0 && (
                  <motion.ul
                    initial="collapsed"
                    animate="expanded"
                    variants={{
                      expanded: { opacity: 1, height: "auto" },
                      collapsed: { opacity: 0, height: 0 },
                    }}
                    className="ml-6 mt-2 space-y-1"
                  >
                    {item.subitems.map((subitem) => (
                      <li key={subitem.href}>
                        <Link
                          href={subitem.href}
                          className={cn(
                            "flex items-center rounded-md p-2 hover:bg-gray-100 dark:hover:bg-gray-800",
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
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </>
  );
} 