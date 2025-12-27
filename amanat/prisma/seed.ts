import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Seeding database...")

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 12)
  const admin = await prisma.user.upsert({
    where: { phone: "+77001234567" },
    update: {},
    create: {
      phone: "+77001234567",
      passwordHash: adminPassword,
      fullName: "Администратор",
      email: "admin@amanat.kz",
      role: "ADMIN",
    },
  })
  console.log("✅ Admin user created:", admin.phone)

  // Create manager user
  const managerPassword = await bcrypt.hash("manager123", 12)
  const manager = await prisma.user.upsert({
    where: { phone: "+77009876543" },
    update: {},
    create: {
      phone: "+77009876543",
      passwordHash: managerPassword,
      fullName: "Иванов Менеджер",
      email: "manager@amanat.kz",
      role: "MANAGER",
    },
  })
  console.log("✅ Manager user created:", manager.phone)

  // Create demo client user
  const clientPassword = await bcrypt.hash("client123", 12)
  const clientUser = await prisma.user.upsert({
    where: { phone: "+77005551234" },
    update: {},
    create: {
      phone: "+77005551234",
      passwordHash: clientPassword,
      fullName: "Петров Клиент",
      email: "client@example.com",
      role: "CLIENT",
    },
  })
  console.log("✅ Client user created:", clientUser.phone)

  // Create demo client
  const client = await prisma.client.upsert({
    where: { phone: "+77005551234" },
    update: {},
    create: {
      fullName: "Петров Клиент",
      phone: "+77005551234",
      iin: "901234567890",
      passportNumber: "N12345678",
      passportIssuedBy: "МВД РК",
      passportIssuedAt: new Date("2020-01-15"),
      address: "г. Алматы, ул. Примерная, д. 10, кв. 5",
    },
  })
  console.log("✅ Demo client created:", client.fullName)

  // Create second demo client
  const client2 = await prisma.client.upsert({
    where: { phone: "+77007771111" },
    update: {},
    create: {
      fullName: "Сидорова Анна",
      phone: "+77007771111",
      iin: "951234567890",
      address: "г. Астана, пр. Мира, д. 25",
    },
  })
  console.log("✅ Second demo client created:", client2.fullName)

  // Create demo products
  const products = [
    { name: "iPhone 15 Pro Max 256GB", sku: "IP15PM256", category: "Смартфоны", defaultPurchasePrice: 550000 },
    { name: "Samsung Galaxy S24 Ultra", sku: "SGS24U", category: "Смартфоны", defaultPurchasePrice: 480000 },
    { name: "MacBook Air M3 13\"", sku: "MBA13M3", category: "Ноутбуки", defaultPurchasePrice: 650000 },
    { name: "Samsung QLED 55\" TV", sku: "SQLED55", category: "Телевизоры", defaultPurchasePrice: 350000 },
    { name: "Sony PlayStation 5", sku: "PS5STD", category: "Игровые консоли", defaultPurchasePrice: 230000 },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    })
  }
  console.log("✅ Demo products created:", products.length)

  // Create demo deal with installments
  const existingDeal = await prisma.deal.findFirst({
    where: { clientId: client.id },
  })

  if (!existingDeal) {
    const startDate = new Date()
    startDate.setDate(startDate.getDate() - 30) // Started 30 days ago

    const deal = await prisma.deal.create({
      data: {
        dealNumber: "AM-2412-0001",
        clientId: client.id,
        productName: "iPhone 15 Pro Max 256GB",
        productSku: "IP15PM256",
        purchasePrice: 550000,
        markupPercentFinal: 25,
        salePrice: 687500,
        downPayment: 100000,
        amountToFinance: 587500,
        months: 5,
        startDate,
        monthlyBasePayment: 117500,
        lastPaymentAdjustment: 0,
        status: "ACTIVE",
        createdByUserId: manager.id,
      },
    })

    // Create installments
    for (let i = 1; i <= 5; i++) {
      const dueDate = new Date(startDate)
      dueDate.setDate(dueDate.getDate() + 30 * i)

      await prisma.installment.create({
        data: {
          dealId: deal.id,
          index: i,
          dueDate,
          amount: 117500,
          status: i === 1 ? "PAID" : (i === 2 ? "OVERDUE" : "DUE"),
          paidAt: i === 1 ? new Date(startDate.getTime() + 25 * 24 * 60 * 60 * 1000) : null,
        },
      })
    }

    // Create first payment
    await prisma.payment.create({
      data: {
        dealId: deal.id,
        amount: 117500,
        method: "CASH",
        comment: "Первый платёж",
      },
    })

    console.log("✅ Demo deal created:", deal.dealNumber)
  }

  // Create some settings
  await prisma.setting.upsert({
    where: { key: "company_name" },
    update: {},
    create: { key: "company_name", value: "ИП Аманат" },
  })

  await prisma.setting.upsert({
    where: { key: "company_phone" },
    update: {},
    create: { key: "company_phone", value: "+7 (700) 123-45-67" },
  })

  await prisma.setting.upsert({
    where: { key: "company_address" },
    update: {},
    create: { key: "company_address", value: "г. Алматы, ул. Примерная, 123" },
  })

  console.log("✅ Settings created")

  console.log("")
  console.log("🎉 Seeding completed!")
  console.log("")
  console.log("📝 Demo accounts:")
  console.log("   Admin:   +77001234567 / admin123")
  console.log("   Manager: +77009876543 / manager123")
  console.log("   Client:  +77005551234 / client123")
  console.log("")
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
