'use client';

import { useState, useEffect } from 'react';
import { LogOut, Trash2, Search, Plus, Minus, X } from 'lucide-react';
import Image from 'next/image';
import TableSelector from '@/components/TableSelector';

interface Drink {
  _id: string;
  name: string;
  brand: string;
  presentation: string;
  salePrice: number;
  category: string;
  image?: string;
  totalUnits: number;
  lowStockAlert: number;
  isActive: boolean;
}

interface CartItem extends Drink {
  quantity: number;
}

export default function WaiterPage() {
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('Todos');
  const [waiterName, setWaiterName] = useState('');
  const [tableNumber, setTableNumber] = useState('');
  const [notes, setNotes] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCartIndex, setSelectedCartIndex] = useState<number | null>(null);
  const [quantityInput, setQuantityInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isSplitOpen, setIsSplitOpen] = useState(false);
  const [numPeople, setNumPeople] = useState(2);
  const [numSeatsToOccupy, setNumSeatsToOccupy] = useState(1);
  const [splitQuantities, setSplitQuantities] = useState<Record<string, number[]>>({});
  const [openOrders, setOpenOrders] = useState<any[]>([]);
  const [showOpenOrders, setShowOpenOrders] = useState(false);
  const [showTableSelector, setShowTableSelector] = useState(false);
  const [showOccupiedTables, setShowOccupiedTables] = useState(false);
  const [selectedOpenOrder, setSelectedOpenOrder] = useState<any | null>(null);
  const [tables, setTables] = useState<any[]>([]);
  const [reservedTables, setReservedTables] = useState<{tableNumber: string, waiterName: string, timestamp: number}[]>([]);

  const categories = ['Todos', 'Refrescos', 'Jugos', 'Cervezas', 'Vinos', 'Licores', 'Café', 'Té', 'Agua', 'Otros'];

  useEffect(() => {
    fetchDrinks();
    fetchOpenOrders();
    fetchTables();
    loadReservedTables();

    // Primero intentar obtener desde localStorage
    const savedName = localStorage.getItem('waiterName');
    if (savedName) {
      console.log('Nombre cargado desde localStorage:', savedName);
      setWaiterName(savedName);
      return;
    }

    // Si no está en localStorage, intentar desde cookie
    console.log('Todas las cookies:', document.cookie);
    const cookies = document.cookie.split(';');
    const authCookie = cookies.find(c => c.trim().startsWith('auth-user='));
    console.log('Cookie de auth encontrada:', authCookie);

    if (authCookie) {
      try {
        const userDataStr = authCookie.split('=')[1];
        console.log('Cookie string:', userDataStr);
        const userData = JSON.parse(decodeURIComponent(userDataStr));
        console.log('Datos del usuario:', userData);
        const name = userData.name || userData.username;
        console.log('Nombre a establecer:', name);
        setWaiterName(name);
        localStorage.setItem('waiterName', name); // Guardar también en localStorage
      } catch (error) {
        console.error('Error al leer cookie de usuario:', error);
      }
    } else {
      console.log('No se encontró cookie auth-user');
    }
  }, []);

  useEffect(() => {
    setSplitQuantities(prev => {
      const next: Record<string, number[]> = { ...prev };

      cart.forEach(item => {
        if (!next[item._id]) {
          const quantities = new Array(numPeople).fill(0);
          quantities[0] = item.quantity;
          next[item._id] = quantities;
        } else if (next[item._id].length !== numPeople) {
          const oldQtys = next[item._id];
          const newQtys = new Array(numPeople).fill(0);

          for (let i = 0; i < Math.min(oldQtys.length, numPeople); i++) {
            newQtys[i] = oldQtys[i];
          }

          const total = newQtys.reduce((sum, q) => sum + q, 0);
          if (total > item.quantity) {
            const scale = item.quantity / total;
            for (let i = 0; i < numPeople; i++) {
              newQtys[i] = Math.floor(newQtys[i] * scale);
            }
            newQtys[0] += item.quantity - newQtys.reduce((sum, q) => sum + q, 0);
          } else if (total < item.quantity) {
            newQtys[0] += item.quantity - total;
          }

          next[item._id] = newQtys;
        } else {
          const total = next[item._id].reduce((sum, q) => sum + q, 0);
          if (total !== item.quantity) {
            const diff = item.quantity - total;
            next[item._id] = [...next[item._id]];
            next[item._id][0] = Math.max(0, next[item._id][0] + diff);
          }
        }
      });

      Object.keys(next).forEach(key => {
        if (!cart.find(item => item._id === key)) {
          delete next[key];
        }
      });

      return next;
    });
  }, [cart, numPeople]);

  const fetchDrinks = async () => {
    try {
      const response = await fetch('/api/drinks');
      const data = await response.json();
      setDrinks(data);
    } catch (error) {
      console.error('Error al cargar bebidas:', error);
    }
  };

  const fetchOpenOrders = async () => {
    try {
      const response = await fetch('/api/orders?paymentStatus=open');
      const data = await response.json();
      setOpenOrders(data);
    } catch (error) {
      console.error('Error al cargar órdenes abiertas:', error);
    }
  };

  const fetchTables = async () => {
    try {
      const response = await fetch('/api/tables');
      const data = await response.json();
      setTables(data);
    } catch (error) {
      console.error('Error al cargar mesas:', error);
    }
  };

  const loadReservedTables = () => {
    const saved = localStorage.getItem('reservedTables');
    if (saved) {
      setReservedTables(JSON.parse(saved));
    }
  };

  const saveReservedTables = (tables: any[]) => {
    localStorage.setItem('reservedTables', JSON.stringify(tables));
    setReservedTables(tables);
  };

  const reserveTable = (tableNumber: string) => {
    const newReservation = {
      tableNumber,
      waiterName,
      timestamp: Date.now()
    };
    const updated = [...reservedTables.filter(r => r.tableNumber !== tableNumber), newReservation];
    saveReservedTables(updated);
  };

  const releaseTable = (tableNumber: string) => {
    const updated = reservedTables.filter(r => r.tableNumber !== tableNumber);
    saveReservedTables(updated);
  };

  const addToCart = (drink: Drink) => {
    const existingIndex = cart.findIndex(item => item._id === drink._id);

    if (existingIndex >= 0) {
      const existingItem = cart[existingIndex];
      if (existingItem.quantity < drink.totalUnits) {
        const newCart = [...cart];
        newCart[existingIndex] = { ...existingItem, quantity: existingItem.quantity + 1 };
        setCart(newCart);
        setSelectedCartIndex(existingIndex);
      } else {
        alert(`Solo hay ${drink.totalUnits} unidades disponibles`);
      }
      return;
    }

    if (drink.totalUnits > 0) {
      setCart([...cart, { ...drink, quantity: 1 }]);
      setSelectedCartIndex(cart.length);
    }
  };

  const removeFromCart = (index: number) => {
    const newCart = cart.filter((_, i) => i !== index);
    setCart(newCart);
    if (selectedCartIndex === index) {
      setSelectedCartIndex(null);
    }
  };

  const updateQuantity = (index: number, newQuantity: number) => {
    const item = cart[index];
    const drink = drinks.find(d => d._id === item._id);

    if (newQuantity === 0) {
      removeFromCart(index);
      return;
    }

    if (drink && newQuantity <= drink.totalUnits && newQuantity > 0) {
      const newCart = [...cart];
      newCart[index] = { ...newCart[index], quantity: newQuantity };
      setCart(newCart);
    } else {
      alert(`Solo hay ${drink?.totalUnits} unidades disponibles`);
    }
  };

  const handleNumpadClick = (value: string) => {
    if (selectedCartIndex === null) return;

    if (value === 'C') {
      setQuantityInput('');
      return;
    }

    if (value === '←') {
      setQuantityInput(quantityInput.slice(0, -1));
      return;
    }

    const newInput = quantityInput + value;
    setQuantityInput(newInput);

    const qty = parseInt(newInput);
    if (!isNaN(qty) && qty > 0) {
      updateQuantity(selectedCartIndex, qty);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.salePrice * item.quantity, 0);
  };

  const handleSubmitOrder = async (items?: CartItem[], paymentStatus: 'open' | 'paid' = 'paid') => {
    const itemsToSubmit = items ?? cart;
    if (itemsToSubmit.length === 0) {
      alert('Agrega bebidas al pedido');
      return;
    }

    setIsLoading(true);
    try {
      // Si es orden abierta y hay múltiples asientos a ocupar (para barras)
      if (paymentStatus === 'open' && numSeatsToOccupy > 1) {
        // Crear múltiples órdenes (una por cada asiento)
        for (let i = 0; i < numSeatsToOccupy; i++) {
          const orderData = {
            items: itemsToSubmit.map(item => ({
              drinkId: item._id,
              drinkName: item.name,
              quantity: item.quantity,
              price: item.salePrice,
              subtotal: item.salePrice * item.quantity,
            })),
            total: itemsToSubmit.reduce((total, item) => total + item.salePrice * item.quantity, 0),
            waiterName,
            tableNumber: tableNumber || 'Mostrador',
            notes: notes + (i > 0 ? ` - Persona ${i + 1}` : ''),
            paymentStatus,
          };

          const response = await fetch('/api/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData),
          });

          if (!response.ok) {
            alert(`Error al crear orden ${i + 1}`);
            setIsLoading(false);
            return;
          }
        }

        alert(`¡${numSeatsToOccupy} órdenes abiertas creadas exitosamente!`);
        setCart([]);
        setTableNumber('');
        setNotes('');
        setNumSeatsToOccupy(1);
        setSelectedCartIndex(null);
        setQuantityInput('');
        setIsSplitOpen(false);
        fetchDrinks();
        fetchOpenOrders();
        // Liberar mesa reservada al crear orden
        if (tableNumber) {
          releaseTable(tableNumber);
        }
        setIsLoading(false);
        return;
      }

      // Orden normal (única)
      const orderData = {
        items: itemsToSubmit.map(item => ({
          drinkId: item._id,
          drinkName: item.name,
          quantity: item.quantity,
          price: item.salePrice,
          subtotal: item.salePrice * item.quantity,
        })),
        total: itemsToSubmit.reduce((total, item) => total + item.salePrice * item.quantity, 0),
        waiterName,
        tableNumber: tableNumber || 'Mostrador',
        notes,
        paymentStatus,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        const message = paymentStatus === 'open' ? '¡Orden abierta creada exitosamente!' : '¡Orden pagada exitosamente!';
        alert(message);
        if (!items) {
          setCart([]);
        } else {
          setCart(prevCart => {
            return prevCart
              .map(item => {
                const submitted = itemsToSubmit.find(s => s._id === item._id);
                if (!submitted) return item;
                const newQty = item.quantity - submitted.quantity;
                return newQty > 0 ? { ...item, quantity: newQty } : null;
              })
              .filter((item): item is CartItem => item !== null);
          });
        }
        setTableNumber('');
        setNotes('');
        setSelectedCartIndex(null);
        setQuantityInput('');
        setIsSplitOpen(false);
        fetchDrinks(); // Actualizar stock
        fetchOpenOrders(); // Actualizar órdenes abiertas
        // Liberar mesa reservada al crear orden
        if (tableNumber) {
          releaseTable(tableNumber);
        }
      } else {
        alert('Error al crear la orden');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al crear la orden');
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = () => {
    if (confirm('¿Estás seguro de vaciar el carrito?')) {
      setCart([]);
      setSelectedCartIndex(null);
      setQuantityInput('');
    }
  };

  const handleSplitBill = () => {
    if (cart.length === 0) {
      alert('No hay productos para dividir');
      return;
    }

    setIsSplitOpen(true);
  };

  const updateSplitQuantity = (itemId: string, personIndex: number, delta: number) => {
    setSplitQuantities(prev => {
      const current = prev[itemId] ?? new Array(numPeople).fill(0);
      const item = cart.find(i => i._id === itemId);
      if (!item) return prev;

      const next = [...current];
      next[personIndex] = Math.max(0, next[personIndex] + delta);

      const total = next.reduce((sum, q) => sum + q, 0);
      if (total > item.quantity) {
        next[personIndex] = Math.max(0, next[personIndex] - (total - item.quantity));
      }

      return { ...prev, [itemId]: next };
    });
  };

  const getSplitItems = (personIndex: number) => {
    return cart
      .map(item => ({
        ...item,
        quantity: splitQuantities[item._id]?.[personIndex] ?? 0,
      }))
      .filter(item => item.quantity > 0);
  };

  const addPerson = () => {
    setNumPeople(prev => prev + 1);
  };

  const removePerson = () => {
    if (numPeople > 2) {
      setNumPeople(prev => prev - 1);
    }
  };

  const addItemsToOpenOrder = async (orderId: string) => {
    if (cart.length === 0) {
      alert('Agrega bebidas al carrito primero');
      return;
    }

    setIsLoading(true);
    try {
      const newItems = cart.map(item => ({
        drinkId: item._id,
        drinkName: item.name,
        quantity: item.quantity,
        price: item.salePrice,
        subtotal: item.salePrice * item.quantity,
      }));

      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'addItems', items: newItems }),
      });

      if (response.ok) {
        alert('Bebidas agregadas a la orden exitosamente');
        setCart([]);
        setSelectedOpenOrder(null);
        setShowOpenOrders(false);
        fetchDrinks();
        fetchOpenOrders();
      } else {
        alert('Error al agregar bebidas');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al agregar bebidas');
    } finally {
      setIsLoading(false);
    }
  };

  const closeOpenOrder = async (orderId: string) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'closeOrder', paymentStatus: 'paid' }),
      });

      if (response.ok) {
        alert('Orden cerrada y pagada exitosamente');
        setSelectedOpenOrder(null);
        setShowOpenOrders(false);
        fetchOpenOrders();
      } else {
        alert('Error al cerrar la orden');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cerrar la orden');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelOrder = async (orderId: string, orderNumber: string) => {
    if (!confirm(`¿Estás seguro de cancelar la orden ${orderNumber}?\n\nEsto devolverá el stock de todas las bebidas.`)) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'cancelOrder', cancelledBy: waiterName }),
      });

      if (response.ok) {
        alert('Orden cancelada exitosamente. El stock ha sido devuelto.');
        setSelectedOpenOrder(null);
        setShowOpenOrders(false);
        fetchDrinks();
        fetchOpenOrders();
      } else {
        const data = await response.json();
        alert(`Error al cancelar la orden: ${data.error || 'Error desconocido'}`);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al cancelar la orden');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const filteredDrinks = (selectedCategory === 'Todos'
    ? drinks.filter(d => d.isActive)
    : drinks.filter(d => d.isActive && d.category === selectedCategory)
  ).filter(d =>
    `${d.name} ${d.brand} ${d.presentation}`.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top Bar */}
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 py-4">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-2xl md:text-3xl font-bold text-slate-900">🍹 Rustic Drinks</h1>
              <p className="text-gray-500">Punto de Venta • Bebidas</p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={() => setShowTableSelector(true)}
                className="bg-indigo-500 text-white px-4 py-2 rounded-lg hover:bg-indigo-600 transition flex items-center gap-2"
              >
                🪑 Seleccionar Mesa
              </button>
              <button
                onClick={() => setShowOccupiedTables(true)}
                className="bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600 transition flex items-center gap-2"
              >
                📋 Mesas Ocupadas
              </button>
              <button
                onClick={() => setShowOpenOrders(!showOpenOrders)}
                className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center gap-2 relative"
              >
                Órdenes Abiertas
                {openOrders.length > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                    {openOrders.length}
                  </span>
                )}
              </button>
              <input
                type="text"
                placeholder="Mesero"
                value={waiterName}
                readOnly
                className="w-full md:w-56 px-4 py-2 border border-slate-200 rounded-lg bg-slate-100 text-slate-900 font-semibold cursor-not-allowed"
              />
              <button
                onClick={handleLogout}
                className="bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition flex items-center gap-2"
              >
                <LogOut size={18} />
                Salir
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Panel - Order */}
          <section className="lg:col-span-4">
            <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-slate-200">
              <div className="p-5 border-b bg-slate-50 rounded-t-2xl">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Pedido actual</h2>
                  <button
                    onClick={clearCart}
                    className="text-sm text-slate-500 hover:text-slate-700 flex items-center gap-1"
                  >
                    <Trash2 size={16} />
                    Vaciar
                  </button>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-xs text-indigo-600 font-medium">Mesa seleccionada</p>
                        <p className="text-lg font-bold text-indigo-900">
                          {tableNumber || 'Sin mesa / Mostrador'}
                        </p>
                        {tableNumber && reservedTables.find(r => r.tableNumber === tableNumber) && (
                          <p className="text-xs text-green-600 font-semibold mt-1">✓ Mesa bloqueada</p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {tableNumber && (
                          <button
                            onClick={() => {
                              releaseTable(tableNumber);
                              setTableNumber('');
                            }}
                            className="text-sm text-red-600 hover:text-red-700 font-semibold"
                          >
                            Liberar
                          </button>
                        )}
                        <button
                          onClick={() => setShowOccupiedTables(true)}
                          className="text-sm text-indigo-600 hover:text-indigo-700 font-semibold"
                        >
                          Cambiar
                        </button>
                      </div>
                    </div>
                  </div>
                  <input
                    type="text"
                    placeholder="Nota rápida"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-white"
                  />
                </div>

                {/* Selector de personas para barras */}
                {tableNumber && tables.find(t => t.number === tableNumber)?.type === 'bar' && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                    <label className="block text-sm font-medium text-slate-700 mb-2">
                      ¿Cuántas personas van a ocupar la barra?
                    </label>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => setNumSeatsToOccupy(Math.max(1, numSeatsToOccupy - 1))}
                        className="w-8 h-8 rounded-lg bg-slate-200 hover:bg-slate-300 flex items-center justify-center font-bold"
                      >
                        −
                      </button>
                      <span className="text-lg font-semibold text-slate-900 min-w-20 text-center">
                        {numSeatsToOccupy} {numSeatsToOccupy === 1 ? 'persona' : 'personas'}
                      </span>
                      <button
                        onClick={() => {
                          const selectedTable = tables.find(t => t.number === tableNumber);
                          const maxSeats = selectedTable?.capacity || 1;
                          const occupiedCount = openOrders.filter(o => o.tableNumber === tableNumber).length;
                          const availableSeats = maxSeats - occupiedCount;
                          if (numSeatsToOccupy < availableSeats) {
                            setNumSeatsToOccupy(numSeatsToOccupy + 1);
                          } else {
                            alert(`Solo hay ${availableSeats} asientos disponibles`);
                          }
                        }}
                        className="w-8 h-8 rounded-lg bg-orange-500 hover:bg-orange-600 flex items-center justify-center font-bold text-white"
                      >
                        +
                      </button>
                    </div>
                    <p className="text-xs text-orange-700 mt-2">
                      Se crearán {numSeatsToOccupy} {numSeatsToOccupy === 1 ? 'orden' : 'órdenes'} {numSeatsToOccupy === 1 ? 'abierta' : 'abiertas'} con los mismos items
                    </p>
                  </div>
                )}
              </div>

              <div className="p-4">
                {cart.length === 0 ? (
                  <div className="text-center text-slate-500 py-10">Sin productos</div>
                ) : (
                  <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                    {cart.map((item, index) => (
                      <button
                        key={item._id}
                        onClick={() => setSelectedCartIndex(index)}
                        className={`w-full text-left p-3 rounded-lg border transition ${
                          selectedCartIndex === index
                            ? 'border-blue-400 bg-blue-50'
                            : 'border-slate-200 hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">{item.brand} • {item.presentation}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-600">x{item.quantity}</p>
                            <p className="font-bold text-slate-900">Q{(item.salePrice * item.quantity).toFixed(2)}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="px-4 pb-4">
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-3">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700">Total</span>
                    <span className="text-2xl font-bold text-slate-900">Q{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Quantity controls */}
              <div className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-2">
                  {['1','2','3','4','5','6','7','8','9','C','0','←'].map((key) => (
                    <button
                      key={key}
                      onClick={() => handleNumpadClick(key)}
                      className="h-12 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-lg font-semibold text-slate-700 shadow-sm"
                    >
                      {key}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <button
                    onClick={() => selectedCartIndex !== null && updateQuantity(selectedCartIndex, cart[selectedCartIndex].quantity - 1)}
                    disabled={selectedCartIndex === null}
                    className="flex-1 bg-slate-100 border border-slate-200 rounded-lg py-2 flex items-center justify-center gap-2 disabled:opacity-50 text-slate-700"
                  >
                    <Minus size={16} />
                    -1
                  </button>
                  <button
                    onClick={() => selectedCartIndex !== null && updateQuantity(selectedCartIndex, cart[selectedCartIndex].quantity + 1)}
                    disabled={selectedCartIndex === null}
                    className="flex-1 bg-slate-100 border border-slate-200 rounded-lg py-2 flex items-center justify-center gap-2 disabled:opacity-50 text-slate-700"
                  >
                    <Plus size={16} />
                    +1
                  </button>
                  <button
                    onClick={() => selectedCartIndex !== null && removeFromCart(selectedCartIndex)}
                    disabled={selectedCartIndex === null}
                    className="flex-1 bg-rose-50 border border-rose-200 text-rose-600 rounded-lg py-2 flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    <X size={16} />
                    Quitar
                  </button>
                </div>
              </div>

              <div className="px-4 pb-4">
                <div className="grid grid-cols-3 gap-2 mb-2">
                  <button
                    onClick={handleSplitBill}
                    className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 rounded-lg font-semibold hover:bg-slate-50 transition text-sm"
                  >
                    Dividir
                  </button>
                  <button
                    onClick={() => handleSubmitOrder(undefined, 'open')}
                    disabled={isLoading || cart.length === 0}
                    className="w-full bg-blue-500 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-600 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    Abrir orden
                  </button>
                  <button
                    onClick={() => handleSubmitOrder()}
                    disabled={isLoading || cart.length === 0}
                    className="w-full bg-emerald-600 text-white py-2.5 rounded-lg font-bold hover:bg-emerald-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed text-sm"
                  >
                    {isLoading ? 'Procesando...' : 'Cobrar'}
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Right Panel - Products */}
          <section className="lg:col-span-8">
            <div className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(15,23,42,0.08)] border border-slate-200 p-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                <div className="relative w-full md:w-80">
                  <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Buscar bebida"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg bg-white"
                  />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                  {categories.map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                        selectedCategory === category
                          ? 'bg-slate-900 text-white'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredDrinks.map(drink => (
                <button
                  key={drink._id}
                  onClick={() => addToCart(drink)}
                  disabled={drink.totalUnits === 0}
                  className={`bg-white rounded-2xl shadow-[0_6px_18px_rgba(15,23,42,0.08)] border border-slate-200 overflow-hidden text-left hover:shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition ${
                    drink.totalUnits === 0 ? 'opacity-60 cursor-not-allowed' : ''
                  }`}
                >
                  <div className="h-32 bg-linear-to-br from-slate-100 to-slate-50 relative">
                    {drink.image ? (
                      <Image
                        src={drink.image}
                        alt={drink.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center text-5xl">🥤</div>
                    )}
                  </div>
                  <div className="p-4">
                    <p className="font-semibold text-slate-900 truncate">{drink.name}</p>
                    <p className="text-xs text-slate-500 truncate">{drink.brand} • {drink.presentation}</p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="font-bold text-slate-900">Q{drink.salePrice.toFixed(2)}</span>
                      <span className={`text-xs font-medium ${
                        drink.totalUnits === 0 ? 'text-rose-500' :
                        drink.totalUnits <= drink.lowStockAlert ? 'text-amber-600' :
                        'text-emerald-600'
                      }`}>
                        Stock: {drink.totalUnits}
                      </span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>
      </main>
      {isSplitOpen && (
        <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setIsSplitOpen(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Dividir cuenta por persona</h3>
                <p className="text-sm text-slate-500">Asigna cuántas unidades corresponden a cada persona</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white border border-slate-300 rounded-lg px-3 py-2 shadow-sm">
                  <button
                    onClick={removePerson}
                    disabled={numPeople <= 2}
                    className="w-8 h-8 rounded-lg bg-slate-100 hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center font-bold text-slate-700"
                  >
                    −
                  </button>
                  <span className="text-sm font-semibold text-slate-900 min-w-20 text-center">
                    {numPeople} {numPeople === 1 ? 'persona' : 'personas'}
                  </span>
                  <button
                    onClick={addPerson}
                    className="w-8 h-8 rounded-lg bg-blue-500 hover:bg-blue-600 flex items-center justify-center font-bold text-white"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={() => setIsSplitOpen(false)}
                  className="text-slate-500 hover:text-slate-700"
                >
                  <X size={22} />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto max-h-[70vh]">
              {cart.map(item => {
                const quantities = splitQuantities[item._id] ?? new Array(numPeople).fill(0);
                return (
                  <div key={item._id} className="border border-slate-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-500">{item.brand} • {item.presentation}</p>
                        <p className="text-sm text-slate-600 mt-1">Total x{item.quantity} • Q{(item.salePrice * item.quantity).toFixed(2)}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-4">
                      {Array.from({ length: numPeople }, (_, index) => (
                        <div key={index} className="flex items-center justify-between border border-slate-200 rounded-lg p-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-700">Persona {index + 1}</p>
                            <p className="text-xs text-slate-500">Cantidad: {quantities[index]}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => updateSplitQuantity(item._id, index, -1)}
                              className="w-8 h-8 rounded-lg border border-slate-200 text-slate-700"
                            >
                              -
                            </button>
                            <button
                              onClick={() => updateSplitQuantity(item._id, index, 1)}
                              className="w-8 h-8 rounded-lg border border-slate-200 text-slate-700"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-6 border-t bg-slate-50">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.from({ length: numPeople }, (_, index) => {
                  const items = getSplitItems(index);
                  const total = items.reduce((sum, item) => sum + item.salePrice * item.quantity, 0);
                  const colors = [
                    { bg: 'bg-blue-600', hover: 'hover:bg-blue-700' },
                    { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700' },
                    { bg: 'bg-purple-600', hover: 'hover:bg-purple-700' },
                    { bg: 'bg-orange-600', hover: 'hover:bg-orange-700' },
                    { bg: 'bg-pink-600', hover: 'hover:bg-pink-700' },
                    { bg: 'bg-teal-600', hover: 'hover:bg-teal-700' },
                  ];
                  const color = colors[index % colors.length];

                  return (
                    <div key={index} className="bg-white border border-slate-200 rounded-lg p-4">
                      <p className="text-sm text-slate-500">Total Persona {index + 1}</p>
                      <p className="text-2xl font-bold text-slate-900">Q{total.toFixed(2)}</p>
                      <button
                        onClick={() => handleSubmitOrder(items)}
                        disabled={items.length === 0}
                        className={`mt-3 w-full ${color.bg} text-white py-2 rounded-lg font-semibold ${color.hover} disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        Cobrar Persona {index + 1}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Open Orders Modal */}
      {showOpenOrders && (
        <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setShowOpenOrders(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-3xl bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Órdenes Abiertas</h3>
                <p className="text-sm text-slate-500">Órdenes pendientes de pago</p>
              </div>
              <button
                onClick={() => setShowOpenOrders(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6">
              {openOrders.length === 0 ? (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-lg font-semibold">No hay órdenes abiertas</p>
                  <p className="text-sm mt-1">Las órdenes abiertas aparecerán aquí</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {openOrders.map((order) => (
                    <div key={order._id} className="border border-slate-200 rounded-lg p-4 hover:shadow-md transition">
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <h4 className="font-bold text-slate-900">Orden #{order.orderNumber}</h4>
                          <p className="text-sm text-slate-500">
                            Mesa: {order.tableNumber || 'Mostrador'} • {new Date(order.createdAt).toLocaleDateString()} {new Date(order.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
                          Abierta
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        {order.items.map((item: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between text-sm">
                            <span className="text-slate-700">
                              {item.drinkName} x{item.quantity}
                            </span>
                            <span className="font-semibold text-slate-900">
                              Q{item.subtotal.toFixed(2)}
                            </span>
                          </div>
                        ))}
                      </div>

                      <div className="border-t pt-3 mb-3">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">Total</span>
                          <span className="text-xl font-bold text-slate-900">Q{order.total.toFixed(2)}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-2">
                        <button
                          onClick={() => {
                            setSelectedOpenOrder(order);
                            setShowOpenOrders(false);
                          }}
                          className="bg-blue-500 text-white py-2 rounded-lg font-semibold hover:bg-blue-600 text-sm"
                        >
                          Agregar bebidas
                        </button>
                        <button
                          onClick={() => closeOpenOrder(order._id)}
                          disabled={isLoading}
                          className="bg-emerald-600 text-white py-2 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 text-sm"
                        >
                          Cerrar y cobrar
                        </button>
                        <button
                          onClick={() => cancelOrder(order._id, order.orderNumber)}
                          disabled={isLoading}
                          className="bg-red-500 text-white py-2 rounded-lg font-semibold hover:bg-red-600 disabled:opacity-50 flex items-center justify-center gap-1 text-sm"
                        >
                          <Trash2 size={16} />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Add Items to Open Order Banner */}
      {selectedOpenOrder && !showOpenOrders && (
        <div className="fixed bottom-0 left-0 right-0 bg-blue-600 text-white p-4 shadow-lg z-20">
          <div className="max-w-screen-2xl mx-auto flex items-center justify-between">
            <div>
              <p className="font-semibold">Agregando a Orden #{selectedOpenOrder.orderNumber}</p>
              <p className="text-sm text-blue-100">Mesa: {selectedOpenOrder.tableNumber || 'Mostrador'}</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => addItemsToOpenOrder(selectedOpenOrder._id)}
                disabled={isLoading || cart.length === 0}
                className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Agregando...' : 'Agregar bebidas'}
              </button>
              <button
                onClick={() => setSelectedOpenOrder(null)}
                className="bg-blue-700 text-white px-4 py-2 rounded-lg hover:bg-blue-800"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Table Selector Modal */}
      <TableSelector
        selectedTable={tableNumber}
        onSelectTable={(table) => {
          setTableNumber(table);
          setNumSeatsToOccupy(1);
          if (table) {
            reserveTable(table); // Bloquear mesa inmediatamente
          }
          setShowTableSelector(false);
        }}
        occupiedTables={[
          ...openOrders.map(o => o.tableNumber).filter(Boolean),
          ...reservedTables.map(r => r.tableNumber)
        ]}
        isOpen={showTableSelector}
        onClose={() => setShowTableSelector(false)}
      />

      {/* Occupied Tables Modal */}
      {showOccupiedTables && (
        <div className="fixed inset-0 bg-black/40 z-30" onClick={() => setShowOccupiedTables(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between sticky top-0 bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-slate-900">Mesas Ocupadas</h3>
                <p className="text-sm text-slate-500">Selecciona una mesa para tomar su orden</p>
              </div>
              <button
                onClick={() => setShowOccupiedTables(false)}
                className="text-slate-500 hover:text-slate-700"
              >
                <X size={22} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Mesas Reservadas (sin orden) */}
              {reservedTables.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-purple-500 rounded-full"></span>
                    Mesas Bloqueadas (sin orden)
                  </h4>
                  <div className="space-y-2">
                    {reservedTables.map((reservation) => (
                      <div key={reservation.tableNumber} className="border border-purple-200 bg-purple-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-purple-900">Mesa {reservation.tableNumber}</p>
                            <p className="text-sm text-purple-600">Bloqueada por: {reservation.waiterName}</p>
                            <p className="text-xs text-purple-500">
                              Hace {Math.floor((Date.now() - reservation.timestamp) / 60000)} min
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setTableNumber(reservation.tableNumber);
                                setShowOccupiedTables(false);
                              }}
                              className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 text-sm"
                            >
                              Seleccionar
                            </button>
                            <button
                              onClick={() => releaseTable(reservation.tableNumber)}
                              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 text-sm"
                            >
                              Liberar
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Mesas con Órdenes Abiertas */}
              {openOrders.length > 0 && (
                <div>
                  <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                    <span className="w-3 h-3 bg-blue-500 rounded-full"></span>
                    Mesas con Órdenes Abiertas
                  </h4>
                  <div className="space-y-2">
                    {openOrders.map((order) => (
                      <div key={order._id} className="border border-blue-200 bg-blue-50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-bold text-blue-900">Mesa {order.tableNumber || 'Mostrador'}</p>
                            <p className="text-sm text-blue-600">Orden #{order.orderNumber}</p>
                            <p className="text-sm text-blue-700 font-semibold">Total: Q{order.total.toFixed(2)}</p>
                          </div>
                          <button
                            onClick={() => {
                              setTableNumber(order.tableNumber);
                              setSelectedOpenOrder(order);
                              setShowOccupiedTables(false);
                            }}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 text-sm"
                          >
                            Agregar a orden
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {reservedTables.length === 0 && openOrders.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  <p className="text-lg font-semibold">No hay mesas ocupadas</p>
                  <p className="text-sm mt-1">Las mesas bloqueadas y con órdenes aparecerán aquí</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
