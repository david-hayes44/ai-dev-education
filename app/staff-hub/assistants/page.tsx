import { Metadata } from "next"
import { PageHeader } from "@/components/page-header"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Custom Assistants | AIssistant Hub",
  description: "Task-specific AI assistants trained on company data to help with common workflows."
}

export default function AssistantsPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <PageHeader
        title="Custom Assistants"
        description="Task-specific AI assistants trained on company data to help with common workflows."
      />

      <div className="mt-8 mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Available Assistants</h2>
        <Link 
          href="/staff-hub/assistants/builder" 
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium flex items-center"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Create New Tool
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">4-Box Report Builder</h3>
            <span className="bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 text-xs px-2 py-1 rounded-full">
              New
            </span>
          </div>
          <p className="text-muted-foreground mb-4">
            Generate professional 4-box status reports from your documents, emails, and project materials.
          </p>
          <Link href="/staff-hub/assistants/report-builder" className="bg-primary text-primary-foreground hover:bg-primary/90 w-full px-4 py-2 rounded-md font-medium block text-center">
            Open Builder
          </Link>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Marketing Research Assistant</h3>
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
          <p className="text-muted-foreground mb-4">
            Find, summarize, and extract insights from research papers, articles, and reports.
          </p>
          <button className="bg-muted text-muted-foreground w-full px-4 py-2 rounded-md font-medium" disabled>
            Join Waitlist
          </button>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Data Analyst</h3>
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
          <p className="text-muted-foreground mb-4">
            Analyze data sets, generate visualizations, and extract key metrics for business intelligence.
          </p>
          <button className="bg-muted text-muted-foreground w-full px-4 py-2 rounded-md font-medium" disabled>
            Join Waitlist
          </button>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Documentation Helper</h3>
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
          <p className="text-muted-foreground mb-4">
            Create, update, and maintain documentation for products, processes, and internal systems.
          </p>
          <button className="bg-muted text-muted-foreground w-full px-4 py-2 rounded-md font-medium" disabled>
            Join Waitlist
          </button>
        </div>

        <div className="rounded-lg border bg-card p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold">Tool Builder</h3>
            <span className="bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 text-xs px-2 py-1 rounded-full">
              Coming Soon
            </span>
          </div>
          <p className="text-muted-foreground mb-4">
            Create custom tools through a guided conversation without writing any code. Start with data processing templates.
          </p>
          <button className="bg-muted text-muted-foreground w-full px-4 py-2 rounded-md font-medium" disabled>
            Join Waitlist
          </button>
        </div>
      </div>

      <div className="mt-12 p-6 rounded-lg border bg-muted/20">
        <h2 className="text-xl font-semibold mb-4">Request a Custom Assistant</h2>
        <p className="text-muted-foreground mb-4">
          Need a specialized AI assistant for your team? Submit a request and our team will help build and train a custom solution.
        </p>
        <button className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md font-medium">
          Submit Request
        </button>
      </div>
    </div>
  )
} 