"use client"

import { signIn } from "next-auth/react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"

export default function LoginPage() {
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      const result = await signIn("credentials", {
        phone,
        password,
        redirect: false,
      })

      if (result?.error) {
        setError("Неверный телефон или пароль")
        setLoading(false)
        return
      }

      router.push("/admin")
      router.refresh()
    } catch (error) {
      setError("Произошла ошибка при входе")
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1 style={styles.title}>Вход в систему</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Телефон</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="89291639595"
              style={styles.input}
              required
            />
          </div>
          <div style={styles.formGroup}>
            <label style={styles.label}>Пароль</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              style={styles.input}
              required
            />
          </div>
          {error && <div style={styles.error}>{error}</div>}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.6 : 1,
              cursor: loading ? "not-allowed" : "pointer"
            }}
          >
            {loading ? "Вход..." : "Войти"}
          </button>
          <div style={styles.registerLink}>
            <p style={styles.registerText}>
              Нет аккаунта?{" "}
              <Link href="/register" style={styles.link}>
                Зарегистрироваться
              </Link>
            </p>
          </div>
        </form>
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
    maxWidth: "400px"
  },
  title: {
    textAlign: "center" as const,
    marginBottom: "30px",
    color: "#2c3e50",
    fontSize: "24px"
  },
  form: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "20px"
  },
  formGroup: {
    display: "flex",
    flexDirection: "column" as const,
    gap: "8px"
  },
  label: {
    fontSize: "14px",
    fontWeight: "500" as const,
    color: "#333"
  },
  input: {
    padding: "12px",
    border: "1px solid #ddd",
    borderRadius: "5px",
    fontSize: "14px",
    width: "100%",
    boxSizing: "border-box" as const
  },
  button: {
    padding: "12px",
    backgroundColor: "#27ae60",
    color: "white",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    fontWeight: "bold" as const,
    cursor: "pointer",
    transition: "background-color 0.3s"
  },
  error: {
    color: "#e74c3c",
    fontSize: "14px",
    textAlign: "center" as const,
    padding: "10px",
    backgroundColor: "#fadbd8",
    borderRadius: "5px"
  },
  registerLink: {
    marginTop: "10px",
    textAlign: "center" as const
  },
  registerText: {
    fontSize: "14px",
    color: "#666",
    margin: 0
  },
  link: {
    color: "#27ae60",
    textDecoration: "none",
    fontWeight: "500" as const
  }
}
