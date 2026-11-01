import { Sidebar } from "@/components/dashboard/sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-stone-50">
      <Sidebar />
      {/* offset content by sidebar width; add top padding for breathing room */}
      <div className="pl-[260px]">
        <div className="min-h-screen">{children}</div>
      </div>
    </div>
  );
}
