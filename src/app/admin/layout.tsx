'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Wine, 
  ShoppingCart, 
  TrendingUp, 
  Users, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
    { icon: Wine, label: 'Bebidas', href: '/admin/drinks' },
    { icon: ShoppingCart, label: 'Órdenes', href: '/admin/orders' },
    { icon: TrendingUp, label: 'Contabilidad', href: '/admin/accounting' },
    { icon: Users, label: 'Usuarios', href: '/admin/users' },
  ];

  const handleLogout = () => {
    // Implementar logout
    window.location.href = '/';
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar para desktop */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-gradient-to-b from-purple-700 to-purple-900 text-white">
        <div className="p-6 border-b border-purple-600">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            🍹 The Rustic
          </h1>
          <p className="text-purple-200 text-sm mt-1">Panel Administrativo</p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? 'bg-white text-purple-700 font-semibold shadow-lg'
                    : 'text-purple-100 hover:bg-purple-600 hover:text-white'
                }`}
              >
                <Icon size={20} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-purple-600">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-purple-100 hover:bg-red-600 hover:text-white transition-all w-full"
          >
            <LogOut size={20} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Sidebar móvil */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" onClick={() => setSidebarOpen(false)}>
          <aside className="absolute left-0 top-0 bottom-0 w-64 bg-gradient-to-b from-purple-700 to-purple-900 text-white" onClick={(e) => e.stopPropagation()}>
            <div className="p-6 border-b border-purple-600 flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold flex items-center gap-2">
                  🍹 The Rustic
                </h1>
                <p className="text-purple-200 text-sm mt-1">Panel Admin</p>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="text-white">
                <X size={24} />
              </button>
            </div>

            <nav className="flex-1 p-4 space-y-2">
              {menuItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href || (item.href !== '/admin' && pathname.startsWith(item.href));
                
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      isActive
                        ? 'bg-white text-purple-700 font-semibold shadow-lg'
                        : 'text-purple-100 hover:bg-purple-600 hover:text-white'
                    }`}
                  >
                    <Icon size={20} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </nav>

            <div className="p-4 border-t border-purple-600">
              <button
                onClick={handleLogout}
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-purple-100 hover:bg-red-600 hover:text-white transition-all w-full"
              >
                <LogOut size={20} />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Contenido principal */}
      <main className="flex-1 overflow-y-auto">
        {/* Header móvil */}
        <header className="md:hidden bg-white shadow-sm p-4 flex items-center gap-4">
          <button onClick={() => setSidebarOpen(true)} className="text-gray-700">
            <Menu size={24} />
          </button>
          <h1 className="text-xl font-bold text-gray-800">The Rustic</h1>
        </header>

        {children}
      </main>
    </div>
  );
}
