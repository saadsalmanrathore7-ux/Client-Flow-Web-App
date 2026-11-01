import { Zap } from "lucide-react"
import Link from "next/link"

export function Logo({ className = "" }: { className?: string }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${className}`}>
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-primary/20">
        <Zap className="w-5 h-5 text-primary" />
      </div>
      <span className="text-xl font-bold tracking-tight text-foreground">ClientFlow</span>
    </Link>
  )
}
