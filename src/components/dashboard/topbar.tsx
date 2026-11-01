"use client"

import { Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

interface TopbarProps {
  title: string
}

export function Topbar({ title }: TopbarProps) {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-6 bg-stone-100/80 backdrop-blur-sm border-b border-stone-200">
      {/* Page Title */}
      <h1 className="text-xl font-bold tracking-tight text-stone-900">{title}</h1>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
          <Input 
            placeholder="Search projects, files, messages..." 
            className="pl-10 h-10 bg-white border-stone-200 focus:border-stone-900 rounded-xl text-stone-900 placeholder:text-stone-400"
          />
        </div>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-3">
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="relative text-stone-500 hover:text-stone-900">
              <Bell className="w-5 h-5" />
              <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center bg-stone-900 text-white border-0 text-xs">
                3
              </Badge>
              <span className="sr-only">Notifications</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-80 bg-white border-stone-200">
            <DropdownMenuLabel className="text-stone-900">Notifications</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-stone-200" />
            <DropdownMenuItem className="text-stone-700 focus:bg-stone-50 focus:text-stone-900">
              <div className="flex flex-col gap-1">
                <span className="font-medium">New message received</span>
                <span className="text-xs text-stone-500">2 minutes ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-stone-700 focus:bg-stone-50 focus:text-stone-900">
              <div className="flex flex-col gap-1">
                <span className="font-medium">Project deadline updated</span>
                <span className="text-xs text-stone-500">1 hour ago</span>
              </div>
            </DropdownMenuItem>
            <DropdownMenuItem className="text-stone-700 focus:bg-stone-50 focus:text-stone-900">
              <div className="flex flex-col gap-1">
                <span className="font-medium">Payment confirmed</span>
                <span className="text-xs text-stone-500">3 hours ago</span>
              </div>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* User Avatar */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0">
              <div className="w-10 h-10 rounded-full bg-stone-900 flex items-center justify-center text-white font-semibold">
                JD
              </div>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56 bg-white border-stone-200">
            <DropdownMenuLabel className="text-stone-900">My Account</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-stone-200" />
            <DropdownMenuItem className="text-stone-700 focus:bg-stone-50 focus:text-stone-900">Profile</DropdownMenuItem>
            <DropdownMenuItem className="text-stone-700 focus:bg-stone-50 focus:text-stone-900">Settings</DropdownMenuItem>
            <DropdownMenuItem className="text-stone-700 focus:bg-stone-50 focus:text-stone-900">Billing</DropdownMenuItem>
            <DropdownMenuSeparator className="bg-stone-200" />
            <DropdownMenuItem className="text-stone-700 focus:bg-stone-50 focus:text-stone-900">Log out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}
