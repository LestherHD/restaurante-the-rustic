'use client';

import { useState, useEffect } from 'react';
import { Plus, Minus, ShoppingCart, X, LogOut } from 'lucide-react';
import Image from 'next/image';

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
  const [showCart, setShowCart] = useState(false);

  const categories = ['Todos', 'Refrescos', 'Jugos', 'Cervezas', 'Vinos', 'Licores', 'Café', 'Té', 'Agua', 'Otros'];

  useEffect(() => {
    fetchDrinks();

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

  const fetchDrinks = async () => {
    try {
      const response = await fetch('/api/drinks');
      const data = await response.json();
      setDrinks(data);
    } catch (error) {
      console.error('Error al cargar bebidas:', error);
    }
  };

  const addToCart = (drink: Drink) => {
    const existingItem = cart.find(item => item._id === drink._id);
    if (existingItem) {
      if (existingItem.quantity < drink.totalUnits) {
        setCart(cart.map(item =>
          item._id === drink._id ? { ...item, quantity: item.quantity + 1 } : item
        ));
      } else {
        alert(`Solo hay ${drink.totalUnits} unidades disponibles`);
      }
    } else {
      if (drink.totalUnits > 0) {
        setCart([...cart, { ...drink, quantity: 1 }]);
      }
    }
  };

  const removeFromCart = (drinkId: string) => {
    setCart(cart.filter(item => item._id !== drinkId));
  };

  const updateQuantity = (drinkId: string, newQuantity: number) => {
    const drink = drinks.find(d => d._id === drinkId);
    if (drink && newQuantity <= drink.totalUnits && newQuantity > 0) {
      setCart(cart.map(item =>
        item._id === drinkId ? { ...item, quantity: newQuantity } : item
      ));
    } else if (newQuantity === 0) {
      removeFromCart(drinkId);
    } else {
      alert(`Solo hay ${drink?.totalUnits} unidades disponibles`);
    }
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + item.salePrice * item.quantity, 0);
  };

  const handleSubmitOrder = async () => {
    if (!waiterName || cart.length === 0) {
      alert('Por favor completa el nombre del mesero y agrega bebidas al carrito');
      return;
    }

    setIsLoading(true);
    try {
      const orderData = {
        items: cart.map(item => ({
          drinkId: item._id,
          drinkName: item.name,
          quantity: item.quantity,
          price: item.salePrice,
          subtotal: item.salePrice * item.quantity,
        })),
        total: calculateTotal(),
        waiterName,
        tableNumber,
        notes,
      };

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      if (response.ok) {
        alert('¡Orden creada exitosamente!');
        setCart([]);
        setTableNumber('');
        setNotes('');
        setShowCart(false);
        fetchDrinks(); // Actualizar stock
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

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    window.location.href = '/';
  };

  const filteredDrinks = selectedCategory === 'Todos'
    ? drinks.filter(d => d.isActive)
    : drinks.filter(d => d.isActive && d.category === selectedCategory);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-orange-600">🍹 Rustic Drinks</h1>
              <p className="text-gray-600">Sistema de Órdenes para Meseros</p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowCart(!showCart)}
                className="relative bg-orange-500 text-white px-6 py-3 rounded-lg hover:bg-orange-600 transition flex items-center gap-2"
              >
                <ShoppingCart size={24} />
                {cart.length > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-bold">
                    {cart.length}
                  </span>
                )}
              </button>
              <button
                onClick={handleLogout}
                className="bg-red-500 text-white px-4 py-3 rounded-lg hover:bg-red-600 transition flex items-center gap-2"
              >
                <LogOut size={20} />
              </button>
            </div>
          </div>

          {/* Waiter Name Input */}
          <div className="mt-4">
            <input
              type="text"
              placeholder="Nombre del mesero"
              value={waiterName}
              readOnly
              className="w-full md:w-64 px-4 py-2 border-2 border-orange-300 rounded-lg bg-orange-50 text-gray-900 font-semibold cursor-not-allowed"
            />
          </div>
        </div>
      </header>

      {/* Categories */}
      <div className="bg-white border-b shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 overflow-x-auto">
          <div className="flex gap-2">
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full whitespace-nowrap transition ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Drinks Grid */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredDrinks.map(drink => (
            <div
              key={drink._id}
              className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition transform hover:-translate-y-1"
            >
              <div className="h-48 bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center relative overflow-hidden">
                {drink.image ? (
                  <Image
                    src={drink.image}
                    alt={drink.name}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                ) : (
                  <span className="text-6xl">🥤</span>
                )}
                {drink.totalUnits <= drink.lowStockAlert && drink.totalUnits > 0 && (
                  <div className="absolute top-2 right-2 bg-yellow-400 text-yellow-900 px-2 py-1 rounded-full text-xs font-bold">
                    ⚠️ Pocas unidades
                  </div>
                )}
                {drink.totalUnits === 0 && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-bold">
                    Sin Stock
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800">{drink.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{drink.brand} - {drink.presentation}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-2xl font-bold text-orange-600">Q{drink.salePrice.toFixed(2)}</span>
                  <span className={`text-sm ${
                    drink.totalUnits === 0 ? 'text-red-500' :
                    drink.totalUnits <= drink.lowStockAlert ? 'text-yellow-600' :
                    'text-green-600'
                  } font-medium`}>
                    {drink.totalUnits} disponibles
                  </span>
                </div>
                <button
                  onClick={() => addToCart(drink)}
                  disabled={drink.totalUnits === 0}
                  className={`w-full mt-4 py-2 rounded-lg font-semibold transition ${
                    drink.totalUnits === 0
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  {drink.totalUnits === 0 ? 'Sin Stock' : 'Agregar al Carrito'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Shopping Cart Sidebar */}
      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-20" onClick={() => setShowCart(false)}>
          <div
            className="absolute right-0 top-0 h-full w-full md:w-96 bg-white shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Carrito</h2>
                <button onClick={() => setShowCart(false)} className="text-gray-500 hover:text-gray-700">
                  <X size={24} />
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-500 text-center py-8">El carrito está vacío</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map(item => (
                      <div key={item._id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-gray-800">{item.name}</h4>
                          <p className="text-orange-600 font-bold">Q{item.salePrice.toFixed(2)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity - 1)}
                            className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition"
                          >
                            <Minus size={16} />
                          </button>
                          <span className="w-10 text-center font-bold text-gray-900 text-lg">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item._id, item.quantity + 1)}
                            className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition"
                          >
                            <Plus size={16} />
                          </button>
                          <button
                            onClick={() => removeFromCart(item._id)}
                            className="ml-2 bg-red-500 text-white p-2 rounded-lg hover:bg-red-600 transition"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="Número de mesa (opcional)"
                      value={tableNumber}
                      onChange={(e) => setTableNumber(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-gray-900"
                    />
                    <textarea
                      placeholder="Notas especiales (opcional)"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-orange-500 text-gray-900"
                      rows={3}
                    />

                    <div className="bg-orange-100 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-semibold text-gray-900">Total:</span>
                        <span className="text-2xl font-bold text-orange-600">
                          Q{calculateTotal().toFixed(2)}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmitOrder}
                      disabled={isLoading}
                      className="w-full bg-green-500 text-white py-3 rounded-lg font-bold hover:bg-green-600 transition disabled:bg-gray-400"
                    >
                      {isLoading ? 'Procesando...' : 'Confirmar Orden'}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
