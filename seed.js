// It hashes passwords and inserts test users + sample products

const { neon } = require('@neondatabase/serverless');
const bcrypt = require('bcryptjs');
const path = require('path');

// Manually load .env.local (Node doesn't load it automatically)
require('fs').readFileSync('.env.local', 'utf8')
  .split('\n')
  .forEach(line => {
    const [key, ...rest] = line.split('=');
    if (key && rest.length) process.env[key.trim()] = rest.join('=').trim();
  });

const sql = neon(process.env.DATABASE_URL);

async function seed() {
  console.log('Connecting to database...');

  // bcrypt.hash(plainTextPassword, saltRounds)
  // saltRounds=10 means bcrypt runs 2^10 = 1024 iterations — hard to brute force
  const adminHash  = await bcrypt.hash('admin123',  10);
  const sellerHash = await bcrypt.hash('seller123', 10);
  const buyerHash  = await bcrypt.hash('buyer123',  10);

  // Insert users. ON CONFLICT DO NOTHING means re-running won't crash.
  await sql`
    INSERT INTO users (name, email, password_hash, role) VALUES
      ('Admin User',  'admin@test.com',  ${adminHash},  'admin'),
      ('Seller User', 'seller@test.com', ${sellerHash}, 'seller'),
      ('Buyer User',  'buyer@test.com',  ${buyerHash},  'buyer')
    ON CONFLICT (email) DO NOTHING
  `;
  console.log('Users seeded.');

  // Get seller id for products
  const sellers = await sql`SELECT id FROM users WHERE email = 'seller@test.com'`;
  const sellerId = sellers[0].id;

  // Sample products
  // price_per_base_unit is INR per GRAM (for weight), INR per mL (for volume), INR per unit (for count)
  // Example: Sodium Chloride ₹2/gram → price_per_base_unit = 2
  // Example: Ethanol ₹0.05/mL → price_per_base_unit = 0.05
  await sql`
    INSERT INTO products (seller_id, name, description, sku, category, quantity, unit_type, price_per_base_unit)
    VALUES
      (${sellerId}, 'Sodium Chloride', 'Lab grade NaCl', 'NaCl-001', 'Salts',     500000, 'weight', 0.002),
      (${sellerId}, 'Ethanol 99%',     'Analytical grade', 'ETH-001', 'Solvents',  200000, 'volume', 0.05),
      (${sellerId}, 'Beaker 250mL',    'Borosilicate',    'BEA-001', 'Glassware',     200, 'count',  85)
    ON CONFLICT DO NOTHING
  `;
  console.log('Products seeded.');
  console.log('Done! Test logins: admin@test.com/admin123, seller@test.com/seller123, buyer@test.com/buyer123');
}

seed().catch(console.error);