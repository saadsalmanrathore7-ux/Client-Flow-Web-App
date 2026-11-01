import { Folder, CheckCircle, CreditCard, MessageCircle } from "lucide-react"

const stats = [
  {
    label: "Active Projects",
    value: "4",
    subtext: "+1 this month",
    icon: Folder,
    iconColor: "text-stone-600",
    bgColor: "bg-stone-200"
  },
  {
    label: "Completed Projects",
    value: "12",
    subtext: "All delivered on time",
    icon: CheckCircle,
    iconColor: "text-stone-900",
    bgColor: "bg-stone-300"
  },
  {
    label: "Subscription Plan",
    value: "Premium",
    subtext: "Renews Jan 15, 2026",
    icon: CreditCard,
    iconColor: "text-stone-600",
    bgColor: "bg-stone-200"
  },
  {
    label: "Unread Messages",
    value: "3",
    subtext: "2 need your response",
    icon: MessageCircle,
    iconColor: "text-stone-900",
    bgColor: "bg-stone-300"
  }
]

export function StatsCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div 
          key={stat.label}
          className="animate-scale-up relative overflow-hidden rounded-2xl border border-stone-200 bg-white p-6 transition-all duration-200 hover:border-stone-300 hover:shadow-sm hover:-translate-y-0.5"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-stone-500">{stat.label}</p>
              <p className="text-3xl font-bold tracking-tight text-stone-900 mt-1">{stat.value}</p>
              <p className="text-xs text-stone-500 mt-2">{stat.subtext}</p>
            </div>
            <div className={`flex items-center justify-center w-12 h-12 rounded-xl ${stat.bgColor}`}>
              <stat.icon className={`w-6 h-6 ${stat.iconColor}`} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
