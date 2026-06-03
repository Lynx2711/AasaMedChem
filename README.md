# Aasa MedChem Inventory and Order Management System

A clean, minimal, monochrome SaaS dashboard for chemical inventory and order management. Built with **Next.js 14 App Router (Next.js 16.2.7 dev)**, **NextAuth.js**, **Tailwind CSS v4**, and **Neon Serverless PostgreSQL**.

---

## 🚀 Key Features by User Role

The system implements Role-Based Access Control (RBAC) across three distinct user roles, authenticated securely via NextAuth.

### 👑 1. Admin Dashboard (`/admin`)
- **System Overview**: Instantly view metrics for total products, lifetime orders, pending orders, and gross revenue.
- **Order Management**: Monitor all client orders. Click to expand details showing individual line items, ordered quantities (converted from base), and line totals.
- **Fulfillment Pipeline**: Transition order states across `Pending` (yellow badge), `Confirmed` (green badge), `Rejected` (red badge), and `Fulfilled` (blue badge).
- **Product Catalog Management**: Edit, delete, or create products across any category.

### 🧪 2. Seller Dashboard (`/seller`)
- **Inventory Metrics**: Monitor total listed products, category variety, and restock alerts (out-of-stock count).
- **Localized Catalog**: Manage seller-specific products. Sellers can add new products and edit/delete only the items they own.

### 🛒 3. Buyer Dashboard (`/buyer`)
- **Product Explorer**: Search the catalog in real-time or filter products by category.
- **Dynamic Unit Pricing**: View prices formatted in INR. Prices dynamically adapt to standard large units (e.g. ₹X per kg for weight, ₹X per L for volume, ₹X per unit for count).
- **Local Shopping Cart**: Add items to a client-side cart. Specify custom quantities and convert display units dynamically (e.g., swapping between `g` and `kg` for weight, or `mL` and `L` for volume).
- **Live Pricing**: Computes dynamic line totals using conversion coefficients in real-time.
- **Checkout**: Add customized delivery notes and place the order with a single click. Tracks purchase history dynamically under the **My Orders** screen.

---

## 🛠️ Technology Stack & Architecture

- **Frontend**: Next.js 14 App Router (built entirely using React `.jsx` client/server components) styled with a clean, monochrome black/white design system using Tailwind CSS.
- **Backend API**: Next.js Route Handlers (`app/api/*`) handling JSON communication and session evaluation.
- **Database**: Neon Serverless PostgreSQL database.
- **Authentication**: NextAuth.js configured with a custom Credentials provider utilizing `bcryptjs` password hashing and JSON Web Tokens (JWT).
- **State Management**: Standard React hooks (`useState`, `useEffect`) and native context, fully eliminating bloated external state dependencies like Redux/Zundand.

---

## ⚖️ Unit Conversion & Pricing Integrity

To keep database records clean and mathematically consistent, all quantities are stored strictly in **base units**:
- **Weight**: Grams (`g`)
- **Volume**: Milliliters (`mL`)
- **Count**: Items (`unit`)

### Conversion Architecture
Conversion logic is isolated inside `lib/units.js` to ensure consistency:
- **`toBase(quantity, unit)`**: Converts display quantities (e.g., `kg` or `L`) into base storage units (`g` or `mL`) before DB insertion.
- **`fromBase(baseQuantity, unit)`**: Resolves database storage units back into user-selected display units in the UI.
- **`calcLineTotal(quantity, unit, pricePerBaseUnit)`**: Calculates precise line item totals. Evaluates calculations using `.toFixed(6)` and cast coercion (`+`) to prevent standard JavaScript binary floating-point representation anomalies.

---

## 🗄️ Database Schema Details

### 👥 `users`
- `id` (SERIAL, PRIMARY KEY)
- `name` (VARCHAR)
- `email` (VARCHAR, UNIQUE)
- `password_hash` (VARCHAR)
- `role` (VARCHAR: `admin` | `seller` | `buyer`)

### 📦 `products`
- `id` (SERIAL, PRIMARY KEY)
- `seller_id` (INTEGER, REFERENCES users)
- `name` (VARCHAR)
- `description` (TEXT)
- `sku` (VARCHAR)
- `category` (VARCHAR)
- `quantity` (NUMERIC) - stored in base units
- `unit_type` (VARCHAR: `weight` | `volume` | `count`)
- `price_per_base_unit` (NUMERIC) - price per gram/mL/unit in INR
- `is_active` (BOOLEAN, DEFAULT true)
- `created_at` (TIMESTAMP WITH TIME ZONE)

### 📋 `orders`
- `id` (SERIAL, PRIMARY KEY)
- `buyer_id` (INTEGER, REFERENCES users)
- `status` (VARCHAR, DEFAULT 'pending')
- `total_amount` (NUMERIC)
- `notes` (TEXT)
- `created_at` (TIMESTAMP WITH TIME ZONE)

### 🔍 `order_items`
- `id` (SERIAL, PRIMARY KEY)
- `order_id` (INTEGER, REFERENCES orders)
- `product_id` (INTEGER, REFERENCES products)
- `ordered_quantity` (NUMERIC) - quantity as inputted by user
- `ordered_unit` (VARCHAR) - unit as selected by user
- `quantity_in_base` (NUMERIC) - quantity converted to base units
- `unit_price_at_order` (NUMERIC) - frozen price per base unit at time of purchase
- `line_total` (NUMERIC) - total line item amount in INR
- `created_at` (TIMESTAMP WITH TIME ZONE)

---

## 📡 API Routes

| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| **GET** | `/api/products` | Get list of active products (supports `?q=search` and `?category=filter`) | Yes |
| **POST** | `/api/products` | Create a new catalog item | Admin, Seller |
| **GET** | `/api/products/:id` | Retrieve single product details | Yes |
| **PUT** | `/api/products/:id` | Update product information/stock | Admin, Seller (own only) |
| **DELETE** | `/api/products/:id` | Soft delete product (sets `is_active = false`) | Admin, Seller (own only) |
| **GET** | `/api/orders` | List orders (Admins see all; Buyers see own) | Admin, Buyer |
| **POST** | `/api/orders` | Place a new order with cart items | Buyer |
| **PUT** | `/api/orders/:id` | Update order status (`confirmed`\|`rejected`\|`fulfilled`) | Admin |
| **POST** | `/api/auth/signup` | Register a new Buyer or Seller account | None |

---

## 💻 Setup and Run Locally

1. Clone the repository and navigate to the application folder:
   ```bash
   cd inventory-app
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables. Create an `inventory-app/.env.local` file with the following variables:
   ```env
   DATABASE_URL=postgresql://<username>:<password>@<host>/<dbname>?sslmode=require
   NEXTAUTH_SECRET=a_long_random_string_used_for_signing_jwt_tokens
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Build the application or run it in development mode:
   ```bash
   # Development Server
   npm run dev

   # Production Build
   npm run build
   npm run start
   ```

---

## ☁️ Deploying to Vercel

Since the Next.js application resides within a subfolder, configure your Vercel deployment with the following settings:

1. **Root Directory**: Navigate to **Project Settings -> General** and set the **Root Directory** to `inventory-app`.
2. **Environment Variables**: Navigate to **Project Settings -> Environment Variables** and add the production credentials for `DATABASE_URL`, `NEXTAUTH_SECRET`, and `NEXTAUTH_URL` (matching your Vercel project domain).
3. Trigger a redeploy of the latest branch commit.
