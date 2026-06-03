import sql from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const q        = searchParams.get('q')        || '';
  const category = searchParams.get('category') || '';

  const products = await sql`
    SELECT 
      p.*,
      u.name AS seller_name
    FROM products p
    JOIN users u ON p.seller_id = u.id
    WHERE p.is_active = true
      AND (${q} = '' OR p.name ILIKE ${'%' + q + '%'} 
                     OR p.description ILIKE ${'%' + q + '%'})
      AND (${category} = '' OR p.category = ${category})
    ORDER BY p.created_at DESC
  `;

  return Response.json(products);
}

export async function POST(request) {
  const session = await getServerSession(authOptions);

  if (!session || !['admin', 'seller'].includes(session.user.role)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { name, description, sku, category, quantity, unit_type, price_per_base_unit } = body;

  // Basic validation
  if (!name || !unit_type || !price_per_base_unit) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const rows = await sql`
    INSERT INTO products 
      (seller_id, name, description, sku, category, quantity, unit_type, price_per_base_unit)
    VALUES
      (${session.user.id}, ${name}, ${description}, ${sku}, ${category}, 
       ${quantity}, ${unit_type}, ${price_per_base_unit})
    RETURNING *
  `;

  return Response.json(rows[0], { status: 201 });
}