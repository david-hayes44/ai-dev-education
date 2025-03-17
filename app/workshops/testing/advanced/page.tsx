import { Metadata } from "next"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TestTube, Code, Lightbulb, ArrowRight, ArrowLeft } from "lucide-react"
import { generateMetadata } from "@/lib/content-utils"
import { ContentTemplate } from "@/components/content/ContentTemplate"

export const metadata: Metadata = generateMetadata({
  title: "Advanced AI-Assisted Testing Techniques",
  description: "Learn advanced techniques for AI-assisted testing, including mocking, fixtures, performance testing, and integration with CI/CD pipelines.",
  keywords: ["advanced testing", "mocking", "test fixtures", "performance testing", "CI/CD", "test generation", "AI testing"],
  section: "workshops/testing/advanced"
})

export default function AdvancedTestingWorkshopPage() {
  return (
    <ContentTemplate
      title="Advanced AI-Assisted Testing Techniques"
      description="Learn advanced techniques for AI-assisted testing, including mocking, fixtures, performance testing, and integration with CI/CD pipelines."
      metadata={{
        difficulty: "advanced",
        timeToComplete: "60 minutes",
        prerequisites: [
          {
            title: "AI-Assisted Testing Workshop",
            href: "/workshops/testing"
          }
        ]
      }}
      tableOfContents={[
        {
          id: "overview",
          title: "Overview",
          level: 2
        },
        {
          id: "mocking",
          title: "Mocking with AI Assistance",
          level: 2
        },
        {
          id: "fixtures",
          title: "Test Fixtures and Data Generation",
          level: 2
        }
      ]}
      relatedContent={[
        {
          title: "AI-Assisted Testing Workshop",
          href: "/workshops/testing",
          description: "Start with the fundamentals of AI-assisted testing"
        },
        {
          title: "Best Practices for Testing",
          href: "/best-practices/testing",
          description: "Learn established testing patterns and how AI enhances them"
        }
      ]}
    >
      <div className="my-8 rounded-xl bg-primary/5 p-6">
        <div className="flex flex-col sm:flex-row items-start gap-4">
          <div className="rounded-full bg-primary/10 p-2 text-primary">
            <TestTube className="h-6 w-6" />
          </div>
          <div>
            <h3 className="mb-2 text-lg font-medium">Building on the Basics</h3>
            <p className="text-muted-foreground">
              This workshop assumes you've completed the basic AI-Assisted Testing Workshop. Here, we'll dive deeper
              into advanced techniques that leverage AI to handle complex testing scenarios.
            </p>
          </div>
        </div>
      </div>

      <h2 id="overview">Overview</h2>
      <p>
        In the basic workshop, we covered generating simple unit tests and improving test coverage. Now, we'll
        explore how AI can assist with more complex testing challenges including:
      </p>
      <ul>
        <li>Creating sophisticated mocks for dependencies</li>
        <li>Generating test fixtures and realistic test data</li>
        <li>Setting up property-based testing</li>
        <li>Optimizing performance testing</li>
        <li>Integrating AI-assisted testing into CI/CD pipelines</li>
      </ul>

      <h2 id="mocking">Mocking with AI Assistance</h2>
      <p>
        Mocking is essential when testing components that depend on external services, databases, or complex objects.
        AI can significantly simplify creating and maintaining mocks.
      </p>
      
      <h2 id="fixtures">Test Fixtures and Data Generation</h2>
      <p>
        AI can help generate realistic test fixtures that cover a wide range of scenarios.
        This is particularly useful for complex objects or large datasets.
      </p>

      <div className="mt-8 flex justify-between">
        <Button variant="outline" asChild>
          <Link href="/workshops/testing">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Testing Workshop
          </Link>
        </Button>
      </div>
    </ContentTemplate>
  )
} 