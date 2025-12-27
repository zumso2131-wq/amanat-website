// ============================================
// SEED — Начальные данные системы "Аманат"
// ============================================

import { PrismaClient } from "@prisma/client"
import bcrypt from "bcryptjs"

const prisma = new PrismaClient()

async function main() {
  console.log("🌱 Начало заполнения базы данных...")

  // ========================================
  // 1. АДМИНИСТРАТОР (создаётся только если не существует)
  // ========================================
  
  // Данные админа (жёстко заданы + можно переопределить через env)
  const adminPhone = process.env.SEED_ADMIN_PHONE || "89291639595"
  const adminPassword = process.env.SEED_ADMIN_PASSWORD || "Lamaro095"
  const adminName = process.env.SEED_ADMIN_NAME || "Главный Администратор"

  // Проверяем, есть ли уже админ с таким телефоном
  const existingAdmin = await prisma.user.findUnique({
    where: { phone: adminPhone }
  })

  if (!existingAdmin) {
    // Хешируем пароль
    const adminHash = await bcrypt.hash(adminPassword, 12)
    
    const admin = await prisma.user.create({
      data: {
        phone: adminPhone,
        passwordHash: adminHash,
        fullName: adminName,
        email: "admin@amanat.kz",
        role: "ADMIN",
        isActive: true,
      },
    })
    console.log(`✅ Создан админ: ${admin.phone} / ${adminPassword}`)
  } else {
    console.log(`ℹ️ Админ уже существует: ${existingAdmin.phone}`)
  }

  // ========================================
  // 2. ДЕМО-МЕНЕДЖЕР (опционально)
  // ========================================
  
  const managerPhone = "+77009876543"
  const existingManager = await prisma.user.findUnique({
    where: { phone: managerPhone }
  })

  if (!existingManager) {
    const managerHash = await bcrypt.hash("manager123", 12)
    const manager = await prisma.user.create({
      data: {
        phone: managerPhone,
        passwordHash: managerHash,
        fullName: "Менеджер Айгуль",
        email: "manager@amanat.kz",
        role: "MANAGER",
        isActive: true,
      },
    })
    console.log(`✅ Создан менеджер: ${manager.phone} / manager123`)
  }

  // ========================================
  // 3. ДЕМО-КЛИЕНТЫ (для тестирования)
  // ========================================

  const demoClients = [
    {
      phone: "+77771112233",
      fullName: "Петров Пётр Петрович",
      iin: "901234567890",
      address: "г. Алматы, ул. Абая, 10",
    },
    {
      phone: "+77772223344",
      fullName: "Сидорова Анна Михайловна",
      iin: "950987654321",
      address: "г. Астана, пр. Республики, 25",
    },
  ]

  for (const clientData of demoClients) {
    await prisma.client.upsert({
      where: { phone: clientData.phone },
      update: {},
      create: clientData,
    })
  }
  console.log(`✅ Демо-клиенты созданы: ${demoClients.length}`)

  // ========================================
  // 4. ТОВАРЫ
  // ========================================

  const products = [
    {
      name: "iPhone 15 Pro Max 256GB",
      sku: "IPHONE-15PM-256",
      category: "Смартфоны",
      defaultPurchasePrice: 650000,
    },
    {
      name: "Samsung Galaxy S24 Ultra",
      sku: "SAMSUNG-S24U",
      category: "Смартфоны",
      defaultPurchasePrice: 580000,
    },
    {
      name: "MacBook Pro 14 M3",
      sku: "MBP-14-M3",
      category: "Ноутбуки",
      defaultPurchasePrice: 1200000,
    },
  ]

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    })
  }
  console.log(`✅ Товары созданы: ${products.length}`)

  // ========================================
  // 5. НАСТРОЙКИ
  // ========================================

  const settings = [
    { key: "company_name", value: "ТОО Аманат" },
    { key: "company_phone", value: "+7 (700) 123-45-67" },
    { key: "company_address", value: "г. Алматы, ул. Абая, 1" },
  ]

  for (const setting of settings) {
    await prisma.setting.upsert({
      where: { key: setting.key },
      update: {},
      create: setting,
    })
  }
  console.log(`✅ Настройки созданы`)

  // ========================================
  // ИТОГ
  // ========================================
  
  console.log("\n🎉 База данных успешно заполнена!\n")
  console.log("═══════════════════════════════════════")
  console.log("  ДАННЫЕ ДЛЯ ВХОДА:")
  console.log("═══════════════════════════════════════")
  console.log(`  Админ:    ${adminPhone} / ${adminPassword}`)
  console.log("  Менеджер: +77009876543 / manager123")
  console.log("═══════════════════════════════════════\n")
}

main()
  .catch((e) => {
    console.error("❌ Ошибка seed:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
