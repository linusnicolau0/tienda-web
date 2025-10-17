import { useState, useEffect } from 'react';
import { productService, brandService, adminService, supabase } from '../services/supabase';

export const AdminDashboard = ({ isOpen, onClose }) => {
  const [view, setView] = useState('overview');
  const [analytics, setAnalytics] = useState({
    products: [],
    orders: [],
    popular: [],
    users: 0
  });
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [productForm, setProductForm] = useState({
    name: '',
    brand: '',
    price: '',
    original_price: '',
    discount: '',
    gender: 'hombre',
    type: 'zapatillas',
    image_url: ''
  });
  const [brandForm, setBrandForm] = useState({
    name: '',
    display_name: ''
  });

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [analyticsData, productsData, brandsData] = await Promise.all([
        loadAnalytics(),
        productService.getAllProducts(),
        brandService.getAllBrands()
      ]);
      setAnalytics(analyticsData);
      setProducts(productsData);
      setBrands(brandsData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadAnalytics = async () => {
    const { data: products } = await supabase.from('products').select('brand');
    const { data: orders } = await supabase.from('orders').select('id, total_amount, user_id');
    const { count: usersCount } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    const { data: orderItems } = await supabase.from('order_items').select('product_id, quantity, price, products(id, name, brand)');

    const brandCounts = {};
    products?.forEach(p => {
      brandCounts[p.brand] = (brandCounts[p.brand] || 0) + 1;
    });

    const productAnalytics = Object.entries(brandCounts).map(([brand, count]) => ({
      brand,
      products_per_brand: count,
      total_products: products?.length || 0
    }));

    const totalRevenue = orders?.reduce((sum, o) => sum + parseFloat(o.total_amount), 0) || 0;
    const uniqueUsers = new Set(orders?.map(o => o.user_id) || []);

    const orderAnalytics = [{
      total_orders: orders?.length || 0,
      total_revenue: totalRevenue,
      unique_customers: uniqueUsers.size,
      average_order_value: orders?.length ? totalRevenue / orders.length : 0
    }];

    const productStats = {};
    orderItems?.forEach(item => {
      const id = item.product_id;
      if (!productStats[id]) {
        productStats[id] = {
          id,
          name: item.products?.name || 'Unknown',
          brand: item.products?.brand || 'Unknown',
          total_quantity_sold: 0,
          total_revenue: 0
        };
      }
      productStats[id].total_quantity_sold += item.quantity;
      productStats[id].total_revenue += parseFloat(item.price) * item.quantity;
    });

    const popular = Object.values(productStats)
      .sort((a, b) => b.total_quantity_sold - a.total_quantity_sold)
      .slice(0, 10);

    return {
      products: productAnalytics,
      orders: orderAnalytics,
      popular,
      users: usersCount || 0
    };
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      await productService.createProduct(productForm);
      await loadData();
      setProductForm({
        name: '',
        brand: '',
        price: '',
        original_price: '',
        discount: '',
        gender: 'hombre',
        type: 'zapatillas',
        image_url: ''
      });
      setView('products');
    } catch (error) {
      console.error('Error creating product:', error);
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!confirm('¿Estás seguro de eliminar este producto?')) return;
    try {
      await productService.deleteProduct(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const handleCreateBrand = async (e) => {
    e.preventDefault();
    try {
      await brandService.createBrand(brandForm);
      await loadData();
      setBrandForm({ name: '', display_name: '' });
    } catch (error) {
      console.error('Error creating brand:', error);
    }
  };

  const handleDeleteBrand = async (id) => {
    if (!confirm('¿Estás seguro de eliminar esta marca?')) return;
    try {
      await brandService.deleteBrand(id);
      await loadData();
    } catch (error) {
      console.error('Error deleting brand:', error);
    }
  };

  if (!isOpen) return null;

  const totalProducts = analytics.products.reduce((sum, item) => sum + item.products_per_brand, 0);
  const totalOrders = analytics.orders[0]?.total_orders || 0;
  const totalRevenue = analytics.orders[0]?.total_revenue || 0;
  const uniqueCustomers = analytics.orders[0]?.unique_customers || 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Admin Dashboard</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl leading-none">×</button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loading ? (
            <div className="text-center py-12">Cargando...</div>
          ) : (
            <>
              {view === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white p-6 rounded-lg">
                      <div className="text-3xl mb-2">📦</div>
                      <div className="text-3xl font-bold">{totalProducts}</div>
                      <div className="text-sm opacity-90">Productos Totales</div>
                    </div>
                    <div className="bg-gradient-to-br from-green-500 to-green-600 text-white p-6 rounded-lg">
                      <div className="text-3xl mb-2">🛍️</div>
                      <div className="text-3xl font-bold">{totalOrders}</div>
                      <div className="text-sm opacity-90">Pedidos Totales</div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white p-6 rounded-lg">
                      <div className="text-3xl mb-2">💰</div>
                      <div className="text-3xl font-bold">${totalRevenue.toFixed(2)}</div>
                      <div className="text-sm opacity-90">Ingresos Totales</div>
                    </div>
                    <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white p-6 rounded-lg">
                      <div className="text-3xl mb-2">👥</div>
                      <div className="text-3xl font-bold">{analytics.users}</div>
                      <div className="text-sm opacity-90">Usuarios Registrados</div>
                    </div>
                    <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white p-6 rounded-lg">
                      <div className="text-3xl mb-2">🎯</div>
                      <div className="text-3xl font-bold">{uniqueCustomers}</div>
                      <div className="text-sm opacity-90">Clientes con Compras</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                    <button onClick={() => setView('products')} className="bg-primary text-white py-3 px-4 rounded-lg font-semibold hover:bg-opacity-90">
                      📦 Gestionar Productos
                    </button>
                    <button onClick={() => setView('brands')} className="bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800">
                      🏷️ Gestionar Marcas
                    </button>
                    <button onClick={() => setView('analytics')} className="bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-gray-800">
                      📊 Ver Análisis
                    </button>
                    <button onClick={() => setView('addProduct')} className="bg-green-600 text-white py-3 px-4 rounded-lg font-semibold hover:bg-green-700">
                      ➕ Añadir Producto
                    </button>
                  </div>
                </div>
              )}

              {view === 'products' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Gestionar Productos ({products.length})</h3>
                    <button onClick={() => setView('overview')} className="text-primary hover:underline">← Volver</button>
                  </div>
                  <div className="space-y-3">
                    {products.map(product => (
                      <div key={product.id} className="flex items-center gap-4 border p-4 rounded-lg">
                        <img src={product.image_url} alt={product.name} className="w-16 h-16 object-cover rounded" />
                        <div className="flex-1">
                          <div className="font-semibold">{product.name}</div>
                          <div className="text-sm text-gray-600">{product.brand} - ${product.price}</div>
                        </div>
                        <button onClick={() => handleDeleteProduct(product.id)} className="text-red-500 hover:text-red-700 px-4 py-2 border border-red-500 rounded">
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {view === 'brands' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Gestionar Marcas ({brands.length})</h3>
                    <button onClick={() => setView('overview')} className="text-primary hover:underline">← Volver</button>
                  </div>
                  <form onSubmit={handleCreateBrand} className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h4 className="font-semibold mb-3">Añadir Nueva Marca</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <input
                        type="text"
                        placeholder="Nombre (ej: nike)"
                        value={brandForm.name}
                        onChange={(e) => setBrandForm({ ...brandForm, name: e.target.value })}
                        className="px-3 py-2 border rounded"
                        required
                      />
                      <input
                        type="text"
                        placeholder="Nombre visible (ej: Nike)"
                        value={brandForm.display_name}
                        onChange={(e) => setBrandForm({ ...brandForm, display_name: e.target.value })}
                        className="px-3 py-2 border rounded"
                        required
                      />
                      <button type="submit" className="bg-primary text-white py-2 rounded font-semibold hover:bg-opacity-90">
                        Añadir Marca
                      </button>
                    </div>
                  </form>
                  <div className="space-y-2">
                    {brands.map(brand => (
                      <div key={brand.id} className="flex justify-between items-center border p-3 rounded-lg">
                        <div>
                          <span className="font-semibold">{brand.display_name}</span>
                          <span className="text-gray-500 ml-2">({brand.name})</span>
                        </div>
                        <button onClick={() => handleDeleteBrand(brand.id)} className="text-red-500 hover:text-red-700 px-3 py-1 border border-red-500 rounded">
                          Eliminar
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {view === 'analytics' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Análisis Detallado</h3>
                    <button onClick={() => setView('overview')} className="text-primary hover:underline">← Volver</button>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Productos por Marca</h4>
                      <div className="space-y-2">
                        {analytics.products.map(brand => (
                          <div key={brand.brand} className="flex justify-between items-center border-b pb-2">
                            <span className="font-medium">{brand.brand.toUpperCase()}</span>
                            <span className="text-gray-600">{brand.products_per_brand} productos</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="bg-white border rounded-lg p-4">
                      <h4 className="font-semibold mb-3">Productos Más Populares</h4>
                      <div className="space-y-2">
                        {analytics.popular.map((product, index) => (
                          <div key={product.id} className="flex items-center gap-3 border-b pb-2">
                            <span className="font-bold text-primary">#{index + 1}</span>
                            <div className="flex-1">
                              <div className="font-medium">{product.name}</div>
                              <div className="text-sm text-gray-600">{product.brand}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm">{product.total_quantity_sold} vendidos</div>
                              <div className="text-primary font-semibold">${product.total_revenue.toFixed(2)}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {view === 'addProduct' && (
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold">Añadir Nuevo Producto</h3>
                    <button onClick={() => setView('overview')} className="text-primary hover:underline">← Volver</button>
                  </div>
                  <form onSubmit={handleCreateProduct} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <input
                        type="text"
                        placeholder="Nombre del producto"
                        value={productForm.name}
                        onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                        required
                      />
                      <select
                        value={productForm.brand}
                        onChange={(e) => setProductForm({ ...productForm, brand: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                        required
                      >
                        <option value="">Selecciona marca</option>
                        {brands.map(brand => (
                          <option key={brand.id} value={brand.name}>{brand.display_name}</option>
                        ))}
                      </select>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Precio"
                        value={productForm.price}
                        onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                        required
                      />
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Precio original (opcional)"
                        value={productForm.original_price}
                        onChange={(e) => setProductForm({ ...productForm, original_price: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                      />
                      <input
                        type="number"
                        placeholder="Descuento % (opcional)"
                        value={productForm.discount}
                        onChange={(e) => setProductForm({ ...productForm, discount: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                      />
                      <select
                        value={productForm.gender}
                        onChange={(e) => setProductForm({ ...productForm, gender: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                        required
                      >
                        <option value="hombre">Hombre</option>
                        <option value="mujer">Mujer</option>
                      </select>
                      <select
                        value={productForm.type}
                        onChange={(e) => setProductForm({ ...productForm, type: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                        required
                      >
                        <option value="zapatillas">Zapatillas</option>
                        <option value="ropa">Ropa</option>
                      </select>
                      <input
                        type="url"
                        placeholder="URL de la imagen"
                        value={productForm.image_url}
                        onChange={(e) => setProductForm({ ...productForm, image_url: e.target.value })}
                        className="px-4 py-2 border rounded-lg"
                        required
                      />
                    </div>
                    <button type="submit" className="w-full bg-primary text-white py-3 rounded-lg font-semibold hover:bg-opacity-90">
                      Crear Producto
                    </button>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};
