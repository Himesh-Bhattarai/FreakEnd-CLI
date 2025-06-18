import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { CheckCircle, Clock, Zap, Code, Globe, Shield, Rocket } from "lucide-react"

const roadmapItems = [
  {
    quarter: "Q1 2024",
    status: "completed",
    progress: 100,
    items: [
      {
        title: "Go Framework Support",
        description: "Add support for Go with Fiber framework",
        status: "completed",
        icon: <Code className="w-5 h-5 text-green-400" />,
      },
      {
        title: "Email Command",
        description: "Generate email services with template support",
        status: "completed",
        icon: <Zap className="w-5 h-5 text-green-400" />,
      },
      {
        title: "Interactive CLI",
        description: "Improved CLI with better prompts and error handling",
        status: "completed",
        icon: <CheckCircle className="w-5 h-5 text-green-400" />,
      },
    ],
  },
  {
    quarter: "Q2 2024",
    status: "in-progress",
    progress: 75,
    items: [
      {
        title: "Ruby on Rails Support",
        description: "Add support for Ruby on Rails framework",
        status: "completed",
        icon: <Code className="w-5 h-5 text-green-400" />,
      },
      {
        title: "Advanced Testing",
        description: "Generate comprehensive test suites with coverage",
        status: "in-progress",
        icon: <Clock className="w-5 h-5 text-blue-400" />,
      },
      {
        title: "Docker Integration",
        description: "Generate Docker configurations and compose files",
        status: "in-progress",
        icon: <Clock className="w-5 h-5 text-blue-400" />,
      },
    ],
  },
  {
    quarter: "Q3 2024",
    status: "planned",
    progress: 25,
    items: [
      {
        title: "GraphQL Support",
        description: "Generate GraphQL APIs with resolvers and schemas",
        status: "planned",
        icon: <Globe className="w-5 h-5 text-slate-400" />,
      },
      {
        title: "Microservices Architecture",
        description: "Generate microservices with service discovery",
        status: "planned",
        icon: <Rocket className="w-5 h-5 text-slate-400" />,
      },
      {
        title: "Advanced Security",
        description: "Enhanced security features and vulnerability scanning",
        status: "planned",
        icon: <Shield className="w-5 h-5 text-slate-400" />,
      },
    ],
  },
  {
    quarter: "Q4 2024",
    status: "planned",
    progress: 0,
    items: [
      {
        title: "Java Spring Boot",
        description: "Add support for Java Spring Boot framework",
        status: "planned",
        icon: <Code className="w-5 h-5 text-slate-400" />,
      },
      {
        title: "Real-time Features",
        description: "Generate WebSocket and real-time communication code",
        status: "planned",
        icon: <Zap className="w-5 h-5 text-slate-400" />,
      },
      {
        title: "Cloud Deployment",
        description: "One-click deployment to major cloud providers",
        status: "planned",
        icon: <Rocket className="w-5 h-5 text-slate-400" />,
      },
    ],
  },
]

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-green-600/20 text-green-400 border-green-600/30"
    case "in-progress":
      return "bg-blue-600/20 text-blue-400 border-blue-600/30"
    case "planned":
      return "bg-slate-600/20 text-slate-400 border-slate-600/30"
    default:
      return "bg-slate-600/20 text-slate-400 border-slate-600/30"
  }
}

const getItemStatusIcon = (status: string) => {
  switch (status) {
    case "completed":
      return <CheckCircle className="w-4 h-4 text-green-400" />
    case "in-progress":
      return <Clock className="w-4 h-4 text-blue-400" />
    case "planned":
      return <Clock className="w-4 h-4 text-slate-400" />
    default:
      return <Clock className="w-4 h-4 text-slate-400" />
  }
}

export default function RoadmapPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30 mb-4">
          Roadmap
        </Badge>
        <h1 className="text-4xl font-bold text-white mb-4">Development Roadmap</h1>
        <p className="text-xl text-slate-300">
          Our plans for the future of Freakend CLI. Help us prioritize by voting on features!
        </p>
      </div>

      <div className="space-y-8">
        {roadmapItems.map((quarter, index) => (
          <Card key={quarter.quarter} className="bg-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-white text-xl">{quarter.quarter}</CardTitle>
                  <Badge variant="secondary" className={getStatusColor(quarter.status)}>
                    {quarter.status.replace("-", " ")}
                  </Badge>
                </div>
                <div className="text-slate-400 text-sm">{quarter.progress}% Complete</div>
              </div>
              <Progress value={quarter.progress} className="h-2" />
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {quarter.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex items-start gap-4 p-4 bg-slate-800/50 rounded-lg">
                    <div className="flex-shrink-0">{item.icon}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-white font-semibold">{item.title}</h3>
                        {getItemStatusIcon(item.status)}
                      </div>
                      <p className="text-slate-300 text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Community Input */}
      <Card className="bg-gradient-to-r from-purple-900/20 to-blue-900/20 border-purple-700/30 mt-12">
        <CardHeader>
          <CardTitle className="text-white">Help Shape the Future</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 mb-4">
            Your feedback drives our development. Vote on features, suggest new ideas, or contribute to the codebase.
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <a
              href="https://github.com/freakend/cli/discussions/categories/feature-requests"
              className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <h4 className="text-white font-semibold mb-1">Feature Requests</h4>
              <p className="text-slate-400 text-sm">Suggest new features and vote on existing ones</p>
            </a>
            <a
              href="https://github.com/freakend/cli/issues"
              className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors"
            >
              <h4 className="text-white font-semibold mb-1">Report Issues</h4>
              <p className="text-slate-400 text-sm">Help us improve by reporting bugs and issues</p>
            </a>
            <a href="/docs/contributing" className="p-3 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors">
              <h4 className="text-white font-semibold mb-1">Contribute</h4>
              <p className="text-slate-400 text-sm">Join our development team and build the future</p>
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
