import React from 'react';

export const Hero = () => {
  return (
    <section className="relative bg-gradient-to-r from-gray-900 to-gray-800 text-white">
      <div className="container mx-auto px-4 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-6">
            <h1 className="text-4xl md:text-6xl font-bold">
              Colección Premium
            </h1>
            <p className="text-xl md:text-2xl text-gray-300">
              Descubre moda de lujo para cada estilo
            </p>
            <button className="bg-primary hover:bg-opacity-90 text-white px-8 py-3 rounded-lg font-semibold transition-all">
              Comprar Ahora
            </button>
          </div>
          <div className="hidden md:block">
            <img
              src="https://images.pexels.com/photos/996329/pexels-photo-996329.jpeg"
              alt="Fashion Model"
              className="rounded-lg shadow-2xl w-full h-96 object-cover"
            />
          </div>
        </div>
      </div>
    </section>
  );
};
