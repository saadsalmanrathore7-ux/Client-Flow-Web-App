import { Upload, RefreshCw, CreditCard, MessageCircle } from "lucide-react"

const activities = [
  {
    icon: Upload,
    description: 'File uploaded to "E-Commerce Redesign"',
    time: "2h ago",
    iconColor: "text-stone-600",
    iconBg: "bg-stone-200"
  },
  {
    icon: RefreshCw,
    description: "Status changed to In Progress",
    time: "Yesterday",
    iconColor: "text-stone-700",
    iconBg: "bg-stone-300"
  },
  {
    icon: CreditCard,
    description: "Payment confirmed $149",
    time: "3 days ago",
    iconColor: "text-stone-900",
    iconBg: "bg-stone-900/10"
  },
  {
    icon: MessageCircle,
    description: "New message from team",
    time: "4 days ago",
    iconColor: "text-stone-600",
    iconBg: "bg-stone-200"
  }
]

export function ActivityCard() {
  return (
    <div className="animate-fade-up delay-500 rounded-2xl border border-stone-200 bg-white">
      <div className="p-6 border-b border-stone-200">
        <h3 className="text-lg font-semibold text-stone-900">Recent Activity</h3>
      </div>
      
      <div className="p-4">
        <div className="relative space-y-4">
          {/* Timeline line */}
          <div className="absolute left-[18px] top-6 bottom-6 w-px bg-stone-200" />
          
          {activities.map((activity, index) => (
            <div key={index} className="flex items-start gap-3 relative">
              <div className={`flex items-center justify-center w-9 h-9 rounded-lg ${activity.iconBg} z-10`}>
                <activity.icon className={`w-4 h-4 ${activity.iconColor}`} />
              </div>
              <div className="flex-1 pt-1">
                <p className="text-sm text-stone-900">{activity.description}</p>
                <p className="text-xs text-stone-500 mt-0.5">{activity.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
