import { Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

const deadlines = [
  {
    project: "E-Commerce Website Redesign",
    daysRemaining: 5,
  },
  {
    project: "SEO & Marketing Dashboard",
    daysRemaining: 11,
  },
  {
    project: "Mobile App MVP",
    daysRemaining: 21,
  }
]

function getDaysColor(days: number) {
  if (days < 7) return "text-stone-900 bg-stone-900/10 font-semibold"
  if (days < 14) return "text-stone-700 bg-stone-200"
  return "text-stone-500 bg-stone-100"
}

export function DeadlinesCard() {
  return (
    <div className="animate-fade-up delay-400 rounded-2xl border border-stone-200 bg-white">
      <div className="p-6 border-b border-stone-200">
        <h3 className="text-lg font-semibold text-stone-900">Upcoming Deadlines</h3>
      </div>
      
      <div className="p-4 space-y-3">
        {deadlines.map((deadline) => (
          <div 
            key={deadline.project}
            className="flex items-center gap-3 p-3 rounded-xl bg-stone-50 hover:bg-stone-100 transition-colors"
          >
            <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-stone-200">
              <Calendar className="w-4 h-4 text-stone-600" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-stone-900 truncate">{deadline.project}</p>
            </div>
            <div className={cn(
              "px-2.5 py-1 rounded-full text-xs font-medium",
              getDaysColor(deadline.daysRemaining)
            )}>
              {deadline.daysRemaining}d
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
