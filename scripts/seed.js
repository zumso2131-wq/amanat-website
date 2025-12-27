const { PrismaClient } = require("@prisma/client")
const bcrypt = require("bcryptjs")

const prisma = new PrismaClient()

async function main() {
  console.log("Начало создания администратора...")

  const existingAdmin = await prisma.user.findUnique({
    where: { phone: "89291639595" }
  })

  if (existingAdmin) {
    console.log("Администратор уже существует")
    return
  }

  const hashedPassword = await bcrypt.hash("Lamaro095", 10)

  const admin = await prisma.user.create({
    data: {
      phone: "89291639595",
      password: hashedPassword,
      role: "ADMIN"
    }
  })

  console.log("Администратор успешно создан:", admin)
}

main()
  .catch((e) => {
    console.error("Ошибка при создании администратора:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
