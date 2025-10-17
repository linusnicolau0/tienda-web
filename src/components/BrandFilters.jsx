import React from 'react';

export const BrandFilters = ({ brands, activeBrand, onBrandChange }) => {
  return (
    <section className="bg-white py-8">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-6">Nuestra Colección</h2>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={() => onBrandChange('all')}
            className={`px-6 py-2 rounded-full font-medium transition-all ${
              activeBrand === 'all'
                ? 'bg-primary text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </button>
          {brands.map((brand) => (
            <button
              key={brand.id}
              onClick={() => onBrandChange(brand.name)}
              className={`px-6 py-2 rounded-full font-medium transition-all ${
                activeBrand === brand.name
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {brand.display_name}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
};
