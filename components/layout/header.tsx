"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { ThemeToggle } from "@/components/theme-toggle"
import AuthStatus from "@/components/auth/auth-status"
import { 
  Menu, 
  X, 
  ChevronDown,
  Home,
  BookOpen,
  Code,CheckSquare,Wrench,
  BookMarked,
  FileText,
  Mail
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

const navItems = [
  {
    path: "/",
    label: "Home",
    icon: <Home className="w-4 h-4 mr-2" />,
  },
  {
    path: "/introduction",
    label: "Introduction",
    icon: <BookOpen className="w-4 h-4 mr-2" />,
    dropdown: [
      { label: "Overview", path: "/introduction" },
      { label: "Concepts", path: "/introduction/concepts" },
      { label: "Benefits", path: "/introduction/benefits" },
      { label: "Getting Started", path: "/introduction/getting-started" },
    ]
  },
  {
    path: "/mcp",
    label: "MCP Framework",
    icon: <Code className="w-4 h-4 mr-2" />,
    dropdown: [
      { label: "Overview", path: "/mcp" },
      { label: "Basics", path: "/mcp/basics" },
      { label: "Benefits", path: "/mcp/benefits" },
      { label: "Context Management", path: "/mcp/context-management" },
      { label: "Implementation", path: "/mcp/implementation" },
    ]
  },
  {
    path: "/best-practices",
    label: "Best Practices",
    icon: <CheckSquare className="w-4 h-4 mr-2" />,
    dropdown: [
      { label: "Overview", path: "/best-practices" },
      { label: "Context Management", path: "/best-practices/context-management" },
      { label: "Code Review", path: "/best-practices/code-review" },
      { label: "Testing", path: "/best-practices/testing" },
      { label: "Security", path: "/best-practices/security" },
      { label: "Collaboration", path: "/best-practices/collaboration" },
      { label: "Practical LLM Usage", path: "/best-practices/practical-llm-usage" },
      { label: "Project Customization", path: "/best-practices/project-customization" },
      { label: "Coding Standards", path: "/best-practices/coding-standards" },
    ]
  },
  {
    path: "/servers",
    label: "MCP Servers",
    icon: <Wrench className="w-4 h-4 mr-2" />,
    dropdown: [
      { label: "Overview", path: "/servers" },
      { label: "Architecture", path: "/servers/architecture" },
      { label: "Implementation", path: "/servers/implementation" },
      { label: "— Node.js", path: "/servers/implementation/nodejs" },
      { label: "— Python", path: "/servers/implementation/python" },
      { label: "Security", path: "/servers/security" },
      { label: "Examples", path: "/servers/examples" },
    ]
  },
  {
    path: "/tools",
    label: "AI Tools",
    icon: <Wrench className="w-4 h-4 mr-2" />,
    dropdown: [
      { label: "Overview", path: "/tools" },
      { label: "Cursor", path: "/tools/cursor" },
      { label: "Windsurf", path: "/tools/windsurf" },
      { label: "Claude", path: "/tools/claude" },
      { label: "OpenAI", path: "/tools/openai" },
    ]
  },
  {
    path: "/learning-paths",
    label: "Learning Paths",
    icon: <BookMarked className="w-4 h-4 mr-2" />,
    dropdown: [
      { label: "Overview", path: "/learning-paths" },
      { label: "Junior Developer", path: "/learning-paths/junior-developer" },
      { label: "Experienced Developer", path: "/learning-paths/experienced-developer" },
      { label: "Technical Leader", path: "/learning-paths/technical-leader" },
    ]
  },
  {
    path: "/resources",
    label: "Resources",
    icon: <FileText className="w-4 h-4 mr-2" />,
    dropdown: [
      { label: "Overview", path: "/resources" },
      { label: "Knowledge Base", path: "/resources/knowledge-base" },
      { label: "— Cursor Rules", path: "/resources/knowledge-base/cursor-rules" },
      { label: "Glossary", path: "/resources/glossary" },
      { label: "External Resources", path: "/resources/external-resources" },
    ]
  },
  {
    path: "/contact",
    label: "Contact",
    icon: <Mail className="w-4 h-4 mr-2" />,
  },
]

export function Header() {
  const pathname = usePathname()
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])
  
  // Handle dropdown visibility - support both click and hover
  const toggleDropdown = (path: string) => {
    if (activeDropdown === path) {
      setActiveDropdown(null)
    } else {
      setActiveDropdown(path)
    }
  }
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Check if click is outside any nav item
      const isOutside = !(e.target as Element).closest('.nav-item-container');
      if (isOutside) {
        setActiveDropdown(null);
      }
    }
    
    document.addEventListener("click", handleClickOutside)
    return () => document.removeEventListener("click", handleClickOutside)
  }, [])
  
  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        scrolled 
          ? "bg-background/95 backdrop-blur-md shadow-md" 
          : "bg-background/60 backdrop-blur-sm"
      )}
    >
      <div className="container mx-auto px-6 sm:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Logo */}
          <Link href="/" className="font-bold text-2xl tracking-tighter flex items-center">
            <span className="text-primary mr-1">AI</span>Dev
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {navItems.map((item) => (
              <div 
                key={item.path} 
                className="relative nav-item-container" 
                onMouseEnter={() => item.dropdown && setActiveDropdown(item.path)}
                onMouseLeave={() => setActiveDropdown(null)}
              >
                {item.dropdown ? (
                  <div className="relative">
                    <button
                      onClick={() => toggleDropdown(item.path)}
                      className={cn(
                        "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                        pathname.startsWith(item.path)
                          ? "bg-primary/10 text-primary" 
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )}
                    >
                      {item.icon}
                      {item.label}
                      <ChevronDown className={cn(
                        "ml-1 h-4 w-4 transition-transform duration-200",
                        activeDropdown === item.path ? "rotate-180" : ""
                      )} />
                    </button>
                    
                    <AnimatePresence>
                      {activeDropdown === item.path && (
                        <motion.div
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute left-0 mt-1 w-48 rounded-md shadow-lg bg-background border border-border z-10"
                        >
                          <div className="py-1 rounded-md bg-popover">
                            {item.dropdown.map((dropdownItem) => (
                              <Link
                                key={dropdownItem.path}
                                href={dropdownItem.path}
                                className={cn(
                                  "block px-4 py-2 text-sm transition-colors duration-200",
                                  pathname === dropdownItem.path
                                    ? "bg-primary/10 text-primary"
                                    : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                )}
                              >
                                {dropdownItem.label}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                ) : (
                  <Link
                    href={item.path}
                    className={cn(
                      "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                      pathname === item.path || pathname.startsWith(item.path + "/")
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted"
                    )}
                  >
                    {item.icon}
                    {item.label}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          {/* Right side items: Auth Status + Theme Toggle + Mobile menu button */}
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Auth Status Component */}
            <div className="hidden sm:block">
              <AuthStatus />
            </div>
            
            {/* Theme Toggle */}
            <ThemeToggle />
            
            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex md:hidden items-center justify-center p-2 rounded-md text-foreground hover:bg-accent hover:text-accent-foreground focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>
      
      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="md:hidden border-t border-border overflow-hidden"
          >
            <div className="container mx-auto px-6 sm:px-8 py-3">
              <nav className="grid gap-y-2">
                {navItems.map((item) => (
                  <div key={item.path} className="w-full">
                    {item.dropdown ? (
                      <div className="w-full">
                        <button
                          onClick={() => toggleDropdown(item.path)}
                          className={cn(
                            "flex items-center justify-between w-full px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                            pathname.startsWith(item.path)
                              ? "bg-primary/10 text-primary"
                              : "text-muted-foreground hover:text-foreground hover:bg-muted"
                          )}
                        >
                          <span className="flex items-center">
                            {item.icon}
                            {item.label}
                          </span>
                          <ChevronDown className={cn(
                            "ml-1 h-4 w-4 transition-transform duration-200",
                            activeDropdown === item.path ? "rotate-180" : ""
                          )} />
                        </button>
                        
                        <AnimatePresence>
                          {activeDropdown === item.path && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="mt-1 pl-5 overflow-hidden"
                            >
                              {item.dropdown.map((dropdownItem) => (
                                <Link
                                  key={dropdownItem.path}
                                  href={dropdownItem.path}
                                  className={cn(
                                    "flex items-center px-3 py-2 rounded-md text-sm transition-colors duration-200",
                                    pathname === dropdownItem.path
                                      ? "bg-primary/10 text-primary"
                                      : "text-muted-foreground hover:text-foreground hover:bg-muted"
                                  )}
                                >
                                  {dropdownItem.label}
                                </Link>
                              ))}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    ) : (
                      <Link
                        href={item.path}
                        className={cn(
                          "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200",
                          pathname === item.path || pathname.startsWith(item.path + "/")
                            ? "bg-primary/10 text-primary"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted"
                        )}
                      >
                        {item.icon}
                        {item.label}
                      </Link>
                    )}
                  </div>
                ))}
              </nav>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
} 