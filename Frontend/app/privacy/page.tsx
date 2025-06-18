import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Eye, Lock, Database } from "lucide-react"

export default function PrivacyPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <Badge variant="secondary" className="bg-blue-600/20 text-blue-400 border-blue-600/30 mb-4">
          Privacy Policy
        </Badge>
        <h1 className="text-4xl font-bold text-white mb-4">Privacy Policy</h1>
        <p className="text-xl text-slate-300">
          Your privacy is important to us. This policy explains how we collect, use, and protect your information.
        </p>
        <p className="text-sm text-slate-400 mt-2">Last updated: January 15, 2024</p>
      </div>

      <div className="space-y-8">
        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Eye className="w-5 h-5 text-blue-400" />
              Information We Collect
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <p>We collect minimal information to provide and improve our services:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>
                <strong>Usage Data:</strong> CLI command usage statistics (anonymized)
              </li>
              <li>
                <strong>Error Reports:</strong> Crash reports and error logs (no personal data)
              </li>
              <li>
                <strong>Analytics:</strong> Website usage through privacy-focused analytics
              </li>
              <li>
                <strong>Donations:</strong> Payment information processed by third-party providers
              </li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Database className="w-5 h-5 text-green-400" />
              How We Use Your Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <p>We use collected information to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Improve the CLI tool and fix bugs</li>
              <li>Understand which features are most used</li>
              <li>Provide customer support</li>
              <li>Send important updates about the project</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Lock className="w-5 h-5 text-purple-400" />
              Data Protection
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <p>We protect your information through:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Encryption of data in transit and at rest</li>
              <li>Regular security audits and updates</li>
              <li>Limited access to personal information</li>
              <li>No sale of personal data to third parties</li>
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-slate-900 border-slate-700">
          <CardHeader>
            <CardTitle className="text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-red-400" />
              Your Rights
            </CardTitle>
          </CardHeader>
          <CardContent className="text-slate-300 space-y-4">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Delete your personal information</li>
              <li>Opt-out of data collection</li>
              <li>Export your data</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, contact us at{" "}
              <a href="mailto:privacy@freakend.dev" className="text-blue-400 hover:text-blue-300">
                privacy@freakend.dev
              </a>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
