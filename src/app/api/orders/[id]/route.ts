import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Order from '@/models/Order';
import Drink from '@/models/Drink';
import Transaction from '@/models/Transaction';
import InventoryMovement from '@/models/InventoryMovement';
import { logAudit } from '@/lib/auditLog';
import { headers } from 'next/headers';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();

    const order = await Order.findById(id);
    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    // Agregar items a una orden abierta
    if (body.action === 'addItems') {
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
            { error: `Stock insuficiente para ${item.drinkName}` },
            { status: 400 }
          );
        }

        const previousBoxes = drink.totalBoxes;
        const previousUnits = drink.totalUnits;

        console.log(`\n=== AGREGAR A ORDEN ABIERTA: ${item.drinkName} ===`);
        console.log(`Stock antes: ${previousUnits} unidades, ${previousBoxes} cajas`);
        console.log(`Cantidad a descontar: ${item.quantity}`);

        drink.totalUnits -= item.quantity;
        const unitsPerBox = drink.unitsPerBox || 1;
        drink.totalBoxes = Math.floor(drink.totalUnits / unitsPerBox);

        console.log(`Stock después de calcular: ${drink.totalUnits} unidades, ${drink.totalBoxes} cajas`);
        console.log(`isModified totalUnits: ${drink.isModified('totalUnits')}`);
        console.log(`isModified totalBoxes: ${drink.isModified('totalBoxes')}`);

        await drink.save();

        console.log(`Stock GUARDADO: ${drink.totalUnits} unidades, ${drink.totalBoxes} cajas\n`);

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
          reason: `Agregado a orden ${order.orderNumber}`,
          createdBy: 'Sistema',
        });
      }

      // Agregar items a la orden
      order.items.push(...body.items);
      order.total += body.items.reduce((sum: number, item: any) => sum + item.subtotal, 0);
      await order.save();

      // Registrar en auditoría
      const headersList = await headers();
      const userAgent = headersList.get('user-agent') || 'Unknown';
      const itemsDescription = body.items.map((item: any) =>
        `${item.quantity}x ${item.drinkName}`
      ).join(', ');

      await logAudit({
        username: body.addedBy || 'Sistema',
        action: 'update',
        module: 'orders',
        description: `Items agregados a orden ${order.orderNumber} - Mesa: ${order.tableNumber || 'Mostrador'} - Nuevos items: ${itemsDescription}`,
        targetId: order._id.toString(),
        targetName: order.orderNumber,
        previousValue: { itemCount: order.items.length - body.items.length, total: order.total - body.items.reduce((sum: number, item: any) => sum + item.subtotal, 0) },
        newValue: {
          itemsAgregados: body.items.map((item: any) => ({
            bebida: item.drinkName,
            cantidad: item.quantity,
            precio: item.price,
            subtotal: item.subtotal
          })),
          nuevoTotal: order.total
        },
        metadata: { userAgent, action: 'addItems' }
      });

      return NextResponse.json(order);
    }

    // Cancelar orden y devolver stock
    if (body.action === 'cancelOrder') {
      // Devolver stock de todas las bebidas
      for (const item of order.items) {
        const drink = await Drink.findById(item.drinkId);
        if (drink) {
          const previousBoxes = drink.totalBoxes;
          const previousUnits = drink.totalUnits;

          console.log(`\n=== CANCELAR ORDEN: Devolver ${item.drinkName} ===`);
          console.log(`Stock antes: ${previousUnits} unidades, ${previousBoxes} cajas`);
          console.log(`Cantidad a devolver: ${item.quantity}`);

          drink.totalUnits += item.quantity;
          const unitsPerBox = drink.unitsPerBox || 1;
          drink.totalBoxes = Math.floor(drink.totalUnits / unitsPerBox);

          console.log(`Stock después: ${drink.totalUnits} unidades, ${drink.totalBoxes} cajas`);

          await drink.save();

          await InventoryMovement.create({
            drinkId: drink._id,
            drinkName: drink.name,
            type: 'add',
            boxesChanged: drink.totalBoxes - previousBoxes,
            unitsChanged: item.quantity,
            previousBoxes,
            newBoxes: drink.totalBoxes,
            previousUnits,
            newUnits: drink.totalUnits,
            reason: `Cancelación de orden ${order.orderNumber}`,
            createdBy: body.cancelledBy || 'Sistema',
          });
        }
      }

      // Marcar orden como cancelada
      order.status = 'cancelled';
      await order.save();

      // Registrar en auditoría
      const headersList = await headers();
      const userAgent = headersList.get('user-agent') || 'Unknown';
      const itemsDescription = order.items.map((item: any) =>
        `${item.quantity}x ${item.drinkName}`
      ).join(', ');

      await logAudit({
        username: body.cancelledBy || 'Sistema',
        action: 'delete',
        module: 'orders',
        description: `Orden ${order.orderNumber} CANCELADA - Mesa: ${order.tableNumber || 'Mostrador'} - Items devueltos: ${itemsDescription}`,
        targetId: order._id.toString(),
        targetName: order.orderNumber,
        previousValue: {
          estado: 'abierta',
          items: order.items.map((item: any) => ({
            bebida: item.drinkName,
            cantidad: item.quantity,
            subtotal: item.subtotal
          })),
          total: order.total
        },
        newValue: { estado: 'cancelada', stockDevuelto: true },
        metadata: { userAgent, action: 'cancelOrder', reason: 'Orden cancelada por usuario' }
      });

      return NextResponse.json(order);
    }

    // Cerrar orden y marcar como pagada
    if (body.action === 'closeOrder') {
      const previousStatus = order.paymentStatus;
      order.paymentStatus = body.paymentStatus || 'paid';
      await order.save();

      // Registrar transacción si se marca como pagada
      if (order.paymentStatus === 'paid') {
        await Transaction.create({
          type: 'income',
          amount: order.total,
          category: 'Ventas',
          description: `Cierre de orden ${order.orderNumber}`,
          orderId: order._id,
          createdBy: body.closedBy || 'Sistema',
        });
      }

      // Registrar en auditoría
      const headersList2 = await headers();
      const userAgent2 = headersList2.get('user-agent') || 'Unknown';
      const itemsDescription2 = order.items.map((item: any) =>
        `${item.quantity}x ${item.drinkName}`
      ).join(', ');

      await logAudit({
        username: body.closedBy || 'Sistema',
        action: 'update',
        module: 'orders',
        description: `Orden ${order.orderNumber} CERRADA Y PAGADA - Mesa: ${order.tableNumber || 'Mostrador'} - Items: ${itemsDescription2} - Total: Q${order.total.toFixed(2)}`,
        targetId: order._id.toString(),
        targetName: order.orderNumber,
        previousValue: { estado: previousStatus },
        newValue: {
          estado: 'pagada',
          mesero: order.waiterName,
          mesa: order.tableNumber || 'Mostrador',
          items: order.items.map((item: any) => ({
            bebida: item.drinkName,
            cantidad: item.quantity,
            precio: item.price,
            subtotal: item.subtotal
          })),
          total: order.total
        },
        metadata: { userAgent: userAgent2, action: 'closeOrder', transactionCreated: order.paymentStatus === 'paid' }
      });

      return NextResponse.json(order);
    }

    return NextResponse.json({ error: 'Acción no válida' }, { status: 400 });
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    return NextResponse.json({ error: 'Error al actualizar orden' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const body = await request.json();
    const order = await Order.findByIdAndUpdate(id, body, { new: true });

    if (!order) {
      return NextResponse.json({ error: 'Orden no encontrada' }, { status: 404 });
    }

    return NextResponse.json(order);
  } catch (error) {
    return NextResponse.json({ error: 'Error al actualizar orden' }, { status: 500 });
  }
}
