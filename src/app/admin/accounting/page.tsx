'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { TrendingUp, Package, DollarSign, Calendar, LogOut, Users } from 'lucide-react';

interface DrinkSales {
  drinkId: string;
  drinkName: string;
  totalQuantity: number;
  totalRevenue: number;
  totalCost: number;
  profit: number;
  profitMargin: number;
}

interface SalesData {
  totalRevenue: number;
  totalCost: number;
  totalProfit: number;
  totalOrders: number;
  totalItemsSold: number;
  drinkSales: DrinkSales[];
}

export default function AccountingPage() {
  const router = useRouter();
  const [salesData, setSalesData] = useState<SalesData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('today');

  useEffect(() => {
    fetchSalesData();
  }, [dateFilter]);

  const fetchSalesData = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/accounting?period=${dateFilter}`);
      const data = await response.json();
      setSalesData(data);
    } catch (error) {
      console.error('Error al cargar datos de contabilidad:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando datos...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">💰 Contabilidad de Ventas</h1>
              <p className="text-indigo-100 mt-1">Reportes y estadísticas de ventas</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin/users')}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 font-semibold flex items-center gap-2"
              >
                <Users size={20} /> Usuarios
              </button>
              <button
                onClick={() => router.push('/admin/drinks')}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 font-semibold flex items-center gap-2"
              >
                <Package size={20} /> Inventario
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 font-semibold flex items-center gap-2"
              >
                <LogOut size={20} /> Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtro de Período */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <Calendar className="text-indigo-600" size={24} />
            <label className="font-semibold text-gray-700">Período:</label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              <option value="today">Hoy</option>
              <option value="week">Esta Semana</option>
              <option value="month">Este Mes</option>
              <option value="all">Todo el Tiempo</option>
            </select>
          </div>
        </div>

        {/* Resumen General */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ingresos Totales</p>
                <p className="text-2xl font-bold text-green-600">
                  Q{salesData?.totalRevenue.toFixed(2) || '0.00'}
                </p>
              </div>
              <TrendingUp className="text-green-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Costo Total</p>
                <p className="text-2xl font-bold text-red-600">
                  Q{salesData?.totalCost.toFixed(2) || '0.00'}
                </p>
              </div>
              <DollarSign className="text-red-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Ganancia</p>
                <p className="text-2xl font-bold text-blue-600">
                  Q{salesData?.totalProfit.toFixed(2) || '0.00'}
                </p>
              </div>
              <TrendingUp className="text-blue-500" size={32} />
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Órdenes Totales</p>
                <p className="text-2xl font-bold text-indigo-600">
                  {salesData?.totalOrders || 0}
                </p>
              </div>
              <Package className="text-indigo-500" size={32} />
            </div>
          </div>
        </div>

        {/* Ventas por Bebida */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">Ventas por Bebida</h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Bebida
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Cantidad Vendida
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Ingresos
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Costo
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Ganancia
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Margen %
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {salesData?.drinkSales.map((sale) => (
                  <tr key={sale.drinkId} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{sale.drinkName}</p>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold">
                        {sale.totalQuantity}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-green-600">Q{sale.totalRevenue.toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-red-600">Q{sale.totalCost.toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-bold text-blue-600">Q{sale.profit.toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <span className={`font-bold ${
                        sale.profitMargin >= 50 ? 'text-green-600' :
                        sale.profitMargin >= 20 ? 'text-blue-600' :
                        'text-orange-600'
                      }`}>
                        {sale.profitMargin.toFixed(2)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(!salesData?.drinkSales || salesData.drinkSales.length === 0) && (
            <div className="text-center py-12">
              <p className="text-gray-500">No hay ventas registradas en este período</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
