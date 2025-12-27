export default function HomePage() {
  return (
    <div style={styles.container}>
      <div style={styles.intro}>
        <h1 style={styles.title}>Добро пожаловать в AMANAT</h1>
        <p style={styles.description}>
          Оформите рассрочку на электронику и бытовую технику с минимальными условиями!
        </p>
        <div style={styles.buttons}>
          <a href="/login" style={styles.button}>
            Войти в систему
          </a>
          <a href="/register" style={styles.buttonSecondary}>
            Зарегистрироваться
          </a>
        </div>
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
    backgroundColor: "#2c3e50",
    padding: "20px"
  },
  intro: {
    textAlign: "center" as const,
    color: "white",
    maxWidth: "600px"
  },
  title: {
    fontSize: "42px",
    marginBottom: "20px",
    fontWeight: "bold" as const
  },
  description: {
    fontSize: "18px",
    marginBottom: "40px",
    lineHeight: "1.6"
  },
  buttons: {
    display: "flex",
    gap: "20px",
    justifyContent: "center",
    flexWrap: "wrap" as const
  },
  button: {
    display: "inline-block",
    padding: "15px 30px",
    backgroundColor: "#27ae60",
    color: "white",
    textDecoration: "none",
    borderRadius: "5px",
    fontWeight: "bold" as const,
    fontSize: "16px",
    transition: "background-color 0.3s"
  },
  buttonSecondary: {
    display: "inline-block",
    padding: "15px 30px",
    backgroundColor: "transparent",
    color: "white",
    textDecoration: "none",
    borderRadius: "5px",
    fontWeight: "bold" as const,
    fontSize: "16px",
    border: "2px solid white",
    transition: "all 0.3s"
  }
}
