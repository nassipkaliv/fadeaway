import { CommonProvider } from './contexts/common/commonContext';
import { CartProvider } from './contexts/cart/cartContext';
import { FiltersProvider } from './contexts/filters/filtersContext';
import { AuthProvider } from './contexts/auth/authContext';
import { ProductsProvider } from './contexts/products/productsContext';
import { ToastProvider } from './contexts/toast/toastContext';
import Header from './components/common/Header';
import RouterRoutes from './routes/RouterRoutes';
import Footer from './components/common/Footer';
import BackTop from './components/common/BackTop';
import React from 'react';


const App = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <CommonProvider>
          <ProductsProvider>
            <FiltersProvider>
              <CartProvider>
                <Header />
                <RouterRoutes />
                <Footer />
                <BackTop />
              </CartProvider>
            </FiltersProvider>
          </ProductsProvider>
        </CommonProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
