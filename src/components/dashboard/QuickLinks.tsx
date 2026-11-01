import React from "react";
import Link from "next/link";
import { MessageCircle, Paperclip, Bell, Settings, ArrowRight } from "lucide-react";

const LINKS = [
  {
    label: "Messages",
    description: "Chat with your team",
    href: "/dashboard/chat",
    Icon: MessageCircle,
    accent: "bg-violet-50 text-violet-600 ring-violet-100",
    hover: "hover:bg-violet-50",
  },
  {
    label: "Files",
    description: "Browse project assets",
    href: "/dashboard/files",
    Icon: Paperclip,
    accent: "bg-sky-50 text-sky-600 ring-sky-100",
    hover: "hover:bg-sky-50",
  },
  {
    label: "Notifications",
    description: "See latest updates",
    href: "/dashboard/notifications",
    Icon: Bell,
    accent: "bg-amber-50 text-amber-600 ring-amber-100",
    hover: "hover:bg-amber-50",
  },
  {
    label: "Settings",
    description: "Account & billing",
    href: "/dashboard/settings",
    Icon: Settings,
    accent: "bg-stone-100 text-stone-600 ring-stone-200",
    hover: "hover:bg-stone-50",
  },
];

export const QuickLinks: React.FC = () => {
  return (
    <section className="rounded-2xl border border-stone-100 bg-white shadow-sm overflow-hidden">
      <div className="px-5 py-4 border-b border-stone-100">
        <h2 className="text-sm font-semibold text-stone-900">Quick Access</h2>
        <p className="mt-0.5 text-xs text-stone-400">Jump to key sections of your portal.</p>
      </div>

      <div className="grid grid-cols-2 divide-x divide-y divide-stone-50">
        {LINKS.map(({ label, description, href, Icon, accent, hover }) => (
          <Link
            key={label}
            href={href}
            className={`group flex flex-col gap-2.5 p-4 transition-colors ${hover}`}
          >
            <div className={`inline-flex h-9 w-9 items-center justify-center rounded-xl ring-1 ${accent}`}>
              <Icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-semibold text-stone-900 group-hover:text-violet-700 transition-colors">
                {label}
              </p>
              <p className="mt-0.5 text-xs text-stone-400">{description}</p>
            </div>
            <ArrowRight className="h-3.5 w-3.5 text-stone-300 transition-transform group-hover:translate-x-0.5 group-hover:text-violet-400" />
          </Link>
        ))}
      </div>
    </section>
  );
};
