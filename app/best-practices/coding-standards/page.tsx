import { Metadata } from "next"
import { Container } from "@/components/ui/container"
import { PageHeader } from "@/components/page-header"

export const metadata: Metadata = {
  title: "Coding Standards for AI-Assisted Development",
  description: "Establishing and maintaining coding standards when working with AI tools.",
}

export default function Page() {
  return (
    <>
      <PageHeader
        title="Coding Standards for AI-Assisted Development"
        description="Establishing and maintaining coding standards when working with AI tools."
      />
      <Container className="py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Table of Contents - only visible on larger screens */}
          <div className="hidden lg:block lg:col-span-3">
            <div className="p-4 border rounded-lg sticky top-20">
              <p className="font-medium mb-3">On this page</p>
              <ul className="space-y-1 text-sm">
                <li>
                  <a 
                    href="#introduction" 
                    className="text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Introduction
                  </a>
                </li>
                <li>
                  <a 
                    href="#key-points" 
                    className="text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Key Points
                  </a>
                </li>
                <li>
                  <a 
                    href="#details" 
                    className="text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Details
                  </a>
                </li>
                <li>
                  <a 
                    href="#related-resources" 
                    className="text-muted-foreground hover:text-primary transition-colors block py-1"
                  >
                    Related Resources
                  </a>
                </li>
              </ul>
            </div>
          </div>
          
          {/* Main content */}
          <div className="lg:col-span-9">
            <div className="prose prose-lg dark:prose-invert mx-auto">
              <h2 id="introduction">Introduction</h2>
              <p>
                This is a placeholder content for the Coding Standards for AI-Assisted Development page. This section will be populated with
                actual content regarding the topic.
              </p>

              <h2 id="key-points">Key Points</h2>
              <ul>
                <li>First important point about this topic</li>
                <li>Second important point about this topic</li>
                <li>Third important point about this topic</li>
              </ul>

              <h2 id="details">Details</h2>
              <p>
                More detailed information about the topic will be presented here, including
                examples, code snippets, and practical implementation guidance.
              </p>

              <h2 id="related-resources">Related Resources</h2>
              <ul>
                <li>Link to related resource 1</li>
                <li>Link to related resource 2</li>
                <li>Link to related resource 3</li>
              </ul>
            </div>
          </div>
        </div>
      </Container>
    </>
  )
}