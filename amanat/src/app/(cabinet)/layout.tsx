import { redirect } from "next/navigation"
import { auth } from "@/lib/auth"
import { CabinetSidebar } from "@/components/layout/cabinet-sidebar"

export default async function CabinetLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect("/login")
  }

  // Admins and managers go to admin panel
  if (session.user.role === "ADMIN" || session.user.role === "MANAGER") {
    redirect("/admin")
  }

  return (
    <div className="flex h-screen overflow-hidden">
      <CabinetSidebar user={session.user} />
      <main className="flex-1 overflow-y-auto bg-muted/30">
        {children}
      </main>
    </div>
  )
}
