import { Metadata } from "next"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "AIssistant Hub | AI-Dev Education",
  description: "Access specialized AI tools and assistants for different departments and workflows."
}

export default function StaffHubPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <PageHeader
        title="AIssistant Hub"
        description="Access specialized AI tools and assistants designed for different departments and workflows."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
        {/* Department Tools Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-semibold mb-2">Department Tools</h3>
          <p className="text-muted-foreground mb-4">
            AI tools customized for specific departments including HR, Marketing, Finance, and Engineering.
          </p>
          <a 
            href="/staff-hub/department-tools" 
            className="text-primary hover:text-primary/80 font-medium inline-flex items-center"
          >
            Explore tools
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Custom Assistants Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-semibold mb-2">Custom Assistants</h3>
          <p className="text-muted-foreground mb-4">
            Task-specific AI assistants trained on company data to help with common workflows.
          </p>
          <a 
            href="/staff-hub/assistants" 
            className="text-primary hover:text-primary/80 font-medium inline-flex items-center"
          >
            View assistants
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        {/* Workflows Card */}
        <div className="rounded-lg border bg-card p-6 shadow-sm transition-all hover:shadow-md">
          <h3 className="text-xl font-semibold mb-2">Workflows</h3>
          <p className="text-muted-foreground mb-4">
            Pre-defined AI-assisted workflows to automate common tasks and processes.
          </p>
          <a 
            href="/staff-hub/workflows" 
            className="text-primary hover:text-primary/80 font-medium inline-flex items-center"
          >
            Discover workflows
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 ml-1" 
              fill="none" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="mt-16 p-8 rounded-lg border bg-muted/50">
        <h2 className="text-2xl font-semibold mb-4">Coming Soon</h2>
        <p className="text-muted-foreground mb-6">
          We're working on expanding the AIssistant Hub with more features to enhance your productivity:
        </p>
        
        <ul className="space-y-3">
          <li className="flex items-start">
            <div className="bg-primary/10 text-primary p-1 rounded mr-3 mt-0.5">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <span className="font-medium">AI Training Portal</span> - Create and train custom AI models on your own datasets
            </div>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/10 text-primary p-1 rounded mr-3 mt-0.5">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <span className="font-medium">Integration Studio</span> - Connect your AI assistants with other business tools and systems
            </div>
          </li>
          <li className="flex items-start">
            <div className="bg-primary/10 text-primary p-1 rounded mr-3 mt-0.5">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div>
              <span className="font-medium">Analytics Dashboard</span> - Track usage and performance metrics for your AI tools
            </div>
          </li>
        </ul>
      </div>
    </div>
  )
} 