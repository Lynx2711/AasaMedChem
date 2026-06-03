import sql from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request, { params }) {
  const { id } = await params;

  const rows = await sql`
    SELECT p.*, u.name AS seller_name
    FROM products p
    JOIN users u ON p.seller_id = u.id
    WHERE p.id = ${id}
  `;

  if (!rows.length) {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }

  return Response.json(rows[0]);
}

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !['admin', 'seller'].includes(session.user.role)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { name, description, sku, category, quantity, unit_type, price_per_base_unit, is_active } = body;

  const rows = await sql`
    UPDATE products SET
      name                = ${name},
      description         = ${description},
      sku                 = ${sku},
      category            = ${category},
      quantity            = ${quantity},
      unit_type           = ${unit_type},
      price_per_base_unit = ${price_per_base_unit},
      is_active           = ${is_active}
    WHERE id = ${id}
      AND (${session.user.role} = 'admin' OR seller_id = ${session.user.id})
    RETURNING *
  `;

  if (!rows.length) {
    return Response.json({ error: 'Not found or not your product' }, { status: 404 });
  }

  return Response.json(rows[0]);
}

export async function DELETE(request, { params }) {
  const session = await getServerSession(authOptions);
  if (!session || !['admin', 'seller'].includes(session.user.role)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  await sql`
    UPDATE products SET is_active = false
    WHERE id = ${id}
      AND (${session.user.role} = 'admin' OR seller_id = ${session.user.id})
  `;

  return Response.json({ message: 'Product deactivated' });
}