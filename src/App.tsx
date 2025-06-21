import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';

import { AuthProvider } from './hooks/useAuth';
// import { CartProvider } from './context/CartContext'; // Удаляем этот импорт

import Home from './pages/Home';
import Catalog from './pages/Catalog';
import ProductDetail from './pages/ProductDetail';
import About from './pages/About';
import Contacts from './pages/Contacts';
import News from './pages/News';
import NewsDetail from './pages/NewsDetail';
import Admin from './pages/Admin';
import Login from './pages/Login';
import Account from './pages/Account';
import Checkout from './pages/Checkout';
import NotFound from './pages/NotFound';
import TestAuth from './pages/TestAuth';

// Test Pages - can be removed for production
import TestMongoDB from './pages/TestMongoDB';

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <Router>
      <AuthProvider>
        {/* <CartProvider> */}
          <Toaster 
            position="bottom-right"
            reverseOrder={false}
          />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<Catalog />} />
            <Route path="/catalog/:category" element={<Catalog />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/catalog/product/:id" element={<ProductDetail />} />
            <Route path="/about" element={<About />} />
            <Route path="/contacts" element={<Contacts />} />
            <Route path="/news" element={<News />} />
            <Route path="/news/:id" element={<NewsDetail />} />
            <Route path="/admin/*" element={<Admin />} />
            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Account />} />
            <Route path="/checkout" element={<Checkout />} />
            
            {/* Dev Routes */}
            <Route path="/test-mongo" element={<TestMongoDB />} />
            <Route path="/test-auth" element={<TestAuth />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        {/* </CartProvider> */}
      </AuthProvider>
    </Router>
  </QueryClientProvider>
);

export default App;
