import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { AdminSidebar } from "@/components/layout/admin-sidebar"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN" && session.user.role !== "MANAGER") {
    redirect("/cabinet")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <AdminSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        {children}
      </main>
    </div>
  )
}
