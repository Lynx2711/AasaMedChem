import sql from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function PUT(request, { params }) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'admin') {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { status } = body;

  const validStatuses = ['confirmed', 'rejected', 'fulfilled'];
  if (!status || !validStatuses.includes(status)) {
    return Response.json(
      { error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` },
      { status: 400 }
    );
  }

  try {
    const rows = await sql`
      UPDATE orders
      SET status = ${status}
      WHERE id = ${id}
      RETURNING *
    `;

    if (!rows.length) {
      return Response.json({ error: 'Order not found' }, { status: 404 });
    }

    return Response.json(rows[0]);
  } catch (error) {
    console.error('Error updating order status:', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
