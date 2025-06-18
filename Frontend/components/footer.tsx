import Link from "next/link"
import { Terminal, Github, Twitter, DiscIcon as Discord } from "lucide-react"

export function Footer() {
  return (
    <footer className="bg-slate-950 border-t border-slate-800 dark:bg-slate-950 dark:border-slate-800 light:bg-slate-50 light:border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Terminal className="h-6 w-6 text-blue-400" />
              <span className="font-bold text-xl text-white dark:text-white light:text-slate-900">Freakend</span>
            </div>
            <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 mb-4 max-w-md">
              The fastest way to scaffold backend logic for any language. Generate production-ready authentication, CRUD
              operations, and more in seconds.
            </p>
            <div className="flex space-x-4">
              <Link href="https://github.com/freakend" className="text-slate-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </Link>
              <Link href="https://twitter.com/freakend" className="text-slate-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </Link>
              <Link href="https://discord.gg/freakend" className="text-slate-400 hover:text-white transition-colors">
                <Discord className="h-5 w-5" />
              </Link>
            </div>
          </div>

          {/* Documentation */}
          <div>
            <h3 className="text-white dark:text-white light:text-slate-900 font-semibold mb-4">Documentation</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/docs/getting-started"
                  className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors"
                >
                  Getting Started
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/cli-reference"
                  className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors"
                >
                  CLI Reference
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/examples"
                  className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors"
                >
                  Examples
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/troubleshooting"
                  className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors"
                >
                  Troubleshooting
                </Link>
              </li>
            </ul>
          </div>

          {/* Community */}
          <div>
            <h3 className="text-white dark:text-white light:text-slate-900 font-semibold mb-4">Community</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/docs/contributing"
                  className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors"
                >
                  Contributing
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/freakend/cli/issues"
                  className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors"
                >
                  Report Bug
                </Link>
              </li>
              <li>
                <Link
                  href="https://github.com/freakend/cli/discussions"
                  className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors"
                >
                  Discussions
                </Link>
              </li>
              <li>
                <Link
                  href="/docs/changelog"
                  className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 transition-colors"
                >
                  Changelog
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800 dark:border-slate-800 light:border-slate-200 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-slate-400 dark:text-slate-400 light:text-slate-600 text-sm">
            © 2024 Freakend. All rights reserved.
          </p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link
              href="/privacy"
              className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 text-sm transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/terms"
              className="text-slate-400 hover:text-white dark:text-slate-400 dark:hover:text-white light:text-slate-600 light:hover:text-slate-900 text-sm transition-colors"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
