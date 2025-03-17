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
  ChevronRight,MessageSquare,Wrench,BookMarked,
  Mail,
  FileText} from "lucide-react";

type NavItem = {
  label: string;
  href: string;
  icon: React.ReactNode;
  subitems?: {
    label: string;
    href: string;
    subitems?: { label: string; href: string }[];
  }[];
};

const navItems: NavItem[] = [
  {
    label: "Home",
    href: "/",
    icon: <Home className="h-5 w-5" />,
  },
  {
    label: "Introduction",
    href: "/introduction",
    icon: <BookOpen className="h-5 w-5" />,
    subitems: [
      { label: "Concepts", href: "/introduction/concepts" },
      { label: "Benefits", href: "/introduction/benefits" },
      { label: "Getting Started", href: "/introduction/getting-started" },
    ],
  },
  {
    label: "Understanding MCP",
    href: "/mcp",
    icon: <Code className="h-5 w-5" />,
    subitems: [
      { label: "Basics", href: "/mcp/basics" },
      { label: "Benefits", href: "/mcp/benefits" },
      { label: "Context Management", href: "/mcp/context-management" },
      { label: "Implementation", href: "/mcp/implementation" },
    ],
  },
  {
    label: "Best Practices",
    href: "/best-practices",
    icon: <CheckSquare className="h-5 w-5" />,
    subitems: [
      { label: "Context Management", href: "/best-practices/context-management" },
      { label: "Code Review", href: "/best-practices/code-review" },
      { label: "Testing", href: "/best-practices/testing" },
      { label: "Security", href: "/best-practices/security" },
      { label: "Collaboration", href: "/best-practices/collaboration" },
      { label: "Practical LLM Usage", href: "/best-practices/practical-llm-usage" },
      { label: "Project Customization", href: "/best-practices/project-customization" },
      { label: "Coding Standards", href: "/best-practices/coding-standards" },
    ],
  },
  {
    label: "Building MCP Servers",
    href: "/servers",
    icon: <Server className="h-5 w-5" />,
    subitems: [
      { label: "Architecture", href: "/servers/architecture" },
      { label: "Implementation", href: "/servers/implementation" },
      { label: "Context Management", href: "/servers/context-management" },
      { label: "Security", href: "/servers/security" },
      { label: "Deployment", href: "/servers/deployment" },
      { label: "Examples", href: "/servers/examples" },
    ],
  },
  {
    label: "AI Development Tools",
    href: "/tools",
    icon: <Wrench className="h-5 w-5" />,
    subitems: [
      { 
        label: "Cursor", 
        href: "/tools/cursor",
        subitems: [
          { label: "Setup & Installation", href: "/tools/cursor/setup" },
          { label: "Core Features", href: "/tools/cursor/core-features" },
          { label: "Project Rules", href: "/tools/cursor/project-rules" },
        ] 
      },
      { label: "Windsurf", href: "/tools/windsurf" },
      // Claude and OpenAI Agent SDK pages are hidden from navigation
      // { label: "Claude", href: "/tools/claude" },
      // { label: "OpenAI", href: "/tools/openai" },
    ],
  },
  {
    label: "Learning Paths",
    href: "/learning-paths",
    icon: <BookMarked className="h-5 w-5" />,
    subitems: [
      { label: "Beginner Path", href: "/learning-paths/beginner" },
      { label: "Developer Path", href: "/learning-paths/developer" },
      { label: "MCP Architect Path", href: "/learning-paths/architect" },
      { label: "Enterprise Path", href: "/learning-paths/enterprise" },
      { label: "Skill Assessment", href: "/learning-paths/assessment" },
    ],
  },
  {
    label: "Resources",
    href: "/resources",
    icon: <FileText className="h-5 w-5" />,
    subitems: [
      { label: "Knowledge Base", href: "/resources/knowledge-base" },
      { label: "Cursor Rules", href: "/resources/knowledge-base/cursor-rules" },
      { label: "Glossary", href: "/resources/glossary" },
      { label: "External Resources", href: "/resources/external-resources" },
    ],
  },
  {
    label: "Playground",
    href: "/playground",
    icon: <Code className="h-5 w-5" />,
  },
  {
    label: "Contact",
    href: "/contact",
    icon: <Mail className="h-5 w-5" />,
  },
  {
    label: "Chat",
    href: "/chat",
    icon: <MessageSquare className="h-5 w-5" />,
  },
];

type SidebarProps = {
  className?: string;
};

export function Sidebar({ className }: SidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const pathname = usePathname();

  // Handle screen resize to detect mobile
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setIsMounted(true);
    }, 100);
    
    const handleResize = () => {
      setIsMobileOpen(false);
    };
    
    window.addEventListener("resize", handleResize);
    
    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Don't render during SSR or initial hydration
  if (!isMounted) {
    return null;
  }

  // Determine if sidebar should be expanded based on click or hover
  const isExpanded = !isCollapsed || isHovered;

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
                <h2 className="text-xl font-bold gradient-text">The AI Dev Odyssey</h2>
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
                          pathname === item.href && "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                        )}
                        onClick={() => setIsMobileOpen(false)}
                      >
                        <div className="mr-3 text-muted-foreground">{item.icon}</div>
                        <span>{item.label}</span>
                      </Link>
                      
                      {item.subitems && item.subitems.length > 0 && pathname.startsWith(item.href) && (
                        <ul className="ml-6 mt-2 space-y-1">
                          {item.subitems.map((subitem) => (
                            <li key={subitem.href}>
                              <Link
                                href={subitem.href}
                                className={cn(
                                  "flex items-center rounded-md p-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200",
                                  pathname === subitem.href && "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                                )}
                                onClick={() => setIsMobileOpen(false)}
                              >
                                <ChevronRight className="mr-2 h-3 w-3" />
                                <span>{subitem.label}</span>
                              </Link>
                              
                              {subitem.subitems && subitem.subitems.length > 0 && pathname.startsWith(subitem.href) && (
                                <ul className="ml-5 mt-1 space-y-1">
                                  {subitem.subitems.map((nestedItem) => (
                                    <li key={nestedItem.href}>
                                      <Link
                                        href={nestedItem.href}
                                        className={cn(
                                          "flex items-center rounded-md p-2 text-xs hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200",
                                          pathname === nestedItem.href && "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                                        )}
                                        onClick={() => setIsMobileOpen(false)}
                                      >
                                        <div className="ml-1 mr-2 h-1 w-1 rounded-full bg-muted-foreground"></div>
                                        <span>{nestedItem.label}</span>
                                      </Link>
                                    </li>
                                  ))}
                                </ul>
                              )}
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

      {/* Desktop Sidebar with improved toggle button and hover functionality */}
      <motion.div
        className={cn(
          "fixed left-0 top-0 z-30 hidden h-screen border-r border-border bg-white shadow-md dark:bg-gray-900 md:block",
          className
        )}
        initial={isCollapsed ? "collapsed" : "expanded"}
        animate={isExpanded ? "expanded" : "collapsed"}
        variants={{
          expanded: { width: 280 },
          collapsed: { width: 70 },
        }}
        transition={{ 
          type: "spring", 
          stiffness: 300,
          damping: 30
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Persistent toggle button */}
        <button 
          className="absolute -right-3 top-20 flex h-6 w-6 items-center justify-center rounded-full bg-white shadow-md dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200 z-10"
          onClick={() => setIsCollapsed(!isCollapsed)}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isExpanded ? 
            <ChevronRight className="h-3 w-3 rotate-180" /> : 
            <ChevronRight className="h-3 w-3" />
          }
        </button>

        {/* Remove the text elements entirely and keep just a spacer */}
        <div className="h-10"></div>

        <div className="mt-8 px-2">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center rounded-md p-2 transition-colors duration-200",
                    !isExpanded ? "justify-center" : "justify-start",
                    (pathname === item.href || pathname.startsWith(item.href + "/")) 
                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                      : "text-muted-foreground hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800"
                  )}
                >
                  <div className={cn("flex-shrink-0", !isExpanded ? "" : "mr-3")}>
                    {item.icon}
                  </div>
                  {isExpanded && <span>{item.label}</span>}
                </Link>
                
                {isExpanded && item.subitems && item.subitems.length > 0 && pathname.startsWith(item.href) && (
                  <ul className="ml-9 mt-2 space-y-1 border-l border-border pl-2">
                    {item.subitems.map((subitem) => (
                      <li key={subitem.href}>
                        <Link
                          href={subitem.href}
                          className={cn(
                            "flex items-center rounded-md p-2 text-sm transition-colors duration-200",
                            pathname === subitem.href || pathname.startsWith(subitem.href + "/")
                              ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                              : "text-muted-foreground hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800"
                          )}
                        >
                          <ChevronRight className="mr-2 h-3 w-3" />
                          <span>{subitem.label}</span>
                        </Link>
                        
                        {subitem.subitems && subitem.subitems.length > 0 && pathname.startsWith(subitem.href) && (
                          <ul className="ml-5 mt-1 space-y-1 border-l border-border pl-2">
                            {subitem.subitems.map((nestedItem) => (
                              <li key={nestedItem.href}>
                                <Link
                                  href={nestedItem.href}
                                  className={cn(
                                    "flex items-center rounded-md p-2 text-xs transition-colors duration-200",
                                    pathname === nestedItem.href
                                      ? "bg-primary/10 text-primary dark:bg-primary/20 dark:text-primary"
                                      : "text-muted-foreground hover:bg-gray-100 hover:text-foreground dark:hover:bg-gray-800"
                                  )}
                                >
                                  <div className="ml-1 mr-2 h-1 w-1 rounded-full bg-muted-foreground"></div>
                                  <span>{nestedItem.label}</span>
                                </Link>
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </motion.div>
    </>
  );
} 