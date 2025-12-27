"use client"

import { signOut } from "next-auth/react"

export default function AdminClient({ session }: any) {
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Панель администратора</h1>
        <div style={styles.info}>
          <p style={styles.welcome}>
            Добро пожаловать, <strong>{session.user.phone}</strong>
          </p>
          <p style={styles.role}>Роль: {session.user.role}</p>
        </div>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          style={styles.button}
        >
          Выйти
        </button>
      </div>
    </div>
  )
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
  card: {
    backgroundColor: "white",
    borderRadius: "8px",
    padding: "40px",
    boxShadow: "0 2px 10px rgba(0,0,0,0.1)",
    width: "100%",
    maxWidth: "500px"
  },
  title: {
    textAlign: "center" as const,
    marginBottom: "30px",
    color: "#2c3e50",
    fontSize: "28px"
  },
  info: {
    marginBottom: "30px",
    padding: "20px",
    backgroundColor: "#f8f9fa",
    borderRadius: "5px"
  },
  welcome: {
    fontSize: "16px",
    marginBottom: "10px",
    color: "#333"
  },
  role: {
    fontSize: "14px",
    color: "#666",
    margin: 0
  },
  button: {
    width: "100%",
    padding: "12px",
    backgroundColor: "#e74c3c",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    fontWeight: "bold" as const,
    cursor: "pointer"
  }
}
