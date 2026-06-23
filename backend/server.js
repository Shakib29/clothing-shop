require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/database');
const errorHandler = require('./src/middleware/errorHandler');

const app = express();
console.log("Mongo URI exists:", !!process.env.MONGODB_URI);
console.log("Mongo URI prefix:", process.env.MONGODB_URI?.slice(0, 15));
(async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
})();

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.use('/api/auth', require('./src/routes/auth'));
app.use('/api/categories', require('./src/routes/categories'));
app.use('/api/products', require('./src/routes/products'));
app.use('/api/wishlist', require('./src/routes/wishlist'));
app.use('/api/cart', require('./src/routes/cart'));
app.use('/api/orders', require('./src/routes/orders'));
app.use('/api/admin', require('./src/routes/admin'));

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'API running' });
});

app.get('/api/health', (req, res) => {
  res.json({ success: true, message: 'Server is running' });
});

app.use(errorHandler);

const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });
