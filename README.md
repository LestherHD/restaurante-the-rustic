# 🍹 Rustic Drinks - Sistema de Gestión de Bebidas para Restaurantes

Sistema completo de punto de venta (POS) para restaurantes enfocado en la gestión de bebidas, con control de inventario automático, seguimiento de órdenes en tiempo real y contabilidad integrada.

## ✨ Características Principales

### 🔐 Portal de Meseros (`/waiter`)
- ✅ Interfaz intuitiva estilo McDonald's para agregar órdenes
- ✅ Catálogo de bebidas con filtros por categoría
- ✅ Carrito de compras con gestión de cantidades
- ✅ Validación automática de stock disponible
- ✅ Notas especiales por orden
- ✅ Identificación de mesero y mesa
- ✅ Diseño responsive y moderno

### ⚙️ Panel Administrativo (`/admin`)
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de inventario (CRUD de bebidas)
- ✅ Visualización y seguimiento de órdenes
- ✅ Actualización de estado de órdenes
- ✅ Control de stock con alertas de bajo inventario
- ✅ Resumen contable (ingresos, gastos, balance)
- ✅ Interfaz con tabs para organización eficiente

### 🔄 Funcionalidades Automáticas
- ✅ Descuento automático de inventario al confirmar órdenes
- ✅ Registro automático de transacciones de ingresos
- ✅ Numeración automática de órdenes
- ✅ Validación de stock antes de confirmar pedidos
- ✅ Cálculo automático de totales y subtotales

## 🛠️ Tecnologías Utilizadas

- **Frontend**: React 19, Next.js 16 (App Router)
- **Backend**: Next.js API Routes
- **Base de Datos**: MongoDB con Mongoose
- **Estilos**: Tailwind CSS
- **Iconos**: Lucide React
- **TypeScript**: Para type safety completo

## 📋 Prerrequisitos

- Node.js 18.18 o superior
- MongoDB (local o MongoDB Atlas)
- npm o yarn

## 🚀 Instalación y Configuración

### 1. Instalar dependencias
```bash
npm install
```

### 2. Configurar MongoDB

Edita el archivo `.env.local`:

```env
MONGODB_URI=mongodb://localhost:27017/restaurant-drinks
```

Para MongoDB Atlas:
```env
MONGODB_URI=mongodb+srv://usuario:contraseña@cluster.mongodb.net/restaurant-drinks?retryWrites=true&w=majority
```

### 3. Iniciar MongoDB local (si aplica)
```bash
mongod
```

### 4. Ejecutar en modo desarrollo

```bash
npm run dev
```

La aplicación estará disponible en [http://localhost:3000](http://localhost:3000)

### 5. Compilar para producción
```bash
npm run build
npm start
```

## 🎯 Uso del Sistema

### Para Meseros

1. Accede a `/waiter`
2. Ingresa tu nombre (requerido)
3. Navega por las categorías de bebidas
4. Agrega productos al carrito
5. Ajusta cantidades según necesites
6. Opcionalmente agrega número de mesa y notas
7. Confirma la orden

### Para Administradores

1. Accede a `/admin`
2. **Tab Inventario**:
   - Agrega nuevas bebidas
   - Edita información y stock
   - Desactiva/elimina productos
3. **Tab Órdenes**:
   - Visualiza órdenes recientes
   - Cambia estados (Pendiente → Preparando → Listo → Entregado)
4. **Tab Contabilidad**:
   - Revisa resumen de ingresos y gastos
   - Monitorea el balance general

## 📊 Modelos de Datos

### Drink (Bebida)
```typescript
{
  name: string
  description: string
  price: number
  category: string  // Refrescos, Jugos, Cervezas, etc.
  image?: string
  stock: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}
```

### Order (Orden)
```typescript
{
  orderNumber: string  // Único, auto-generado
  items: [{
    drinkId: ObjectId
    drinkName: string
    quantity: number
    price: number
    subtotal: number
  }]
  total: number
  status: 'pending' | 'preparing' | 'ready' | 'delivered' | 'cancelled'
  waiterName: string
  tableNumber?: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}
```

### Transaction (Transacción)
```typescript
{
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  orderId?: ObjectId
  date: Date
  createdBy: string
  createdAt: Date
}
```

## 🔌 API Endpoints

### Bebidas
- `GET /api/drinks` - Obtener todas las bebidas
- `POST /api/drinks` - Crear bebida
- `PUT /api/drinks/[id]` - Actualizar bebida
- `DELETE /api/drinks/[id]` - Eliminar bebida

### Órdenes
- `GET /api/orders` - Obtener órdenes
- `POST /api/orders` - Crear orden (descuenta stock automáticamente)
- `PUT /api/orders/[id]` - Actualizar estado de orden

### Estadísticas
- `GET /api/stats` - Obtener estadísticas del dashboard

## 🐛 Solución de Problemas

### Error de conexión a MongoDB
```bash
# Verifica que MongoDB esté corriendo
mongod

# Verifica la URI en .env.local
MONGODB_URI=mongodb://localhost:27017/restaurant-drinks
```

### Error de compilación TypeScript
```bash
# Limpia caché y reinstala
rm -rf .next node_modules
npm install
npm run build
```

## 📝 Scripts Disponibles

```bash
npm run dev      # Desarrollo con hot-reload
npm run build    # Compilar para producción
npm start        # Ejecutar build de producción
npm run lint     # Ejecutar linter
```

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

---

**Desarrollado con ❤️ para Rustic Restaurant**


## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
