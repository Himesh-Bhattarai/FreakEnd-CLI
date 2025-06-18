import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Coffee, Star, Users, Code, Zap } from "lucide-react"

const donationTiers = [
  {
    name: "Coffee Supporter",
    amount: "$5",
    icon: <Coffee className="w-6 h-6 text-yellow-400" />,
    description: "Buy us a coffee to keep the development going",
    perks: ["Our eternal gratitude", "Supporter badge on Discord"],
    popular: false,
  },
  {
    name: "Pro Supporter",
    amount: "$15",
    icon: <Star className="w-6 h-6 text-blue-400" />,
    description: "Help us dedicate more time to Freakend development",
    perks: ["All Coffee perks", "Early access to new features", "Priority support"],
    popular: true,
  },
  {
    name: "Team Supporter",
    amount: "$50",
    icon: <Users className="w-6 h-6 text-purple-400" />,
    description: "Perfect for teams and companies using Freakend",
    perks: ["All Pro perks", "Feature request priority", "Monthly development updates"],
    popular: false,
  },
  {
    name: "Enterprise Supporter",
    amount: "$100",
    icon: <Zap className="w-6 h-6 text-green-400" />,
    description: "Maximum support for enterprise users",
    perks: ["All Team perks", "Direct line to maintainers", "Custom feature development consideration"],
    popular: false,
  },
]

const stats = [
  { label: "GitHub Stars", value: "12.5K", icon: <Star className="w-5 h-5 text-yellow-400" /> },
  { label: "Monthly Downloads", value: "45K", icon: <Code className="w-5 h-5 text-blue-400" /> },
  { label: "Active Contributors", value: "89", icon: <Users className="w-5 h-5 text-green-400" /> },
  { label: "Projects Created", value: "8.2K", icon: <Zap className="w-5 h-5 text-purple-400" /> },
]

export default function DonatePage() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="max-w-6xl mx-auto px-4 py-16">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <Badge variant="secondary" className="bg-red-600/20 text-red-400 border-red-600/30 mb-6">
            <Heart className="w-4 h-4 mr-2" />
            Support Freakend
          </Badge>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-red-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-6">
            Help Us Build the Future
          </h1>
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto">
            Freakend CLI is free and open-source. Your support helps us maintain the project, add new features, and keep
            the community thriving.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-white">{stat.value}</div>
                <div className="text-slate-400 text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Why Donate Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Why Your Support Matters</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <Code className="w-8 h-8 text-blue-400 mb-2" />
                <CardTitle className="text-white">Continuous Development</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <p>
                  Your donations allow our maintainers to dedicate more time to developing new features, fixing bugs,
                  and improving the overall experience.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <Users className="w-8 h-8 text-green-400 mb-2" />
                <CardTitle className="text-white">Community Growth</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <p>
                  Funds help us organize community events, create educational content, and provide better support to our
                  growing user base.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <Zap className="w-8 h-8 text-purple-400 mb-2" />
                <CardTitle className="text-white">Infrastructure Costs</CardTitle>
              </CardHeader>
              <CardContent className="text-slate-300">
                <p>
                  Supporting hosting costs for our documentation, CI/CD pipelines, and development tools that keep the
                  project running smoothly.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Donation Tiers */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Choose Your Support Level</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {donationTiers.map((tier, index) => (
              <Card
                key={index}
                className={`bg-slate-900 border-slate-700 relative ${tier.popular ? "ring-2 ring-blue-500" : ""}`}
              >
                {tier.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-blue-600 text-white">Most Popular</Badge>
                  </div>
                )}
                <CardHeader className="text-center">
                  <div className="flex justify-center mb-3">{tier.icon}</div>
                  <CardTitle className="text-white">{tier.name}</CardTitle>
                  <div className="text-3xl font-bold text-white">{tier.amount}</div>
                  <p className="text-slate-400 text-sm">{tier.description}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 mb-6">
                    {tier.perks.map((perk, perkIndex) => (
                      <li key={perkIndex} className="text-slate-300 text-sm flex items-center gap-2">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full" />
                        {perk}
                      </li>
                    ))}
                  </ul>
                  <Button
                    className={`w-full ${tier.popular ? "bg-blue-600 hover:bg-blue-700" : "bg-slate-700 hover:bg-slate-600"}`}
                    asChild
                  >
                    <a
                      href={`https://github.com/sponsors/freakend?amount=${tier.amount.replace("$", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Support with {tier.amount}
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Alternative Ways to Support */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-white text-center mb-8">Other Ways to Support</h2>
          <div className="grid md:grid-cols-2 gap-8">
            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Contribute Code</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Can't donate? No problem! Contributing code, documentation, or helping with issues is equally
                  valuable.
                </p>
                <Button variant="outline" className="border-slate-600" asChild>
                  <a href="/docs/contributing">Learn How to Contribute</a>
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-slate-900 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Spread the Word</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-slate-300 mb-4">
                  Share Freakend with your network, write blog posts, or give talks about how it's helped your projects.
                </p>
                <div className="flex gap-3">
                  <Button variant="outline" size="sm" className="border-slate-600" asChild>
                    <a
                      href="https://twitter.com/intent/tweet?text=Check%20out%20Freakend%20CLI%20-%20the%20fastest%20way%20to%20scaffold%20backend%20code!&url=https://freakend.dev"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Tweet
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" className="border-slate-600" asChild>
                    <a href="https://github.com/freakend/cli" target="_blank" rel="noopener noreferrer">
                      Star on GitHub
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Transparency */}
        <Card className="bg-gradient-to-r from-blue-900/20 to-purple-900/20 border-blue-700/30">
          <CardHeader>
            <CardTitle className="text-white text-center">Transparency & Trust</CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-slate-300 mb-6">
              We believe in complete transparency. All donations are used exclusively for Freakend development,
              infrastructure, and community initiatives. We publish quarterly reports showing exactly how funds are
              used.
            </p>
            <div className="grid md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="text-2xl font-bold text-green-400 mb-1">75%</div>
                <div className="text-slate-400 text-sm">Development</div>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="text-2xl font-bold text-blue-400 mb-1">20%</div>
                <div className="text-slate-400 text-sm">Infrastructure</div>
              </div>
              <div className="p-4 bg-slate-800 rounded-lg">
                <div className="text-2xl font-bold text-purple-400 mb-1">5%</div>
                <div className="text-slate-400 text-sm">Community Events</div>
              </div>
            </div>
            <Button variant="outline" className="border-slate-600 mt-6" asChild>
              <a href="https://github.com/freakend/transparency" target="_blank" rel="noopener noreferrer">
                View Financial Reports
              </a>
            </Button>
          </CardContent>
        </Card>

        {/* Thank You Section */}
        <div className="text-center mt-16">
          <h2 className="text-3xl font-bold text-white mb-4">Thank You! ❤️</h2>
          <p className="text-xl text-slate-300 max-w-2xl mx-auto">
            Every contribution, no matter the size, makes a real difference. Thank you for helping us build better tools
            for the developer community.
          </p>
        </div>
      </div>
    </div>
  )
}
