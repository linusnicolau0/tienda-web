import React, { useState } from 'react';

const getSizesForProduct = (productType) => {
  if (productType === 'zapatillas') {
    return ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];
  } else {
    return ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  }
};

export const ProductModal = ({ product, isOpen, onClose, onAddToCart }) => {
  const [selectedSize, setSelectedSize] = useState(null);
  const [selectedColor] = useState('default');

  if (!isOpen || !product) return null;

  const sizes = getSizesForProduct(product.type);

  const handleAddToCart = () => {
    if (selectedSize) {
      onAddToCart(product, selectedSize, selectedColor);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
          <h2 className="text-2xl font-bold">Detalles del Producto</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-3xl leading-none">
            ×
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full rounded-lg"
              />
            </div>

            <div className="space-y-4">
              <div className="text-sm font-bold text-gray-500 uppercase">
                {product.brand}
              </div>
              <h2 className="text-3xl font-bold">{product.name}</h2>

              {product.discount ? (
                <div className="flex items-center gap-3">
                  <span className="text-3xl font-bold text-primary">
                    ${product.price}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    ${product.original_price}
                  </span>
                  <span className="bg-red-500 text-white text-sm px-3 py-1 rounded-full font-semibold">
                    {product.discount}% OFF
                  </span>
                </div>
              ) : (
                <div className="text-3xl font-bold text-gray-900">
                  ${product.price}
                </div>
              )}

              <div className="pt-4">
                <p className="text-gray-600">
                  Producto de alta calidad con materiales premium. Diseño moderno y cómodo para uso diario.
                </p>
              </div>

              <div>
                <h3 className="font-semibold mb-3">Talla:</h3>
                <div className="flex flex-wrap gap-2">
                  {sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border-2 rounded-lg font-medium transition-all ${
                        selectedSize === size
                          ? 'border-primary bg-primary text-white'
                          : 'border-gray-300 hover:border-primary'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={handleAddToCart}
                disabled={!selectedSize}
                className={`w-full py-3 rounded-lg font-semibold transition-colors ${
                  selectedSize
                    ? 'bg-primary text-white hover:bg-opacity-90'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
              >
                {selectedSize ? 'Agregar al Carrito' : 'Selecciona una talla'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
