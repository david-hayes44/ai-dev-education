import {
  type LucideProps,
  Moon,
  Sun,
  Twitter,
  Github,
  Menu,
  X,
  Check,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronsUpDown,
  ExternalLink,
  Laptop,
  Search,
  Home,
  BookOpen,
  Code,
  Server,
  CheckSquare,
  MessageCircle,
  Wrench,
  BookMarked,
  FileText,
  Mail,
  Puzzle,
  LucideIcon,
  ArrowRight,
  ArrowLeft,
  Info,
  AlertCircle,
  AlertTriangle,
  HelpCircle,
  BookOpen as Book,
  LinkIcon,
  CircleEllipsis,
  Monitor,
  SquarePen,
  Terminal,
} from "lucide-react"

export type Icon = LucideIcon

export const Icons = {
  sun: Sun,
  moon: Moon,
  twitter: Twitter,
  gitHub: Github,
  check: Check,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  chevronsUpDown: ChevronsUpDown,
  externalLink: ExternalLink,
  laptop: Laptop,
  close: X,
  menu: Menu,
  search: Search,
  home: Home,
  book: BookOpen,
  code: Code,
  server: Server,
  bestPractice: CheckSquare,
  chat: MessageCircle,
  tools: Wrench,
  learningPath: BookMarked,
  resources: FileText,
  contact: Mail,
  puzzle: Puzzle,
  arrowRight: ArrowRight,
  arrowLeft: ArrowLeft,
  info: Info,
  warning: AlertTriangle,
  error: AlertCircle,
  help: HelpCircle,
  docs: Book,
  link: LinkIcon,
  loading: CircleEllipsis,
  monitor: Monitor,
  edit: SquarePen,
  terminal: Terminal,
  discord: ({ ...props }: LucideProps) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 6c-1.7 0-3 1.3-3 3v0c0 1.7 1.3 3 3 3v0c1.7 0 3-1.3 3-3v0c0-1.7-1.3-3-3-3Z" />
      <path d="M15 6c-1.7 0-3 1.3-3 3v0c0 1.7 1.3 3 3 3v0c1.7 0 3-1.3 3-3v0c0-1.7-1.3-3-3-3Z" />
      <path d="M9 12c-4.2 1.3-6 4-6 8h6" />
      <path d="M15 12c4.2 1.3 6 4 6 8h-6" />
    </svg>
  ),
  logo: ({ ...props }: LucideProps) => (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M12 2L20.2678 7V17L12 22L3.73218 17V7L12 2Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 6L16.7175 8.85714V14.5714L12 17.4286L7.28247 14.5714V8.85714L12 6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="12" r="1" fill="currentColor" />
    </svg>
  ),
} 