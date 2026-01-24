'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function NewIngredientPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Carnes',
    stockMinimo: '',
    preferredUnit: 'oz',
  });

  const categories = ['Carnes', 'Vegetales', 'Lácteos', 'Condimentos', 'Otros'];
  const units = ['oz', 'lb', 'kg', 'g', 'l', 'ml', 'gal', 'unit'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch('/api/ingredients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          stockMinimo: parseFloat(formData.stockMinimo),
        }),
      });

      if (response.ok) {
        router.push('/admin/ingredients');
      } else {
        const data = await response.json();
        alert(data.error || 'Error al crear ingrediente');
      }
    } catch (error) {
      alert('Error al crear ingrediente');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8">
      <Link
        href="/admin/ingredients"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft size={20} />
        Volver a Bodega
      </Link>

      <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuevo Ingrediente</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Nombre del Ingrediente
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="Ej: Brisket, Cebolla, Aceite de Oliva"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Categoría
            </label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stock Mínimo (en oz)
            </label>
            <input
              type="number"
              step="0.01"
              required
              value={formData.stockMinimo}
              onChange={(e) => setFormData({ ...formData, stockMinimo: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
              placeholder="0.00"
            />
            <p className="text-xs text-gray-500 mt-1">
              Cantidad mínima para generar alertas
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Unidad Preferida (para visualización)
            </label>
            <select
              required
              value={formData.preferredUnit}
              onChange={(e) => setFormData({ ...formData, preferredUnit: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-gray-900"
            >
              {units.map(unit => (
                <option key={unit} value={unit}>{unit}</option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-1">
              El stock siempre se almacena en oz, pero se puede visualizar en esta unidad
            </p>
          </div>

          <div className="flex gap-4 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-indigo-600 text-white py-3 rounded-lg font-semibold hover:bg-indigo-700 transition disabled:bg-gray-400"
            >
              {isLoading ? 'Creando...' : 'Crear Ingrediente'}
            </button>
            <Link
              href="/admin/ingredients"
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition text-center"
            >
              Cancelar
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
