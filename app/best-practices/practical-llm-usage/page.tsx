import { Metadata } from "next"
import { ContentTemplate, CodeBlock, Callout } from "@/components/content"
import { generateMetadata } from "@/lib/content-utils"

export const metadata: Metadata = generateMetadata({
  title: "Practical LLM Usage for Developers",
  description: "Learn effective strategies for using Large Language Models in your development workflow, based on Simon Willison's practical insights.",
  keywords: ["LLM", "AI coding", "hallucinations", "prompt engineering", "development workflow", "Simon Willison"],
  section: "best-practices/practical-llm-usage"
})

export default function PracticalLLMUsage() {
  return (
    <ContentTemplate
      title="Practical LLM Usage for Developers"
      description="Learn effective strategies for using Large Language Models in your development workflow, based on Simon Willison's practical insights."
      metadata={{
        difficulty: "intermediate",
        timeToComplete: "15 minutes",
        prerequisites: [
          {
            title: "Introduction to AI-Assisted Development",
            href: "/introduction/concepts"
          }
        ]
      }}
      tableOfContents={[
        {
          id: "introduction",
          title: "Introduction",
          level: 2
        },
        {
          id: "understanding-hallucinations",
          title: "Understanding LLM Hallucinations",
          level: 2,
          children: [
            {
              id: "why-not-biggest-worry",
              title: "Why Hallucinations Aren't the Biggest Worry",
              level: 3
            },
            {
              id: "how-to-handle",
              title: "How to Spot and Handle Hallucinations",
              level: 3
            }
          ]
        },
        {
          id: "practical-tips",
          title: "Practical Tips for Using LLMs",
          level: 2,
          children: [
            {
              id: "exploratory-coding",
              title: "Exploratory Coding: Prototyping and Learning",
              level: 3
            },
            {
              id: "production-coding",
              title: "Production Coding: Building Reliable Code",
              level: 3
            },
            {
              id: "giving-instructions",
              title: "Giving Great Instructions",
              level: 3
            },
            {
              id: "refining-outputs",
              title: "Refining Outputs",
              level: 3
            }
          ]
        },
        {
          id: "leveraging-context",
          title: "Leveraging Context for Better Results",
          level: 2,
          children: [
            {
              id: "why-context-matters",
              title: "Why Context Matters",
              level: 3
            },
            {
              id: "providing-context",
              title: "How to Provide Context",
              level: 3
            },
            {
              id: "reducing-hallucinations",
              title: "Reducing Hallucinations with Context",
              level: 3
            }
          ]
        },
        {
          id: "putting-together",
          title: "Putting It All Together",
          level: 2
        }
      ]}
      relatedContent={[
        {
          title: "MCP Context Management",
          href: "/mcp/context-management",
          description: "Learn techniques for effectively managing model context with MCP."
        },
        {
          title: "Code Review Best Practices",
          href: "/best-practices/code-review",
          description: "Guidelines for reviewing AI-generated code in your projects."
        },
        {
          title: "Testing AI-Generated Code",
          href: "/best-practices/testing",
          description: "Approaches to ensure AI-generated code is reliable and robust."
        }
      ]}
    >
      <h2 id="introduction">Introduction</h2>
      <p>
        AI-assisted development can transform how you write code, debug issues, and explore new ideas—provided you use it wisely. 
        This guide draws from Simon Willison's practical insights to help you get dependable results from Large Language Models (LLMs) 
        in your development workflow.
      </p>
      <p>
        Whether you're prototyping a new feature or refining production code, these best practices will help you harness AI 
        effectively while avoiding common pitfalls. We'll cover handling hallucinations, applying LLMs for different coding 
        tasks, and enhancing results with better context management.
      </p>

      <h2 id="understanding-hallucinations">Understanding LLM Hallucinations</h2>
      <p>
        Hallucinations happen when an LLM generates code that references made-up libraries, methods, or APIs—things that 
        sound plausible but don't exist. While this might seem like a dealbreaker, it's actually not as bad as it sounds.
      </p>

      <h3 id="why-not-biggest-worry">Why Hallucinations Aren't the Biggest Worry</h3>
      <p>
        Unlike subtle logic errors that can slip into production unnoticed, hallucinations are usually obvious. Try running 
        code with a fake <code>superCoolMethod()</code>, and you'll get an immediate error—something like <code>AttributeError</code> 
        or <code>ModuleNotFoundError</code>. This makes them easy to catch and fix compared to bugs that only surface later.
      </p>

      <Callout type="info" title="Hallucinations vs. Logic Errors">
        Logic errors (where code runs but produces incorrect results) are often more dangerous than hallucinations 
        (references to non-existent APIs) because logic errors can slip through testing undetected.
      </Callout>

      <h3 id="how-to-handle">How to Spot and Handle Hallucinations</h3>
      <ul>
        <li>
          <strong>Run the Code</strong>: The simplest way to detect hallucinations is to execute the code. If it fails right away, 
          you've likely found a hallucination.
        </li>
        <li>
          <strong>Double-Check References</strong>: If the LLM mentions an unfamiliar function or library, look it up in the 
          official docs or a quick search. Don't assume it's real just because it looks convincing.
        </li>
        <li>
          <strong>Keep Testing in Your Pipeline</strong>: Treat LLM-generated code like any other code—run your unit tests and 
          integration checks to confirm it works as intended.
        </li>
      </ul>

      <p>
        Don't let hallucinations scare you off from using LLMs. They're a manageable quirk, not a fatal flaw. Focus your energy on 
        verifying outputs and catching the trickier, less obvious mistakes.
      </p>

      <h2 id="practical-tips">Practical Tips for Using LLMs</h2>
      <p>
        Simon Willison uses LLMs in two main ways: <strong>exploratory coding</strong> (figuring things out fast) and 
        <strong>production coding</strong> (building reliable, usable code). Here's how you can do the same, with tips 
        to make your interactions with LLMs as effective as possible.
      </p>

      <h3 id="exploratory-coding">Exploratory Coding: Prototyping and Learning</h3>
      <p>
        When you're diving into unfamiliar territory—like a new language or library—LLMs are perfect for quick experiments.
      </p>

      <h4>Get Options First</h4>
      <p>
        Ask the LLM to list possible approaches to a problem. For example:
      </p>
      <CodeBlock 
        language="text"
        code={`How can I visualize an audio wave?`}
      />
      <p>You might get responses like:</p>
      <ol>
        <li><code>matplotlib</code> for a static plot in Python.</li>
        <li><code>D3.js</code> for an interactive web visualization.</li>
        <li><code>Processing</code> for real-time graphics.</li>
      </ol>

      <h4>Request a Prototype</h4>
      <p>
        Pick an option and ask for a working example:
      </p>
      <CodeBlock 
        language="text"
        code={`Give me a basic D3.js script to visualize an audio wave.`}
      />
      <p>The LLM might generate something like:</p>
      <CodeBlock 
        language="javascript"
        code={`const svg = d3.select("body").append("svg").attr("width", 500).attr("height", 200);

const data = Array.from({ length: 100 }, () => Math.sin(Math.random() * 10));

svg.selectAll("line")
   .data(data)
   .enter()
   .append("line")
   .attr("x1", (d, i) => i * 5)
   .attr("y1", 100)
   .attr("x2", (d, i) => i * 5)
   .attr("y2", d => 100 + d * 50);`}
      />
      <p>
        This isn't production-ready, but it's a starting point you can tweak.
      </p>

      <h4>Iterate Freely</h4>
      <p>
        Use the prototype to experiment. Ask follow-ups like:
      </p>
      <CodeBlock 
        language="text"
        code={`How do I add real audio data to this?`}
      />
      <p>
        The goal is speed and learning, not perfection.
      </p>

      <Callout type="tip" title="Exploration Mode">
        For exploratory coding, prioritize speed and learning over code quality. Use LLMs to quickly understand 
        possibilities and get working prototypes that you can experiment with.
      </Callout>

      <h3 id="production-coding">Production Coding: Building Reliable Code</h3>
      <p>
        For code that'll ship, you need precision. LLMs can still help—think of them as a super-smart assistant.
      </p>

      <h4>Be Ultra-Specific</h4>
      <p>
        Tell the LLM exactly what you need, including constraints. Example:
      </p>
      <CodeBlock 
        language="text"
        code={`Write a Python function to validate an email address. It should return True for valid emails (e.g., user@domain.com) and False otherwise, using regex for standard email rules.`}
      />
      <p>You might get:</p>
      <CodeBlock 
        language="python"
        code={`import re

def is_valid_email(email):
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(pattern, email))`}
      />

      <h4>Test Everything</h4>
      <p>
        Run the code with edge cases: <code>test@domain</code>, <code>invalid@.com</code>, <code>user@domain.co.uk</code>. 
        If it fails, refine your prompt:
      </p>
      <CodeBlock 
        language="text"
        code={`Update it to handle international domains like .co.uk.`}
      />

      <h4>Use It for Boilerplate</h4>
      <p>
        LLMs shine at churning out repetitive code. Ask for a REST API client or a config parser, then polish it yourself.
      </p>

      <h3 id="giving-instructions">Giving Great Instructions</h3>
      <p>
        Your results depend on your prompts. Make them count:
      </p>
      <ul>
        <li><strong>Be Clear</strong>: <em>"Write a function to sort a list of integers"</em> beats <em>"Help me with sorting."</em></li>
        <li><strong>Add Context</strong>: <em>"I'm using Python 3.9 and need a function for a Flask app."</em></li>
        <li><strong>Guide the Output</strong>: <em>"Include comments and use type hints."</em></li>
      </ul>

      <Callout type="info" title="MCP Integration">
        When using MCP-compatible tools, you can often skip adding manual context as the tools will automatically 
        retrieve relevant project context for you. This makes your prompts cleaner and more focused.
      </Callout>

      <h3 id="refining-outputs">Refining Outputs</h3>
      <p>
        Rarely will the first result be perfect. Iterate:
      </p>
      <ul>
        <li>
          <strong>Fix Errors</strong>: <em>"This crashes with None input. Add a check for that."</em>
        </li>
        <li>
          <strong>Improve It</strong>: <em>"Make this faster with a generator instead of a list."</em>
        </li>
      </ul>
      <p>Example follow-up output:</p>
      <CodeBlock 
        language="python"
        code={`def is_valid_email(email: str) -> bool:
    if not email:
        return False
    pattern = r'^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$'
    return bool(re.match(pattern, email))`}
      />

      <p>
        Treat LLMs like a pair-programming buddy: give them direction, check their work, and nudge them until it's right.
      </p>

      <h2 id="leveraging-context">Leveraging Context for Better Results</h2>
      <p>
        Simon emphasizes that LLMs perform better when you give them context—like example code or project details. 
        This is where tools like the Model Context Protocol (MCP) can amplify your results.
      </p>

      <h3 id="why-context-matters">Why Context Matters</h3>
      <p>
        Without context, an LLM might suggest a solution that's outdated or irrelevant to your setup. Feed it specifics, 
        and it's more likely to nail the task.
      </p>

      <h3 id="providing-context">How to Provide Context</h3>
      <h4>Manually</h4>
      <p>
        Paste relevant code or docs into your prompt. Example:
      </p>
      <CodeBlock 
        language="text"
        code={`Here's my current setup: 
import requests; 
url = 'api.example.com'

Write a function to fetch data from it.`}
      />

      <h4>With MCP</h4>
      <p>
        If you're using MCP, it can automatically supply details like your library versions or project structure. 
        Imagine telling the LLM:
      </p>
      <CodeBlock 
        language="text"
        code={`Use the requests version in my MCP context (2.25.1) to fetch JSON data.`}
      />
      <p>Result:</p>
      <CodeBlock 
        language="python"
        code={`import requests

def fetch_json(url):
    response = requests.get(url)
    return response.json()`}
      />

      <h3 id="reducing-hallucinations">Reducing Hallucinations with Context</h3>
      <p>
        Context helps ground the LLM in reality. If it knows you're using <code>pandas 1.5.3</code>, it won't suggest 
        methods from <code>2.0.0</code> that don't exist in your environment.
      </p>

      <Callout type="success" title="MCP Advantage">
        The Model Context Protocol (MCP) automates context sharing across tools, reducing hallucinations by 
        giving all AI tools access to the same accurate information about your project.
      </Callout>

      <h2 id="putting-together">Putting It All Together</h2>
      <p>
        Here's how to weave these practices into your daily work:
      </p>
      <ul>
        <li><strong>Start Small</strong>: Use LLMs for a quick prototype or a one-off function. Test it, tweak it, and build confidence.</li>
        <li><strong>Verify Always</strong>: Run the code, check references, and lean on your testing suite. Hallucinations and bugs don't stand a chance.</li>
        <li><strong>Scale with Context</strong>: As projects grow, use tools like MCP to keep your LLM aligned with your codebase.</li>
        <li><strong>Iterate Fearlessly</strong>: Treat LLM outputs as a first draft—polish them with your expertise.</li>
      </ul>

      <p>
        For developers and engineers, this approach turns LLMs into a reliable ally. You'll write code faster, explore ideas with ease, 
        and ship with confidence—all while keeping AI's quirks in check. Simon Willison's insights prove it's less about blind trust 
        and more about smart collaboration. Apply these tips, and you'll see practical results in no time.
      </p>
    </ContentTemplate>
  )
}