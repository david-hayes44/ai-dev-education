import Link from "next/link"
import { FileQuestion } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] px-6 py-16 text-center">
      <div className="flex items-center justify-center w-16 h-16 mb-6 rounded-full bg-muted">
        <FileQuestion className="w-8 h-8 text-muted-foreground" />
      </div>
      <h1 className="mb-2 text-3xl font-bold">Page Not Found</h1>
      <p className="mb-8 text-muted-foreground max-w-md">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">
            Return Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href="/contact">
            Contact Support
          </Link>
        </Button>
      </div>
    </div>
  )
} 