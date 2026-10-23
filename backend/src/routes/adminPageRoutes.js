const router = require('express').Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { rateLimit } = require('express-rate-limit');
const Order = require('../models/Order');
const Product = require('../models/Product');
const Category = require('../models/Category');
const User = require('../models/User');
const AdminSetup = require('../models/AdminSetup');
const { cookieOptions, signToken } = require('../utils/generateToken');

const escapeHtml = (value = '') =>
  String(value).replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  })[character]);

const formatDate = (date) => new Date(date).toLocaleString();
const money = (amount) => `$${Number(amount || 0).toFixed(2)}`;
const clearAdminCookie = (res) => {
  const { maxAge, ...options } = cookieOptions();
  res.clearCookie('jwt', options);
};
const setupKeyConfigured = () =>
  typeof process.env.ADMIN_SETUP_KEY === 'string' && process.env.ADMIN_SETUP_KEY.length >= 32;

const getAdminSetupState = async () => {
  const [adminExists, setup] = await Promise.all([
    User.exists({ role: 'admin' }),
    AdminSetup.findById('initial-admin-setup').select('completed lockExpiresAt'),
  ]);
  return {
    available:
      setupKeyConfigured() &&
      !adminExists &&
      !setup?.completed &&
      (!setup?.lockExpiresAt || setup.lockExpiresAt <= new Date()),
  };
};

const setupForm = (error = '') => `
  <form class="login" method="post" action="/admin/setup">
    <h1>Create first admin</h1>
    <p class="muted">This one-time form is only available until the first admin account is created.</p>
    ${error ? `<p class="error">${escapeHtml(error)}</p>` : ''}
    <label for="name">Name</label><input id="name" name="name" autocomplete="name" required>
    <label for="email">Admin email</label><input id="email" name="email" type="email" autocomplete="email" required>
    <label for="password">Password (at least 12 characters)</label><input id="password" name="password" type="password" minlength="12" autocomplete="new-password" required>
    <label for="confirmPassword">Confirm password</label><input id="confirmPassword" name="confirmPassword" type="password" minlength="12" autocomplete="new-password" required>
    <label for="setupKey">Admin setup key</label><input id="setupKey" name="setupKey" type="password" autocomplete="off" required>
    <p><button class="button" type="submit">Create admin account</button></p>
  </form>
`;

const setupRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
});

const page = (title, content, user) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)} | ShopHub Admin</title>
  <style>
    :root{font-family:Segoe UI,Arial,sans-serif;color:#172033;background:#f4f6fa}
    *{box-sizing:border-box}body{margin:0}a{color:#4f46e5;text-decoration:none}
    header{background:#111827;color:#fff;padding:14px 24px;display:flex;align-items:center;gap:24px;flex-wrap:wrap}
    .brand{font-size:21px;font-weight:700;color:#fff;white-space:nowrap}.brand span{color:#a5b4fc}
    nav{display:flex;gap:6px;flex-wrap:wrap}nav a,header button{color:#e5e7eb;padding:9px 11px;border:0;border-radius:7px;background:transparent;font:inherit}
    nav a:hover,nav a.active,header button:hover{background:#293449;color:#fff}.account{margin-left:auto;display:flex;align-items:center;gap:14px;color:#cbd5e1}
    main{max-width:1240px;margin:28px auto;padding:0 20px}h1{margin:0 0 20px}h2{font-size:18px;margin-top:28px}
    .cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(170px,1fr));gap:14px;margin-bottom:24px}
    .card,table{background:#fff;border:1px solid #e1e5ed;border-radius:10px}.card{padding:18px}.metric{font-size:25px;font-weight:700;display:block;margin-top:5px}
    .muted{color:#697386}.table-wrap{overflow-x:auto;border-radius:10px}table{border-collapse:collapse;width:100%;border-radius:10px;overflow:hidden}
    th,td{text-align:left;padding:12px 14px;border-bottom:1px solid #e8ebf1;vertical-align:top}th{font-size:12px;text-transform:uppercase;color:#697386;background:#f9fafc}
    tr:last-child td{border-bottom:0}.status{font-weight:600}.error{background:#fff0f0;color:#a11;padding:10px;border-radius:7px;margin-bottom:14px}
    form.login{max-width:430px;margin:50px auto;background:white;border:1px solid #e1e5ed;border-radius:12px;padding:24px}
    label{display:block;font-weight:600;margin:14px 0 5px}input{width:100%;padding:11px;border:1px solid #cbd1dc;border-radius:7px;font:inherit}
    .button{display:inline-block;background:#4f46e5;color:white;border:0;border-radius:7px;padding:10px 15px;font:inherit;cursor:pointer}
    @media(max-width:700px){header{gap:10px;padding:14px}main{padding:0 12px}.account{margin-left:0}}
  </style>
</head>
<body>
  <header>
    <a class="brand" href="/admin">Shop<span>Hub</span> Admin</a>
    <nav aria-label="Admin navigation">
      <a href="/admin">Dashboard</a><a href="/admin/orders">Orders</a>
      <a href="/admin/users">Customers</a><a href="/admin/products">Products</a>
      <a href="/admin/categories">Categories</a>
    </nav>
    ${user ? `<div class="account"><span>${escapeHtml(user.name)}</span><form method="post" action="/admin/logout"><button type="submit">Log out</button></form></div>` : ''}
  </header>
  <main>${content}</main>
</body>
</html>`;

const renderTable = (headers, rows, emptyMessage) => {
  const body = rows.length
    ? rows.join('')
    : `<tr><td colspan="${headers.length}" class="muted">${escapeHtml(emptyMessage)}</td></tr>`;
  return `<div class="table-wrap"><table><thead><tr>${headers.map((header) => `<th>${header}</th>`).join('')}</tr></thead><tbody>${body}</tbody></table></div>`;
};

const requireAdminPage = async (req, res, next) => {
  const token = req.cookies?.jwt;
  if (!token) return res.redirect('/admin/login');

  try {
    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(id).select('name email role isActive');
    if (!user || !user.isActive) {
      clearAdminCookie(res);
      return res.redirect('/admin/login');
    }
    if (user.role !== 'admin') {
      return res.status(403).send(page(
        'Admin access denied',
        `<h1>Admin access denied</h1>
          <p>You are signed in as <strong>${escapeHtml(user.email)}</strong>, which is not an administrator account.</p>
          <form method="post" action="/admin/logout">
            <button class="button" type="submit">Log out and sign in as admin</button>
          </form>
          <p><a href="/admin/login">Go to admin sign in</a></p>`,
        null
      ));
    }
    req.adminUser = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      clearAdminCookie(res);
      return res.redirect('/admin/login');
    }
    next(error);
  }
};

router.get('/login', (req, res) => {
  getAdminSetupState()
    .then(({ available }) => {
      res.send(page('Admin sign in', `
        <form class="login" method="post" action="/admin/login">
          <h1>Admin sign in</h1>
          ${req.query.error ? '<p class="error">Invalid credentials or this account is not an active administrator.</p>' : ''}
          <label for="email">Email</label><input id="email" name="email" type="email" autocomplete="username" required>
          <label for="password">Password</label><input id="password" name="password" type="password" autocomplete="current-password" required>
          <p><button class="button" type="submit">Sign in</button></p>
          ${available ? '<p class="muted">First time here? <a href="/admin/setup">Set up the administrator account</a>.</p>' : ''}
        </form>
      `));
    })
    .catch((error) => {
      console.error('Could not check admin setup status:', error.message);
      res.status(500).send(page('Admin sign in', '<p class="error">Could not load sign-in page. Please try again.</p>'));
    });
});

router.get('/setup', async (req, res, next) => {
  try {
    const { available } = await getAdminSetupState();
    if (!available) {
      return res.status(410).send(page(
        'Admin setup unavailable',
        '<h1>Admin setup unavailable</h1><p>Initial setup is closed or not configured. Sign in at <a href="/admin/login">admin sign in</a>.</p>'
      ));
    }
    res.send(page('Create first admin', setupForm()));
  } catch (error) {
    next(error);
  }
});

router.post('/setup', setupRateLimit, async (req, res, next) => {
  const name = String(req.body.name || '').trim();
  const email = String(req.body.email || '').trim().toLowerCase();
  const password = String(req.body.password || '');
  const confirmPassword = String(req.body.confirmPassword || '');
  const providedKey = String(req.body.setupKey || '');

  try {
    const { available } = await getAdminSetupState();
    if (!available) {
      return res.status(410).send(page(
        'Admin setup unavailable',
        '<h1>Admin setup unavailable</h1><p>Initial setup is closed or not configured. Sign in at <a href="/admin/login">admin sign in</a>.</p>'
      ));
    }

    const configuredKey = process.env.ADMIN_SETUP_KEY;
    const providedKeyBuffer = Buffer.from(providedKey);
    const configuredKeyBuffer = Buffer.from(configuredKey);
    if (
      providedKeyBuffer.length !== configuredKeyBuffer.length ||
      !crypto.timingSafeEqual(providedKeyBuffer, configuredKeyBuffer)
    ) {
      return res.status(400).send(page('Create first admin', setupForm('The admin setup key is incorrect.')));
    }
    if (!name || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).send(page('Create first admin', setupForm('Enter a name and a valid email address.')));
    }
    if (password.length < 12) {
      return res.status(400).send(page('Create first admin', setupForm('Choose a password with at least 12 characters.')));
    }
    if (password !== confirmPassword) {
      return res.status(400).send(page('Create first admin', setupForm('The passwords do not match.')));
    }

    const lockToken = crypto.randomBytes(32).toString('hex');
    let lock;
    try {
      lock = await AdminSetup.findOneAndUpdate(
        {
          _id: 'initial-admin-setup',
          completed: { $ne: true },
          $or: [
            { lockExpiresAt: { $exists: false } },
            { lockExpiresAt: { $lte: new Date() } },
          ],
        },
        {
          $set: {
            lockToken,
            lockExpiresAt: new Date(Date.now() + 5 * 60 * 1000),
          },
          $setOnInsert: { completed: false },
        },
        { new: true, upsert: true }
      );
    } catch (error) {
      if (error.code === 11000) {
        return res.status(410).send(page('Admin setup unavailable', '<h1>Admin setup unavailable</h1><p>Setup is already in progress or has been completed.</p>'));
      }
      throw error;
    }

    if (!lock || lock.lockToken !== lockToken) {
      return res.status(410).send(page('Admin setup unavailable', '<h1>Admin setup unavailable</h1><p>Setup is already in progress or has been completed.</p>'));
    }

    try {
      if (await User.exists({ role: 'admin' })) {
        await AdminSetup.updateOne({ _id: lock._id, lockToken }, { $set: { completed: true }, $unset: { lockToken: 1, lockExpiresAt: 1 } });
        return res.status(410).send(page('Admin setup unavailable', '<h1>Admin setup unavailable</h1><p>An administrator account already exists.</p>'));
      }

      const user = await User.create({ name, email, password, role: 'admin' });
      await AdminSetup.updateOne(
        { _id: lock._id, lockToken },
        { $set: { completed: true }, $unset: { lockToken: 1, lockExpiresAt: 1 } }
      );
      res.cookie('jwt', signToken(user._id), cookieOptions());
      return res.redirect(303, '/admin');
    } catch (error) {
      await AdminSetup.updateOne(
        { _id: lock._id, lockToken },
        { $unset: { lockToken: 1, lockExpiresAt: 1 } }
      );
      if (error.code === 11000) {
        return res.status(400).send(page('Create first admin', setupForm('An account with that email already exists.')));
      }
      next(error);
    }
  } catch (error) {
    next(error);
  }
});

router.post('/login', rateLimit({ windowMs: 15 * 60 * 1000, limit: 20, standardHeaders: true, legacyHeaders: false }), async (req, res, next) => {
  try {
    const email = String(req.body.email || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const user = await User.findOne({ email }).select('+password');
    if (!user || user.role !== 'admin' || !user.isActive || !(await user.matchPassword(password))) {
      return res.redirect(303, '/admin/login?error=1');
    }
    res.cookie('jwt', signToken(user._id), cookieOptions());
    res.redirect(303, '/admin');
  } catch (error) {
    next(error);
  }
});

router.post('/logout', (req, res) => {
  clearAdminCookie(res);
  res.redirect(303, '/admin/login');
});

router.get('/', requireAdminPage, async (req, res, next) => {
  try {
    const [totalOrders, totalUsers, totalProducts, totalCategories, recentOrders, recentUsers] = await Promise.all([
      Order.countDocuments(),
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Category.countDocuments(),
      Order.find().populate('user', 'name email').sort('-createdAt').limit(10),
      User.find({ role: 'user' }).select('name email createdAt isActive').sort('-createdAt').limit(10),
    ]);

    const cards = [
      ['Orders', totalOrders, '/admin/orders'],
      ['Customers', totalUsers, '/admin/users'],
      ['Products', totalProducts, '/admin/products'],
      ['Categories', totalCategories, '/admin/categories'],
    ].map(([label, value, href]) => `<a class="card" href="${href}"><span class="muted">${label}</span><span class="metric">${value}</span></a>`).join('');

    const orderRows = recentOrders.map((order) => `<tr>
      <td>#${escapeHtml(String(order._id).slice(-8).toUpperCase())}</td>
      <td>${escapeHtml(order.user?.name || 'Deleted user')}<br><span class="muted">${escapeHtml(order.user?.email || '')}</span></td>
      <td>${escapeHtml(formatDate(order.createdAt))}</td><td>${money(order.totalPrice)}</td>
      <td class="status">${escapeHtml(order.status)}</td><td>${order.isPaid ? 'Paid' : 'Unpaid'}</td>
    </tr>`);
    const userRows = recentUsers.map((user) => `<tr>
      <td>${escapeHtml(user.name)}</td><td>${escapeHtml(user.email)}</td>
      <td>${escapeHtml(formatDate(user.createdAt))}</td><td>${user.isActive ? 'Active' : 'Inactive'}</td>
    </tr>`);

    res.send(page('Dashboard', `<h1>Admin dashboard</h1>
      <section class="cards">${cards}</section>
      <h2>Recent orders</h2>${renderTable(['Order', 'Customer', 'Date', 'Total', 'Status', 'Payment'], orderRows, 'No orders yet.')}
      <h2>Recent customers</h2>${renderTable(['Name', 'Email', 'Joined', 'Account'], userRows, 'No customers yet.')}`, req.adminUser));
  } catch (error) {
    next(error);
  }
});

router.get('/orders', requireAdminPage, async (req, res, next) => {
  try {
    const orders = await Order.find().populate('user', 'name email').sort('-createdAt').limit(100);
    const rows = orders.map((order) => `<tr>
      <td>#${escapeHtml(String(order._id).slice(-8).toUpperCase())}</td>
      <td>${escapeHtml(order.user?.name || 'Deleted user')}<br><span class="muted">${escapeHtml(order.user?.email || '')}</span></td>
      <td>${escapeHtml(formatDate(order.createdAt))}</td><td>${money(order.totalPrice)}</td>
      <td>${escapeHtml(order.status)}</td><td>${order.isPaid ? 'Paid' : 'Unpaid'}</td>
      <td>${order.orderItems.map((item) => `${escapeHtml(item.name)} × ${item.qty}`).join('<br>')}
      <br><span class="muted">${escapeHtml(order.shippingAddress.fullName)}, ${escapeHtml(order.shippingAddress.phone)}, ${escapeHtml(order.shippingAddress.address)}, ${escapeHtml(order.shippingAddress.city)}, ${escapeHtml(order.shippingAddress.country)}</span></td>
    </tr>`);
    res.send(page('Orders', `<h1>Orders</h1>${renderTable(['Order', 'Customer', 'Date', 'Total', 'Status', 'Payment', 'Items and shipping'], rows, 'No orders found.')}`, req.adminUser));
  } catch (error) {
    next(error);
  }
});

router.get('/users', requireAdminPage, async (req, res, next) => {
  try {
    const users = await User.find({ role: 'user' }).select('name email createdAt isActive').sort('-createdAt').limit(500);
    const rows = users.map((user) => `<tr><td>${escapeHtml(user.name)}</td><td>${escapeHtml(user.email)}</td><td>${escapeHtml(formatDate(user.createdAt))}</td><td>${user.isActive ? 'Active' : 'Inactive'}</td></tr>`);
    res.send(page('Customers', `<h1>Customers</h1>${renderTable(['Name', 'Email', 'Joined', 'Account'], rows, 'No customers found.')}`, req.adminUser));
  } catch (error) {
    next(error);
  }
});

router.get('/products', requireAdminPage, async (req, res, next) => {
  try {
    const products = await Product.find().populate('category', 'name').sort('name').limit(500);
    const rows = products.map((product) => `<tr><td>${escapeHtml(product.name)}</td><td>${escapeHtml(product.category?.name || 'Uncategorized')}</td><td>${money(product.price)}</td><td>${product.countInStock}</td><td>${product.featured ? 'Featured' : ''}</td></tr>`);
    res.send(page('Products', `<h1>Products</h1>${renderTable(['Name', 'Category', 'Price', 'Stock', 'Featured'], rows, 'No products found.')}`, req.adminUser));
  } catch (error) {
    next(error);
  }
});

router.get('/categories', requireAdminPage, async (req, res, next) => {
  try {
    const categories = await Category.find().sort('name');
    const rows = categories.map((category) => `<tr><td>${escapeHtml(category.name)}</td><td>${escapeHtml(category.description || '')}</td></tr>`);
    res.send(page('Categories', `<h1>Categories</h1>${renderTable(['Name', 'Description'], rows, 'No categories found.')}`, req.adminUser));
  } catch (error) {
    next(error);
  }
});

module.exports = router;
