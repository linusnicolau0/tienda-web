import React from 'react';

export const LandingPage = ({ onEnter }) => {
  return (
    <div
      className="relative w-screen h-screen overflow-hidden bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: 'url(https://images.pexels.com/photos/1082528/pexels-photo-1082528.jpeg)'
      }}
    >
      <div className="absolute inset-0 bg-black-carbon bg-opacity-40"></div>

      <div className="relative h-full flex flex-col items-center justify-center px-4">
        <button
          onClick={onEnter}
          className="group relative px-12 py-4 text-lg md:text-xl font-semibold text-white-pure bg-transparent border-2 border-gold-intense rounded-sm overflow-hidden transition-all duration-300 hover:border-gold-soft hover:text-gold-soft"
        >
          <span className="relative z-10 font-display tracking-wide">Entrar a la colección</span>
          <div className="absolute inset-0 bg-gold-soft opacity-0 group-hover:opacity-10 transition-opacity duration-300"></div>
        </button>
      </div>

      <div className="absolute bottom-8 left-8 md:bottom-12 md:left-12 max-w-md">
        <p className="text-2xl md:text-4xl font-display font-bold text-white-pure leading-tight tracking-wide">
          El lujo también pertenece
          <br />
          <span className="text-gold-intense">a la calle.</span>
        </p>
      </div>
    </div>
  );
};
