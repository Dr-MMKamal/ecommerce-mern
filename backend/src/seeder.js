require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const Category = require('./models/Category');
const Product = require('./models/Product');
const Order = require('./models/Order');

const run = async () => {
  await connectDB();

  await Promise.all([Order.deleteMany(), Product.deleteMany(), Category.deleteMany(), User.deleteMany()]);

  if (process.argv[2] === '--destroy') {
    console.log('Data destroyed');
    return process.exit();
  }

  await User.create([
    { name: 'Admin', email: 'admin@example.com', password: 'admin123', role: 'admin' },
    { name: 'John Doe', email: 'john@example.com', password: 'user123' },
  ]);

  const [electronics, fashion, home] = await Category.create([
    { name: 'Electronics', description: 'Gadgets and devices' },
    { name: 'Fashion', description: 'Clothing and accessories' },
    { name: 'Home & Living', description: 'Furniture and decor' },
  ]);

  const img = (seed) => `https://picsum.photos/seed/${seed}/600/600`;

  await Product.create([
    { name: 'Wireless Headphones', brand: 'SoundMax', price: 89.99, countInStock: 25, category: electronics._id, featured: true, images: [img('headphones')], description: 'Over-ear Bluetooth headphones with active noise cancellation and 30-hour battery life.' },
    { name: 'Smart Watch Series 5', brand: 'TimeTech', price: 149.0, countInStock: 15, category: electronics._id, featured: true, images: [img('watch')], description: 'Fitness tracking, heart-rate monitor, GPS and a bright AMOLED display.' },
    { name: 'Mechanical Keyboard', brand: 'KeyPro', price: 64.5, countInStock: 40, category: electronics._id, images: [img('keyboard')], description: 'Hot-swappable switches, RGB backlight and an aluminium frame.' },
    { name: 'Bluetooth Speaker', brand: 'SoundMax', price: 39.99, countInStock: 3, category: electronics._id, images: [img('speaker')], description: 'Portable waterproof speaker with deep bass.' },
    { name: 'Classic Denim Jacket', brand: 'UrbanWear', price: 59.0, countInStock: 30, category: fashion._id, featured: true, images: [img('jacket')], description: 'Timeless denim jacket in a relaxed fit.' },
    { name: 'Running Sneakers', brand: 'StrideX', price: 79.0, countInStock: 20, category: fashion._id, images: [img('sneakers')], description: 'Lightweight breathable sneakers for daily runs.' },
    { name: 'Leather Backpack', brand: 'UrbanWear', price: 95.0, countInStock: 12, category: fashion._id, images: [img('backpack')], description: 'Genuine leather backpack with a padded laptop sleeve.' },
    { name: 'Ceramic Table Lamp', brand: 'HomeNest', price: 34.5, countInStock: 18, category: home._id, featured: true, images: [img('lamp')], description: 'Minimalist ceramic lamp with a warm linen shade.' },
    { name: 'Cotton Throw Blanket', brand: 'HomeNest', price: 29.0, countInStock: 50, category: home._id, images: [img('blanket')], description: 'Soft woven blanket, perfect for the sofa.' },
    { name: 'Wooden Wall Clock', brand: 'HomeNest', price: 24.0, countInStock: 22, category: home._id, images: [img('clock')], description: 'Silent quartz movement with a solid wood frame.' },
  ]);

  console.log('Data imported');
  console.log('Admin  -> admin@example.com / admin123');
  console.log('User   -> john@example.com / user123');
  await mongoose.disconnect();
  process.exit();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
