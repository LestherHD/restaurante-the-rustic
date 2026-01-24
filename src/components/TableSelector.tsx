'use client';

import { useState, useEffect } from 'react';
import { Check, X } from 'lucide-react';

interface Table {
  _id: string;
  number: string;
  capacity: number;
  level: string;
  type: 'table' | 'bar';
  position: { x: number; y: number };
}

interface TableSelectorProps {
  selectedTable: string;
  onSelectTable: (table: string) => void;
  occupiedTables?: string[];
  isOpen?: boolean;
  onClose?: () => void;
}

export default function TableSelector({
  selectedTable,
  onSelectTable,
  occupiedTables = [],
  isOpen,
  onClose
}: TableSelectorProps) {
  const [showSelector, setShowSelector] = useState(false);
  const [tables, setTables] = useState<Table[]>([]);
  const [levels, setLevels] = useState<string[]>([]);
  const [selectedLevel, setSelectedLevel] = useState('');

  useEffect(() => {
    fetchTables();
  }, []);

  useEffect(() => {
    if (tables.length > 0) {
      const uniqueLevels = Array.from(new Set(tables.map(t => t.level)));
      setLevels(uniqueLevels);
      if (!selectedLevel && uniqueLevels.length > 0) {
        setSelectedLevel(uniqueLevels[0]);
      }
    }
  }, [tables]);

  useEffect(() => {
    if (isOpen !== undefined) {
      setShowSelector(isOpen);
    }
  }, [isOpen]);

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    }
  };

  const handleSelectTable = (tableNumber: string) => {
    onSelectTable(tableNumber);
    handleClose();
  };

  const handleClose = () => {
    setShowSelector(false);
    onClose?.();
  };

  const filteredTables = tables.filter(t => t.level === selectedLevel);

  const getTableAtPosition = (x: number, y: number) => {
    return filteredTables.find(t => t.position.x === x && t.position.y === y);
  };

  const getOccupiedCount = (tableNumber: string, tableType: 'table' | 'bar') => {
    if (tableType === 'bar') {
      // Para barras, contar cuántas órdenes abiertas hay
      return occupiedTables.filter(t => t === tableNumber).length;
    }
    // Para mesas, cualquier orden la bloquea
    return occupiedTables.includes(tableNumber) ? 1 : 0;
  };

  const openModal = () => {
    setShowSelector(true);
  };

  return (
    <>
      <button
        type="button"
        onClick={openModal}
        className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white hover:bg-slate-50 text-left flex items-center justify-between"
      >
        <span>{selectedTable || 'Seleccionar mesa'}</span>
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Modal fullscreen */}
      {showSelector && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            {/* Header */}
            <div className="p-6 border-b bg-slate-50 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-slate-900">Seleccionar Mesa</h3>
                <p className="text-sm text-slate-500 mt-1">Elige la mesa o barra para la orden</p>
              </div>
              <button
                onClick={handleClose}
                className="text-slate-500 hover:text-slate-700 p-2"
              >
                <X size={24} />
              </button>
            </div>

            {/* Selector de niveles */}
            {levels.length > 1 && (
              <div className="px-6 py-4 border-b bg-white">
                <div className="flex gap-2 overflow-x-auto">
                  {levels.map((level) => (
                    <button
                      key={level}
                      onClick={() => setSelectedLevel(level)}
                      className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap ${
                        selectedLevel === level
                          ? 'bg-blue-600 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Plano de mesas */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="bg-slate-50 rounded-xl p-8 border-2 border-dashed border-slate-300">
                <div className="grid grid-cols-6 gap-4 mb-6">
                  {Array.from({ length: 6 * 5 }, (_, index) => {
                    const gridX = index % 6;
                    const gridY = Math.floor(index / 6);
                    const table = getTableAtPosition(gridX, gridY);

                    if (!table) {
                      return (
                        <div
                          key={index}
                          className="aspect-square border-2 border-slate-200 rounded-lg bg-white opacity-30"
                        />
                      );
                    }

                    const occupiedCount = getOccupiedCount(table.number, table.type);
                    const isFullyOccupied = table.type === 'bar'
                      ? occupiedCount >= table.capacity
                      : occupiedCount > 0;
                    const isSelected = selectedTable === table.number;
                    const availableSeats = table.type === 'bar'
                      ? table.capacity - occupiedCount
                      : (isFullyOccupied ? 0 : table.capacity);

                    return (
                      <button
                        key={table._id}
                        type="button"
                        onClick={() => !isFullyOccupied && handleSelectTable(table.number)}
                        disabled={isFullyOccupied}
                        className={`relative aspect-square rounded-xl border-2 transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 scale-105 shadow-lg'
                            : isFullyOccupied
                            ? 'border-red-400 bg-red-50 cursor-not-allowed opacity-75'
                            : occupiedCount > 0 && table.type === 'bar'
                            ? 'border-yellow-400 bg-yellow-50 hover:bg-yellow-100'
                            : 'border-slate-300 bg-white hover:bg-slate-50 hover:border-slate-400'
                        }`}
                      >
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-2xl font-bold ${isFullyOccupied ? 'text-red-700' : occupiedCount > 0 && table.type === 'bar' ? 'text-yellow-700' : 'text-slate-900'}`}>
                            {table.number}
                          </span>
                          {table.type === 'bar' ? (
                            <span className={`text-xs mt-1 font-semibold ${isFullyOccupied ? 'text-red-600' : occupiedCount > 0 ? 'text-yellow-600' : 'text-slate-500'}`}>
                              {availableSeats}/{table.capacity} libres
                            </span>
                          ) : (
                            <span className={`text-xs mt-1 ${isFullyOccupied ? 'text-red-600' : 'text-slate-500'}`}>
                              {table.capacity}p
                            </span>
                          )}
                          {table.type === 'bar' && (
                            <span className={`text-xs font-semibold mt-0.5 ${isFullyOccupied ? 'text-red-700' : occupiedCount > 0 ? 'text-yellow-700' : 'text-orange-600'}`}>
                              Barra
                            </span>
                          )}
                          {isFullyOccupied && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <X size={48} className="text-red-500 opacity-30" />
                            </div>
                          )}
                          {isFullyOccupied && (
                            <span className="absolute top-1 left-0 right-0 text-center">
                              <span className="text-[10px] font-bold text-red-700 bg-red-100 px-2 py-0.5 rounded-full">
                                LLENA
                              </span>
                            </span>
                          )}
                          {occupiedCount > 0 && !isFullyOccupied && table.type === 'bar' && (
                            <span className="absolute top-1 left-0 right-0 text-center">
                              <span className="text-[10px] font-bold text-yellow-700 bg-yellow-100 px-2 py-0.5 rounded-full">
                                {occupiedCount} OCUPADO{occupiedCount > 1 ? 'S' : ''}
                              </span>
                            </span>
                          )}
                          {isSelected && (
                            <span className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1">
                              <Check size={14} />
                            </span>
                          )}
                        </div>

                        {/* Sillas decorativas */}
                        {table.type === 'table' && (
                          <>
                            <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-400 rounded" />
                            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-indigo-400 rounded" />
                            {table.capacity >= 4 && (
                              <>
                                <div className="absolute top-1/2 -left-1 -translate-y-1/2 w-3 h-3 bg-indigo-400 rounded" />
                                <div className="absolute top-1/2 -right-1 -translate-y-1/2 w-3 h-3 bg-indigo-400 rounded" />
                              </>
                            )}
                            {table.capacity >= 6 && (
                              <>
                                <div className="absolute top-1/4 -left-1 w-3 h-3 bg-indigo-400 rounded" />
                                <div className="absolute top-1/4 -right-1 w-3 h-3 bg-indigo-400 rounded" />
                              </>
                            )}
                          </>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center justify-center gap-6 text-sm text-slate-600">
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded border-2 border-slate-300 bg-white" />
                    <span>Disponible</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded border-2 border-yellow-400 bg-yellow-50" />
                    <span>Parcial (Barra)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded border-2 border-red-400 bg-red-50 relative">
                      <X size={12} className="text-red-500 absolute inset-0 m-auto" />
                    </div>
                    <span>Llena/Ocupada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded border-2 border-blue-500 bg-blue-50" />
                    <span>Seleccionada</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t bg-white flex justify-between items-center">
              <button
                type="button"
                onClick={() => handleSelectTable('')}
                className="text-sm text-slate-600 hover:text-slate-900 font-medium"
              >
                Sin mesa / Mostrador
              </button>
              <button
                type="button"
                onClick={handleClose}
                className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-semibold"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
