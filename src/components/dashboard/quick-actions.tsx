import { Plus, Upload, MessageCircle, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"

const actions = [
  {
    label: "New Project",
    icon: Plus,
    variant: "default" as const,
    className: "bg-stone-900 hover:bg-stone-800 text-white border-0"
  },
  {
    label: "Upload File",
    icon: Upload,
    variant: "outline" as const,
    className: "bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 hover:border-stone-300"
  },
  {
    label: "Message Team",
    icon: MessageCircle,
    variant: "outline" as const,
    className: "bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 hover:border-stone-300"
  },
  {
    label: "View Invoice",
    icon: FileText,
    variant: "outline" as const,
    className: "bg-white border-stone-200 text-stone-700 hover:bg-stone-50 hover:text-stone-900 hover:border-stone-300"
  }
]

export function QuickActions() {
  return (
    <div className="animate-slide-up delay-600 rounded-2xl border border-stone-200 bg-white p-6">
      <h3 className="text-lg font-semibold text-stone-900 mb-4">Quick Actions</h3>
      
      <div className="flex flex-wrap gap-3">
        {actions.map((action) => (
          <Button
            key={action.label}
            variant={action.variant}
            className={`h-10 rounded-xl transition-all duration-200 hover:scale-[1.02] ${action.className}`}
          >
            <action.icon className="w-4 h-4 mr-2" />
            {action.label}
          </Button>
        ))}
      </div>
    </div>
  )
}
