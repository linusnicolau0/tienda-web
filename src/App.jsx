import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { productService, brandService, cartService, adminService, authService as supabaseAuth } from './services/supabase';
import { useNotification } from './hooks/useNotification';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { BrandFilters } from './components/BrandFilters';
import { ProductGrid } from './components/ProductGrid';
import { ProductModal } from './components/ProductModal';
import { CartModal } from './components/CartModal';
import { ProfileModal } from './components/ProfileModal';
import { AdminDashboard } from './components/AdminDashboard';
import { AuthModal } from './components/AuthModal';
import { Notification } from './components/Notification';
import { Footer } from './components/Footer';

function AppContent() {
  const { user } = useAuth();
  const { notification, showNotification } = useNotification();
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [cart, setCart] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [genderFilter, setGenderFilter] = useState('all');
  const [brandFilter, setBrandFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    loadProducts();
    loadBrands();
    handleCheckoutRedirect();
  }, []);

  useEffect(() => {
    if (user) {
      loadCart();
      checkAdmin();
    } else {
      setCart([]);
      setIsAdmin(false);
    }
  }, [user]);

  useEffect(() => {
    filterProducts();
  }, [products, genderFilter, brandFilter, searchTerm]);

  const loadProducts = async () => {
    try {
      const data = await productService.getAllProducts();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadBrands = async () => {
    try {
      const data = await brandService.getAllBrands();
      setBrands(data);
    } catch (error) {
      console.error('Error loading brands:', error);
    }
  };

  const loadCart = async () => {
    if (!user) return;
    try {
      const dbCartItems = await cartService.getCartItems(user.id);
      const cartItems = dbCartItems.map(item => ({
        id: item.product_id,
        cartItemId: item.id,
        name: item.products.name,
        brand: item.products.brand,
        price: item.products.price,
        size: item.size,
        color: item.color,
        image: item.products.image_url,
        quantity: item.quantity,
        cartId: `${item.product_id}-${item.size}-${item.color}`
      }));
      setCart(cartItems);
    } catch (error) {
      console.error('Error loading cart:', error);
    }
  };

  const checkAdmin = async () => {
    if (!user) return;
    try {
      const admin = await adminService.isUserAdmin(user.id);
      setIsAdmin(admin);
    } catch (error) {
      console.error('Error checking admin:', error);
    }
  };

  const filterProducts = () => {
    let filtered = products;

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.brand.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (genderFilter === 'ofertas') {
      filtered = filtered.filter(p => p.discount);
    } else if (genderFilter !== 'all') {
      filtered = filtered.filter(p => p.gender === genderFilter);
    }

    if (brandFilter !== 'all') {
      filtered = filtered.filter(p => p.brand === brandFilter);
    }

    setFilteredProducts(filtered);
  };

  const handleAddToCart = async (product, size, color) => {
    if (!user) {
      showNotification('Por favor inicia sesión para agregar productos al carrito');
      setIsAuthOpen(true);
      setAuthMode('login');
      return;
    }

    try {
      const dbCartItem = await cartService.addToCart(user.id, product.id, 1, size, color);
      const cartId = `${product.id}-${size}-${color}`;
      const existingItem = cart.find(item => item.cartId === cartId);

      if (existingItem) {
        setCart(cart.map(item =>
          item.cartId === cartId
            ? { ...item, quantity: item.quantity + 1, cartItemId: dbCartItem.id }
            : item
        ));
      } else {
        const newItem = {
          id: product.id,
          cartItemId: dbCartItem.id,
          name: product.name,
          brand: product.brand,
          price: product.price,
          size,
          color,
          image: product.image_url,
          quantity: 1,
          cartId
        };
        setCart([...cart, newItem]);
      }

      showNotification('Producto agregado al carrito');
    } catch (error) {
      console.error('Error adding to cart:', error);
      showNotification('Error al agregar al carrito');
    }
  };

  const handleUpdateQuantity = async (cartId, change) => {
    const item = cart.find(i => i.cartId === cartId);
    if (!item) return;

    const newQuantity = item.quantity + change;

    if (newQuantity <= 0) {
      handleRemoveFromCart(cartId);
    } else {
      try {
        if (user && item.cartItemId) {
          await cartService.updateCartItemQuantity(item.cartItemId, newQuantity);
        }
        setCart(cart.map(i =>
          i.cartId === cartId ? { ...i, quantity: newQuantity } : i
        ));
      } catch (error) {
        console.error('Error updating quantity:', error);
        showNotification('Error al actualizar cantidad');
      }
    }
  };

  const handleRemoveFromCart = async (cartId) => {
    const item = cart.find(i => i.cartId === cartId);

    try {
      if (user && item?.cartItemId) {
        await cartService.removeFromCart(item.cartItemId);
      }
      setCart(cart.filter(i => i.cartId !== cartId));
    } catch (error) {
      console.error('Error removing from cart:', error);
      showNotification('Error al eliminar del carrito');
    }
  };

  const handleCheckout = async () => {
    if (!user) {
      showNotification('Por favor inicia sesión para realizar el pedido');
      setIsCartOpen(false);
      setIsAuthOpen(true);
      setAuthMode('login');
      return;
    }

    if (cart.length === 0) {
      showNotification('Tu carrito está vacío');
      return;
    }

    try {
      showNotification('Redirigiendo al checkout...');

      const dbCartItems = await cartService.getCartItems(user.id);
      const { data: { session } } = await supabaseAuth.supabase.auth.getSession();

      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-checkout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cartItems: dbCartItems,
          successUrl: `${window.location.origin}?checkout=success`,
          cancelUrl: `${window.location.origin}?checkout=cancel`
        })
      });

      const data = await response.json();

      if (data.error) {
        throw new Error(data.error);
      }

      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error) {
      console.error('Error creating checkout session:', error);
      showNotification('Error al procesar el pedido');
    }
  };

  const handleCheckoutRedirect = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const checkoutStatus = urlParams.get('checkout');

    if (checkoutStatus === 'success') {
      showNotification('¡Pago exitoso! Tu pedido ha sido procesado.');
      setCart([]);
      window.history.replaceState({}, '', window.location.pathname);
    } else if (checkoutStatus === 'cancel') {
      showNotification('Pago cancelado. Tu carrito sigue disponible.');
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        onFilterChange={setGenderFilter}
        onSearchChange={setSearchTerm}
        cartCount={cartCount}
        onCartOpen={() => setIsCartOpen(true)}
        onProfileOpen={() => setIsProfileOpen(true)}
        onAdminOpen={() => setIsAdminOpen(true)}
        isAdmin={isAdmin}
      />

      <Hero />

      <BrandFilters
        brands={brands}
        activeBrand={brandFilter}
        onBrandChange={setBrandFilter}
      />

      <ProductGrid
        products={filteredProducts}
        onProductClick={setSelectedProduct}
      />

      <Footer />

      <ProductModal
        product={selectedProduct}
        isOpen={!!selectedProduct}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={handleAddToCart}
      />

      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cart}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveFromCart}
        onCheckout={handleCheckout}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        onLoginClick={() => {
          setIsProfileOpen(false);
          setIsAuthOpen(true);
          setAuthMode('login');
        }}
        onRegisterClick={() => {
          setIsProfileOpen(false);
          setIsAuthOpen(true);
          setAuthMode('register');
        }}
        cartCount={cartCount}
        cartTotal={cartTotal}
      />

      <AdminDashboard
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        initialMode={authMode}
        onSuccess={() => {
          showNotification('¡Sesión iniciada con éxito!');
          loadCart();
        }}
      />

      <Notification message={notification} />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
