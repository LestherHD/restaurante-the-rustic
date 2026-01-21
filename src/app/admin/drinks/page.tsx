'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Eye, Power, AlertTriangle, Package2, TrendingUp, LogOut, Users } from 'lucide-react';
import Image from 'next/image';
import InventoryModal from '@/components/InventoryModal';

interface Drink {
  _id: string;
  name: string;
  brand: string;
  presentation: string;
  category: string;
  image?: string;
  unitsPerBox: number;
  totalBoxes: number;
  totalUnits: number;
  lowStockAlert: number;
  costPerBox: number;
  costPerUnit: number;
  salePrice: number;
  profitMargin: number;
  isActive: boolean;
}

export default function DrinksListPage() {
  const router = useRouter();
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [filteredDrinks, setFilteredDrinks] = useState<Drink[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedDrinkForInventory, setSelectedDrinkForInventory] = useState<Drink | null>(null);

  const categories = ['Todos', 'Refrescos', 'Jugos', 'Cervezas', 'Vinos', 'Licores', 'Café', 'Té', 'Agua', 'Otros'];

  useEffect(() => {
    fetchDrinks();
  }, []);

  useEffect(() => {
    let filtered = drinks;

    if (selectedCategory !== 'Todos') {
      filtered = filtered.filter(d => d.category === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(d =>
        d.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        d.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredDrinks(filtered);
  }, [drinks, selectedCategory, searchTerm]);

  const fetchDrinks = async () => {
    try {
      const response = await fetch('/api/drinks');
      const data = await response.json();
      setDrinks(data);
      setFilteredDrinks(data);
    } catch (error) {
      console.error('Error al cargar bebidas:', error);
    }
  };

  const handleToggleActive = async (drink: Drink) => {
    const newStatus = !drink.isActive;
    const action = newStatus ? 'activar' : 'desactivar';

    if (!confirm(`¿Estás seguro de ${action} "${drink.name}"?`)) return;

    try {
      const response = await fetch(`/api/drinks/${drink._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });

      if (response.ok) {
        fetchDrinks();
      } else {
        alert(`Error al ${action} la bebida`);
      }
    } catch (error) {
      alert(`Error al ${action} la bebida`);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/');
  };

  const lowStockDrinks = drinks.filter(d => d.totalUnits <= d.lowStockAlert && d.isActive);

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">🍹 Inventario de Bebidas</h1>
              <p className="text-indigo-100 mt-1">Gestión completa del catálogo</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => router.push('/admin/accounting')}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 font-semibold flex items-center gap-2"
              >
                <TrendingUp size={20} />
                Contabilidad
              </button>
              <button
                onClick={() => router.push('/admin/users')}
                className="bg-white text-indigo-600 px-4 py-2 rounded-lg hover:bg-indigo-50 font-semibold flex items-center gap-2"
              >
                <Users size={20} />
                Usuarios
              </button>
              <button
                onClick={() => router.push('/admin/drinks/new')}
                className="bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 font-semibold flex items-center gap-2 shadow-lg"
              >
                <Plus size={20} />
                Nueva Bebida
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 flex items-center gap-2"
              >
                <LogOut size={20} />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Alertas */}
        {lowStockDrinks.length > 0 && (
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-yellow-600" size={20} />
              <p className="text-yellow-800 font-semibold">
                ⚠️ {lowStockDrinks.length} bebida(s) con stock bajo
              </p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {lowStockDrinks.map(drink => (
                <span key={drink._id} className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                  {drink.name}: {drink.totalUnits} unidades
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-4 flex-wrap">
            <input
              type="text"
              placeholder="Buscar por nombre o marca..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900 placeholder-gray-400"
            />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabla de Bebidas */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b-2 border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Imagen
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Nombre
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Marca
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">
                    Presentación
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Stock
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Costo
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Precio Venta
                  </th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">
                    Ganancia
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredDrinks.map((drink) => (
                  <tr key={drink._id} className="hover:bg-gray-50 transition">
                    <td className="px-4 py-3">
                      <div className="w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                        {drink.image ? (
                          <Image
                            src={drink.image}
                            alt={drink.name}
                            width={48}
                            height={48}
                            className="object-cover"
                          />
                        ) : (
                          <span className="text-2xl">🥤</span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-gray-900">{drink.name}</p>
                      <p className="text-xs text-gray-700">{drink.category}</p>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                        {drink.brand}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded-full text-xs">
                        {drink.presentation}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => setSelectedDrinkForInventory(drink)}
                        className="hover:bg-blue-50 p-2 rounded-lg transition group"
                        title="Agregar/quitar inventario"
                      >
                        <div className="flex flex-col items-center">
                          <div className="flex items-center gap-1">
                            <Package2 size={14} className="text-gray-600 group-hover:text-blue-600" />
                            <span className="font-bold text-gray-900">{drink.totalBoxes}</span>
                            <span className="text-xs text-gray-700">cajas</span>
                          </div>
                          <span className={`text-sm font-semibold ${
                            drink.totalUnits <= drink.lowStockAlert
                              ? 'text-red-600'
                              : 'text-green-600'
                          }`}>
                            {drink.totalUnits} unidades
                          </span>
                          {drink.totalUnits <= drink.lowStockAlert && (
                            <span className="text-xs text-red-500 flex items-center gap-1">
                              <AlertTriangle size={12} /> Bajo stock
                            </span>
                          )}
                        </div>
                      </button>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="text-sm text-gray-600">Q{drink.costPerUnit.toFixed(2)}</p>
                      <p className="text-xs text-gray-400">por unidad</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <p className="font-semibold text-gray-900">Q{drink.salePrice.toFixed(2)}</p>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex flex-col items-end">
                        <span className={`font-bold ${
                          drink.profitMargin >= 50 ? 'text-green-600' :
                          drink.profitMargin >= 20 ? 'text-blue-600' :
                          'text-orange-600'
                        }`}>
                          {drink.profitMargin.toFixed(2)}%
                        </span>
                        <span className="text-xs text-gray-500">
                          Q{(drink.salePrice - drink.costPerUnit).toFixed(2)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => router.push(`/admin/drinks/${drink._id}`)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Ver detalles"
                        >
                          <Eye size={18} />
                        </button>
                        <button
                          onClick={() => router.push(`/admin/drinks/${drink._id}/edit`)}
                          className="p-2 text-green-600 hover:bg-green-50 rounded-lg"
                          title="Editar"
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          onClick={() => handleToggleActive(drink)}
                          className={`p-2 rounded-lg ${
                            drink.isActive
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={drink.isActive ? 'Desactivar' : 'Activar'}
                        >
                          <Power size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredDrinks.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron bebidas</p>
            </div>
          )}
        </div>

        {/* Resumen */}
        <div className="mt-6 grid grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Bebidas</p>
            <p className="text-2xl font-bold text-gray-900">{drinks.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Bebidas Activas</p>
            <p className="text-2xl font-bold text-green-600">
              {drinks.filter(d => d.isActive).length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Stock Bajo</p>
            <p className="text-2xl font-bold text-orange-600">{lowStockDrinks.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total Unidades</p>

      {/* Modal de Movimiento de Inventario */}
      {selectedDrinkForInventory && (
        <InventoryModal
          drink={selectedDrinkForInventory}
          onClose={() => setSelectedDrinkForInventory(null)}
          onSuccess={() => {
            fetchDrinks();
            setSelectedDrinkForInventory(null);
          }}
        />
      )}
            <p className="text-2xl font-bold text-blue-600">
              {drinks.reduce((sum, d) => sum + d.totalUnits, 0)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
