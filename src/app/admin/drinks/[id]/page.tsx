'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { ArrowLeft, Package, TrendingUp, DollarSign, Edit } from 'lucide-react';
import Image from 'next/image';

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
  createdAt: string;
  updatedAt: string;
}

export default function ViewDrinkPage() {
  const router = useRouter();
  const params = useParams();
  const [drink, setDrink] = useState<Drink | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (params.id) {
      fetchDrink(params.id as string);
    }
  }, [params.id]);

  const fetchDrink = async (id: string) => {
    try {
      const response = await fetch(`/api/drinks/${id}`);
      if (response.ok) {
        const data = await response.json();
        setDrink(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Cargando...</p>
      </div>
    );
  }

  if (!drink) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <p className="text-gray-600">Bebida no encontrada</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.back()}
              className="p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Detalles de Bebida</h1>
              <p className="text-sm text-gray-600">Vista completa del producto</p>
            </div>
          </div>
          <button
            onClick={() => router.push(`/admin/drinks/${drink._id}/edit`)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 flex items-center gap-2"
          >
            <Edit size={18} />
            Editar
          </button>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Imagen y Info Básica */}
          <div className="md:col-span-1">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="w-full h-64 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden mb-4">
                {drink.image ? (
                  <Image
                    src={drink.image}
                    alt={drink.name}
                    width={256}
                    height={256}
                    className="object-cover"
                  />
                ) : (
                  <span className="text-8xl">🥤</span>
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{drink.name}</h2>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Marca:</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                    {drink.brand}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Categoría:</span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium">
                    {drink.category}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Presentación:</span>
                  <span className="text-sm font-medium text-gray-900">{drink.presentation}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Estado:</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    drink.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                  }`}>
                    {drink.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Información Detallada */}
          <div className="md:col-span-2 space-y-6">
            {/* Inventario */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Package size={20} className="text-indigo-600" />
                Inventario
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">Unidades por Caja</p>
                  <p className="text-3xl font-bold text-blue-900">{drink.unitsPerBox}</p>
                </div>
                <div className="p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-700">Total Cajas</p>
                  <p className="text-3xl font-bold text-indigo-900">{drink.totalBoxes}</p>
                </div>
                <div className={`p-4 rounded-lg ${
                  drink.totalUnits <= drink.lowStockAlert ? 'bg-red-50' : 'bg-green-50'
                }`}>
                  <p className={`text-sm ${
                    drink.totalUnits <= drink.lowStockAlert ? 'text-red-700' : 'text-green-700'
                  }`}>
                    Total Unidades
                  </p>
                  <p className={`text-3xl font-bold ${
                    drink.totalUnits <= drink.lowStockAlert ? 'text-red-900' : 'text-green-900'
                  }`}>
                    {drink.totalUnits}
                  </p>
                  {drink.totalUnits <= drink.lowStockAlert && (
                    <p className="text-xs text-red-600 mt-1">⚠️ Stock bajo</p>
                  )}
                </div>
                <div className="p-4 bg-orange-50 rounded-lg">
                  <p className="text-sm text-orange-700">Alerta Stock Bajo</p>
                  <p className="text-3xl font-bold text-orange-900">{drink.lowStockAlert}</p>
                  <p className="text-xs text-orange-600">unidades</p>
                </div>
              </div>
            </div>

            {/* Costos y Precios */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign size={20} className="text-green-600" />
                Costos y Precios
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Costo por Caja</p>
                  <p className="text-2xl font-bold text-gray-900">Q{drink.costPerBox.toFixed(2)}</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">Costo por Unidad</p>
                  <p className="text-2xl font-bold text-gray-900">Q{drink.costPerUnit.toFixed(2)}</p>
                  <p className="text-xs text-gray-500 mt-1">Calculado automáticamente</p>
                </div>
                <div className="p-4 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">Precio de Venta</p>
                  <p className="text-2xl font-bold text-blue-900">Q{drink.salePrice.toFixed(2)}</p>
                  <p className="text-xs text-blue-600 mt-1">por unidad</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-700">Ganancia por Unidad</p>
                  <p className="text-2xl font-bold text-green-900">
                    Q{(drink.salePrice - drink.costPerUnit).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Margen de Ganancia */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-purple-600" />
                Margen de Ganancia
              </h3>
              <div className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg text-center">
                <p className="text-sm text-purple-700 mb-2">Porcentaje de Ganancia</p>
                <p className={`text-5xl font-bold ${
                  drink.profitMargin >= 50 ? 'text-green-600' :
                  drink.profitMargin >= 20 ? 'text-blue-600' :
                  'text-orange-600'
                }`}>
                  {drink.profitMargin.toFixed(2)}%
                </p>
                <div className="mt-4 pt-4 border-t border-purple-200">
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-purple-600">Costo</p>
                      <p className="font-bold text-gray-900">Q{drink.costPerUnit.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-purple-600">Venta</p>
                      <p className="font-bold text-gray-900">Q{drink.salePrice.toFixed(2)}</p>
                    </div>
                    <div>
                      <p className="text-purple-600">Ganancia</p>
                      <p className="font-bold text-green-600">
                        Q{(drink.salePrice - drink.costPerUnit).toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-bold text-gray-900 mb-4">📅 Información de Registro</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Creado:</p>
                  <p className="font-medium text-gray-900">
                    {new Date(drink.createdAt).toLocaleString('es-ES')}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Última actualización:</p>
                  <p className="font-medium text-gray-900">
                    {new Date(drink.updatedAt).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
