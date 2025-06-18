import { Card, CardContent } from "@/components/ui/card"
import { CodeBlock } from "@/components/code-block"

interface Step {
  title: string
  description: string
  code?: string
}

interface StepsCardProps {
  steps: Step[]
}

export function StepsCard({ steps }: StepsCardProps) {
  return (
    <div className="space-y-6">
      {steps.map((step, index) => (
        <Card key={index} className="bg-slate-900 border-slate-700">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                  {index + 1}
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-white font-semibold text-lg mb-2">{step.title}</h3>
                <p className="text-slate-400 mb-4">{step.description}</p>
                {step.code && <CodeBlock code={step.code} />}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
