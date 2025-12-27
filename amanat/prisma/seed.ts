import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Начинаем сидирование базы данных...');

  // Создание администратора
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { phone: '+77771234567' },
    update: {},
    create: {
      phone: '+77771234567',
      passwordHash: adminPassword,
      fullName: 'Администратор',
      role: UserRole.ADMIN,
      isActive: true,
    },
  });
  console.log('✅ Создан администратор:', admin.phone);

  // Создание менеджера
  const managerPassword = await bcrypt.hash('manager123', 10);
  const manager = await prisma.user.upsert({
    where: { phone: '+77771234568' },
    update: {},
    create: {
      phone: '+77771234568',
      passwordHash: managerPassword,
      fullName: 'Менеджер Алия',
      role: UserRole.MANAGER,
      isActive: true,
    },
  });
  console.log('✅ Создан менеджер:', manager.phone);

  // Создание тестового клиента
  const clientPassword = await bcrypt.hash('client123', 10);
  const clientUser = await prisma.user.upsert({
    where: { phone: '+77771234569' },
    update: {},
    create: {
      phone: '+77771234569',
      passwordHash: clientPassword,
      fullName: 'Клиент Айдар',
      role: UserRole.CLIENT,
      isActive: true,
    },
  });

  await prisma.client.upsert({
    where: { userId: clientUser.id },
    update: {},
    create: {
      userId: clientUser.id,
      fullName: 'Клиент Айдар Нурланов',
      phone: '+77771234569',
      passportNumber: '123456789',
      passportIssuedBy: 'МВД РК',
      passportIssuedAt: new Date('2015-05-15'),
      address: 'г. Алматы, ул. Абая 100',
      note: 'Тестовый клиент для демонстрации',
    },
  });
  console.log('✅ Создан тестовый клиент:', clientUser.phone);

  // Создание товаров
  const products = [
    {
      name: 'iPhone 15 Pro 256GB',
      sku: 'IPHONE-15-PRO-256',
      category: 'Смартфоны',
      defaultPurchasePrice: 450000,
      description: 'Премиальный смартфон Apple последнего поколения',
    },
    {
      name: 'Samsung Galaxy S24 Ultra',
      sku: 'SAMSUNG-S24-ULTRA',
      category: 'Смартфоны',
      defaultPurchasePrice: 420000,
      description: 'Флагманский смартфон Samsung',
    },
    {
      name: 'MacBook Pro 14" M3',
      sku: 'MBP-14-M3',
      category: 'Ноутбуки',
      defaultPurchasePrice: 950000,
      description: 'Профессиональный ноутбук Apple',
    },
    {
      name: 'iPad Pro 11" 2024',
      sku: 'IPAD-PRO-11-2024',
      category: 'Планшеты',
      defaultPurchasePrice: 380000,
      description: 'Планшет для работы и творчества',
    },
    {
      name: 'AirPods Pro 2',
      sku: 'AIRPODS-PRO-2',
      category: 'Аудио',
      defaultPurchasePrice: 95000,
      description: 'Беспроводные наушники с шумоподавлением',
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {},
      create: product,
    });
  }
  console.log('✅ Создано товаров:', products.length);

  // Системные настройки
  const settings = [
    { key: 'company_name', value: 'ТОО "Аманат"' },
    { key: 'company_bin', value: '123456789012' },
    { key: 'company_address', value: 'г. Алматы, ул. Достык 123' },
    { key: 'company_phone', value: '+7 (777) 123-45-67' },
    { key: 'company_email', value: 'info@amanat.kz' },
  ];

  for (const setting of settings) {
    await prisma.systemSetting.upsert({
      where: { key: setting.key },
      update: { value: setting.value },
      create: setting,
    });
  }
  console.log('✅ Созданы системные настройки:', settings.length);

  console.log('');
  console.log('🎉 Сидирование завершено!');
  console.log('');
  console.log('📝 Тестовые учетные данные:');
  console.log('   Администратор: +77771234567 / admin123');
  console.log('   Менеджер:      +77771234568 / manager123');
  console.log('   Клиент:        +77771234569 / client123');
}

main()
  .catch((e) => {
    console.error('❌ Ошибка при сидировании:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
