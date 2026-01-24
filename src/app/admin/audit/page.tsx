'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Filter, Calendar, User, Activity, Clock, FileText } from 'lucide-react';

interface AuditLog {
  _id: string;
  username: string;
  action: string;
  module: string;
  description: string;
  targetName?: string;
  createdAt: string;
  previousValue?: any;
  newValue?: any;
  metadata?: any;
}

export default function AuditLogsPage() {
  const router = useRouter();
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedModule, setSelectedModule] = useState('all');
  const [selectedAction, setSelectedAction] = useState('all');
  const [selectedUser, setSelectedUser] = useState('all');

  useEffect(() => {
    fetchLogs();
  }, []);

  useEffect(() => {
    filterLogs();
  }, [logs, selectedModule, selectedAction, selectedUser]);

  const fetchLogs = async () => {
    try {
      const response = await fetch('/api/audit');
      const data = await response.json();
      setLogs(data);
    } catch (error) {
      console.error('Error al cargar logs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = [...logs];

    if (selectedModule !== 'all') {
      filtered = filtered.filter(log => log.module === selectedModule);
    }

    if (selectedAction !== 'all') {
      filtered = filtered.filter(log => log.action === selectedAction);
    }

    if (selectedUser !== 'all') {
      filtered = filtered.filter(log => log.username === selectedUser);
    }

    setFilteredLogs(filtered);
  };

  const getActionColor = (action: string) => {
    switch (action) {
      case 'create': return 'bg-green-100 text-green-800';
      case 'update': return 'bg-blue-100 text-blue-800';
      case 'delete': return 'bg-red-100 text-red-800';
      case 'inventory_movement': return 'bg-purple-100 text-purple-800';
      case 'price_change': return 'bg-orange-100 text-orange-800';
      case 'login': return 'bg-emerald-100 text-emerald-800';
      case 'logout': return 'bg-slate-100 text-slate-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getActionLabel = (action: string) => {
    switch (action) {
      case 'create': return 'Creación';
      case 'update': return 'Actualización';
      case 'delete': return 'Eliminación';
      case 'inventory_movement': return 'Movimiento';
      case 'price_change': return 'Precio';
      case 'login': return 'Inicio Sesión';
      case 'logout': return 'Cierre Sesión';
      default: return action;
    }
  };

  const getModuleLabel = (module: string) => {
    switch (module) {
      case 'drinks': return 'Bebidas';
      case 'ingredients': return 'Ingredientes';
      case 'categories': return 'Categorías';
      case 'dishes': return 'Platos';
      case 'recipes': return 'Recetas';
      case 'orders': return 'Órdenes';
      case 'users': return 'Usuarios';
      case 'auth': return 'Autenticación';
      default: return module;
    }
  };

  const uniqueUsers = Array.from(new Set(logs.map(log => log.username)));

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Activity size={28} />
            Registro de Auditoría
          </h1>
          <p className="text-gray-600 mt-1">Historial completo de actividades del sistema</p>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Filtros */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-2 mb-3">
            <Filter size={20} className="text-gray-600" />
            <h2 className="font-semibold text-gray-900">Filtros</h2>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Módulo
              </label>
              <select
                value={selectedModule}
                onChange={(e) => setSelectedModule(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
              >
                <option value="all">Todos</option>
                <option value="drinks">Bebidas</option>
                <option value="ingredients">Ingredientes</option>
                <option value="categories">Categorías</option>
                <option value="dishes">Platos</option>
                <option value="recipes">Recetas</option>
                <option value="orders">Órdenes</option>
                <option value="users">Usuarios</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Acción
              </label>
              <select
                value={selectedAction}
                onChange={(e) => setSelectedAction(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
              >
                <option value="all">Todas</option>
                <option value="create">Creación</option>
                <option value="update">Actualización</option>
                <option value="delete">Eliminación</option>
                <option value="inventory_movement">Movimiento de Inventario</option>
                <option value="price_change">Cambio de Precio</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Usuario
              </label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 text-gray-900"
              >
                <option value="all">Todos</option>
                {uniqueUsers.map(user => (
                  <option key={user} value={user}>{user}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resumen */}
        <div className="grid grid-cols-4 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Total de Registros</p>
            <p className="text-3xl font-bold text-gray-900">{filteredLogs.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Creaciones</p>
            <p className="text-3xl font-bold text-green-600">
              {filteredLogs.filter(l => l.action === 'create').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Modificaciones</p>
            <p className="text-3xl font-bold text-blue-600">
              {filteredLogs.filter(l => l.action === 'update').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow p-4">
            <p className="text-sm text-gray-600">Eliminaciones</p>
            <p className="text-3xl font-bold text-red-600">
              {filteredLogs.filter(l => l.action === 'delete').length}
            </p>
          </div>
        </div>

        {/* Tabla de Logs */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {isLoading ? (
            <div className="p-12 text-center">
              <p className="text-gray-500">Cargando registros...</p>
            </div>
          ) : filteredLogs.length === 0 ? (
            <div className="p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500">No hay registros con los filtros seleccionados</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      <Clock size={14} className="inline mr-1" />
                      FECHA Y HORA
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      <User size={14} className="inline mr-1" />
                      USUARIO
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      MÓDULO
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      ACCIÓN
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                      DESCRIPCIÓN
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {filteredLogs.map((log) => (
                    <tr key={log._id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(log.createdAt).toLocaleString('es-GT', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-indigo-100 text-indigo-800 rounded-full text-xs font-medium">
                          {log.username}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs font-medium">
                          {getModuleLabel(log.module)}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getActionColor(log.action)}`}>
                          {getActionLabel(log.action)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-900">
                        {log.description}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
