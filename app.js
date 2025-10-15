import { authService, cartService, orderService, productService, brandService } from './supabase-client.js';
import { showAuthModal } from './auth.js';
import { isUserAdmin, openAdminDashboard, closeAdminDashboard } from './admin-dashboard.js';

let products = [];
let cart = [];
let currentUser = null;
let currentBrandFilter = 'all';
let currentGenderFilter = 'all';
let selectedProduct = null;
let selectedSize = null;
let selectedColor = null;
let currentSearchTerm = '';
let brands = [];

document.addEventListener('DOMContentLoaded', async function() {
    await initializeApp();
    await loadBrands();
    renderBrandFilters();
    renderProducts();
    setupEventListeners();
    updateCartCount();
    await checkAndShowAdminButton();
});

async function initializeApp() {
    try {
        await loadProducts();

        currentUser = await authService.getCurrentUser();
        if (currentUser) {
            await loadUserCart();
        }

        authService.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN') {
                currentUser = session.user;
                await loadUserCart();
                updateUIForAuthState();
                await checkAndShowAdminButton();
                closeProfile();
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                cart = [];
                updateCartCount();
                updateUIForAuthState();
                hideAdminButton();
            }
        });

        updateUIForAuthState();
    } catch (error) {
        console.error('Error initializing app:', error);
    }
}

async function loadProducts() {
    try {
        const dbProducts = await productService.getAllProducts();
        products = dbProducts.map(product => ({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: parseFloat(product.price),
            originalPrice: product.original_price ? parseFloat(product.original_price) : null,
            discount: product.discount || 0,
            gender: product.gender,
            type: product.type,
            image: product.image_url,
            currentColorIndex: 0
        }));
        renderProducts();
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

async function loadBrands() {
    try {
        const dbBrands = await brandService.getAllBrands();
        brands = dbBrands;
    } catch (error) {
        console.error('Error loading brands:', error);
    }
}

function renderBrandFilters() {
    const filtersContainer = document.querySelector('.filters');
    if (!filtersContainer) return;

    filtersContainer.innerHTML = '<button class="filter-btn active" data-filter="all">Todos</button>';

    brands.forEach(brand => {
        const filterBtn = document.createElement('button');
        filterBtn.className = 'filter-btn';
        filterBtn.setAttribute('data-filter', brand.name);
        filterBtn.textContent = brand.display_name;
        filtersContainer.appendChild(filterBtn);
    });

    const filterButtons = filtersContainer.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            setActiveFilter(this, filterButtons);
            currentBrandFilter = filter;
            filterProducts();
        });
    });
}

async function loadUserCart() {
    try {
        const dbCartItems = await cartService.getCartItems(currentUser.id);
        cart = dbCartItems.map(item => ({
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
        updateCartCount();
    } catch (error) {
        console.error('Error loading cart:', error);
    }
}

function updateUIForAuthState() {
    const guestMessage = document.getElementById('guestMessage');
    const userSections = document.getElementById('userSections');
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');

    if (currentUser) {
        guestMessage.style.display = 'none';
        userSections.style.display = 'block';
        userName.textContent = currentUser.user_metadata?.full_name || 'Usuario';
        userEmail.textContent = currentUser.email;
    } else {
        guestMessage.style.display = 'block';
        userSections.style.display = 'none';
    }
}

window.handleLogin = function() {
    showAuthModal('login');
};

window.handleRegister = function() {
    showAuthModal('register');
};

window.handleLogout = async function() {
    try {
        await authService.signOut();
        showNotification('Cerrando sesión...');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    } catch (error) {
        console.error('Error signing out:', error);
        showNotification('Error al cerrar sesión');
    }
};

function setupEventListeners() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const filter = this.getAttribute('data-filter');
            setActiveNavLink(this, navLinks);

            if (filter === 'ofertas') {
                currentGenderFilter = 'ofertas';
            } else {
                currentGenderFilter = filter;
            }

            currentBrandFilter = 'all';
            const firstFilterBtn = document.querySelector('.filter-btn[data-filter="all"]');
            const allFilterButtons = document.querySelectorAll('.filter-btn');
            if (firstFilterBtn) {
                setActiveFilter(firstFilterBtn, allFilterButtons);
            }

            filterProducts();
        });
    });

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    searchInput.addEventListener('input', function() {
        currentSearchTerm = this.value.toLowerCase();
        filterProducts();
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            filterProducts();
        }
    });

    searchBtn.addEventListener('click', function() {
        filterProducts();
    });

    document.getElementById('cartBtn').addEventListener('click', openCart);
    document.getElementById('closeCart').addEventListener('click', closeCart);
    document.getElementById('profileBtn').addEventListener('click', openProfile);
    document.getElementById('closeProfile').addEventListener('click', closeProfile);
    document.getElementById('closeProductModal').addEventListener('click', closeProductModal);
    document.getElementById('addToCartModal').addEventListener('click', addToCartFromModal);

    const checkoutBtn = document.querySelector('.checkout-btn');
    checkoutBtn.addEventListener('click', handleCheckout);

    const adminDashboardBtn = document.getElementById('adminDashboardBtn');
    if (adminDashboardBtn) {
        adminDashboardBtn.addEventListener('click', openAdminDashboard);
    }

    const closeAdminModalBtn = document.getElementById('closeAdminModal');
    if (closeAdminModalBtn) {
        closeAdminModalBtn.addEventListener('click', closeAdminDashboard);
    }

    document.getElementById('cartModal').addEventListener('click', function(e) {
        if (e.target === this) closeCart();
    });

    document.getElementById('profileModal').addEventListener('click', function(e) {
        if (e.target === this) closeProfile();
    });

    document.getElementById('productModal').addEventListener('click', function(e) {
        if (e.target === this) closeProductModal();
    });

    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
        adminModal.addEventListener('click', function(e) {
            if (e.target === this) closeAdminDashboard();
        });
    }
}

function filterProducts() {
    let filteredProducts = products;

    if (currentSearchTerm) {
        filteredProducts = filteredProducts.filter(product =>
            product.name.toLowerCase().includes(currentSearchTerm) ||
            product.brand.toLowerCase().includes(currentSearchTerm)
        );
    }

    if (currentGenderFilter === 'ofertas') {
        filteredProducts = filteredProducts.filter(product => product.discount);
    } else if (currentGenderFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.gender === currentGenderFilter);
    }

    if (currentBrandFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.brand === currentBrandFilter);
    }

    renderProducts(filteredProducts);
}

function renderProducts(productsToRender = products) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    productsToRender.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

function createProductCard(product) {
    const productDiv = document.createElement('div');
    productDiv.className = 'product-card';
    productDiv.addEventListener('click', () => window.openProductModal(product));

    const priceHTML = product.discount ?
        `<div class="product-price-container">
            <div class="product-price">$${product.price}</div>
            <div class="product-original-price">$${product.originalPrice}</div>
            <div class="product-discount">${product.discount}% OFF</div>
        </div>` :
        `<div class="product-price">$${product.price}</div>`;

    productDiv.innerHTML = `
        <img src="${product.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <div class="product-brand">${product.brand.toUpperCase()}</div>
            <h3 class="product-name">${product.name}</h3>
            ${priceHTML}
            <button class="add-to-cart" onclick="event.stopPropagation(); window.openProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                Ver Detalles
            </button>
        </div>
    `;

    return productDiv;
}

function getSizesForProduct(productType) {
    if (productType === 'zapatillas') {
        return ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
    } else {
        return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }
}

window.openProductModal = function(product) {
    selectedProduct = product;
    selectedSize = null;
    selectedColor = 'default';

    document.getElementById('modalProductImage').src = product.image;
    document.getElementById('modalProductBrand').textContent = product.brand.toUpperCase();
    document.getElementById('modalProductName').textContent = product.name;

    const priceElement = document.getElementById('modalProductPrice');
    if (product.discount) {
        priceElement.innerHTML = `
            <div class="modal-price-container">
                <span class="modal-current-price">$${product.price}</span>
                <span class="modal-original-price">$${product.originalPrice}</span>
                <span class="modal-discount">${product.discount}% OFF</span>
            </div>
        `;
    } else {
        priceElement.textContent = `$${product.price}`;
    }

    const colorSelection = document.getElementById('colorSelection');
    colorSelection.style.display = 'none';

    const sizeOptions = document.getElementById('sizeOptions');
    const sizes = getSizesForProduct(product.type);

    sizeOptions.innerHTML = '';
    sizes.forEach(size => {
        const sizeBtn = document.createElement('button');
        sizeBtn.className = 'size-btn';
        sizeBtn.textContent = size;
        sizeBtn.setAttribute('data-size', size);
        sizeBtn.addEventListener('click', function() {
            selectSize(this);
        });
        sizeOptions.appendChild(sizeBtn);
    });

    updateAddToCartButton();
    document.getElementById('productModal').style.display = 'block';
};

function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    selectedProduct = null;
    selectedSize = null;
    selectedColor = null;
}

function selectSize(button) {
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
    });

    button.classList.add('selected');
    selectedSize = button.getAttribute('data-size');
    updateAddToCartButton();
}

function updateAddToCartButton() {
    const button = document.getElementById('addToCartModal');
    if (selectedSize) {
        button.disabled = false;
        button.textContent = 'Agregar al Carrito';
    } else {
        button.disabled = true;
        button.textContent = 'Selecciona una talla';
    }
}

async function addToCartFromModal() {
    if (!selectedProduct || !selectedSize) return;

    if (!currentUser) {
        showNotification('Por favor inicia sesión para agregar productos al carrito');
        closeProductModal();
        showAuthModal('login');
        return;
    }

    const cartItem = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        brand: selectedProduct.brand,
        price: selectedProduct.price,
        size: selectedSize,
        color: selectedColor,
        image: selectedProduct.image,
        quantity: 1,
        cartId: `${selectedProduct.id}-${selectedSize}-${selectedColor}`
    };

    try {
        const dbCartItem = await cartService.addToCart(
            currentUser.id,
            selectedProduct.id,
            1,
            selectedSize,
            selectedColor
        );

        const existingItem = cart.find(item => item.cartId === cartItem.cartId);

        if (existingItem) {
            existingItem.quantity += 1;
            existingItem.cartItemId = dbCartItem.id;
        } else {
            cartItem.cartItemId = dbCartItem.id;
            cart.push(cartItem);
        }

        updateCartCount();
        closeProductModal();
        showNotification('Producto agregado al carrito');
    } catch (error) {
        console.error('Error adding to cart:', error);
        showNotification('Error al agregar al carrito');
    }
}

window.showNotification = function(message) {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #d4af37;
        color: white;
        padding: 1rem 2rem;
        border-radius: 8px;
        z-index: 9999;
        font-weight: 600;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
    `;
    notification.textContent = message;

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentElement) {
            document.body.removeChild(notification);
        }
    }, 3000);
};

function openCart() {
    renderCartItems();
    document.getElementById('cartModal').style.display = 'block';
}

function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

function renderCartItems() {
    const cartItems = document.getElementById('cartItems');

    if (cart.length === 0) {
        cartItems.innerHTML = '<div class="empty-cart">Tu carrito está vacío</div>';
        document.getElementById('totalPrice').textContent = '$0.00';
        return;
    }

    cartItems.innerHTML = '';
    let total = 0;

    cart.forEach(item => {
        total += item.price * item.quantity;

        const cartItemDiv = document.createElement('div');
        cartItemDiv.className = 'cart-item';
        cartItemDiv.innerHTML = `
            <img src="${item.image}" alt="${item.name}" class="cart-item-image">
            <div class="cart-item-info">
                <div class="cart-item-name">${item.name}</div>
                <div class="cart-item-price">$${item.price}</div>
                <div style="font-size: 0.9rem; color: #666;">
                    Talla: ${item.size} | Color: ${item.color}
                </div>
                <div class="quantity-controls">
                    <button class="quantity-btn" onclick="window.updateQuantity('${item.cartId}', -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="window.updateQuantity('${item.cartId}', 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="window.removeFromCart('${item.cartId}')">Eliminar</button>
        `;

        cartItems.appendChild(cartItemDiv);
    });

    document.getElementById('totalPrice').textContent = `$${total.toFixed(2)}`;
}

window.updateQuantity = async function(cartId, change) {
    const item = cart.find(item => item.cartId === cartId);
    if (item) {
        const newQuantity = item.quantity + change;

        if (newQuantity <= 0) {
            window.removeFromCart(cartId);
        } else {
            try {
                if (currentUser && item.cartItemId) {
                    await cartService.updateCartItemQuantity(item.cartItemId, newQuantity);
                }
                item.quantity = newQuantity;
                renderCartItems();
                updateCartCount();
            } catch (error) {
                console.error('Error updating quantity:', error);
                showNotification('Error al actualizar cantidad');
            }
        }
    }
};

window.removeFromCart = async function(cartId) {
    const item = cart.find(item => item.cartId === cartId);

    try {
        if (currentUser && item && item.cartItemId) {
            await cartService.removeFromCart(item.cartItemId);
        }
        cart = cart.filter(item => item.cartId !== cartId);
        renderCartItems();
        updateCartCount();
    } catch (error) {
        console.error('Error removing from cart:', error);
        showNotification('Error al eliminar del carrito');
    }
};

function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

async function openProfile() {
    try {
        currentUser = await authService.getCurrentUser();
        updateUIForAuthState();
        await updateProfileInfo();
        document.getElementById('profileModal').style.display = 'block';
    } catch (error) {
        console.error('Error opening profile:', error);
        document.getElementById('profileModal').style.display = 'block';
    }
}

window.closeProfile = function() {
    document.getElementById('profileModal').style.display = 'none';
};

async function updateProfileInfo() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    document.getElementById('profileCartCount').textContent = totalItems;
    document.getElementById('profileCartTotal').textContent = `$${totalPrice.toFixed(2)}`;

    if (currentUser) {
        const userName = document.getElementById('userName');
        const userEmail = document.getElementById('userEmail');

        userName.textContent = currentUser.user_metadata?.full_name || 'Usuario';
        userEmail.textContent = currentUser.email;

        try {
            const orders = await orderService.getUserOrders(currentUser.id);
            renderOrderHistory(orders);
        } catch (error) {
            console.error('Error loading orders:', error);
        }
    }
}

function renderOrderHistory(orders) {
    const orderHistory = document.getElementById('orderHistory');

    if (!currentUser || orders.length === 0) {
        orderHistory.innerHTML = '<div class="no-orders"><p>No tienes pedidos anteriores</p></div>';
        return;
    }

    orderHistory.innerHTML = '';

    orders.forEach(order => {
        const orderDiv = document.createElement('div');
        orderDiv.className = 'order-item';
        orderDiv.style.cssText = `
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
        `;

        const itemCount = order.order_items.reduce((sum, item) => sum + item.quantity, 0);
        const orderDate = new Date(order.created_at).toLocaleDateString('es-ES');

        orderDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <strong>Pedido #${order.id}</strong>
                <span style="color: #666;">${orderDate}</span>
            </div>
            <div style="color: #666; font-size: 0.9rem;">
                ${itemCount} artículo(s) - Total: <strong style="color: #d4af37;">$${order.total_amount}</strong>
            </div>
            <div style="margin-top: 0.5rem; color: ${order.status === 'completed' ? '#4CAF50' : '#ff9800'};">
                Estado: ${order.status === 'completed' ? 'Completado' : 'Pendiente'}
            </div>
        `;

        orderHistory.appendChild(orderDiv);
    });
}

async function handleCheckout() {
    if (!currentUser) {
        showNotification('Por favor inicia sesión para realizar el pedido');
        closeCart();
        showAuthModal('login');
        return;
    }

    if (cart.length === 0) {
        showNotification('Tu carrito está vacío');
        return;
    }

    const totalAmount = cart.reduce((total, item) => total + (item.price * item.quantity), 0);

    try {
        const dbCartItems = await cartService.getCartItems(currentUser.id);
        await orderService.createOrder(currentUser.id, dbCartItems, totalAmount);

        cart = [];
        updateCartCount();
        closeCart();
        showNotification('¡Pedido realizado con éxito!');
    } catch (error) {
        console.error('Error creating order:', error);
        showNotification('Error al procesar el pedido');
    }
}

window.openCart = openCart;

function setActiveFilter(activeButton, allButtons) {
    allButtons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
}

function setActiveNavLink(activeLink, allLinks) {
    allLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}

async function checkAndShowAdminButton() {
    const adminButton = document.getElementById('adminDashboardBtn');
    if (!adminButton) return;

    const isAdmin = await isUserAdmin();
    if (isAdmin) {
        adminButton.style.display = 'block';
    } else {
        adminButton.style.display = 'none';
    }
}

function hideAdminButton() {
    const adminButton = document.getElementById('adminDashboardBtn');
    if (adminButton) {
        adminButton.style.display = 'none';
    }
}
