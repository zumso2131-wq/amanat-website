// ============================================
// SEED — Начальные данные системы "Аманат"
// ============================================

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Начало заполнения базы данных...")

  // ========================================
  // 1. ПОЛЬЗОВАТЕЛИ
  // ========================================
  
  // Данные админа из переменных окружения
  const adminPhone = process.env.SEED_ADMIN_PHONE || "+77001234567"
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "admin123"
  const adminName = process.env.SEED_ADMIN_NAME || "Администратор"

  // Хешируем пароли
  const adminHash = await bcrypt.hash(adminPassword, 12)
  const managerHash = await bcrypt.hash("manager123", 12)
  const clientHash = await bcrypt.hash("client123", 12)

  // Создаём администратора
  const admin = await prisma.user.upsert({
    where: { phone: adminPhone },
    update: {},
    create: {
      phone: adminPhone,
      passwordHash: adminHash,
      fullName: adminName,
      email: "admin@amanat.kz",
      role: "ADMIN",
      isActive: true,
    },
  })
  console.log(`✅ Админ: ${admin.phone} / ${adminPassword}`)

  // Создаём менеджера
  const manager = await prisma.user.upsert({
    where: { phone: "+77009876543" },
    update: {},
    create: {
      phone: "+77009876543",
      passwordHash: managerHash,
      fullName: "Менеджер Айгуль",
      email: "manager@amanat.kz",
      role: "MANAGER",
      isActive: true,
    },
  })
  console.log(`✅ Менеджер: ${manager.phone} / manager123`)

  // Создаём пользователя-клиента
  const clientUser = await prisma.user.upsert({
    where: { phone: "+77005551234" },
    update: {},
    create: {
      phone: "+77005551234",
      passwordHash: clientHash,
      fullName: "Иванов Иван Иванович",
      email: "client@example.com",
      role: "CLIENT",
      isActive: true,
    },
  })
  console.log(`✅ Клиент (user): ${clientUser.phone} / client123`)

  // ========================================
  // 2. КЛИЕНТЫ (для сделок)
  // ========================================

  const client1 = await prisma.client.upsert({
    where: { phone: "+77771112233" },
    update: {},
    create: {
      fullName: "Петров Пётр Петрович",
      phone: "+77771112233",
      iin: "901234567890",
      address: "г. Алматы, ул. Абая, 10",
    },
  })

  await prisma.client.upsert({
    where: { phone: "+77772223344" },
    update: {},
    create: {
      fullName: "Сидорова Анна Михайловна",
      phone: "+77772223344",
      iin: "950987654321",
      address: "г. Астана, пр. Республики, 25",
    },
  })

  await prisma.client.upsert({
    where: { phone: "+77773334455" },
    update: {},
    create: {
      fullName: "Казахстанов Асет Ерланович",
      phone: "+77773334455",
      iin: "880123456789",
      address: "г. Шымкент, ул. Тауке хана, 5",
    },
  })

  console.log(`✅ Создано клиентов: 3`)

  // ========================================
  // 3. ТОВАРЫ
  // ========================================

  const products = [
    {
      name: "iPhone 15 Pro Max 256GB",
      sku: "IPHONE-15PM-256",
      category: "Смартфоны",
      defaultPurchasePrice: 650000,
      description: "Флагманский смартфон Apple",
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      sku: "SAMSUNG-S24U",
      category: "Смартфоны",
      defaultPurchasePrice: 580000,
      description: "Флагман Samsung с S Pen",
    },
    {
      name: "MacBook Pro 14 M3",
      sku: "MBP-14-M3",
      category: "Ноутбуки",
      defaultPurchasePrice: 1200000,
      description: "Профессиональный ноутбук Apple",
    },
    {
      name: "Sony PlayStation 5",
      sku: "PS5-STD",
      category: "Игровые консоли",
      defaultPurchasePrice: 280000,
      description: "Игровая консоль нового поколения",
    },
    {
      name: "Apple Watch Ultra 2",
      sku: "AW-ULTRA-2",
      category: "Умные часы",
      defaultPurchasePrice: 420000,
      description: "Премиум смарт-часы",
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    })
  }
  console.log(`✅ Создано товаров: ${products.length}`)

  // ========================================
  // 4. ДЕМО-СДЕЛКА
  // ========================================

  // Проверяем, есть ли уже сделки
  const existingDeals = await prisma.deal.count()
  
  if (existingDeals === 0) {
    // Расчёт сделки
    const purchasePrice = 650000
    const months = 6
    const markupPercent = 35
    const salePrice = Math.round(purchasePrice * (1 + markupPercent / 100))
    const downPayment = 100000
    const amountToFinance = salePrice - downPayment
    const basePayment = Math.floor(amountToFinance / months)
    const remainder = amountToFinance - basePayment * months
    const startDate = new Date()

    // Создаём сделку
    const deal = await prisma.deal.create({
      data: {
        dealNumber: "AM-2412-0001",
        clientId: client1.id,
        createdByUserId: manager.id,
        productName: "iPhone 15 Pro Max 256GB",
        productSku: "IPHONE-15PM-256",
        purchasePrice,
        markupPercentFinal: markupPercent,
        salePrice,
        downPayment,
        amountToFinance,
        months,
        monthlyBasePayment: basePayment,
        lastPaymentAdjustment: remainder,
        startDate,
        status: "ACTIVE",
      },
    })

    // Создаём график платежей
    for (let i = 1; i <= months; i++) {
      const dueDate = new Date(startDate)
      dueDate.setDate(dueDate.getDate() + 30 * i)
      
      const amount = i === months ? basePayment + remainder : basePayment
      const isPaid = i <= 2 // Первые 2 платежа оплачены

      await prisma.installment.create({
        data: {
          dealId: deal.id,
          index: i,
          dueDate,
          amount,
          status: isPaid ? "PAID" : "DUE",
          paidAt: isPaid ? new Date() : null,
        },
      })
    }

    // Создаём платежи для первых 2 installments
    const installments = await prisma.installment.findMany({
      where: { dealId: deal.id, status: "PAID" },
    })

    for (const inst of installments) {
      await prisma.payment.create({
        data: {
          dealId: deal.id,
          installmentId: inst.id,
          amount: inst.amount,
          method: "CASH",
          paidAt: new Date(),
          comment: "Демо-платёж",
        },
      })
    }

    console.log(`✅ Создана демо-сделка: ${deal.dealNumber}`)
  }

  // ========================================
  // 5. НАСТРОЙКИ
  // ========================================

  await prisma.setting.upsert({
    where: { key: "company_name" },
    update: {},
    create: { key: "company_name", value: "ТОО Аманат" },
  })

  await prisma.setting.upsert({
    where: { key: "company_phone" },
    update: {},
    create: { key: "company_phone", value: "+7 (700) 123-45-67" },
  })

  await prisma.setting.upsert({
    where: { key: "company_address" },
    update: {},
    create: { key: "company_address", value: "г. Алматы, ул. Абая, 1" },
  })

  console.log(`✅ Настройки созданы`)

  console.log("\n🎉 База данных успешно заполнена!\n")
  console.log("Демо-аккаунты:")
  console.log(`  Админ:    ${adminPhone} / ${adminPassword}`)
  console.log("  Менеджер: +77009876543 / manager123")
  console.log("  Клиент:   +77005551234 / client123")
}

main()
  .catch((e) => {
    console.error("❌ Ошибка seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
