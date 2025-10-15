// Productos de la tienda
const products = [
    {
        id: 1,
        name: "Zapatillas Air Max Premium",
        brand: "nike",
        price: 120,
        originalPrice: 150,
        discount: 20,
        gender: "hombre",
        type: "zapatillas",
        colors: [
            {
                name: "Negro/Blanco",
                image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg"
            },
            {
                name: "Blanco/Dorado",
                image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg"
            }
        ],
        currentColorIndex: 0
    },
    {
        id: 2,
        name: "Camiseta Deportiva Pro",
        brand: "nike",
        price: 45,
        gender: "hombre",
        type: "camiseta",
        colors: [
            {
                name: "Negro",
                image: "https://images.pexels.com/photos/8532616/pexels-photo-8532616.jpeg"
            },
            {
                name: "Blanco",
                image: "https://images.pexels.com/photos/8532617/pexels-photo-8532617.jpeg"
            }
        ],
        currentColorIndex: 0
    },
    {
        id: 3,
        name: "Zapatillas Ultraboost 22",
        brand: "adidas",
        price: 180,
        originalPrice: 220,
        discount: 18,
        gender: "mujer",
        type: "zapatillas",
        colors: [
            {
                name: "Rosa/Blanco",
                image: "https://images.pexels.com/photos/1598505/pexels-photo-1598505.jpeg"
            },
            {
                name: "Blanco/Azul",
                image: "https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg"
            }
        ],
        currentColorIndex: 0
    },
    {
        id: 4,
        name: "Sudadera con Capucha",
        brand: "adidas",
        price: 75,
        originalPrice: 95,
        discount: 21,
        gender: "hombre",
        type: "sudadera",
        colors: [
            {
                name: "Negro",
                image: "https://images.pexels.com/photos/8532617/pexels-photo-8532617.jpeg"
            },
            {
                name: "Gris",
                image: "https://images.pexels.com/photos/8532618/pexels-photo-8532618.jpeg"
            }
        ],
        currentColorIndex: 0
    },
    {
        id: 5,
        name: "Zapatillas RS-X",
        brand: "puma",
        price: 97,
        originalPrice: 120,
        discount: 19,
        gender: "mujer",
        type: "zapatillas",
        colors: [
            {
                name: "Multicolor",
                image: "https://images.pexels.com/photos/2529157/pexels-photo-2529157.jpeg"
            },
            {
                name: "Blanco/Rosa",
                image: "https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg"
            }
        ],
        currentColorIndex: 0
    },
    {
        id: 6,
        name: "Pantalones de Entrenamiento",
        brand: "puma",
        price: 55,
        gender: "hombre",
        type: "pantalon",
        colors: [
            {
                name: "Negro",
                image: "https://images.pexels.com/photos/8532618/pexels-photo-8532618.jpeg"
            },
            {
                name: "Azul Marino",
                image: "https://images.pexels.com/photos/8532619/pexels-photo-8532619.jpeg"
            }
        ],
        currentColorIndex: 0
    },
    {
        id: 7,
        name: "Zapatillas Charged Assert 9",
        brand: "under-armour",
        price: 70,
        originalPrice: 85,
        discount: 18,
        gender: "hombre",
        type: "zapatillas",
        colors: [
            {
                name: "Negro/Rojo",
                image: "https://images.pexels.com/photos/1598508/pexels-photo-1598508.jpeg"
            }
        ],
        currentColorIndex: 0
    },
    {
        id: 8,
        name: "Top Deportivo HeatGear",
        brand: "under-armour",
        price: 35,
        gender: "mujer",
        type: "top",
        colors: [
            {
                name: "Negro",
                image: "https://images.pexels.com/photos/8532619/pexels-photo-8532619.jpeg"
            },
            {
                name: "Blanco",
                image: "https://images.pexels.com/photos/8532620/pexels-photo-8532620.jpeg"
            }
        ],
        currentColorIndex: 0
    },
    {
        id: 9,
        name: "Zapatillas Classic Leather",
        brand: "reebok",
        price: 60,
        originalPrice: 80,
        discount: 25,
        gender: "hombre",
        type: "zapatillas",
        colors: [
            {
                name: "Blanco",
                image: "https://images.pexels.com/photos/2529151/pexels-photo-2529151.jpeg"
            },
            {
                name: "Negro",
                image: "https://images.pexels.com/photos/2529148/pexels-photo-2529148.jpeg"
            }
        ],
        currentColorIndex: 0
    },
    {
        id: 10,
        name: "Leggings Training Essentials",
        brand: "reebok",
        price: 40,
        originalPrice: 50,
        discount: 20,
        gender: "mujer",
        type: "leggings",
        colors: [
            {
                name: "Negro",
                image: "https://images.pexels.com/photos/8532620/pexels-photo-8532620.jpeg"
            }
        ],
        currentColorIndex: 0
    },
    {
        id: 11,
        name: "Zapatillas Future Rider",
        brand: "puma",
        price: 80,
        originalPrice: 100,
        discount: 20,
        gender: "mujer",
        type: "zapatillas",
        colors: [
            {
                name: "Blanco/Azul",
                image: "https://images.pexels.com/photos/1598506/pexels-photo-1598506.jpeg"
            }
        ],
        currentColorIndex: 0
    },
    {
        id: 12,
        name: "Zapatillas Blazer Mid '77",
        brand: "nike",
        price: 85,
        originalPrice: 100,
        discount: 15,
        gender: "mujer",
        type: "zapatillas",
        colors: [
            {
                name: "Blanco/Dorado",
                image: "https://images.pexels.com/photos/2529152/pexels-photo-2529152.jpeg"
            }
        ],
        currentColorIndex: 0
    }
];

// Variables globales
let cart = [];
let currentBrandFilter = 'all';
let currentGenderFilter = 'all';
let selectedProduct = null;
let selectedSize = null;
let selectedColor = null;
let currentSearchTerm = '';

// Inicializar la aplicación
document.addEventListener('DOMContentLoaded', function() {
    renderProducts();
    setupEventListeners();
    updateCartCount();
});

// Configurar event listeners
function setupEventListeners() {
    // Filtros de marca
    const filterButtons = document.querySelectorAll('.filter-btn');
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filter = this.getAttribute('data-filter');
            setActiveFilter(this, filterButtons);
            currentBrandFilter = filter;
            filterProducts();
        });
    });

    // Filtros de género en navegación
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
            
            // Reset brand filter when changing gender
            currentBrandFilter = 'all';
            const firstFilterBtn = document.querySelector('.filter-btn[data-filter="all"]');
            if (firstFilterBtn) {
                setActiveFilter(firstFilterBtn, filterButtons);
            }
            
            filterProducts();
        });
    });

    // Búsqueda funcional
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

    // Carrito
    document.getElementById('cartBtn').addEventListener('click', openCart);
    document.getElementById('closeCart').addEventListener('click', closeCart);

    // Perfil
    document.getElementById('profileBtn').addEventListener('click', openProfile);
    document.getElementById('closeProfile').addEventListener('click', closeProfile);

    // Modal de producto
    document.getElementById('closeProductModal').addEventListener('click', closeProductModal);

    // Agregar al carrito desde modal
    document.getElementById('addToCartModal').addEventListener('click', addToCartFromModal);

    // Cerrar modales al hacer clic fuera
    document.getElementById('cartModal').addEventListener('click', function(e) {
        if (e.target === this) closeCart();
    });

    document.getElementById('profileModal').addEventListener('click', function(e) {
        if (e.target === this) closeProfile();
    });

    document.getElementById('productModal').addEventListener('click', function(e) {
        if (e.target === this) closeProductModal();
    });
}

// Filtrar productos
function filterProducts() {
    let filteredProducts = products;

    // Filtrar por búsqueda
    if (currentSearchTerm) {
        filteredProducts = filteredProducts.filter(product => 
            product.name.toLowerCase().includes(currentSearchTerm) ||
            product.brand.toLowerCase().includes(currentSearchTerm)
        );
    }

    // Filtrar por género/ofertas
    if (currentGenderFilter === 'ofertas') {
        filteredProducts = filteredProducts.filter(product => product.discount);
    } else if (currentGenderFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.gender === currentGenderFilter);
    }

    // Filtrar por marca
    if (currentBrandFilter !== 'all') {
        filteredProducts = filteredProducts.filter(product => product.brand === currentBrandFilter);
    }

    renderProducts(filteredProducts);
}

// Renderizar productos
function renderProducts(productsToRender = products) {
    const productsGrid = document.getElementById('productsGrid');
    productsGrid.innerHTML = '';

    productsToRender.forEach(product => {
        const productCard = createProductCard(product);
        productsGrid.appendChild(productCard);
    });
}

// Crear tarjeta de producto
function createProductCard(product) {
    const productDiv = document.createElement('div');
    productDiv.className = 'product-card';
    productDiv.addEventListener('click', () => openProductModal(product));

    const currentColor = product.colors[product.currentColorIndex];
    
    const priceHTML = product.discount ? 
        `<div class="product-price-container">
            <div class="product-price">$${product.price}</div>
            <div class="product-original-price">$${product.originalPrice}</div>
            <div class="product-discount">${product.discount}% OFF</div>
        </div>` :
        `<div class="product-price">$${product.price}</div>`;

    productDiv.innerHTML = `
        <img src="${currentColor.image}" alt="${product.name}" class="product-image">
        <div class="product-info">
            <div class="product-brand">${product.brand.toUpperCase()}</div>
            <h3 class="product-name">${product.name}</h3>
            ${priceHTML}
            <button class="add-to-cart" onclick="event.stopPropagation(); openProductModal(${JSON.stringify(product).replace(/"/g, '&quot;')})">
                Ver Detalles
            </button>
        </div>
    `;

    return productDiv;
}

// Obtener tallas según el tipo de producto
function getSizesForProduct(productType) {
    if (productType === 'zapatillas') {
        return ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
    } else {
        return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
    }
}

// Abrir modal de producto
function openProductModal(product) {
    selectedProduct = product;
    selectedSize = null;
    selectedColor = product.currentColorIndex;

    const currentColor = product.colors[selectedColor];
    
    document.getElementById('modalProductImage').src = currentColor.image;
    document.getElementById('modalProductBrand').textContent = product.brand.toUpperCase();
    document.getElementById('modalProductName').textContent = product.name;
    
    // Mostrar precio con descuento si aplica
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

    // Mostrar colores si hay más de uno
    const colorSelection = document.getElementById('colorSelection');
    const colorOptions = document.getElementById('colorOptions');
    
    if (product.colors.length > 1) {
        colorSelection.style.display = 'block';
        colorOptions.innerHTML = '';
        
        product.colors.forEach((color, index) => {
            const colorBtn = document.createElement('button');
            colorBtn.className = `color-btn ${index === selectedColor ? 'selected' : ''}`;
            colorBtn.textContent = color.name;
            colorBtn.setAttribute('data-color-index', index);
            colorBtn.addEventListener('click', () => selectColor(index));
            colorOptions.appendChild(colorBtn);
        });
    } else {
        colorSelection.style.display = 'none';
    }

    // Configurar tallas según el tipo de producto
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
}

// Seleccionar color
function selectColor(colorIndex) {
    selectedColor = colorIndex;
    const currentColor = selectedProduct.colors[colorIndex];
    
    // Actualizar imagen
    document.getElementById('modalProductImage').src = currentColor.image;
    
    // Actualizar botones de color
    document.querySelectorAll('.color-btn').forEach((btn, index) => {
        btn.classList.toggle('selected', index === colorIndex);
    });
}

// Cerrar modal de producto
function closeProductModal() {
    document.getElementById('productModal').style.display = 'none';
    selectedProduct = null;
    selectedSize = null;
    selectedColor = null;
}

// Seleccionar talla
function selectSize(button) {
    document.querySelectorAll('.size-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    button.classList.add('selected');
    selectedSize = button.getAttribute('data-size');
    updateAddToCartButton();
}

// Actualizar botón de agregar al carrito
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

// Agregar al carrito desde modal
function addToCartFromModal() {
    if (!selectedProduct || !selectedSize || selectedColor === null) return;

    const selectedColorData = selectedProduct.colors[selectedColor];
    
    const cartItem = {
        id: selectedProduct.id,
        name: selectedProduct.name,
        brand: selectedProduct.brand,
        price: selectedProduct.price,
        size: selectedSize,
        color: selectedColorData.name,
        image: selectedColorData.image,
        quantity: 1,
        cartId: `${selectedProduct.id}-${selectedSize}-${selectedColor}`
    };

    const existingItem = cart.find(item => item.cartId === cartItem.cartId);
    
    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push(cartItem);
    }

    updateCartCount();
    closeProductModal();
    
    // Mostrar mensaje de confirmación
    showNotification('Producto agregado al carrito');
}

// Mostrar notificación
function showNotification(message) {
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
        document.body.removeChild(notification);
    }, 3000);
}

// Abrir carrito
function openCart() {
    renderCartItems();
    document.getElementById('cartModal').style.display = 'block';
}

// Cerrar carrito
function closeCart() {
    document.getElementById('cartModal').style.display = 'none';
}

// Renderizar items del carrito
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
                    <button class="quantity-btn" onclick="updateQuantity('${item.cartId}', -1)">-</button>
                    <span class="quantity">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity('${item.cartId}', 1)">+</button>
                </div>
            </div>
            <button class="remove-item" onclick="removeFromCart('${item.cartId}')">Eliminar</button>
        `;
        
        cartItems.appendChild(cartItemDiv);
    });

    document.getElementById('totalPrice').textContent = `$${total.toFixed(2)}`;
}

// Actualizar cantidad
function updateQuantity(cartId, change) {
    const item = cart.find(item => item.cartId === cartId);
    if (item) {
        item.quantity += change;
        if (item.quantity <= 0) {
            removeFromCart(cartId);
        } else {
            renderCartItems();
            updateCartCount();
        }
    }
}

// Remover del carrito
function removeFromCart(cartId) {
    cart = cart.filter(item => item.cartId !== cartId);
    renderCartItems();
    updateCartCount();
}

// Actualizar contador del carrito
function updateCartCount() {
    const count = cart.reduce((total, item) => total + item.quantity, 0);
    document.getElementById('cartCount').textContent = count;
}

// Abrir perfil
function openProfile() {
    updateProfileInfo();
    document.getElementById('profileModal').style.display = 'block';
}

// Cerrar perfil
function closeProfile() {
    document.getElementById('profileModal').style.display = 'none';
}

// Actualizar información del perfil
function updateProfileInfo() {
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    const totalPrice = cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    
    document.getElementById('profileCartCount').textContent = totalItems;
    document.getElementById('profileCartTotal').textContent = `$${totalPrice.toFixed(2)}`;
    
    // Aquí es donde integrarás con Kinde para obtener datos del usuario
    // Ejemplo de cómo se vería:
    /*
    if (kindeClient.isAuthenticated) {
        const user = kindeClient.getUser();
        document.getElementById('userName').textContent = user.given_name + ' ' + user.family_name;
        document.getElementById('userEmail').textContent = user.email;
        document.getElementById('loginSection').style.display = 'none';
        document.getElementById('logoutBtn').style.display = 'block';
    } else {
        document.getElementById('userName').textContent = 'No autenticado';
        document.getElementById('userEmail').textContent = 'Inicia sesión para ver tu información';
        document.getElementById('loginSection').style.display = 'block';
        document.getElementById('logoutBtn').style.display = 'none';
    }
    */
}

// Funciones para Kinde (preparadas para integración)
function handleRegister() {
    // Aquí integrarás con Kinde para registro
    console.log('Redirigir a registro de Kinde');
    // Ejemplo: kindeClient.register();
}

function handleLogin() {
    // Aquí integrarás con Kinde para login
    console.log('Redirigir a login de Kinde');
    // Ejemplo: kindeClient.login();
}

function handleLogout() {
    // Aquí integrarás con Kinde para logout
    console.log('Cerrar sesión con Kinde');
    // Ejemplo: kindeClient.logout();
}

// Establecer filtro activo
function setActiveFilter(activeButton, allButtons) {
    allButtons.forEach(btn => btn.classList.remove('active'));
    activeButton.classList.add('active');
}

// Establecer enlace de navegación activo
function setActiveNavLink(activeLink, allLinks) {
    allLinks.forEach(link => link.classList.remove('active'));
    activeLink.classList.add('active');
}