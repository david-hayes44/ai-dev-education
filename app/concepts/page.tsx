import { MainLayout } from "@/components/navigation";

export default function ConceptsPage() {
  return (
    <MainLayout>
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 md:mb-12">
          <h1 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">
            AI-Dev Concepts
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Understanding the fundamentals of AI-assisted development
          </p>
        </div>

        <div className="space-y-8">
          <section className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-2xl font-bold">Introduction to AI-Dev</h2>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              AI-assisted development (AI-Dev) represents a paradigm shift in how we build software. 
              By leveraging large language models and specialized AI tools, developers can enhance 
              their productivity, creativity, and problem-solving capabilities.
            </p>
            <p className="mb-4 text-gray-600 dark:text-gray-400">
              At its core, AI-Dev is about creating a collaborative workflow between human developers 
              and AI systems. The goal is not to replace human ingenuity but to augment it with AI&apos;s 
              capabilities for pattern recognition, knowledge retrieval, and code generation.
            </p>
          </section>

          <section className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-2xl font-bold">Key AI-Dev Principles</h2>
            <ul className="ml-6 list-disc space-y-2 text-gray-600 dark:text-gray-400">
              <li>
                <strong>Augmentation, not replacement:</strong> AI tools should enhance developer 
                capabilities, not replace human judgment and expertise.
              </li>
              <li>
                <strong>Context-awareness:</strong> Effective AI-Dev tools understand the development 
                context, including codebase structure, design patterns, and team conventions.
              </li>
              <li>
                <strong>Feedback loops:</strong> Human feedback continually improves AI suggestions, 
                creating a virtuous learning cycle.
              </li>
              <li>
                <strong>Tool integration:</strong> AI-Dev works best when seamlessly integrated into 
                existing developer workflows and tools.
              </li>
              <li>
                <strong>Transparency:</strong> Developers should understand the capabilities and 
                limitations of their AI assistants.
              </li>
            </ul>
          </section>

          <section className="rounded-lg border bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <h2 className="mb-4 text-2xl font-bold">Benefits of AI-Dev</h2>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <h3 className="mb-2 text-xl font-semibold">Productivity</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Automate repetitive tasks, generate boilerplate code, and quickly 
                  prototype features to accelerate development cycles.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">Code Quality</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Receive real-time suggestions for code improvements, bug detection, 
                  and adherence to best practices.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">Knowledge Access</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Instantly access relevant documentation, examples, and solutions 
                  without leaving your development environment.
                </p>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-semibold">Skill Development</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Learn new technologies and patterns through contextual examples 
                  and explanations provided by AI tools.
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </MainLayout>
  );
} 