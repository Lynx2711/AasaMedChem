import sql from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { toBase, calcLineTotal } from '@/lib/units';

export async function GET(request) {
  const session = await getServerSession(authOptions);
  if (!session) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  let orders;

  if (session.user.role === 'admin') {
    // Admin sees all orders
    orders = await sql`
      SELECT o.*, u.name AS buyer_name, u.email AS buyer_email
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      ORDER BY o.created_at DESC
    `;
  } else if (session.user.role === 'buyer') {
    orders = await sql`
      SELECT o.*, u.name AS buyer_name
      FROM orders o
      JOIN users u ON o.buyer_id = u.id
      WHERE o.buyer_id = ${session.user.id}
      ORDER BY o.created_at DESC
    `;
  } else {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Fetch items for each order
  for (const order of orders) {
    order.items = await sql`
      SELECT oi.*, p.name AS product_name, p.unit_type
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      WHERE oi.order_id = ${order.id}
    `;
  }

  return Response.json(orders);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== 'buyer') {
    return Response.json({ error: 'Only buyers can place orders' }, { status: 403 });
  }

  const body = await request.json();
  const { items, notes } = body;
  // items = [{ product_id, quantity, unit }, ...]

  if (!items || !items.length) {
    return Response.json({ error: 'No items in order' }, { status: 400 });
  }

  // Fetch product prices from DB (never trust client-sent prices)
  const productIds = items.map(i => i.product_id);
  const products = await sql`
    SELECT id, price_per_base_unit, unit_type, quantity AS stock
    FROM products
    WHERE id = ANY(${productIds}) AND is_active = true
  `;
  const productMap = Object.fromEntries(products.map(p => [p.id, p]));

  // Calculate totals server-side
  let totalAmount = 0;
  const processedItems = [];

  for (const item of items) {
    const product = productMap[item.product_id];
    if (!product) {
      return Response.json({ error: `Product ${item.product_id} not found` }, { status: 400 });
    }

    const quantityInBase = toBase(item.quantity, item.unit);
    const lineTotal = calcLineTotal(item.quantity, item.unit, product.price_per_base_unit);

    totalAmount += lineTotal;
    processedItems.push({
      product_id:           item.product_id,
      ordered_quantity:     item.quantity,
      ordered_unit:         item.unit,
      quantity_in_base:     quantityInBase,
      unit_price_at_order:  product.price_per_base_unit,
      line_total:           lineTotal,
    });
  }

  // Insert order and items in a transaction
  const orderRows = await sql`
    INSERT INTO orders (buyer_id, total_amount, notes)
    VALUES (${session.user.id}, ${totalAmount}, ${notes || ''})
    RETURNING *
  `;
  const order = orderRows[0];

  for (const item of processedItems) {
    await sql`
      INSERT INTO order_items 
        (order_id, product_id, ordered_quantity, ordered_unit, quantity_in_base, unit_price_at_order, line_total)
      VALUES
        (${order.id}, ${item.product_id}, ${item.ordered_quantity}, ${item.ordered_unit},
         ${item.quantity_in_base}, ${item.unit_price_at_order}, ${item.line_total})
    `;
  }

  return Response.json({ ...order, items: processedItems }, { status: 201 });
}