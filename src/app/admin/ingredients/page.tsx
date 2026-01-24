'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, AlertTriangle, Package, Search } from 'lucide-react';
import AddStockModal from '@/components/AddStockModal';

interface Ingredient {
  _id: string;
  name: string;
  category: string;
  stockActual: number;
  stockMinimo: number;
  cxo: number;
  preferredUnit: string;
  isLowStock: boolean;
  stockInPreferredUnit: number;
}

export default function IngredientsPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const categories = ['Todos', 'Carnes', 'Vegetales', 'Lácteos', 'Condimentos', 'Otros'];

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await fetch('/api/ingredients');
      const data = await response.json();
      setIngredients(data);
    } catch (error) {
      console.error('Error al cargar ingredientes:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredIngredients = selectedCategory === 'Todos'
    ? ingredients
    : ingredients.filter(i => i.category === selectedCategory);

  // Filtrar por término de búsqueda
  const searchedIngredients = filteredIngredients.filter(i =>
    i.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const lowStockCount = ingredients.filter(i => i.isLowStock).length;

  return (
    <div className="p-4 md:p-8">
      {selectedIngredient && (
        <AddStockModal
          ingredient={selectedIngredient}
          onClose={() => setSelectedIngredient(null)}
          onSuccess={() => {
            fetchIngredients();
            setSelectedIngredient(null);
          }}
        />
      )}

      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Bodega e Inventario</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Gestión de ingredientes y stock</p>
        </div>
        <Link
          href="/admin/ingredients/new"
          className="flex items-center justify-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition text-sm md:text-base"
        >
          <Plus size={20} />
          Nuevo Ingrediente
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Total Ingredientes</p>
              <p className="text-2xl font-bold text-gray-900">{ingredients.length}</p>
            </div>
            <Package className="text-indigo-600" size={40} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm">Alertas de Stock</p>
              <p className="text-2xl font-bold text-red-600">{lowStockCount}</p>
            </div>
            <AlertTriangle className="text-red-600" size={40} />
          </div>
        </div>
      </div>

      {/* Filtros por categoría */}
      <div className="bg-white rounded-lg shadow mb-6 p-3 md:p-4">
        <div className="mb-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Buscar ingrediente..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            />
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 text-sm rounded-lg transition ${
                selectedCategory === cat
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tabla de ingredientes */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando...</div>
        ) : searchedIngredients.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            No hay ingredientes que coincidan con la búsqueda
          </div>
        ) : (
          <>
            {/* Vista de tabla para desktop */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Nombre
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Categoría
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Stock
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Mínimo
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      CXO
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Valor
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {searchedIngredients.map((ingredient) => (
                    <tr key={ingredient._id} className={ingredient.isLowStock ? 'bg-red-50' : ''}>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          {ingredient.isLowStock && (
                            <AlertTriangle size={16} className="text-red-600" />
                          )}
                          <span className="font-medium text-gray-900 text-sm">{ingredient.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {ingredient.category}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className={`text-sm ${ingredient.isLowStock ? 'text-red-600 font-semibold' : 'text-gray-900'}`}>
                          {ingredient.stockInPreferredUnit.toFixed(2)} {ingredient.preferredUnit}
                        </span>
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                        {(ingredient.stockMinimo / (ingredient.preferredUnit === 'oz' ? 1 : 16)).toFixed(2)} {ingredient.preferredUnit}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                        Q{ingredient.cxo.toFixed(4)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 font-semibold">
                        Q{(ingredient.stockActual * ingredient.cxo).toFixed(2)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <div className="flex gap-2">
                          <button
                            onClick={() => setSelectedIngredient(ingredient)}
                            className="text-indigo-600 hover:text-indigo-900 text-xs font-medium"
                          >
                            + Stock
                          </button>
                          <Link
                            href={`/admin/ingredients/${ingredient._id}`}
                            className="text-gray-600 hover:text-gray-900 text-xs font-medium"
                          >
                            Ver
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Vista de cards para móvil */}
            <div className="md:hidden divide-y divide-gray-200">
              {searchedIngredients.map((ingredient) => (
                <div key={ingredient._id} className={`p-4 ${ingredient.isLowStock ? 'bg-red-50' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {ingredient.isLowStock && (
                          <AlertTriangle size={16} className="text-red-600" />
                        )}
                        <h3 className="font-semibold text-gray-900">{ingredient.name}</h3>
                      </div>
                      <p className="text-sm text-gray-600">{ingredient.category}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <p className="text-xs text-gray-500">Stock Actual</p>
                      <p className={`text-sm font-semibold ${ingredient.isLowStock ? 'text-red-600' : 'text-gray-900'}`}>
                        {ingredient.stockInPreferredUnit.toFixed(2)} {ingredient.preferredUnit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Stock Mínimo</p>
                      <p className="text-sm text-gray-600">
                        {(ingredient.stockMinimo / (ingredient.preferredUnit === 'oz' ? 1 : 16)).toFixed(2)} {ingredient.preferredUnit}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">CXO</p>
                      <p className="text-sm text-gray-900">Q{ingredient.cxo.toFixed(4)}</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Valor Total</p>
                      <p className="text-sm font-semibold text-gray-900">
                        Q{(ingredient.stockActual * ingredient.cxo).toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedIngredient(ingredient)}
                      className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-medium hover:bg-indigo-700"
                    >
                      + Stock
                    </button>
                    <Link
                      href={`/admin/ingredients/${ingredient._id}`}
                      className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-medium hover:bg-gray-200 text-center"
                    >
                      Ver
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
