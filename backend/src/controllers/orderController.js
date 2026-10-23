const Order = require('../models/Order');
const Product = require('../models/Product');
const asyncHandler = require('../utils/asyncHandler');

const round2 = (n) => Math.round(n * 100) / 100;

// @route POST /api/orders  (private)
// Prices are recalculated on the server from the database; client-sent prices are ignored.
const createOrder = asyncHandler(async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (!orderItems || orderItems.length === 0) {
    res.status(400);
    throw new Error('No order items');
  }

  const ids = orderItems.map((i) => i.product);
  const products = await Product.find({ _id: { $in: ids } });

  const items = orderItems.map((i) => {
    const p = products.find((x) => String(x._id) === String(i.product));
    if (!p) {
      res.status(404);
      throw new Error(`Product not found: ${i.product}`);
    }
    const qty = Number(i.qty);
    if (!Number.isInteger(qty) || qty < 1) {
      res.status(400);
      throw new Error(`Invalid quantity for ${p.name}`);
    }
    if (p.countInStock < qty) {
      res.status(400);
      throw new Error(`Not enough stock for ${p.name} (available: ${p.countInStock})`);
    }
    return { product: p._id, name: p.name, image: p.images[0], price: p.price, qty };
  });

  const itemsPrice = round2(items.reduce((s, i) => s + i.price * i.qty, 0));
  const shippingPrice = itemsPrice > 100 ? 0 : 10;
  const taxPrice = round2(itemsPrice * 0.05);
  const totalPrice = round2(itemsPrice + shippingPrice + taxPrice);

  const order = await Order.create({
    user: req.user._id,
    orderItems: items,
    shippingAddress,
    paymentMethod: paymentMethod || 'COD',
    itemsPrice,
    shippingPrice,
    taxPrice,
    totalPrice,
  });

  // Decrease stock
  await Promise.all(
    items.map((i) => Product.updateOne({ _id: i.product }, { $inc: { countInStock: -i.qty } }))
  );

  res.status(201).json(order);
});

// @route GET /api/orders/mine  (private)
const getMyOrders = asyncHandler(async (req, res) => {
  res.json(await Order.find({ user: req.user._id }).sort('-createdAt'));
});

// @route GET /api/orders/:id  (private - owner or admin)
const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('user', 'name email');
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const isOwner = String(order.user._id) === String(req.user._id);
  if (!isOwner && req.user.role !== 'admin') {
    res.status(403);
    throw new Error('Not authorized to view this order');
  }
  res.json(order);
});

// @route PUT /api/orders/:id/cancel  (private - owner, only while Pending)
const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  if (String(order.user) !== String(req.user._id)) {
    res.status(403);
    throw new Error('Not authorized');
  }
  if (order.status !== 'Pending') {
    res.status(400);
    throw new Error('Only pending orders can be cancelled');
  }
  order.status = 'Cancelled';
  await order.save();
  await Promise.all(
    order.orderItems.map((i) =>
      Product.updateOne({ _id: i.product }, { $inc: { countInStock: i.qty } })
    )
  );
  res.json(order);
});

// ---------- Admin ----------

// @route GET /api/orders  (admin)
const getOrders = asyncHandler(async (req, res) => {
  const filter = req.query.status ? { status: req.query.status } : {};
  res.json(await Order.find(filter).populate('user', 'name email').sort('-createdAt'));
});

// @route PUT /api/orders/:id/status  (admin)
const updateOrderStatus = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }
  const { status, isPaid } = req.body;
  if (status) {
    order.status = status;
    if (status === 'Delivered') {
      order.deliveredAt = Date.now();
      // COD orders are paid on delivery
      if (!order.isPaid) {
        order.isPaid = true;
        order.paidAt = Date.now();
      }
    }
  }
  if (typeof isPaid === 'boolean') {
    order.isPaid = isPaid;
    order.paidAt = isPaid ? Date.now() : undefined;
  }
  res.json(await order.save());
});

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getOrders,
  updateOrderStatus,
};
