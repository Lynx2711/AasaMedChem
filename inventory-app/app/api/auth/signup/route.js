import sql from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request) {
  try {
    const body = await request.json();
    const { name, email, password, role } = body;

    // Validate inputs
    if (!name || !email || !password || !role) {
      return Response.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return Response.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    const allowedRoles = ['buyer', 'seller'];
    if (!allowedRoles.includes(role.toLowerCase())) {
      return Response.json({ error: 'Invalid role selection' }, { status: 400 });
    }

    // Hash the password
    const passwordHash = await bcrypt.hash(password, 10);

    // Insert user into database
    const rows = await sql`
      INSERT INTO users (name, email, password_hash, role)
      VALUES (${name}, ${email.toLowerCase().trim()}, ${passwordHash}, ${role.toLowerCase()})
      RETURNING id, name, email, role
    `;

    const user = rows[0];
    return Response.json(user, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    
    // Check if error is due to duplicate email unique constraint (Postgres code 23505)
    if (error.code === '23505' || error.message?.includes('users_email_key') || error.message?.includes('duplicate key')) {
      return Response.json({ error: 'Email is already registered' }, { status: 400 });
    }

    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
