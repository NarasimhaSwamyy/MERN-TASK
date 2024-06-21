
import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [products, setProducts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchProducts();
  }, [page, search]);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/products?page=${page}&search=${search}`);
      setProducts(response.data.products);
      setTotalPages(response.data.totalPages);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const initializeDatabase = async () => {
    try {
      await axios.get('http://localhost:5000/api/initialize-db');
      alert('Database initialized successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error initializing database:', error);
    }
  };

  return (
    <div className="App">
      <h1>Product List</h1>
      <button onClick={initializeDatabase}>Initialize Database</button>
      <input
        type="text"
        placeholder="Search products"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <ul>
        {products.map((product) => (
          <li key={product.id}>{product.title} - ${product.price}</li>
        ))}
      </ul>
      <div>
        <button onClick={() => setPage(page - 1)} disabled={page === 1}>
          Previous
        </button>
        <span>Page {page} of {totalPages}</span>
        <button onClick={() => setPage(page + 1)} disabled={page === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
}

export default App;