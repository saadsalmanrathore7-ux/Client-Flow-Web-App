"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Folder,
  MessageCircle,
  Paperclip,
  CreditCard,
  Bell,
  Settings,
  LogOut,
  Zap,
  ShieldCheck,
} from "lucide-react";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";

const NAV = [
  { name: "Dashboard",     href: "/dashboard",               icon: LayoutDashboard },
  { name: "My Projects",   href: "/dashboard/projects",      icon: Folder },
  { name: "Messages",      href: "/dashboard/chat",          icon: MessageCircle },
  { name: "Files",         href: "/dashboard/files",         icon: Paperclip },
  { name: "Subscription",  href: "/dashboard/subscription",  icon: CreditCard },
  { name: "Notifications", href: "/dashboard/notifications", icon: Bell },
  { name: "Settings",      href: "/dashboard/settings",      icon: Settings },
];

const ADMIN_NAV = [
  { name: "Admin Panel", href: "/admin", icon: ShieldCheck },
];

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const user    = session?.user as { name?: string; email?: string; role?: string } | undefined;
  const isAdmin = user?.role === "ADMIN";
  const allNav  = isAdmin ? [...NAV, ...ADMIN_NAV] : NAV;

  const initials = user?.name
    ? user.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : "?";

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-[260px] flex-col border-r border-stone-800 bg-stone-950">

      {/* ── Logo ──────────────────────────────────────── */}
      <div className="flex items-center gap-2.5 border-b border-stone-800 px-5 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
          <Zap className="h-4 w-4 text-white" />
        </div>
        <span className="text-lg font-bold tracking-tight text-white">ClientFlow</span>
      </div>

      {/* ── Navigation ────────────────────────────────── */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-0.5">
          {allNav.map((item) => {
            const active = pathname === item.href ||
              (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <li key={item.name}>
                <Link
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-150",
                    active
                      ? "bg-white/10 text-white"
                      : "text-stone-400 hover:bg-stone-800/60 hover:text-white",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-[18px] w-[18px] shrink-0 transition-colors",
                      active ? "text-white" : "text-stone-500 group-hover:text-stone-300",
                    )}
                  />
                  <span className="flex-1">{item.name}</span>
                  {/* active indicator pill */}
                  {active && (
                    <span className="h-1.5 w-1.5 rounded-full bg-white/70" />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* ── User card ─────────────────────────────────── */}
      <div className="border-t border-stone-800 p-3">
        <div className="flex items-center gap-3 rounded-xl bg-stone-900 p-3">
          {/* avatar */}
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-sm font-bold text-stone-900">
            {initials}
          </div>

          {/* name + role */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {user?.name ?? "Guest"}
            </p>
            <p className="text-xs text-stone-500">
              {isAdmin ? "Administrator" : "Client"}
            </p>
          </div>

          {/* logout */}
          <button
            onClick={() => signOut({ callbackUrl: "/auth/login" })}
            title="Sign out"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-stone-500 transition-colors hover:bg-stone-800 hover:text-white"
          >
            <LogOut className="h-4 w-4" />
            <span className="sr-only">Sign out</span>
          </button>
        </div>
      </div>

    </aside>
  );
}
