import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminHeader } from "@/components/admin/AdminHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <div className="flex">
        {/* Sidebar para Desktop */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <AdminSidebar />
        </div>

        {/* Conteúdo Principal */}
        <div className="lg:pl-64 flex-1 flex flex-col min-h-screen">
          <AdminHeader />
          <main className="flex-1">{children}</main>
        </div>
      </div>
    </div>
  );
}
