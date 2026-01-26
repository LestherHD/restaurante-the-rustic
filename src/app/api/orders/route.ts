import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Drink from '@/models/Drink';
import Transaction from '@/models/Transaction';
import InventoryMovement from '@/models/InventoryMovement';
import { logAudit } from '@/lib/auditLog';
import { headers } from 'next/headers';

export async function GET(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const paymentStatus = searchParams.get('paymentStatus');

    const filter: any = paymentStatus ? { paymentStatus } : {};
    // Excluir órdenes canceladas
    filter.status = { $ne: 'cancelled' };

    const orders = await Order.find(filter).sort({ createdAt: -1 }).limit(50);
    return NextResponse.json(orders);
  } catch (error) {
    return NextResponse.json({ error: 'Error al obtener órdenes' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const body = await request.json();

    // Generar número de orden único
    const orderCount = await Order.countDocuments();
    const orderNumber = `ORD-${Date.now()}-${orderCount + 1}`;

    // Verificar y actualizar stock
    for (const item of body.items) {
      const drink = await Drink.findById(item.drinkId);
      if (!drink) {
        return NextResponse.json(
          { error: `Bebida ${item.drinkName} no encontrada` },
          { status: 400 }
        );
      }

      if (drink.totalUnits < item.quantity) {
        return NextResponse.json(
          { error: `Stock insuficiente para ${item.drinkName}. Solo hay ${drink.totalUnits} unidades` },
          { status: 400 }
        );
      }

      // Calcular cuántas cajas y unidades sueltas se deben descontar
      const previousBoxes = drink.totalBoxes;
      const previousUnits = drink.totalUnits;

      console.log(`\n=== VENTA DE ${item.drinkName} ===`);
      console.log(`Stock antes: ${previousUnits} unidades, ${previousBoxes} cajas`);
      console.log(`Cantidad a vender: ${item.quantity}`);

      // Descontar unidades del inventario
      drink.totalUnits -= item.quantity;

      console.log(`Unidades después de restar: ${drink.totalUnits}`);

      // Recalcular cajas basado en las unidades restantes
      drink.totalBoxes = Math.floor(drink.totalUnits / drink.unitsPerBox);

      console.log(`Cajas después de recalcular: ${drink.totalBoxes}`);
      console.log(`Unidades por caja: ${drink.unitsPerBox}`);

      console.log(`\nANTES de save():`);
      console.log(`  drink.totalUnits: ${drink.totalUnits}`);
      console.log(`  drink.totalBoxes: ${drink.totalBoxes}`);

      await drink.save();

      console.log(`\nDESPUÉS de save():`);
      console.log(`  drink.totalUnits: ${drink.totalUnits}`);
      console.log(`  drink.totalBoxes: ${drink.totalBoxes}`);

      // Recargar desde la base de datos para verificar
      const reloaded = await Drink.findById(drink._id);
      console.log(`\nRECARGADO desde DB:`);
      console.log(`  reloaded.totalUnits: ${reloaded?.totalUnits}`);
      console.log(`  reloaded.totalBoxes: ${reloaded?.totalBoxes}`);

      console.log(`Stock GUARDADO: ${drink.totalUnits} unidades, ${drink.totalBoxes} cajas\n`);

      // Registrar movimiento de inventario
      await InventoryMovement.create({
        drinkId: drink._id,
        drinkName: drink.name,
        type: 'sale',
        boxesChanged: drink.totalBoxes - previousBoxes,
        unitsChanged: -item.quantity,
        previousBoxes,
        newBoxes: drink.totalBoxes,
        previousUnits,
        newUnits: drink.totalUnits,
        reason: `Venta orden ${orderNumber}`,
        createdBy: body.waiterName,
      });
    }

    // Crear orden
    const order = await Order.create({
      ...body,
      orderNumber,
      paymentStatus: body.paymentStatus || 'paid',
    });

    // Registrar transacción de ingreso solo si está pagada
    if (body.paymentStatus !== 'open') {
      await Transaction.create({
        type: 'income',
        amount: body.total,
        category: 'Ventas',
        description: `Venta orden ${orderNumber}`,
        orderId: order._id,
        createdBy: body.waiterName,
      });
    }

    // Registrar en auditoría
    const headersList = await headers();
    const userAgent = headersList.get('user-agent') || 'Unknown';
    const itemsDescription = body.items.map((item: any) =>
      `${item.quantity}x ${item.drinkName}`
    ).join(', ');

    await logAudit({
      username: body.waiterName || 'Sistema',
      action: 'create',
      module: 'orders',
      description: `Orden ${orderNumber} creada - Mesa: ${body.tableNumber || 'Mostrador'} - Items: ${itemsDescription}`,
      targetId: order._id.toString(),
      targetName: orderNumber,
      newValue: {
        orderNumber,
        mesa: body.tableNumber || 'Mostrador',
        mesero: body.waiterName,
        items: body.items.map((item: any) => ({
          bebida: item.drinkName,
          cantidad: item.quantity,
          precio: item.price,
          subtotal: item.subtotal
        })),
        total: body.total,
        estado: body.paymentStatus === 'open' ? 'Abierta' : 'Pagada',
        notas: body.notes || ''
      },
      metadata: {
        userAgent,
        orderType: body.paymentStatus,
        itemCount: body.items.length,
        tableNumber: body.tableNumber
      }
    });

    return NextResponse.json(order, { status: 201 });
  } catch (error) {
    console.error('Error al crear orden:', error);
    return NextResponse.json({ error: 'Error al crear orden' }, { status: 500 });
  }
}
