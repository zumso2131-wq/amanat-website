import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Создаём админа
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { phone: '+79991234567' },
    update: {},
    create: {
      phone: '+79991234567',
      passwordHash: adminPassword,
      fullName: 'Администратор',
      role: 'ADMIN',
      isActive: true,
    },
  })

  console.log('Created admin:', admin.phone)

  // Создаём менеджера
  const managerPassword = await bcrypt.hash('manager123', 10)
  const manager = await prisma.user.upsert({
    where: { phone: '+79991234568' },
    update: {},
    create: {
      phone: '+79991234568',
      passwordHash: managerPassword,
      fullName: 'Менеджер',
      role: 'MANAGER',
      isActive: true,
    },
  })

  console.log('Created manager:', manager.phone)

  // Создаём тестового клиента
  const client = await prisma.client.upsert({
    where: { phone: '+79991234569' },
    update: {},
    create: {
      phone: '+79991234569',
      fullName: 'Иванов Иван Иванович',
      passportNumber: '1234 567890',
      address: 'г. Москва, ул. Примерная, д. 1',
    },
  })

  console.log('Created client:', client.fullName)

  // Создаём пользователя-клиента
  const clientUserPassword = await bcrypt.hash('client123', 10)
  const clientUser = await prisma.user.upsert({
    where: { phone: '+79991234569' },
    update: {},
    create: {
      phone: '+79991234569',
      passwordHash: clientUserPassword,
      fullName: 'Иванов Иван Иванович',
      role: 'CLIENT',
      isActive: true,
    },
  })

  console.log('Created client user:', clientUser.phone)

  console.log('Seeding completed!')
  console.log('\nDefault credentials:')
  console.log('Admin: +79991234567 / admin123')
  console.log('Manager: +79991234568 / manager123')
  console.log('Client: +79991234569 / client123')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
