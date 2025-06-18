import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { ExternalLink, Github, Play } from "lucide-react"

const examples = [
  {
    title: "E-commerce API",
    description: "Complete e-commerce backend with authentication, product management, and payment processing",
    tech: ["Node.js", "Express", "MongoDB", "Stripe"],
    commands: ["frx add login -en", "frx add crud -en", "frx add payment -en", "frx add upload -en"],
    github: "https://github.com/freakend/examples/ecommerce-api",
    demo: "https://ecommerce-api-demo.vercel.app",
  },
  {
    title: "Social Media Backend",
    description: "Social platform with user authentication, posts, comments, and real-time features",
    tech: ["Python", "Django", "PostgreSQL", "Redis"],
    commands: ["frx add login -pyd", "frx add crud -pyd", "frx add upload -pyd", "frx add email -pyd"],
    github: "https://github.com/freakend/examples/social-backend",
    demo: "https://social-backend-demo.herokuapp.com",
  },
  {
    title: "Task Management API",
    description: "Project management tool with teams, tasks, and collaboration features",
    tech: ["Go", "Fiber", "PostgreSQL", "JWT"],
    commands: ["frx add login -go", "frx add crud -go"],
    github: "https://github.com/freakend/examples/task-api",
    demo: "https://task-api-demo.fly.dev",
  },
  {
    title: "Blog Platform",
    description: "Content management system with authentication, posts, and comment system",
    tech: ["PHP", "Laravel", "MySQL", "Redis"],
    commands: ["frx add login -php", "frx add crud -php", "frx add email -php"],
    github: "https://github.com/freakend/examples/blog-platform",
    demo: "https://blog-platform-demo.com",
  },
]

const tutorials = [
  {
    title: "Building a REST API in 5 Minutes",
    description: "Step-by-step guide to create a complete REST API with authentication",
    duration: "5 min read",
    level: "Beginner",
    framework: "Node.js + Express",
  },
  {
    title: "Adding Payment Processing",
    description: "Integrate Stripe payments into your existing API",
    duration: "10 min read",
    level: "Intermediate",
    framework: "Multiple",
  },
  {
    title: "Deploying to Production",
    description: "Best practices for deploying Freakend-generated backends",
    duration: "15 min read",
    level: "Advanced",
    framework: "Multiple",
  },
]

export default function ExamplesPage() {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30 mb-4">
          Examples
        </Badge>
        <h1 className="text-4xl font-bold text-white mb-4">Real-world Examples</h1>
        <p className="text-xl text-slate-300">
          Explore complete applications built with Freakend CLI to see how different modules work together.
        </p>
      </div>

      <Tabs defaultValue="projects" className="w-full">
        <TabsList className="grid w-full grid-cols-2 bg-slate-800">
          <TabsTrigger value="projects">Example Projects</TabsTrigger>
          <TabsTrigger value="tutorials">Tutorials</TabsTrigger>
        </TabsList>

        <TabsContent value="projects" className="mt-8">
          <div className="grid gap-6">
            {examples.map((example, index) => (
              <Card key={index} className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-white text-xl mb-2">{example.title}</CardTitle>
                      <CardDescription className="text-slate-400 text-base">{example.description}</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" asChild>
                        <a href={example.github} target="_blank" rel="noopener noreferrer">
                          <Github className="w-4 h-4 mr-2" />
                          Code
                        </a>
                      </Button>
                      <Button size="sm" asChild>
                        <a href={example.demo} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Demo
                        </a>
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-white font-semibold mb-2">Tech Stack:</h4>
                      <div className="flex flex-wrap gap-2">
                        {example.tech.map((tech, techIndex) => (
                          <Badge key={techIndex} variant="secondary" className="bg-slate-800 text-slate-300">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-white font-semibold mb-2">Generated with:</h4>
                      <div className="bg-slate-950 rounded-lg p-4 border border-slate-700">
                        {example.commands.map((cmd, cmdIndex) => (
                          <div key={cmdIndex} className="font-mono text-sm text-green-400 mb-1 last:mb-0">
                            {cmd}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="tutorials" className="mt-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {tutorials.map((tutorial, index) => (
              <Card key={index} className="bg-slate-900 border-slate-700">
                <CardHeader>
                  <div className="flex justify-between items-start mb-2">
                    <Badge variant="outline" className="border-slate-600 text-slate-300 text-xs">
                      {tutorial.level}
                    </Badge>
                    <span className="text-slate-400 text-sm">{tutorial.duration}</span>
                  </div>
                  <CardTitle className="text-white text-lg">{tutorial.title}</CardTitle>
                  <CardDescription className="text-slate-400">{tutorial.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="text-sm text-slate-400">
                      Framework: <span className="text-slate-300">{tutorial.framework}</span>
                    </div>
                    <Button variant="outline" className="w-full" size="sm">
                      <Play className="w-4 h-4 mr-2" />
                      Start Tutorial
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
