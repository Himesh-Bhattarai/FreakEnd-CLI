import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, GitCommit, Star, Bug, Zap, Shield } from "lucide-react"

const releases = [
  {
    version: "1.2.0",
    date: "2024-01-15",
    type: "major",
    description: "Major update with new framework support and improved performance",
    changes: [
      { type: "feature", text: "Added support for Go with Fiber framework" },
      { type: "feature", text: "New email command with template support" },
      { type: "feature", text: "Interactive CLI with better error messages" },
      { type: "improvement", text: "50% faster code generation" },
      { type: "improvement", text: "Better TypeScript support" },
      { type: "fix", text: "Fixed database connection issues in Django templates" },
      { type: "fix", text: "Resolved Windows path handling bugs" },
    ],
  },
  {
    version: "1.1.5",
    date: "2024-01-02",
    type: "patch",
    description: "Bug fixes and minor improvements",
    changes: [
      { type: "fix", text: "Fixed JWT token expiration handling" },
      { type: "fix", text: "Resolved CORS configuration issues" },
      { type: "improvement", text: "Updated dependencies to latest versions" },
      { type: "improvement", text: "Better error messages for invalid commands" },
    ],
  },
  {
    version: "1.1.0",
    date: "2023-12-20",
    type: "minor",
    description: "New features and framework additions",
    changes: [
      { type: "feature", text: "Added PHP Laravel support" },
      { type: "feature", text: "New upload command with cloud storage integration" },
      { type: "feature", text: "Configuration file support (freakend.config.js)" },
      { type: "improvement", text: "Enhanced security in generated authentication code" },
      { type: "improvement", text: "Better documentation generation" },
    ],
  },
  {
    version: "1.0.0",
    date: "2023-12-01",
    type: "major",
    description: "First stable release! 🎉",
    changes: [
      { type: "feature", text: "Complete authentication system generation" },
      { type: "feature", text: "CRUD operations with validation" },
      { type: "feature", text: "Payment integration with Stripe" },
      { type: "feature", text: "Support for Express.js and Django" },
      { type: "feature", text: "Comprehensive test generation" },
    ],
  },
]

const getChangeIcon = (type: string) => {
  switch (type) {
    case "feature":
      return <Star className="w-4 h-4 text-green-400" />
    case "improvement":
      return <Zap className="w-4 h-4 text-blue-400" />
    case "fix":
      return <Bug className="w-4 h-4 text-red-400" />
    case "security":
      return <Shield className="w-4 h-4 text-purple-400" />
    default:
      return <GitCommit className="w-4 h-4 text-slate-400" />
  }
}

const getVersionBadgeColor = (type: string) => {
  switch (type) {
    case "major":
      return "bg-red-600/20 text-red-400 border-red-600/30"
    case "minor":
      return "bg-blue-600/20 text-blue-400 border-blue-600/30"
    case "patch":
      return "bg-green-600/20 text-green-400 border-green-600/30"
    default:
      return "bg-slate-600/20 text-slate-400 border-slate-600/30"
  }
}

export default function ChangelogPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Badge variant="secondary" className="bg-green-600/20 text-green-400 border-green-600/30 mb-4">
          Changelog
        </Badge>
        <h1 className="text-4xl font-bold text-white mb-4">Release History</h1>
        <p className="text-xl text-slate-300">Track all changes, improvements, and new features in Freakend CLI.</p>
      </div>

      <div className="space-y-8">
        {releases.map((release, index) => (
          <Card key={release.version} className="bg-slate-900 border-slate-700">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <CardTitle className="text-white text-2xl">v{release.version}</CardTitle>
                  <Badge variant="secondary" className={getVersionBadgeColor(release.type)}>
                    {release.type}
                  </Badge>
                  {index === 0 && (
                    <Badge variant="secondary" className="bg-yellow-600/20 text-yellow-400 border-yellow-600/30">
                      Latest
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Calendar className="w-4 h-4" />
                  <span className="text-sm">{release.date}</span>
                </div>
              </div>
              <p className="text-slate-300">{release.description}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {release.changes.map((change, changeIndex) => (
                  <div key={changeIndex} className="flex items-start gap-3">
                    {getChangeIcon(change.type)}
                    <span className="text-slate-300 text-sm">{change.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Subscribe to updates */}
      <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/30 mt-12">
        <CardHeader>
          <CardTitle className="text-white">Stay Updated</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 mb-4">Get notified about new releases and important updates.</p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="https://github.com/freakend/cli/releases"
              className="inline-flex items-center justify-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <GitCommit className="w-4 h-4 mr-2" />
              Watch on GitHub
            </a>
            <a
              href="https://twitter.com/freakend_dev"
              className="inline-flex items-center justify-center px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              Follow on Twitter
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
