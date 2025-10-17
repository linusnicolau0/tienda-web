export const ProductCard = ({ product, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer transition-transform hover:scale-105"
    >
      <img
        src={product.image_url}
        alt={product.name}
        className="w-full h-64 object-cover"
      />
      <div className="p-4">
        <div className="text-sm font-bold text-gray-500 uppercase mb-1">
          {product.brand}
        </div>
        <h3 className="font-semibold text-lg mb-2 line-clamp-2">
          {product.name}
        </h3>
        {product.discount ? (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-2xl font-bold text-primary">
              ${product.price}
            </span>
            <span className="text-lg text-gray-500 line-through">
              ${product.original_price}
            </span>
            <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
              {product.discount}% OFF
            </span>
          </div>
        ) : (
          <div className="text-2xl font-bold text-gray-900">
            ${product.price}
          </div>
        )}
        <button className="mt-4 w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-opacity-90 transition-colors">
          Ver Detalles
        </button>
      </div>
    </div>
  );
};
