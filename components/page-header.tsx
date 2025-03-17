import { cn } from "@/lib/utils"
import { Container } from "@/components/ui/container"

interface PageHeaderProps {
  title: string
  description?: string
  className?: string
}

export function PageHeader({ title, description, className }: PageHeaderProps) {
  return (
    <div className={cn("bg-muted py-8 md:py-12", className)}>
      <Container>
        <h1 className="text-3xl font-bold tracking-tight md:text-4xl">{title}</h1>
        {description && (
          <p className="mt-4 text-lg text-muted-foreground max-w-3xl">
            {description}
          </p>
        )}
      </Container>
    </div>
  )
} 