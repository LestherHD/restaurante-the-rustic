'use client';

import { useState } from 'react';
import { X, Plus, Minus, Save } from 'lucide-react';

interface InventoryModalProps {
  drink: {
    _id: string;
    name: string;
    totalBoxes: number;
    totalUnits: number;
    unitsPerBox: number;
  };
  onClose: () => void;
  onSuccess: () => void;
}

export default function InventoryModal({ drink, onClose, onSuccess }: InventoryModalProps) {
  const [boxesToAdd, setBoxesToAdd] = useState(0);
  const [reason, setReason] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const newTotalBoxes = drink.totalBoxes + boxesToAdd;
  const newTotalUnits = newTotalBoxes * drink.unitsPerBox;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (boxesToAdd === 0) {
      alert('Debe agregar o quitar al menos 1 caja');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/drinks/inventory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          drinkId: drink._id,
          boxesToAdd,
          reason: reason || 'Ajuste de inventario',
          createdBy: 'Admin',
        }),
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        alert('Error al actualizar inventario');
      }
    } catch (error) {
      alert('Error al actualizar inventario');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-bold text-gray-900">Movimiento de Inventario</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <p className="text-sm text-gray-600 mb-1">Bebida</p>
            <p className="font-bold text-gray-900">{drink.name}</p>
          </div>

          <div className="bg-indigo-50 p-4 rounded-lg border-2 border-indigo-200">
            <p className="text-sm font-semibold text-indigo-900 mb-2">Stock Actual</p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs font-medium text-indigo-700">Cajas</p>
                <p className="text-2xl font-bold text-indigo-900">{drink.totalBoxes}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-indigo-700">Unidades</p>
                <p className="text-2xl font-bold text-indigo-900">{drink.totalUnits}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cajas a Agregar/Quitar
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBoxesToAdd(Math.max(boxesToAdd - 1, -drink.totalBoxes))}
                className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
              >
                <Minus size={20} />
              </button>
              <input
                type="number"
                value={boxesToAdd}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setBoxesToAdd(Math.max(value, -drink.totalBoxes));
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center text-xl font-bold text-gray-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setBoxesToAdd(boxesToAdd + 1)}
                className="p-2 bg-green-100 text-green-600 rounded-lg hover:bg-green-200"
              >
                <Plus size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-700 mt-1 font-medium">
              Usa números negativos para quitar cajas
            </p>
          </div>

          {boxesToAdd !== 0 && (
            <div className={`p-4 rounded-lg ${boxesToAdd > 0 ? 'bg-green-50' : 'bg-red-50'}`}>
              <p className={`text-sm mb-2 ${boxesToAdd > 0 ? 'text-green-700' : 'text-red-700'}`}>
                Nuevo Stock
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-gray-600">Cajas</p>
                  <p className={`text-2xl font-bold ${boxesToAdd > 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {newTotalBoxes}
                  </p>
                  <p className="text-xs text-gray-500">
                    ({boxesToAdd > 0 ? '+' : ''}{boxesToAdd})
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Unidades</p>
                  <p className={`text-2xl font-bold ${boxesToAdd > 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {newTotalUnits}
                  </p>
                  <p className="text-xs text-gray-500">
                    ({boxesToAdd > 0 ? '+' : ''}{boxesToAdd * drink.unitsPerBox})
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-900 mb-1">
              Razón del movimiento
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-500 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              rows={3}
              placeholder="Ej: Compra de inventario, Ajuste por merma, etc."
            />
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || boxesToAdd === 0}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
              <Save size={18} />
              {isLoading ? 'Guardando...' : 'Guardar Movimiento'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
