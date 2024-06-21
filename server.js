// backend/server.js
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost/product_db')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Error connecting to MongoDB:', err));

const productSchema = new mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  sold: Boolean,
  dateOfSale: Date
});

const Product = mongoose.model('Product', productSchema);

app.post('/api/initialize-db', async (req, res) => {
  try {
    const products = req.body; // Assuming array of products is sent in the request body

    console.log(`Received ${products.length} products from front end`);

    console.log('Clearing existing data...');
    await Product.deleteMany({});

    console.log('Inserting new data...');
    for (let product of products) {
      const newProduct = new Product(product);
      await newProduct.save();
    }

    const count = await Product.countDocuments();
    console.log(`Inserted ${count} products into the database`);

    res.json({ message: `Database initialized successfully with ${count} products` });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'An error occurred while initializing the database', details: error.message });
  }
});
app.get('/api/products', async (req, res) => {
  const { page = 1, limit = 10, search = '' } = req.query;
  const skip = (page - 1) * limit;

  try {
    const query = search
      ? {
          $or: [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } },
            { price: isNaN(parseFloat(search)) ? undefined : parseFloat(search) }
          ]
        }
      : {};

    const products = await Product.find(query)
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Product.countDocuments(query);

    console.log(`Fetched ${products.length} products out of ${total}`);
    res.json({
      products,
      totalPages: Math.ceil(total / limit),
      currentPage: parseInt(page),
      totalProducts: total
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({ error: 'An error occurred while fetching products', details: error.message });
  }
});


app.get('/api/all-products', async (req, res) => {
  try {
    
    const products = await Product.find();
    
   
    res.json(products);
  } catch (error) {
    console.error('Error fetching all products:', error);
    res.status(500).json({ error: 'An error occurred while fetching all products', details: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});