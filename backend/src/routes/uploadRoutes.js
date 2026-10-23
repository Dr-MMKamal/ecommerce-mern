const path = require('path');
const fs = require('fs');
const router = require('express').Router();
const multer = require('multer');
const { protect, admin } = require('../middleware/authMiddleware');

const uploadDir = path.join(__dirname, '..', '..', 'uploads');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) =>
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e6)}${path.extname(file.originalname).toLowerCase()}`),
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
  fileFilter: (req, file, cb) => {
    const ok = /jpe?g|png|webp/.test(path.extname(file.originalname).toLowerCase()) &&
      /jpe?g|png|webp/.test(file.mimetype);
    cb(ok ? null : new Error('Only JPG, PNG or WEBP images are allowed'), ok);
  },
});

// @route POST /api/upload  (admin) - field name: "image"
router.post('/', protect, admin, upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }
  res.status(201).json({ url: `/uploads/${req.file.filename}` });
});

module.exports = router;
