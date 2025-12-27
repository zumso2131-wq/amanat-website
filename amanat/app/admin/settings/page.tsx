'use client';

import { useState, useEffect } from 'react';
import { Save } from 'lucide-react';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    company_name: 'ТОО "Аманат"',
    company_bin: '123456789012',
    company_address: 'г. Алматы, ул. Достык 123',
    company_phone: '+7 (777) 123-45-67',
    company_email: 'info@amanat.kz',
  });

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Настройки системы</h1>

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-6">Информация о компании</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Название компании</label>
            <input
              type="text"
              value={settings.company_name}
              onChange={(e) => setSettings({ ...settings, company_name: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">БИН</label>
            <input
              type="text"
              value={settings.company_bin}
              onChange={(e) => setSettings({ ...settings, company_bin: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Адрес</label>
            <input
              type="text"
              value={settings.company_address}
              onChange={(e) => setSettings({ ...settings, company_address: e.target.value })}
              className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Телефон</label>
              <input
                type="tel"
                value={settings.company_phone}
                onChange={(e) => setSettings({ ...settings, company_phone: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Email</label>
              <input
                type="email"
                value={settings.company_email}
                onChange={(e) => setSettings({ ...settings, company_email: e.target.value })}
                className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="pt-4">
            <button className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700">
              <Save className="h-4 w-4" />
              <span>Сохранить настройки</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
