import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "../api/auth/[...nextauth]/route"
import { signOut } from "next-auth/react"
import AdminClient from "./AdminClient"

export default async function AdminPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/login")
  }

  if (session.user.role !== "ADMIN") {
    return (
      <div style={styles.container}>
        <div style={styles.errorCard}>
          <h1>Доступ запрещен</h1>
          <p>У вас нет прав администратора</p>
        </div>
      </div>
    )
  }

  return <AdminClient session={session} />
}

const styles = {
  container: {
    minHeight: "100vh",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f4f4f4",
    padding: "20px"
  },
  errorCard: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "40px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    textAlign: "center" as const
  }
}
