import Link from "next/link"
import { Mail, MessageSquare, Phone, Globe, Upload, Info, HelpCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

export default function ContactPage() {
  return (
    <div className="container mx-auto px-6 sm:px-8 py-10 md:py-12">
      {/* Header with breadcrumb */}
      <div className="mb-8">
        <nav className="mb-4 flex items-center text-sm text-muted-foreground">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2 text-muted-foreground">/</span>
          <span className="text-foreground">Contact</span>
        </nav>
        <h1 className="mb-2 text-4xl font-extrabold tracking-tight md:text-5xl">
          Contact Us
        </h1>
        <p className="text-xl text-muted-foreground">
          Get support, provide feedback, or connect with our team
        </p>
      </div>
      
      {/* Contact options tabs */}
      <Tabs defaultValue="support" className="mb-12">
        <TabsList className="grid w-full grid-cols-3 mb-8">
          <TabsTrigger value="support">Technical Support</TabsTrigger>
          <TabsTrigger value="feedback">Feedback</TabsTrigger>
          <TabsTrigger value="general">General Inquiries</TabsTrigger>
        </TabsList>
        
        {/* Support tab */}
        <TabsContent value="support">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Get Technical Support</CardTitle>
                  <CardDescription>
                    Submit your technical question or issue and include screenshots if needed
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" placeholder="your.email@example.com" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="subject">Subject</Label>
                    <Input id="subject" placeholder="Brief description of your issue" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Issue Category</Label>
                    <RadioGroup defaultValue="tool" className="flex flex-wrap gap-6">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="tool" id="tool" />
                        <Label htmlFor="tool">AI Tool Issue</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mcp" id="mcp" />
                        <Label htmlFor="mcp">MCP Implementation</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="server" id="server" />
                        <Label htmlFor="server">Server Problem</Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="other" id="other" />
                        <Label htmlFor="other">Other</Label>
                      </div>
                    </RadioGroup>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Detailed Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Please describe your issue in detail, including any error messages, steps to reproduce, and your environment (OS, browser, etc.)."
                      className="min-h-[150px]"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="screenshot">Upload Screenshots (optional)</Label>
                    <div className="border-2 border-dashed rounded-md p-6 text-center hover:bg-accent/5 transition-colors cursor-pointer">
                      <Upload className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground mb-1">
                        Drag and drop your screenshots here, or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Supports PNG, JPG, or GIF up to 5MB each (max 3 files)
                      </p>
                      <Input 
                        id="screenshot" 
                        type="file" 
                        className="hidden" 
                        accept="image/png, image/jpeg, image/gif"
                        multiple
                      />
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4">
                  <Button className="w-full sm:w-auto" type="submit">
                    Submit Support Request
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    <span>Support Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email Support</p>
                      <p className="text-sm text-muted-foreground">
                        support@aidevtools.com
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Response within 24-48 hours
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <MessageSquare className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Community Support</p>
                      <p className="text-sm text-muted-foreground">
                        Join our Discord for community help
                      </p>
                      <Button asChild variant="link" className="h-auto p-0 text-xs mt-1">
                        <Link href="https://discord.gg/aidevtools">
                          discord.gg/aidevtools
                        </Link>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Clock className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Support Hours</p>
                      <p className="text-sm text-muted-foreground">
                        Monday-Friday: 9AM-6PM PT<br />
                        Weekend: Limited support
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HelpCircle className="h-5 w-5 text-primary" />
                    <span>Frequently Asked Questions</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="item-1">
                      <AccordionTrigger>How quickly will I get a response?</AccordionTrigger>
                      <AccordionContent>
                        We strive to respond to all support requests within 24-48 hours during business days. 
                        Critical issues may be addressed sooner.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-2">
                      <AccordionTrigger>What information should I include?</AccordionTrigger>
                      <AccordionContent>
                        For the fastest resolution, please include details about your environment, 
                        steps to reproduce the issue, error messages, and screenshots if applicable.
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="item-3">
                      <AccordionTrigger>Can I request a feature?</AccordionTrigger>
                      <AccordionContent>
                        Yes! We welcome feature requests. Please use the Feedback tab to submit your ideas 
                        for new features or improvements.
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
        
        {/* Feedback tab */}
        <TabsContent value="feedback">
          <Card>
            <CardHeader>
              <CardTitle>Share Your Feedback</CardTitle>
              <CardDescription>
                We value your input to help us improve our content and tools
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="feedback-name">Name</Label>
                  <Input id="feedback-name" placeholder="Your name" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="feedback-email">Email</Label>
                  <Input id="feedback-email" type="email" placeholder="your.email@example.com" />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Feedback Type</Label>
                <RadioGroup defaultValue="content" className="flex flex-wrap gap-6">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="content" id="content" />
                    <Label htmlFor="content">Content Feedback</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="feature" id="feature" />
                    <Label htmlFor="feature">Feature Request</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="general" id="general-feedback" />
                    <Label htmlFor="general-feedback">General Feedback</Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedback-subject">Subject</Label>
                <Input id="feedback-subject" placeholder="Brief description of your feedback" />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="feedback-details">Detailed Feedback</Label>
                <Textarea 
                  id="feedback-details" 
                  placeholder="Please share your thoughts, ideas, or suggestions in detail. Specific examples are always helpful."
                  className="min-h-[150px]"
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col sm:flex-row gap-4">
              <Button className="w-full sm:w-auto" type="submit">
                Submit Feedback
              </Button>
              <Button variant="outline" className="w-full sm:w-auto">
                Cancel
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        {/* General Inquiries tab */}
        <TabsContent value="general">
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Our Team</CardTitle>
                  <CardDescription>
                    For partnership opportunities, media inquiries, or general questions
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-name">Name</Label>
                      <Input id="contact-name" placeholder="Your name" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-email">Email</Label>
                      <Input id="contact-email" type="email" placeholder="your.email@example.com" />
                    </div>
                  </div>
                  
                  <div className="grid gap-6 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="contact-organization">Organization (optional)</Label>
                      <Input id="contact-organization" placeholder="Your company or organization" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="contact-phone">Phone (optional)</Label>
                      <Input id="contact-phone" type="tel" placeholder="+1 (555) 123-4567" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact-subject">Subject</Label>
                    <Input id="contact-subject" placeholder="What would you like to discuss?" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="contact-message">Message</Label>
                    <Textarea 
                      id="contact-message" 
                      placeholder="Please include any relevant details about your inquiry."
                      className="min-h-[150px]"
                    />
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col sm:flex-row gap-4">
                  <Button className="w-full sm:w-auto" type="submit">
                    Send Message
                  </Button>
                  <Button variant="outline" className="w-full sm:w-auto">
                    Cancel
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-start gap-3">
                    <Mail className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email</p>
                      <p className="text-sm text-muted-foreground">
                        hello@aidevtools.com
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Phone className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Phone</p>
                      <p className="text-sm text-muted-foreground">
                        +1 (888) 123-4567
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Globe className="h-5 w-5 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-sm text-muted-foreground">
                        San Francisco, CA<br />
                        United States
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Connect With Us</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-4">
                    <Button variant="outline" size="icon" asChild>
                      <Link href="https://twitter.com/aidevtools">
                        <TwitterIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href="https://github.com/aidevtools">
                        <GithubIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href="https://linkedin.com/company/aidevtools">
                        <LinkedinIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="outline" size="icon" asChild>
                      <Link href="https://discord.gg/aidevtools">
                        <DiscordIcon className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Social icons
function TwitterIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M22 5.8a8.49 8.49 0 0 1-2.36.64 4.13 4.13 0 0 0 1.81-2.27 8.21 8.21 0 0 1-2.61 1 4.1 4.1 0 0 0-7 3.74 11.64 11.64 0 0 1-8.45-4.29 4.16 4.16 0 0 0-.55 2.07 4.09 4.09 0 0 0 1.82 3.41 4.05 4.05 0 0 1-1.86-.51v.05a4.1 4.1 0 0 0 3.3 4 3.93 3.93 0 0 1-1.85.07 4.11 4.11 0 0 0 3.83 2.85A8.22 8.22 0 0 1 2 18.33a11.57 11.57 0 0 0 6.29 1.85A11.59 11.59 0 0 0 20 8.45v-.53A8.43 8.43 0 0 0 22 5.8z"
      />
    </svg>
  )
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34-.46-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.87 1.52 2.34 1.07 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.55-1.11-4.55-4.92 0-1.11.38-2 1.03-2.71-.1-.25-.45-1.29.1-2.64 0 0 .84-.27 2.75 1.02.79-.22 1.65-.33 2.5-.33.85 0 1.71.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.35.2 2.39.1 2.64.65.71 1.03 1.6 1.03 2.71 0 3.82-2.34 4.66-4.57 4.91.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"
      />
    </svg>
  )
}

function LinkedinIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M16 8.2c.7 0 1.4.3 1.8.8s.7 1.3.8 2v9h3.4V11c-.1-1.7-.7-3.1-1.7-4.1S18 5.2 16 5c-1.5 0-2.8.5-3.8 1.3C11.2 7.2 10.7 8.2 10.5 9.5V5.2H7.2v15.6h3.4v-9c0-.7.3-1.4.7-1.8.4-.5 1-1 1.8-.9.7 0 1.4.3 1.8.8.4.5.7 1.2.7 1.9v9h3.4v-9c-.1-.8-.3-1.4-.7-1.9s-1-1-1.8-.9h.5zM5 5.2c-.5 0-1 .2-1.3.5-.4.3-.6.8-.6 1.3s.2 1 .6 1.4c.3.3.8.5 1.3.5s1-.2 1.4-.5c.4-.3.5-.8.5-1.3s-.2-1-.5-1.4c-.4-.3-.8-.5-1.4-.5zm-1.7 4.5h3.3v11.1H3.3z"
      />
    </svg>
  )
}

function DiscordIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path
        fill="currentColor"
        d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"
      />
    </svg>
  )
}

function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
} 