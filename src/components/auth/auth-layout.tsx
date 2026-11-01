"use client"

import { Logo } from "@/components/logo"
import { CursorDots } from "@/components/auth/cursor-dots"

interface AuthLayoutProps {
  children: React.ReactNode
  heading: string
  subheading: string
  features?: {
    icon: React.ReactNode
    text: string
  }[]
  testimonial?: {
    quote: string
    name: string
    role: string
    avatar: string
  }
}

export function AuthLayout({ 
  children, 
  heading, 
  subheading, 
  features,
  testimonial 
}: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden bg-stone-950 animate-fade-in">
        {/* Cursor-reactive shiny dots */}
        <CursorDots count={90} />

        {/* Subtle ambient blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-stone-800/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-40 right-20 w-96 h-96 bg-stone-700/20 rounded-full blur-3xl animate-float-delayed" />
        </div>
        
        {/* Content */}
        <div className="relative z-10 flex flex-col justify-between p-12 w-full">
          <div className="animate-fade-up delay-100">
            <Logo />
          </div>
          
          <div className="max-w-md animate-fade-up delay-200">
            <h1 className="text-4xl font-bold tracking-tight text-white mb-4">
              {heading}
            </h1>
            <p className="text-lg text-stone-400 mb-8">
              {subheading}
            </p>
            
            {features && (
              <ul className="space-y-4">
                {features.map((feature, index) => (
                  <li
                    key={index}
                    className="animate-slide-left flex items-center gap-3 text-stone-300"
                    style={{ animationDelay: `${300 + index * 100}ms` }}
                  >
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-white/10 text-white">
                      {feature.icon}
                    </div>
                    <span>{feature.text}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {testimonial && (
            <div className="animate-fade-up delay-400 bg-stone-800/50 backdrop-blur-sm border border-stone-700/50 rounded-2xl p-6 max-w-md">
              <p className="text-stone-300 italic mb-4">&ldquo;{testimonial.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-stone-900 font-semibold">
                  {testimonial.avatar}
                </div>
                <div>
                  <p className="text-white font-medium">{testimonial.name}</p>
                  <p className="text-stone-400 text-sm">{testimonial.role}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Right Side - Form */}
      <div className="w-full lg:w-[40%] flex items-center justify-center p-8 bg-stone-100">
        <div className="w-full max-w-md animate-slide-right">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8">
            <Logo />
          </div>
          
          {children}
        </div>
      </div>
    </div>
  )
}
