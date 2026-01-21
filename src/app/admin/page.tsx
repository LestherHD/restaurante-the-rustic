'use client';

import { useEffect, useState } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Package, 
  ShoppingCart, 
  AlertTriangle,
  Wine,
  Users
} from 'lucide-react';

interface Stats {
  totalDrinks: number;
  activeDrinks: number;
  lowStockDrinks: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  totalExpenses: number;
  balance: number;
  recentOrders: Array<{
    _id: string;
    orderNumber: string;
    total: number;
    status: string;
    waiterName: string;
    createdAt: string;
  }>;
  lowStockItems: Array<{
    _id: string;
    name: string;
    totalUnits: number;
    lowStockAlert: number;
  }>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-300 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Balance Total',
      value: `Q${(stats?.balance || 0).toFixed(2)}`,
      icon: DollarSign,
      color: 'bg-green-500',
      trend: (stats?.balance || 0) >= 0 ? 'positive' : 'negative'
    },
    {
      title: 'Ingresos',
      value: `Q${(stats?.totalRevenue || 0).toFixed(2)}`,
      icon: TrendingUp,
      color: 'bg-blue-500',
      trend: 'positive'
    },
    {
      title: 'Bebidas Activas',
      value: stats?.activeDrinks || 0,
      icon: Wine,
      color: 'bg-purple-500',
      subtitle: `${stats?.totalDrinks || 0} total`
    },
    {
      title: 'Órdenes Pendientes',
      value: stats?.pendingOrders || 0,
      icon: ShoppingCart,
      color: 'bg-orange-500',
      subtitle: `${stats?.totalOrders || 0} total`
    },
  ];

  return (
    <div className="p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1">Resumen general del sistema</p>
      </div>

      {/* Tarjetas de estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((card, index) => {
          const Icon = card.icon;
          return (
            <div key={index} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm font-medium">{card.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-2">{card.value}</p>
                  {card.subtitle && (
                    <p className="text-gray-400 text-xs mt-1">{card.subtitle}</p>
                  )}
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="text-white" size={24} />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Sección de dos columnas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas de Stock Bajo */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="text-red-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Alertas de Stock</h2>
          </div>
          
          {stats?.lowStockItems && stats.lowStockItems.length > 0 ? (
            <div className="space-y-3">
              {stats.lowStockItems.slice(0, 5).map(item => (
                <div key={item._id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-gray-900">{item.name}</p>
                    <p className="text-sm text-gray-600">
                      Stock: {item.totalUnits} unidades
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-semibold text-red-600 bg-red-100 px-2 py-1 rounded">
                      Bajo Stock
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <Package size={48} className="mx-auto mb-2 opacity-50" />
              <p>No hay alertas de stock bajo</p>
            </div>
          )}
        </div>

        {/* Órdenes Recientes */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <div className="flex items-center gap-2 mb-4">
            <ShoppingCart className="text-blue-500" size={24} />
            <h2 className="text-xl font-bold text-gray-900">Órdenes Recientes</h2>
          </div>
          
          {stats?.recentOrders && stats.recentOrders.length > 0 ? (
            <div className="space-y-3">
              {stats.recentOrders.slice(0, 5).map(order => {
                const statusColors: { [key: string]: string } = {
                  pending: 'bg-yellow-100 text-yellow-700',
                  preparing: 'bg-blue-100 text-blue-700',
                  ready: 'bg-green-100 text-green-700',
                  delivered: 'bg-gray-100 text-gray-700',
                };
                
                return (
                  <div key={order._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200">
                    <div>
                      <p className="font-medium text-gray-900">#{order.orderNumber}</p>
                      <p className="text-sm text-gray-600">{order.waiterName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-gray-900">Q{order.total.toFixed(2)}</p>
                      <span className={`text-xs font-semibold px-2 py-1 rounded ${statusColors[order.status] || 'bg-gray-100 text-gray-700'}`}>
                        {order.status === 'pending' && 'Pendiente'}
                        {order.status === 'preparing' && 'Preparando'}
                        {order.status === 'ready' && 'Listo'}
                        {order.status === 'delivered' && 'Entregado'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <ShoppingCart size={48} className="mx-auto mb-2 opacity-50" />
              <p>No hay órdenes recientes</p>
            </div>
          )}
        </div>
      </div>

      {/* Resumen Financiero */}
      <div className="bg-gradient-to-br from-slate-100 via-gray-50 to-slate-200 rounded-xl shadow-lg p-8 border border-gray-200">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">Resumen Financiero</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-blue-500 p-2 rounded-lg shadow-sm">
                <TrendingUp size={20} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Ingresos Totales</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">Q{(stats?.totalRevenue || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className="bg-red-500 p-2 rounded-lg shadow-sm">
                <TrendingDown size={20} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Gastos Totales</p>
            </div>
            <p className="text-3xl font-bold text-gray-900">Q{(stats?.totalExpenses || 0).toFixed(2)}</p>
          </div>
          <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-md hover:shadow-lg transition-shadow">
            <div className="flex items-center gap-3 mb-3">
              <div className={`p-2 rounded-lg shadow-sm ${(stats?.balance || 0) >= 0 ? 'bg-green-500' : 'bg-orange-500'}`}>
                <DollarSign size={20} className="text-white" />
              </div>
              <p className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Balance</p>
            </div>
            <p className={`text-3xl font-bold ${(stats?.balance || 0) >= 0 ? 'text-green-600' : 'text-orange-600'}`}>
              Q{(stats?.balance || 0).toFixed(2)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
