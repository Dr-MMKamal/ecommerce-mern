# ShopHub — MERN E-commerce

Full-stack e-commerce store with an admin dashboard.

- **Backend:** Node, Express, MongoDB (Mongoose), **MVC** structure, **JWT stored in an httpOnly cookie**
- **Frontend:** React 18 + Vite, **Redux Toolkit** (async thunks), React Router v6
- **Admin dashboard:** stats and sales chart, products (with image upload), categories, orders, users

## Folder structure

```
ecommerce-mern/
├── backend/
│   ├── server.js                  # entry: loads env, connects DB, starts server
│   ├── .env.example
│   ├── uploads/                   # uploaded product images
│   └── src/
│       ├── app.js                 # express app, middleware, route mounting
│       ├── seeder.js              # demo data (npm run seed)
│       ├── config/db.js
│       ├── models/                # M — User, Product, Category, Order
│       ├── controllers/           # C — auth, user, product, category, order, dashboard
│       ├── routes/                # V/routing layer — REST endpoints
│       ├── middleware/            # authMiddleware (protect, admin), errorMiddleware
│       └── utils/                 # asyncHandler, generateToken
└── frontend/
    ├── index.html, vite.config.js (dev proxy -> :5000)
    └── src/
        ├── main.jsx, App.jsx, index.css
        ├── api/axios.js           # axios instance (withCredentials)
        ├── app/store.js           # configureStore
        ├── features/              # Redux Toolkit slices
        │   ├── auth/authSlice.js
        │   ├── product/productSlice.js
        │   ├── cart/cartSlice.js
        │   ├── order/orderSlice.js
        │   └── admin/adminSlice.js
        ├── components/            # Navbar, ProductCard, ProtectedRoute, AdminRoute, ...
        └── pages/
            ├── Home, Shop, ProductDetails, Cart, Checkout,
            │   Login, Register, MyOrders, OrderDetails, Profile
            └── admin/             # AdminLayout, Dashboard, AdminProducts, ProductForm,
                                   # AdminOrders, AdminUsers, AdminCategories
```

## Run it

Requirements: Node 18+, a running MongoDB (local or Atlas).

```bash
# Frontend terminal: customer store at http://localhost:5173
cd frontend
npm install
npm run dev

# Backend terminal: server-rendered admin portal and API at http://localhost:5000
cd backend
cp .env.example .env          # edit MONGO_URI and JWT_SECRET
# Set ADMIN_SETUP_KEY to a private random string of at least 32 characters.
npm install
npm run dev                   # http://localhost:5000

# The backend root opens the server-rendered admin area; sign in at /admin/login.
# When no admin exists, use the one-time setup form at /admin/setup.
# Admin dashboard, orders, customers, products and categories are available from its navbar.
```

If the admin page says **Admin access denied**, that browser is signed in as a customer.
Log out from the message on the page, then sign in with an administrator account.
The one-time setup form is intentionally hidden after an admin account exists.

Create an administrator without deleting existing store data (PowerShell):

```powershell
cd backend
$env:ADMIN_EMAIL = "admin@example.com"
$env:ADMIN_PASSWORD = "choose-a-unique-password-at-least-12-characters"
npm run create:admin
```

The backend `.env.example` includes `ADMIN_SETUP_KEY`. Set it to a private random key,
restart the backend, and open `http://localhost:5000/admin/setup`. The one-time form
requires that key and closes after the first admin is created. Generate a key with:

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Alternatively, use `npm run create:admin`; it refuses to modify an account if that email
is already in use. `npm run seed` is only for demo data: it deletes existing users,
products, categories, and orders before recreating them. Do not run it on a database
whose data you want to keep; it also creates a demo admin, which disables first-admin setup.

Demo accounts (created by the seeder):

| Role  | Email               | Password |
|-------|---------------------|----------|
| Admin | admin@example.com   | admin123 |
| User  | john@example.com    | user123  |

Change these before deploying anywhere public.

## Authentication (JWT in httpOnly cookie)

1. `POST /api/auth/login` verifies the password (bcrypt), signs a JWT and sets it as an
   **httpOnly** cookie. JavaScript can never read it, which protects against XSS token theft.
2. The browser sends the cookie automatically (`withCredentials: true`).
3. `protect` middleware verifies the token and loads the user; `admin` middleware checks the role.
4. On page refresh the app calls `GET /api/auth/me` to restore the session.
5. `POST /api/auth/logout` clears the cookie.

Roles are never accepted from the request body at registration, so users cannot make themselves admin.
`protect` also accepts an `Authorization: Bearer <token>` header for non-browser API clients.

## API overview

| Method | Endpoint | Access |
|---|---|---|
| POST | /api/auth/register, /login, /logout | public |
| GET | /api/auth/me | user |
| PUT | /api/users/profile | user |
| GET/PUT/DELETE | /api/users, /api/users/:id | admin |
| GET | /api/products (keyword, category, minPrice, maxPrice, sort, page, limit) | public |
| GET | /api/products/:id | public |
| POST | /api/products/:id/reviews | user |
| POST/PUT/DELETE | /api/products, /api/products/:id | admin |
| GET | /api/categories | public |
| POST/PUT/DELETE | /api/categories | admin |
| POST | /api/orders | user |
| GET | /api/orders/mine, /api/orders/:id | user (owner/admin) |
| PUT | /api/orders/:id/cancel | user (owner, Pending only) |
| GET / PUT | /api/orders, /api/orders/:id/status | admin |
| GET | /api/dashboard/stats | admin |
| POST | /api/upload | admin |

Order totals are always recalculated on the server from database prices, and stock is
decremented on order (and restored on cancellation).

## Before going to production

- Set a strong `JWT_SECRET`, `NODE_ENV=production`, and serve everything over HTTPS.
- If the frontend and API are on different domains, set `CLIENT_URL` on the API and `VITE_API_URL`
  on the frontend (cookies then use `SameSite=None; Secure`). Same-site subdomains are simpler.
- Add real payment processing (Stripe, SSLCommerz, bKash, etc.) — currently orders are Cash on Delivery;
  the "Card" option only records the method.
- Store uploads in object storage (S3/Cloudinary) instead of local disk.
- Add CSRF protection if you rely on `SameSite=None`, request validation (e.g. zod/express-validator) and tests.
