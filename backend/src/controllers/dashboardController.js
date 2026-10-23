const Order = require('../models/Order');
const Product = require('../models/Product');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

// @route GET /api/dashboard/stats  (admin)
const getStats = asyncHandler(async (req, res) => {
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
  sevenDaysAgo.setHours(0, 0, 0, 0);

  const [
    totalUsers,
    totalProducts,
    totalOrders,
    revenueAgg,
    statusAgg,
    salesAgg,
    lowStock,
    recentOrders,
    recentUsers,
  ] =
    await Promise.all([
      User.countDocuments({ role: 'user' }),
      Product.countDocuments(),
      Order.countDocuments(),
      Order.aggregate([
        { $match: { status: { $ne: 'Cancelled' } } },
        { $group: { _id: null, total: { $sum: '$totalPrice' } } },
      ]),
      Order.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      Order.aggregate([
        { $match: { createdAt: { $gte: sevenDaysAgo }, status: { $ne: 'Cancelled' } } },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
            sales: { $sum: '$totalPrice' },
            orders: { $sum: 1 },
          },
        },
        { $sort: { _id: 1 } },
      ]),
      Product.find({ countInStock: { $lte: 5 } })
        .select('name countInStock')
        .sort('countInStock')
        .limit(5),
      Order.find({}).populate('user', 'name email').sort('-createdAt').limit(5),
      User.find({ role: 'user' }).select('name email createdAt isActive').sort('-createdAt').limit(5),
    ]);

  // Fill missing days so the chart always has 7 points
  const salesByDay = [];
  for (let i = 0; i < 7; i++) {
    const d = new Date(sevenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10);
    const found = salesAgg.find((s) => s._id === key);
    salesByDay.push({ date: key, sales: found?.sales || 0, orders: found?.orders || 0 });
  }

  res.json({
    totalUsers,
    totalProducts,
    totalOrders,
    totalRevenue: revenueAgg[0]?.total || 0,
    ordersByStatus: statusAgg.map((s) => ({ status: s._id, count: s.count })),
    salesByDay,
    lowStock,
    recentOrders,
    recentUsers,
  });
});

module.exports = { getStats };
