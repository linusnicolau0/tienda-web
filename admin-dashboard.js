import { supabase } from './supabase-client.js';

const ADMIN_USER_ID = '80ed04f7-a38b-4716-a066-8ae3ffe054b3';

class AdminDashboard {
  constructor() {
    this.currentUser = null;
    this.analytics = {
      products: null,
      orders: null,
      popular: null
    };
  }

  async initialize() {
    const { data: { user } } = await supabase.auth.getUser();
    this.currentUser = user;

    if (!this.isAdmin()) {
      throw new Error('Unauthorized: Admin access required');
    }

    await this.loadAnalytics();
    this.setupEventListeners();
    this.renderDashboard();
  }

  isAdmin() {
    return this.currentUser && this.currentUser.id === ADMIN_USER_ID;
  }

  async loadAnalytics() {
    try {
      const [productsData, ordersData, popularData, usersData] = await Promise.all([
        this.getProductAnalytics(),
        this.getOrderAnalytics(),
        this.getPopularProducts(),
        this.getUsersCount()
      ]);

      this.analytics.products = productsData;
      this.analytics.orders = ordersData;
      this.analytics.popular = popularData;
      this.analytics.users = usersData;
    } catch (error) {
      console.error('Error loading analytics:', error);
    }
  }

  async getProductAnalytics() {
    const { data: products, error } = await supabase
      .from('products')
      .select('brand');

    if (error) throw error;

    const brandCounts = {};
    products.forEach(product => {
      brandCounts[product.brand] = (brandCounts[product.brand] || 0) + 1;
    });

    return Object.entries(brandCounts).map(([brand, count]) => ({
      brand,
      products_per_brand: count,
      total_products: products.length
    }));
  }

  async getOrderAnalytics() {
    const { data: orders, error } = await supabase
      .from('orders')
      .select('id, total_amount, user_id, created_at');

    if (error) throw error;

    if (!orders || orders.length === 0) {
      return [];
    }

    const uniqueUsers = new Set(orders.map(order => order.user_id));
    const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.total_amount), 0);

    return [{
      total_orders: orders.length,
      total_revenue: totalRevenue,
      unique_customers: uniqueUsers.size,
      average_order_value: orders.length > 0 ? totalRevenue / orders.length : 0
    }];
  }

  async getPopularProducts() {
    const { data: orderItems, error } = await supabase
      .from('order_items')
      .select(`
        product_id,
        quantity,
        price,
        products (
          id,
          name,
          brand
        )
      `);

    if (error) throw error;

    if (!orderItems || orderItems.length === 0) {
      return [];
    }

    const productStats = {};

    orderItems.forEach(item => {
      const productId = item.product_id;
      if (!productStats[productId]) {
        productStats[productId] = {
          id: productId,
          name: item.products?.name || 'Unknown',
          brand: item.products?.brand || 'Unknown',
          times_ordered: 0,
          total_quantity_sold: 0,
          total_revenue: 0
        };
      }

      productStats[productId].times_ordered += 1;
      productStats[productId].total_quantity_sold += item.quantity;
      productStats[productId].total_revenue += parseFloat(item.price) * item.quantity;
    });

    return Object.values(productStats)
      .sort((a, b) => b.total_quantity_sold - a.total_quantity_sold)
      .slice(0, 10);
  }

  async getUsersCount() {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;
    return count || 0;
  }

  async getAllProducts() {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  }

  async getAllBrands() {
    const { data, error } = await supabase
      .from('brands')
      .select('*')
      .order('name');

    if (error) throw error;
    return data || [];
  }

  renderDashboard() {
    const container = document.getElementById('adminContent');
    if (!container) return;

    container.innerHTML = this.getOverviewHTML();
    this.renderAnalytics();
  }

  getOverviewHTML() {
    const totalProducts = this.analytics.products?.reduce((sum, item) => sum + item.products_per_brand, 0) || 0;
    const totalOrders = this.analytics.orders?.[0]?.total_orders || 0;
    const totalRevenue = this.analytics.orders?.[0]?.total_revenue || 0;
    const uniqueCustomers = this.analytics.orders?.[0]?.unique_customers || 0;
    const totalUsers = this.analytics.users || 0;

    return `
      <div class="dashboard-overview">
        <h2>Admin Dashboard</h2>
        <p class="dashboard-subtitle">Gestión completa de la tienda</p>

        <div class="stats-grid">
          <div class="stat-card">
            <div class="stat-icon">📦</div>
            <div class="stat-info">
              <div class="stat-value">${totalProducts}</div>
              <div class="stat-label">Productos Totales</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🛍️</div>
            <div class="stat-info">
              <div class="stat-value">${totalOrders}</div>
              <div class="stat-label">Pedidos Totales</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <div class="stat-value">$${totalRevenue.toFixed(2)}</div>
              <div class="stat-label">Ingresos Totales</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">👥</div>
            <div class="stat-info">
              <div class="stat-value">${totalUsers}</div>
              <div class="stat-label">Usuarios Registrados</div>
            </div>
          </div>

          <div class="stat-card">
            <div class="stat-icon">🎯</div>
            <div class="stat-info">
              <div class="stat-value">${uniqueCustomers}</div>
              <div class="stat-label">Clientes con Compras</div>
            </div>
          </div>
        </div>

        <div class="dashboard-actions">
          <button class="admin-btn primary" id="showProductsBtn">
            📦 Gestionar Productos
          </button>
          <button class="admin-btn" id="showBrandsBtn">
            🏷️ Gestionar Marcas
          </button>
          <button class="admin-btn" id="showAnalyticsBtn">
            📊 Ver Análisis Detallado
          </button>
          <button class="admin-btn" id="addProductBtn">
            ➕ Añadir Producto
          </button>
        </div>

        <div id="dashboardContent"></div>
      </div>
    `;
  }

  renderAnalytics() {
    const content = document.getElementById('dashboardContent');
    if (!content) return;

    const brandData = this.analytics.products || [];
    const popularProducts = this.analytics.popular || [];

    let brandsHTML = '';
    brandData.forEach(brand => {
      brandsHTML += `
        <div class="brand-stat">
          <div class="brand-name">${brand.brand.toUpperCase()}</div>
          <div class="brand-count">${brand.products_per_brand} productos</div>
        </div>
      `;
    });

    let popularHTML = '';
    popularProducts.forEach((product, index) => {
      popularHTML += `
        <div class="popular-product">
          <div class="product-rank">#${index + 1}</div>
          <div class="product-details">
            <div class="product-name">${product.name}</div>
            <div class="product-brand">${product.brand.toUpperCase()}</div>
          </div>
          <div class="product-stats">
            <div>${product.total_quantity_sold || 0} vendidos</div>
            <div class="revenue">$${parseFloat(product.total_revenue || 0).toFixed(2)}</div>
          </div>
        </div>
      `;
    });

    content.innerHTML = `
      <div class="analytics-section">
        <div class="analytics-card">
          <h3>Productos por Marca</h3>
          <div class="brands-list">
            ${brandsHTML || '<p>No hay datos disponibles</p>'}
          </div>
        </div>

        <div class="analytics-card">
          <h3>Productos Más Populares</h3>
          <div class="popular-list">
            ${popularHTML || '<p>No hay datos disponibles</p>'}
          </div>
        </div>
      </div>
    `;
  }

  async renderProductsManagement() {
    const content = document.getElementById('dashboardContent');
    if (!content) return;

    const products = await this.getAllProducts();

    let productsHTML = '';
    products.forEach(product => {
      productsHTML += `
        <div class="admin-product-card">
          <img src="${product.image_url}" alt="${product.name}" class="admin-product-image">
          <div class="admin-product-info">
            <div class="admin-product-brand">${product.brand.toUpperCase()}</div>
            <div class="admin-product-name">${product.name}</div>
            <div class="admin-product-price">$${product.price}</div>
            ${product.discount ? `<div class="admin-product-discount">${product.discount}% OFF</div>` : ''}
          </div>
          <div class="admin-product-actions">
            <button class="admin-btn small" onclick="adminDashboard.editProduct(${product.id})">✏️ Editar</button>
            <button class="admin-btn small danger" onclick="adminDashboard.deleteProduct(${product.id})">🗑️ Eliminar</button>
          </div>
        </div>
      `;
    });

    content.innerHTML = `
      <div class="products-management">
        <div class="section-header">
          <h3>Gestión de Productos</h3>
          <button class="admin-btn primary" id="backToDashboard">⬅️ Volver</button>
        </div>
        <div class="admin-products-grid">
          ${productsHTML || '<p>No hay productos disponibles</p>'}
        </div>
      </div>
    `;

    document.getElementById('backToDashboard')?.addEventListener('click', () => {
      this.renderDashboard();
    });
  }

  async showAddProductForm() {
    const content = document.getElementById('dashboardContent');
    if (!content) return;

    const brands = await this.getAllBrands();
    const brandOptions = brands.map(b => `<option value="${b.name}">${b.display_name}</option>`).join('');

    content.innerHTML = `
      <div class="product-form-container">
        <div class="section-header">
          <h3>Añadir Nuevo Producto</h3>
          <button class="admin-btn" id="cancelAddProduct">❌ Cancelar</button>
        </div>
        <form id="addProductForm" class="product-form">
          <div class="form-group">
            <label>Nombre del Producto</label>
            <input type="text" name="name" required class="form-input">
          </div>

          <div class="form-group">
            <label>Marca</label>
            <select name="brand" required class="form-input">
              <option value="">Seleccionar marca</option>
              ${brandOptions}
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Precio</label>
              <input type="number" name="price" step="0.01" required class="form-input">
            </div>

            <div class="form-group">
              <label>Precio Original (opcional)</label>
              <input type="number" name="original_price" step="0.01" class="form-input">
            </div>

            <div class="form-group">
              <label>Descuento % (opcional)</label>
              <input type="number" name="discount" min="0" max="100" class="form-input">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Género</label>
              <select name="gender" required class="form-input">
                <option value="">Seleccionar género</option>
                <option value="hombre">Hombre</option>
                <option value="mujer">Mujer</option>
              </select>
            </div>

            <div class="form-group">
              <label>Tipo</label>
              <select name="type" required class="form-input">
                <option value="">Seleccionar tipo</option>
                <option value="zapatillas">Zapatillas</option>
                <option value="camiseta">Camiseta</option>
                <option value="sudadera">Sudadera</option>
                <option value="pantalon">Pantalón</option>
                <option value="top">Top</option>
                <option value="leggings">Leggings</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Imagen del Producto</label>
            <input type="file" name="product_image" accept="image/*" class="form-input" id="productImageInput">
            <div id="imagePreview" class="image-preview"></div>
            <small>Sube una imagen desde tu dispositivo (JPG, PNG, WEBP)</small>
          </div>

          <button type="submit" class="admin-btn primary full-width">✅ Guardar Producto</button>
        </form>
      </div>
    `;

    const imageInput = document.getElementById('productImageInput');
    if (imageInput) {
      imageInput.addEventListener('change', (e) => this.handleImagePreview(e));
    }

    document.getElementById('cancelAddProduct')?.addEventListener('click', () => {
      this.renderDashboard();
    });

    document.getElementById('addProductForm')?.addEventListener('submit', (e) => {
      this.handleAddProduct(e);
    });
  }

  handleImagePreview(event) {
    const file = event.target.files[0];
    const preview = document.getElementById('imagePreview');

    if (file && preview) {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.innerHTML = `<img src="${e.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 8px;">`;
      };
      reader.readAsDataURL(file);
    }
  }

  async uploadProductImage(file) {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `products/${fileName}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('product-images')
      .getPublicUrl(filePath);

    return publicUrl;
  }

  async handleAddProduct(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const imageFile = formData.get('product_image');

    try {
      let imageUrl = '';

      if (imageFile && imageFile.size > 0) {
        imageUrl = await this.uploadProductImage(imageFile);
      } else {
        throw new Error('Por favor selecciona una imagen');
      }

      const productData = {
        name: formData.get('name'),
        brand: formData.get('brand'),
        price: parseFloat(formData.get('price')),
        original_price: formData.get('original_price') ? parseFloat(formData.get('original_price')) : null,
        discount: formData.get('discount') ? parseInt(formData.get('discount')) : 0,
        gender: formData.get('gender'),
        type: formData.get('type'),
        image_url: imageUrl
      };

      const { data, error } = await supabase
        .from('products')
        .insert([productData])
        .select();

      if (error) throw error;

      window.showNotification('Producto añadido exitosamente');
      await this.loadAnalytics();
      this.renderDashboard();
    } catch (error) {
      console.error('Error adding product:', error);
      window.showNotification(error.message || 'Error al añadir producto');
    }
  }

  async editProduct(productId) {
    const { data: product, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', productId)
      .single();

    if (error) {
      console.error('Error loading product:', error);
      return;
    }

    const brands = await this.getAllBrands();
    const brandOptions = brands.map(b =>
      `<option value="${b.name}" ${product.brand === b.name ? 'selected' : ''}>${b.display_name}</option>`
    ).join('');

    const content = document.getElementById('dashboardContent');
    if (!content) return;

    content.innerHTML = `
      <div class="product-form-container">
        <div class="section-header">
          <h3>Editar Producto</h3>
          <button class="admin-btn" id="cancelEditProduct">❌ Cancelar</button>
        </div>
        <form id="editProductForm" class="product-form">
          <input type="hidden" name="id" value="${product.id}">
          <input type="hidden" name="current_image_url" value="${product.image_url}">

          <div class="form-group">
            <label>Nombre del Producto</label>
            <input type="text" name="name" value="${product.name}" required class="form-input">
          </div>

          <div class="form-group">
            <label>Marca</label>
            <select name="brand" required class="form-input">
              ${brandOptions}
            </select>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Precio</label>
              <input type="number" name="price" step="0.01" value="${product.price}" required class="form-input">
            </div>

            <div class="form-group">
              <label>Precio Original</label>
              <input type="number" name="original_price" step="0.01" value="${product.original_price || ''}" class="form-input">
            </div>

            <div class="form-group">
              <label>Descuento %</label>
              <input type="number" name="discount" value="${product.discount || 0}" class="form-input">
            </div>
          </div>

          <div class="form-row">
            <div class="form-group">
              <label>Género</label>
              <select name="gender" required class="form-input">
                <option value="hombre" ${product.gender === 'hombre' ? 'selected' : ''}>Hombre</option>
                <option value="mujer" ${product.gender === 'mujer' ? 'selected' : ''}>Mujer</option>
              </select>
            </div>

            <div class="form-group">
              <label>Tipo</label>
              <select name="type" required class="form-input">
                <option value="zapatillas" ${product.type === 'zapatillas' ? 'selected' : ''}>Zapatillas</option>
                <option value="camiseta" ${product.type === 'camiseta' ? 'selected' : ''}>Camiseta</option>
                <option value="sudadera" ${product.type === 'sudadera' ? 'selected' : ''}>Sudadera</option>
                <option value="pantalon" ${product.type === 'pantalon' ? 'selected' : ''}>Pantalón</option>
                <option value="top" ${product.type === 'top' ? 'selected' : ''}>Top</option>
                <option value="leggings" ${product.type === 'leggings' ? 'selected' : ''}>Leggings</option>
              </select>
            </div>
          </div>

          <div class="form-group">
            <label>Imagen Actual</label>
            <div class="current-image">
              <img src="${product.image_url}" alt="${product.name}" style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 8px;">
            </div>
          </div>

          <div class="form-group">
            <label>Cambiar Imagen (opcional)</label>
            <input type="file" name="product_image" accept="image/*" class="form-input" id="editProductImageInput">
            <div id="editImagePreview" class="image-preview"></div>
            <small>Deja vacío para mantener la imagen actual</small>
          </div>

          <button type="submit" class="admin-btn primary full-width">💾 Actualizar Producto</button>
        </form>
      </div>
    `;

    const imageInput = document.getElementById('editProductImageInput');
    if (imageInput) {
      imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        const preview = document.getElementById('editImagePreview');
        if (file && preview) {
          const reader = new FileReader();
          reader.onload = (evt) => {
            preview.innerHTML = `<img src="${evt.target.result}" alt="Preview" style="max-width: 200px; max-height: 200px; object-fit: cover; border-radius: 8px;">`;
          };
          reader.readAsDataURL(file);
        }
      });
    }

    document.getElementById('cancelEditProduct')?.addEventListener('click', () => {
      this.renderProductsManagement();
    });

    document.getElementById('editProductForm')?.addEventListener('submit', (e) => {
      this.handleUpdateProduct(e);
    });
  }

  async handleUpdateProduct(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const imageFile = formData.get('product_image');
    const currentImageUrl = formData.get('current_image_url');

    try {
      let imageUrl = currentImageUrl;

      if (imageFile && imageFile.size > 0) {
        imageUrl = await this.uploadProductImage(imageFile);
      }

      const productData = {
        name: formData.get('name'),
        brand: formData.get('brand'),
        price: parseFloat(formData.get('price')),
        original_price: formData.get('original_price') ? parseFloat(formData.get('original_price')) : null,
        discount: formData.get('discount') ? parseInt(formData.get('discount')) : 0,
        gender: formData.get('gender'),
        type: formData.get('type'),
        image_url: imageUrl
      };

      const productId = formData.get('id');

      const { error } = await supabase
        .from('products')
        .update(productData)
        .eq('id', productId);

      if (error) throw error;

      window.showNotification('Producto actualizado exitosamente');
      await this.loadAnalytics();
      this.renderProductsManagement();
    } catch (error) {
      console.error('Error updating product:', error);
      window.showNotification(error.message || 'Error al actualizar producto');
    }
  }

  async deleteProduct(productId) {
    if (!confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      window.showNotification('Producto eliminado exitosamente');
      await this.loadAnalytics();
      this.renderProductsManagement();
    } catch (error) {
      console.error('Error deleting product:', error);
      window.showNotification('Error al eliminar producto. Puede que esté en uso.');
    }
  }

  async renderBrandsManagement() {
    const content = document.getElementById('dashboardContent');
    if (!content) return;

    const brands = await this.getAllBrands();

    let brandsHTML = '';
    brands.forEach(brand => {
      brandsHTML += `
        <div class="brand-card">
          <div class="brand-info">
            <div class="brand-display-name">${brand.display_name}</div>
            <div class="brand-slug">${brand.name}</div>
          </div>
          <button class="admin-btn small danger" onclick="adminDashboard.deleteBrand(${brand.id}, '${brand.name}')">
            🗑️ Eliminar
          </button>
        </div>
      `;
    });

    content.innerHTML = `
      <div class="brands-management">
        <div class="section-header">
          <h3>Gestión de Marcas</h3>
          <button class="admin-btn primary" id="backToDashboard">⬅️ Volver</button>
        </div>

        <div class="add-brand-form">
          <h4>Añadir Nueva Marca</h4>
          <form id="addBrandForm" class="brand-form">
            <div class="form-row">
              <div class="form-group">
                <label>Nombre de Marca (slug)</label>
                <input type="text" name="name" required class="form-input" placeholder="nike" pattern="[a-z0-9-]+">
                <small>Solo letras minúsculas, números y guiones</small>
              </div>
              <div class="form-group">
                <label>Nombre para Mostrar</label>
                <input type="text" name="display_name" required class="form-input" placeholder="Nike">
              </div>
              <button type="submit" class="admin-btn primary">➕ Añadir</button>
            </div>
          </form>
        </div>

        <div class="brands-list">
          <h4>Marcas Existentes</h4>
          ${brandsHTML || '<p>No hay marcas disponibles</p>'}
        </div>
      </div>
    `;

    document.getElementById('backToDashboard')?.addEventListener('click', () => {
      this.renderDashboard();
    });

    document.getElementById('addBrandForm')?.addEventListener('submit', (e) => {
      this.handleAddBrand(e);
    });
  }

  async handleAddBrand(e) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const brandData = {
      name: formData.get('name').toLowerCase().trim(),
      display_name: formData.get('display_name').trim()
    };

    try {
      const { error } = await supabase
        .from('brands')
        .insert([brandData]);

      if (error) throw error;

      window.showNotification('Marca añadida exitosamente');
      await this.renderBrandsManagement();
    } catch (error) {
      console.error('Error adding brand:', error);
      window.showNotification(error.message || 'Error al añadir marca. Puede que ya exista.');
    }
  }

  async deleteBrand(brandId, brandName) {
    if (!confirm(`¿Estás seguro de que quieres eliminar la marca "${brandName}"?`)) {
      return;
    }

    try {
      const { data: products } = await supabase
        .from('products')
        .select('id')
        .eq('brand', brandName)
        .limit(1);

      if (products && products.length > 0) {
        window.showNotification('No se puede eliminar: hay productos usando esta marca');
        return;
      }

      const { error } = await supabase
        .from('brands')
        .delete()
        .eq('id', brandId);

      if (error) throw error;

      window.showNotification('Marca eliminada exitosamente');
      await this.renderBrandsManagement();
    } catch (error) {
      console.error('Error deleting brand:', error);
      window.showNotification('Error al eliminar marca');
    }
  }

  setupEventListeners() {
    const observer = new MutationObserver(() => {
      const showProductsBtn = document.getElementById('showProductsBtn');
      const showBrandsBtn = document.getElementById('showBrandsBtn');
      const showAnalyticsBtn = document.getElementById('showAnalyticsBtn');
      const addProductBtn = document.getElementById('addProductBtn');

      if (showProductsBtn) {
        showProductsBtn.onclick = () => this.renderProductsManagement();
      }

      if (showBrandsBtn) {
        showBrandsBtn.onclick = () => this.renderBrandsManagement();
      }

      if (showAnalyticsBtn) {
        showAnalyticsBtn.onclick = () => this.renderDashboard();
      }

      if (addProductBtn) {
        addProductBtn.onclick = () => this.showAddProductForm();
      }
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }
}

export const adminDashboard = new AdminDashboard();
window.adminDashboard = adminDashboard;

export async function isUserAdmin() {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    return user && user.id === ADMIN_USER_ID;
  } catch {
    return false;
  }
}

export function openAdminDashboard() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.style.display = 'block';
    adminDashboard.initialize().catch(error => {
      console.error('Error initializing dashboard:', error);
      window.showNotification('Error al cargar el dashboard');
      closeAdminDashboard();
    });
  }
}

export function closeAdminDashboard() {
  const modal = document.getElementById('adminModal');
  if (modal) {
    modal.style.display = 'none';
  }
}
