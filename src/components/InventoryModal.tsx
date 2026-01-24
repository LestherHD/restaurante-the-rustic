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

  // Calcular cajas completas y unidades sueltas actuales
  const currentCompleteBoxes = Math.floor(drink.totalUnits / drink.unitsPerBox);
  const currentLooseUnits = drink.totalUnits % drink.unitsPerBox;

  // Calcular nuevo total después del movimiento
  const newTotalUnits = drink.totalUnits + (boxesToAdd * drink.unitsPerBox);
  const newCompleteBoxes = Math.floor(newTotalUnits / drink.unitsPerBox);
  const newLooseUnits = newTotalUnits % drink.unitsPerBox;

  // Límite mínimo: no se pueden quitar más cajas completas de las que hay
  const minBoxesToRemove = -currentCompleteBoxes;

  const handleSubmit = async () => {
    if (boxesToAdd === 0) return;

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
        const error = await response.json();
        console.error('Error al actualizar inventario:', error);
      }
    } catch (error) {
      console.error('Error al actualizar inventario:', error);
      alert('Error al actualizar inventario: ' + error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-xl w-full max-h-[90vh] flex flex-col">
        {/* Header Fijo */}
        <div className="flex justify-between items-center p-4 border-b">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Movimiento de Inventario</h2>
            <p className="text-sm text-gray-600 mt-1">{drink.name}</p>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 p-1 transition">
            <X size={20} />
          </button>
        </div>

        {/* Contenido con Scroll */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-xs font-medium text-gray-600 mb-3">Stock Actual</p>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <p className="text-xs text-gray-500">Cajas Completas</p>
                <p className="text-lg font-semibold text-gray-900">{currentCompleteBoxes}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Unidades Sueltas</p>
                <p className="text-lg font-semibold text-gray-900">{currentLooseUnits}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Total Unidades</p>
                <p className="text-lg font-semibold text-gray-900">{drink.totalUnits}</p>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-2">
              Cajas a Agregar/Quitar
            </label>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setBoxesToAdd(Math.max(boxesToAdd - 1, minBoxesToRemove))}
                className="w-10 h-10 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition flex items-center justify-center"
              >
                <Minus size={20} />
              </button>
              <input
                type="number"
                value={boxesToAdd}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  setBoxesToAdd(Math.max(value, minBoxesToRemove));
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-center text-xl font-semibold text-gray-900 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              />
              <button
                type="button"
                onClick={() => setBoxesToAdd(boxesToAdd + 1)}
                className="w-10 h-10 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition flex items-center justify-center"
              >
                <Plus size={20} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1 text-center">
              Usa números negativos para quitar cajas
            </p>
          </div>

          {boxesToAdd !== 0 && (
            <div className={`p-3 rounded-lg border ${boxesToAdd > 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`text-xs mb-2 font-medium ${boxesToAdd > 0 ? 'text-green-700' : 'text-red-700'}`}>
                Nuevo Stock
              </p>
              <div className="grid grid-cols-3 gap-3 text-sm">
                <div>
                  <p className="text-xs text-gray-600">Cajas</p>
                  <p className={`font-semibold ${boxesToAdd > 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {newCompleteBoxes}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Sueltas</p>
                  <p className={`font-semibold ${boxesToAdd > 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {newLooseUnits}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600">Total</p>
                  <p className={`font-semibold ${boxesToAdd > 0 ? 'text-green-900' : 'text-red-900'}`}>
                    {newTotalUnits}
                  </p>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">
              Razón del movimiento
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-gray-900 text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
              rows={2}
              placeholder="Ej: Compra de inventario, Ajuste por merma"
            />
          </div>
          </div>
        </div>

        {/* Footer Fijo con Botones */}
        <div className="border-t p-4">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 text-sm font-medium transition"
            >
              Cancelar
            </button>
            <button
              onClick={handleSubmit}
              disabled={isLoading || boxesToAdd === 0}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center justify-center gap-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition"
            >
              <Save size={16} />
              {isLoading ? 'Guardando...' : 'Guardar Movimiento'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
