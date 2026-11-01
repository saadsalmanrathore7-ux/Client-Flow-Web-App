"use client"

import * as React from "react"
import { Eye, EyeOff, Lock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface PasswordInputProps extends React.ComponentProps<"input"> {
  showStrength?: boolean
}

function getStrength(password: string): { level: number; label: string; color: string } {
  if (!password) return { level: 0, label: "", color: "" }
  let score = 0
  if (password.length >= 8) score++
  if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++
  if (/\d/.test(password)) score++
  if (/[^a-zA-Z0-9]/.test(password)) score++
  if (score <= 1) return { level: 25, label: "Weak", color: "bg-red-500" }
  if (score === 2) return { level: 50, label: "Fair", color: "bg-amber-500" }
  if (score === 3) return { level: 75, label: "Good", color: "bg-stone-600" }
  return { level: 100, label: "Strong", color: "bg-stone-900" }
}

const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ className, showStrength = false, onChange, value, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const [localValue, setLocalValue] = React.useState("")

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      setLocalValue(e.target.value)
      onChange?.(e)
    }

    const strength = getStrength(localValue)

    return (
      <div className="space-y-2">
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 z-10" />
          <Input
            ref={ref}
            type={showPassword ? "text" : "password"}
            onChange={handleChange}
            className={cn(
              "pl-10 pr-10 h-11 bg-stone-50 border-stone-200 focus:border-stone-900 rounded-xl text-stone-900 placeholder:text-stone-400",
              className,
            )}
            {...props}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-stone-400 hover:text-stone-900"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
          </Button>
        </div>

        {showStrength && localValue && (
          <div className="space-y-1">
            <div className="h-1.5 bg-stone-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strength.color}`}
                style={{ width: `${strength.level}%` }}
              />
            </div>
            <p className="text-xs text-stone-500">
              Password strength:{" "}
              <span
                className={
                  strength.level >= 75
                    ? "text-stone-900 font-medium"
                    : strength.level >= 50
                    ? "text-amber-600"
                    : "text-red-500"
                }
              >
                {strength.label}
              </span>
            </p>
          </div>
        )}
      </div>
    )
  },
)

PasswordInput.displayName = "PasswordInput"

export { PasswordInput }
